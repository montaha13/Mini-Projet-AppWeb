import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Tabs,
  Tab,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  Stack,
  Divider,
  Paper,
} from '@mui/material';
import {
  CalendarToday,
  AccessTime,
  LocationOn,
  People,
  Cancel,
  Info,
  ChevronRight,
} from '@mui/icons-material';
import dayjs from 'dayjs';
import { useTranslation, Trans } from 'react-i18next';
import { useGetUserBookingsQuery, useCancelBookingMutation } from '../store/api/bookingsApi';
import { useGetRoomsQuery } from '../store/api/roomsApi';
import PageHeader from '../components/layout/PageHeader';

const TabPanel = ({ children, value, index }) => {
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ pt: 1 }}>{children}</Box>}
    </div>
  );
};

const BookingsPage = () => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === 'rtl';

  const [tabValue, setTabValue] = useState(0);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { data: bookings, isLoading, refetch } = useGetUserBookingsQuery({ userId: user?.id }, { skip: !isAuthenticated || !user?.id });
  const { data: rooms } = useGetRoomsQuery({ page: 1, limit: 100 });
  const [cancelBooking, { isLoading: isCancelling }] = useCancelBookingMutation();

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleViewDetails = (booking) => {
    setSelectedBooking(booking);
    setDetailsDialogOpen(true);
  };

  const handleOpenCancel = (booking) => {
    setSelectedBooking(booking);
    setCancelDialogOpen(true);
  };

  const handleConfirmCancel = async () => {
    try {
      await cancelBooking(selectedBooking.id).unwrap();
      setCancelDialogOpen(false);
      refetch();
    } catch (err) {
      console.error('Failed to cancel', err);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'CONFIRMED': return 'success';
      case 'PENDING': return 'warning';
      case 'CANCELLED': return 'error';
      case 'COMPLETED': return 'info';
      default: return 'default';
    }
  };

  const getRoomName = (roomId) => {
    const room = rooms?.rooms?.find(r => r.id === roomId) || rooms?.find(r => r.id === roomId);
    return room?.name || t('rooms.active');
  };

  const filteredBookings = (status) => {
    const list = bookings?.reservations || bookings || [];
    if (status === 'UPCOMING') {
      return list.filter(b => dayjs(b.startTime).isAfter(dayjs()) && b.status !== 'CANCELLED');
    }
    if (status === 'PAST') {
      return list.filter(b => dayjs(b.startTime).isBefore(dayjs()) && b.status !== 'CANCELLED');
    }
    if (status === 'CANCELLED') {
      return list.filter(b => b.status === 'CANCELLED');
    }
    return list;
  };

  const BookingCard = ({ booking }) => (
    <Card 
      elevation={0}
      sx={{ 
        mb: 3, 
        borderRadius: 4, 
        border: '1px solid', 
        borderColor: 'divider',
        transition: 'all 0.2s ease',
        '&:hover': {
          borderColor: 'primary.main',
          bgcolor: 'rgba(10, 25, 47, 0.02)'
        }
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }}>
          <Box sx={{ flexGrow: 1 }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
              <Typography variant="h6" fontWeight="800">
                {booking.title}
              </Typography>
              <Chip 
                label={booking.status} 
                color={getStatusColor(booking.status)}
                size="small"
                variant="soft"
                sx={{ fontWeight: 'bold', fontSize: '0.7rem' }}
              />
            </Stack>
            
            <Stack direction="row" spacing={1} alignItems="center" color="text.secondary" sx={{ mb: 2 }}>
              <LocationOn sx={{ fontSize: 16 }} />
              <Typography variant="body2" fontWeight="500">
                {getRoomName(booking.roomId)}
              </Typography>
            </Stack>

            <Stack direction="row" spacing={{ xs: 2, md: 4 }} sx={{ flexWrap: 'wrap', gap: 1 }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <CalendarToday sx={{ fontSize: 16, color: 'text.secondary' }} />
                <Typography variant="body2" fontWeight="600">
                  {dayjs(booking.startTime).format('MMM DD, YYYY')}
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <AccessTime sx={{ fontSize: 16, color: 'text.secondary' }} />
                <Typography variant="body2" fontWeight="600">
                  {dayjs(booking.startTime).format('HH:mm')} - {dayjs(booking.endTime).format('HH:mm')}
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <People sx={{ fontSize: 16, color: 'text.secondary' }} />
                <Typography variant="body2" fontWeight="600">
                  {booking.participantCount} Pax
                </Typography>
              </Stack>
            </Stack>
          </Box>

          <Stack direction="row" spacing={1} sx={{ alignSelf: { xs: 'flex-end', md: 'center' }, mt: { xs: 2, md: 0 } }}>
            <Button 
              variant="outlined" 
              size="small"
              onClick={() => handleViewDetails(booking)}
              startIcon={<Info />}
            >
              {t('common.view_all')}
            </Button>
            {booking.status !== 'CANCELLED' && dayjs(booking.startTime).isAfter(dayjs()) && (
              <Button 
                variant="outlined" 
                color="error"
                size="small"
                onClick={() => handleOpenCancel(booking)}
                startIcon={<Cancel />}
              >
                {t('rooms.cancel_no')}
              </Button>
            )}
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', pb: 8 }}>
      <PageHeader 
        title={t('common.my_bookings')}
        subtitle={t('dashboard.upcoming').toLowerCase() + " & " + t('rooms.past').toLowerCase()}
        breadcrumbs={[{ label: t('common.my_bookings') }]}
      />

      <Container maxWidth="lg">
        <Paper 
          elevation={0}
          sx={{ 
            borderRadius: 4, 
            border: '1px solid', 
            borderColor: 'divider',
            overflow: 'hidden',
            mb: 4
          }}
        >
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            textColor="primary" 
            indicatorColor="primary"
            sx={{
              px: 2,
              '& .MuiTab-root': { py: 2.5, fontWeight: 700, fontSize: '0.95rem' }
            }}
          >
            <Tab label={t('rooms.upcoming')} />
            <Tab label={t('rooms.past')} />
            <Tab label={t('rooms.cancelled')} />
          </Tabs>
          {isLoading && <LinearProgress sx={{ height: 2 }} />}
        </Paper>

        <TabPanel value={tabValue} index={0}>
          {filteredBookings('UPCOMING').length > 0 ? (
            filteredBookings('UPCOMING').map((b) => <BookingCard key={b.id} booking={b} />)
          ) : (
            !isLoading && (
              <Paper variant="outlined" sx={{ textAlign: 'center', py: 12, borderRadius: 4, borderStyle: 'dashed' }}>
                <Typography variant="h6" color="text.secondary" fontWeight="600">{t('rooms.no_upcoming')}</Typography>
                <Button variant="contained" sx={{ mt: 2 }} onClick={() => navigate('/rooms')}>{t('common.find_room')}</Button>
              </Paper>
            )
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          {filteredBookings('PAST').length > 0 ? (
            filteredBookings('PAST').map((b) => <BookingCard key={b.id} booking={b} />)
          ) : (
            !isLoading && (
              <Paper variant="outlined" sx={{ textAlign: 'center', py: 12, borderRadius: 4, borderStyle: 'dashed' }}>
                <Typography variant="h6" color="text.secondary" fontWeight="600">{t('rooms.no_past')}</Typography>
              </Paper>
            )
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          {filteredBookings('CANCELLED').length > 0 ? (
            filteredBookings('CANCELLED').map((b) => <BookingCard key={b.id} booking={b} />)
          ) : (
            !isLoading && (
              <Paper variant="outlined" sx={{ textAlign: 'center', py: 12, borderRadius: 4, borderStyle: 'dashed' }}>
                <Typography variant="h6" color="text.secondary" fontWeight="600">{t('rooms.no_cancelled')}</Typography>
              </Paper>
            )
          )}
        </TabPanel>

        {/* Details Dialog */}
        <Dialog 
          open={detailsDialogOpen} 
          onClose={() => setDetailsDialogOpen(false)} 
          maxWidth="xs" 
          fullWidth
          PaperProps={{ sx: { borderRadius: 4 } }}
        >
          <DialogTitle sx={{ fontWeight: 800, pt: 3 }}>{t('rooms.res_details')}</DialogTitle>
          <DialogContent>
            {selectedBooking && (
              <Stack spacing={3} sx={{ mt: 1 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 800, letterSpacing: 1 }}>{t('common.title')}</Typography>
                  <Typography variant="h6" fontWeight="700">{selectedBooking.title}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 800, letterSpacing: 1 }}>{t('rooms_plural')}</Typography>
                  <Typography variant="body1" fontWeight="600">{getRoomName(selectedBooking.roomId)}</Typography>
                </Box>
                <Divider />
                <Stack spacing={1.5}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">{t('common.date')}:</Typography>
                    <Typography variant="body2" fontWeight="700">{dayjs(selectedBooking.startTime).format('MMMM DD, YYYY')}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">{t('common.start_time')} - {t('common.end_time')}:</Typography>
                    <Typography variant="body2" fontWeight="700">{dayjs(selectedBooking.startTime).format('HH:mm')} - {dayjs(selectedBooking.endTime).format('HH:mm')}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">{t('common.status')}:</Typography>
                    <Chip label={selectedBooking.status} color={getStatusColor(selectedBooking.status)} size="small" sx={{ fontWeight: 800, fontSize: '0.65rem' }} />
                  </Box>
                </Stack>
              </Stack>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 0 }}>
            <Button fullWidth variant="outlined" onClick={() => setDetailsDialogOpen(false)}>{t('common.close')}</Button>
          </DialogActions>
        </Dialog>

        {/* Cancel Confirmation */}
        <Dialog 
          open={cancelDialogOpen} 
          onClose={() => setCancelDialogOpen(false)}
          PaperProps={{ sx: { borderRadius: 4, p: 1 } }}
        >
          <DialogTitle sx={{ fontWeight: 800 }}>{t('rooms.cancel_confirm')}</DialogTitle>
          <DialogContent>
            <Typography variant="body1" color="text.secondary">
              {t('rooms.cancel_desc', { title: selectedBooking?.title })}
            </Typography>
            <Paper sx={{ mt: 2, p: 2, bgcolor: 'error.lighter', border: '1px dashed', borderColor: 'error.main' }}>
              <Typography variant="body2" color="error.dark" fontWeight="600">{t('rooms.cancel_warning')}</Typography>
            </Paper>
          </DialogContent>
          <DialogActions sx={{ p:3 }}>
            <Button variant="outlined" onClick={() => setCancelDialogOpen(false)}>{t('rooms.cancel_no')}</Button>
            <Button 
              onClick={handleConfirmCancel} 
              color="error" 
              variant="contained" 
              disabled={isCancelling}
            >
              {isCancelling ? t('common.loading') : t('rooms.cancel_yes')}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default BookingsPage;


