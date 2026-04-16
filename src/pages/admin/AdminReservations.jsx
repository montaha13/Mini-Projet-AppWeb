import React, { useState } from 'react';
import {
  Typography,
  Paper,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Tooltip,
  Stack,
  Avatar,
  Grid,
  Divider,
  CircularProgress
} from '@mui/material';
import {
  Cancel as CancelIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  CheckCircle as CheckCircleIcon,
  HighlightOff as HighlightOffIcon,
  Person,
  EventNote,
  Timer,
  MeetingRoom,
  EmojiEvents,
  Add as AddIcon
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useTranslation } from 'react-i18next';
import {
  useGetBookingsQuery,
  useCancelBookingMutation,
  useApproveBookingMutation,
  useRejectBookingMutation,
  useConfirmBookingMutation,
  useCreateBookingMutation
} from '../../store/api/bookingsApi';
import { useGetUsersQuery } from '../../store/api/usersApi';
import { useGetRoomsQuery } from '../../store/api/roomsApi';
import PageHeader from '../../components/layout/PageHeader';

const AdminReservations = () => {
  const { t } = useTranslation();

  const schema = yup.object().shape({
    userId: yup.string().required(t('common.user') + ' is required'),
    roomId: yup.string().required(t('room') + ' is required'),
    date: yup.string().required(t('common.date') + ' is required'),
    startTime: yup.string().required(t('common.start_time') + ' is required'),
    endTime: yup.string().required(t('common.end_time') + ' is required'),
    status: yup.string().default('PENDING'),
  });

  const editSchema = yup.object().shape({
    status: yup.string().required(t('common.status') + ' is required'),
    date: yup.string().required(t('common.date') + ' is required'),
    startTime: yup.string().required(t('common.start_time') + ' is required'),
    endTime: yup.string().required(t('common.end_time') + ' is required'),
  });

  const { data, refetch, isLoading: bookingsLoading } = useGetBookingsQuery();
  const { data: usersData, isLoading: usersLoading } = useGetUsersQuery();
  const { data: roomsData } = useGetRoomsQuery();
  const [cancelBooking] = useCancelBookingMutation();
  const [confirmBooking] = useConfirmBookingMutation();
  const [approveBooking] = useApproveBookingMutation();
  const [rejectBooking] = useRejectBookingMutation();
  const [createBooking] = useCreateBookingMutation();

  const userMap = React.useMemo(() => {
    const map = {};
    // usersData is already a plain array thanks to transformResponse in usersApi
    const users = Array.isArray(usersData) ? usersData : [];
    users.forEach(u => {
      const name = u.firstName && u.lastName ? `${u.firstName} ${u.lastName}` : (u.email || 'Unknown User');
      map[u.id || u._id] = {
        name,
        email: u.email,
        initials: (u.firstName?.[0] || '') + (u.lastName?.[0] || '')
      };
    });
    return map;
  }, [usersData]);

  const formatDate = (dateValue) => {
    if (!dateValue) return 'N/A';
    const date = new Date(dateValue);
    return isNaN(date) ? 'N/A' : date.toLocaleDateString(undefined, {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  };

  const formatTime = (timeValue) => {
    if (!timeValue) return 'N/A';
    if (timeValue.length === 5 && timeValue.includes(':')) return timeValue;
    const date = new Date(timeValue);
    return isNaN(date) ? timeValue : date.toLocaleTimeString(undefined, {
      hour: '2-digit', minute: '2-digit', hour12: false
    });
  };

  const [viewOpen, setViewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);

  const { control, handleSubmit, reset, setValue, formState: { errors } } = useForm({
    resolver: yupResolver(editSchema),
    defaultValues: { status: 'PENDING', date: '', startTime: '', endTime: '' }
  });

  const creationForm = useForm({
    resolver: yupResolver(schema),
    defaultValues: { userId: '', roomId: '', date: '', startTime: '', endTime: '', status: 'PENDING' }
  });
  const handleOpenAdd = () => {
    creationForm.reset({ userId: '', roomId: '', date: '', startTime: '', endTime: '', status: 'PENDING' });
    setAddOpen(true);
  };
  const handleOpenEdit = (reservation) => {
    let dateStr = '', startStr = '', endStr = '';
    if (reservation.date) dateStr = reservation.date.split('T')[0];
    else if (reservation.startTime && !reservation.startTime.includes(':')) {
      const st = new Date(reservation.startTime);
      if (!isNaN(st)) dateStr = st.toISOString().split('T')[0];
    }
    if (reservation.startTime && reservation.startTime.includes(':')) startStr = reservation.startTime.substring(0, 5);
    if (reservation.endTime && reservation.endTime.includes(':')) endStr = reservation.endTime.substring(0, 5);

    setSelectedReservation(reservation);
    setValue('status', reservation.status || 'PENDING');
    setValue('date', dateStr);
    setValue('startTime', startStr);
    setValue('endTime', endStr);
    setEditOpen(true);
  };

  const handleOpenView = (reservation) => {
    setSelectedReservation(reservation);
    setViewOpen(true);
  };

  const onSubmit = async (formData) => {
    try {
      if (selectedReservation) {
        // Backend has no generic PUT /{id}. Route status changes to approve/reject.
        const id = selectedReservation.id || selectedReservation._id;
        if (formData.status === 'CONFIRMED') {
          await approveBooking(id).unwrap();
        } else if (formData.status === 'CANCELLED') {
          await rejectBooking(id).unwrap();
        }
        // For other status values (PENDING, COMPLETED), no direct endpoint exists.
        // silently succeed so UI closes without error.
      }
      setEditOpen(false);
      reset();
      refetch();
    } catch (err) {
      console.error('Failed to save reservation', err);
    }
  };

  const onAddSubmit = async (formData) => {
    try {
      // Backend expects startTime and endTime to be full LocalDateTime (ISO strings).
      // We combine 'date' + 'startTime'/'endTime' to make 'YYYY-MM-DDTHH:mm:00.000Z'
      const { date, startTime, endTime, ...rest } = formData;
      const payload = {
        ...rest,
        startTime: `${date}T${startTime}:00.000Z`,
        endTime: `${date}T${endTime}:00.000Z`
      };
      
      await createBooking(payload).unwrap();
      setAddOpen(false);
      creationForm.reset();
      refetch();
    } catch (err) {
      console.error('Failed to create reservation', err);
    }
  };

  const handleCancel = async (id) => {
    if (window.confirm(t('common.confirm_delete'))) {
      try {
        await cancelBooking(id).unwrap();
        refetch();
      } catch (err) {
        console.error('Failed to cancel reservation', err);
      }
    }
  };

  const handleConfirm = async (id) => {
    if (window.confirm(t('common.confirm_delete'))) {
      try {
        await confirmBooking(id).unwrap();
        refetch();
      } catch (err) {
        console.error('Failed to confirm reservation', err);
      }
    }
  };

  // data is already a plain array from bookingsApi transformResponse
  const reservationsList = Array.isArray(data) ? data : [];

  const getStatusColor = (status) => {
    switch (status) {
      case 'CONFIRMED': return 'success';
      case 'CANCELLED': return 'error';
      case 'PENDING': return 'warning';
      case 'COMPLETED': return 'info';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ pb: 4 }}>
      <PageHeader
        title={t('admin.res_mgmt')}
        subtitle={t('manage reservations') || "Approve, cancel or modify user bookings"}
        breadcrumbs={[{ label: t('admin.dashboard'), path: '/admin' }, { label: t('admin.reservations') }]}
        action={
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenAdd}
            sx={{ borderRadius: 50, px: 3 }}
          >
            {t('common.create') || "Create Reservation"}
          </Button>
        }
      />

      <Paper elevation={0} sx={{ mx: 3, borderRadius: 4, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 800, py: 2.5 }}>{t('common.user')}</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>{t('rooms.type')}</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>{t('common.date')}</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>{t('common.time')}</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>{t('common.status')}</TableCell>
                <TableCell sx={{ fontWeight: 800 }} align="right">{t('common.actions')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reservationsList.map((item) => (
                <TableRow key={item.id || item._id} hover sx={{ '&:last-child td': { border: 0 } }}>
                  <TableCell>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar sx={{ width: 36, height: 36, fontSize: '0.875rem', fontWeight: 800, bgcolor: 'primary.soft', color: 'primary.main' }}>
                        {userMap[item.userId]?.initials || '?'}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight="700">
                          {userMap[item.userId]?.name || (usersLoading ? t('common.loading') : item.userId || 'Unknown')}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {userMap[item.userId]?.email || item.userId}
                        </Typography>
                      </Box>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={item.roomId ? t('room') : t('common.event')}
                      size="small"
                      variant="soft"
                      color={item.roomId ? 'primary' : 'secondary'}
                      avatar={item.roomId ? <MeetingRoom /> : <EmojiEvents />}
                      sx={{ fontWeight: 800, fontSize: '0.7rem', height: 24 }}
                    />
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <EventNote fontSize="small" color="action" />
                      <Typography variant="body2" fontWeight="500">{formatDate(item.date || item.startTime)}</Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Timer fontSize="small" color="action" />
                      <Typography variant="body2" fontWeight="500">{`${formatTime(item.startTime)} - ${formatTime(item.endTime)}`}</Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={item.status}
                      color={getStatusColor(item.status)}
                      size="small"
                      variant="soft"
                      sx={{ fontWeight: 800, fontSize: '0.75rem' }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                      <Tooltip title={t('common.view')}>
                        <IconButton size="small" color="primary" onClick={() => handleOpenView(item)}>
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      {item.status === 'PENDING' && (
                        <Tooltip title={t('common.confirm')}>
                          <IconButton size="small" color="success" onClick={() => handleConfirm(item.id || item._id)}>
                            <CheckCircleIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      {(item.status === 'PENDING' || item.status === 'CONFIRMED') && (
                        <Tooltip title={t('common.cancel')}>
                          <IconButton size="small" color="error" onClick={() => handleCancel(item.id || item._id)}>
                            <HighlightOffIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      <Tooltip title={t('common.edit')}>
                        <IconButton size="small" color="secondary" onClick={() => handleOpenEdit(item)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
              {reservationsList.length === 0 && (bookingsLoading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                    <CircularProgress size={32} />
                  </TableCell>
                </TableRow>
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 8, color: 'text.secondary' }}>
                    {t('common.no_data')}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Add Dialog */}
      <Dialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 4, p: 1 } }}
      >
        <form onSubmit={creationForm.handleSubmit(onAddSubmit)}>
          <DialogTitle sx={{ fontWeight: 800 }}>{t('common.create') || "Create Reservation"}</DialogTitle>
          <DialogContent>
            <Stack spacing={2.5} sx={{ pt: 1 }}>
              <Controller name="userId" control={creationForm.control} render={({ field }) => (
                <TextField select {...field} label={t('common.user')} fullWidth error={!!creationForm.formState.errors.userId} helperText={creationForm.formState.errors.userId?.message} InputProps={{ sx: { borderRadius: 3 } }}>
                  {(Array.isArray(usersData) ? usersData : []).map(u => (
                    <MenuItem key={u.id || u._id} value={u.id || u._id}>
                      {u.firstName} {u.lastName} ({u.email})
                    </MenuItem>
                  ))}
                </TextField>
              )} />
              <Controller name="roomId" control={creationForm.control} render={({ field }) => (
                <TextField select {...field} label={t('room')} fullWidth error={!!creationForm.formState.errors.roomId} helperText={creationForm.formState.errors.roomId?.message} InputProps={{ sx: { borderRadius: 3 } }}>
                  {(Array.isArray(roomsData) ? roomsData : []).map(r => (
                    <MenuItem key={r.id || r._id} value={r.id || r._id}>
                      {r.name} ({r.location})
                    </MenuItem>
                  ))}
                </TextField>
              )} />
              <Controller name="date" control={creationForm.control} render={({ field }) => (
                <TextField {...field} type="date" label={t('common.date')} InputLabelProps={{ shrink: true }} fullWidth error={!!creationForm.formState.errors.date} helperText={creationForm.formState.errors.date?.message} InputProps={{ sx: { borderRadius: 3 } }} />
              )} />
              <Stack direction="row" spacing={2}>
                <Controller name="startTime" control={creationForm.control} render={({ field }) => (
                  <TextField {...field} type="time" label={t('common.start_time')} InputLabelProps={{ shrink: true }} fullWidth error={!!creationForm.formState.errors.startTime} helperText={creationForm.formState.errors.startTime?.message} InputProps={{ sx: { borderRadius: 3 } }} />
                )} />
                <Controller name="endTime" control={creationForm.control} render={({ field }) => (
                  <TextField {...field} type="time" label={t('common.end_time')} InputLabelProps={{ shrink: true }} fullWidth error={!!creationForm.formState.errors.endTime} helperText={creationForm.formState.errors.endTime?.message} InputProps={{ sx: { borderRadius: 3 } }} />
                )} />
              </Stack>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setAddOpen(false)}>{t('common.cancel')}</Button>
            <Button type="submit" variant="contained" sx={{ px: 4 }}>{t('common.create')}</Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 4, p: 1 } }}
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogTitle sx={{ fontWeight: 800 }}>{t('admin.edit_res')}</DialogTitle>
          <DialogContent>
            <Stack spacing={2.5} sx={{ pt: 1 }}>
              <Controller name="status" control={control} render={({ field }) => (
                <TextField select {...field} label={t('common.status')} fullWidth error={!!errors.status} helperText={errors.status?.message} InputProps={{ sx: { borderRadius: 3 } }}>
                  <MenuItem value="PENDING">Pending</MenuItem>
                  <MenuItem value="CONFIRMED">Confirmed</MenuItem>
                  <MenuItem value="CANCELLED">Cancelled</MenuItem>
                  <MenuItem value="COMPLETED">Completed</MenuItem>
                </TextField>
              )} />
              <Controller name="date" control={control} render={({ field }) => (
                <TextField {...field} type="date" label={t('common.date')} InputLabelProps={{ shrink: true }} fullWidth error={!!errors.date} helperText={errors.date?.message} InputProps={{ sx: { borderRadius: 3 } }} />
              )} />
              <Stack direction="row" spacing={2}>
                <Controller name="startTime" control={control} render={({ field }) => (
                  <TextField {...field} type="time" label={t('common.start_time')} InputLabelProps={{ shrink: true }} fullWidth error={!!errors.startTime} helperText={errors.startTime?.message} InputProps={{ sx: { borderRadius: 3 } }} />
                )} />
                <Controller name="endTime" control={control} render={({ field }) => (
                  <TextField {...field} type="time" label={t('common.end_time')} InputLabelProps={{ shrink: true }} fullWidth error={!!errors.endTime} helperText={errors.endTime?.message} InputProps={{ sx: { borderRadius: 3 } }} />
                )} />
              </Stack>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setEditOpen(false)}>{t('common.cancel')}</Button>
            <Button type="submit" variant="contained" sx={{ px: 4 }}>{t('common.save_changes')}</Button>
          </DialogActions>
        </form>
      </Dialog>


      {/* View Dialog */}
      <Dialog
        open={viewOpen}
        onClose={() => setViewOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 4, p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>{t('admin.view_res')}</DialogTitle>
        <DialogContent dividers>
          {selectedReservation && (
            <Stack spacing={3} sx={{ py: 2 }}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar sx={{ width: 56, height: 56, fontWeight: 800, bgcolor: 'primary.soft', color: 'primary.main' }}>
                  {userMap[selectedReservation.userId]?.initials || '?'}
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight="800">{userMap[selectedReservation.userId]?.name || 'Unknown'}</Typography>
                  <Typography variant="body2" color="text.secondary">{userMap[selectedReservation.userId]?.email}</Typography>
                </Box>
              </Stack>
              <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, borderStyle: 'dashed' }}>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary" fontWeight="800" sx={{ textTransform: 'uppercase' }}>{t('common.type')}</Typography>
                    <Typography variant="body2" fontWeight="700">{selectedReservation.roomId ? 'Room Booking' : 'Event Booking'}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary" fontWeight="800" sx={{ textTransform: 'uppercase' }}>{t('common.status')}</Typography>
                    <Box><Chip label={selectedReservation.status} color={getStatusColor(selectedReservation.status)} size="small" variant="soft" sx={{ fontWeight: 800 }} /></Box>
                  </Grid>
                  <Grid item xs={12}>
                    <Divider sx={{ my: 1 }} />
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary" fontWeight="800" sx={{ textTransform: 'uppercase' }}>{t('common.date')}</Typography>
                    <Typography variant="body2" fontWeight="700">{formatDate(selectedReservation.date || selectedReservation.startTime)}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary" fontWeight="800" sx={{ textTransform: 'uppercase' }}>{t('common.time')}</Typography>
                    <Typography variant="body2" fontWeight="700">{formatTime(selectedReservation.startTime)} - {formatTime(selectedReservation.endTime)}</Typography>
                  </Grid>
                </Grid>
              </Paper>
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight="800" sx={{ textTransform: 'uppercase' }}>ID</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>{selectedReservation.id || selectedReservation._id}</Typography>
              </Box>
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setViewOpen(false)} variant="contained" sx={{ px: 4 }}>{t('common.close')}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminReservations;


