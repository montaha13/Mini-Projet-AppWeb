import React, { useMemo } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Paper,
  Stack,
  IconButton,
  Divider,
  Chip,
  LinearProgress,
  useTheme,
  Avatar,
} from '@mui/material';
import {
  Search,
  People,
  History,
  EventAvailable,
  Star as StarIcon,
  ArrowForward,
  MeetingRoom,
  TrendingUp,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import { useGetUserBookingsQuery } from '../store/api/bookingsApi';
import { useGetRoomsQuery } from '../store/api/roomsApi';
import roomJpg from '../assets/room.jpg';
import room2Jpg from '../assets/room2.jpg';

const DashboardPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const theme = useTheme();
  const { user } = useSelector((state) => state.auth);

  // Real-time user stats
  const { data: bookingsData, isLoading: statsLoading } = useGetUserBookingsQuery({});
  const { data: roomsData, isLoading: roomsLoading } = useGetRoomsQuery({ page: 1, limit: 3 });

  const bookings = useMemo(() => {
    return bookingsData?.reservations || bookingsData || [];
  }, [bookingsData]);

  const featuredRooms = useMemo(() => {
    return roomsData?.rooms || roomsData || [];
  }, [roomsData]);

  const stats = useMemo(() => {
    const total = bookings.length;
    const upcoming = bookings.filter(b => dayjs(b.startTime).isAfter(dayjs()) && b.status !== 'CANCELLED').length;
    return { total, upcoming };
  }, [bookings]);

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      {/* Refined Hero / Top Section */}
      <Box
        sx={{
          pt: { xs: 12, md: 15 },
          pb: { xs: 8, md: 12 },
          backgroundImage: `linear-gradient(rgba(10, 25, 47, 0.85), rgba(10, 25, 47, 0.85)), url(${roomJpg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          color: 'white',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Abstract Background Element */}
        <Box sx={{
          position: 'absolute',
          top: -100,
          right: -100,
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.03)',
          zIndex: 0
        }} />

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={7}>
              <Stack spacing={3}>
                <Chip
                  label={t('Smart Room Booker') || "Campus Resource Hub"}
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.1)',
                    color: 'white',
                    fontWeight: 800,
                    alignSelf: 'flex-start',
                    border: '1px solid rgba(255,255,255,0.2)'
                  }}
                />
                <Typography variant="h1" fontWeight="900" sx={{ fontSize: { xs: '2.5rem', md: '3.5rem' }, lineHeight: 1.1 }}>
                  {t('dashboard.welcome', { name: user?.firstName })}<br />
                  <Typography component="span" variant="inherit" sx={{ opacity: 0.8, fontWeight: 500 }}>
                    {t('dashboard.subtitle')}
                  </Typography>
                </Typography>
                <Typography variant="h6" sx={{ opacity: 0.7, fontWeight: 400, maxWidth: 550, lineHeight: 1.6 }}>
                  {t('dashboard.hero_desc')}
                </Typography>
                <Stack direction="row" spacing={2} sx={{ pt: 2 }}>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={() => navigate('/rooms')}
                    sx={{ borderRadius: 50, px: 4, py: 1.5, fontWeight: 800, fontSize: '1rem' }}
                  >
                    {t('common.find_room')}
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={() => navigate('/my-bookings')}
                    sx={{ borderRadius: 50, px: 4, py: 1.5, color: 'white', borderColor: 'rgba(255,255,255,0.3)', '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.05)' } }}
                  >
                    {t('common.my_bookings')}
                  </Button>
                </Stack>
              </Stack>
            </Grid>

            <Grid item xs={12} md={5}>
              <Stack spacing={3}>
                <Paper elevation={0} sx={{ p: 3, borderRadius: 4, bgcolor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <Stack direction="row" spacing={3} alignItems="center">
                    <Box sx={{ p: 2, borderRadius: 3, bgcolor: 'primary.main', color: 'white', display: 'flex' }}>
                      <EventAvailable />
                    </Box>
                    <Box>
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', fontWeight: 800, textTransform: 'uppercase' }}>
                        {t('dashboard.upcoming')}
                      </Typography>
                      <Typography variant="h4" fontWeight="800" sx={{ color: 'white' }}>{stats.upcoming}</Typography>
                    </Box>
                  </Stack>
                </Paper>
                <Paper elevation={0} sx={{ p: 3, borderRadius: 4, bgcolor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <Stack direction="row" spacing={3} alignItems="center">
                    <Box sx={{ p: 2, borderRadius: 3, bgcolor: 'secondary.main', color: 'white', display: 'flex' }}>
                      <TrendingUp />
                    </Box>
                    <Box>
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', fontWeight: 800, textTransform: 'uppercase' }}>
                        {t('dashboard.recent_activity')}
                      </Typography>
                      <Typography variant="h4" fontWeight="800" sx={{ color: 'white' }}>{stats.total}</Typography>
                    </Box>
                  </Stack>
                </Paper>
              </Stack>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Main Content Area */}
      <Container maxWidth="lg" sx={{ py: 10 }}>
        {/* Recommended Rooms */}
        <Box sx={{ mb: 12 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-end" sx={{ mb: 6 }}>
            <Box>
              <Typography variant="h3" fontWeight="900" gutterBottom>{t('dashboard.recommended')}</Typography>
              <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600 }}>
                {t('dashboard.rec_desc')}
              </Typography>
            </Box>
            <Button
              endIcon={<ArrowForward />}
              onClick={() => navigate('/rooms')}
              sx={{ fontWeight: 800, display: { xs: 'none', sm: 'flex' } }}
            >
              {t('common.view_all')}
            </Button>
          </Stack>

          {(statsLoading || roomsLoading) && <LinearProgress sx={{ mb: 4, borderRadius: 1 }} />}

          <Grid container spacing={4}>
            {featuredRooms.map((room) => (
              <Grid item xs={12} md={4} key={room.id}>
                <Card
                  elevation={0}
                  sx={{
                    borderRadius: 5,
                    border: '1px solid',
                    borderColor: 'divider',
                    overflow: 'hidden',
                    transition: 'all 0.3s ease',
                    '&:hover': { transform: 'translateY(-8px)', boxShadow: '0 20px 40px rgba(0,0,0,0.08)' }
                  }}
                >
                  <Box sx={{ position: 'relative', height: 240, bgcolor: '#f1f5f9' }}>
                    <img
                      src={room.imageUrl || room2Jpg}
                      alt={room.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
                      <Chip
                        label={room.roomType}
                        size="small"
                        sx={{ bgcolor: 'rgba(255,255,255,0.9)', fontWeight: 800, color: 'primary.main', backdropFilter: 'blur(4px)' }}
                      />
                    </Box>
                  </Box>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" fontWeight="800" noWrap gutterBottom>{room.name}</Typography>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <People sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary" fontWeight="600">{room.capacity} {t('rooms.seats')}</Typography>
                      </Stack>
                      <Typography variant="h6" color="primary.main" fontWeight="800">
                        {room.price || 0} DT<Typography component="span" variant="caption" sx={{ color: 'text.secondary', ml: 0.5, fontWeight: 600 }}>/hr</Typography>
                      </Typography>
                    </Stack>
                    <Button
                      variant="soft"
                      fullWidth
                      onClick={() => navigate(`/rooms?room=${room.id}`)}
                      sx={{ borderRadius: 3, fontWeight: 700, bgcolor: 'primary.soft', '&:hover': { bgcolor: 'primary.softHover' } }}
                    >
                      {t('rooms.reserve')}
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>
    </Box>
  );
};

export default DashboardPage;


