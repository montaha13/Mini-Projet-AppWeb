import React, { useState } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  CardMedia, 
  Button, 
  Chip, 
  Stack, 
  Divider,
  Alert,
  Snackbar,
  CircularProgress
} from '@mui/material';
import { 
  CalendarToday, 
  LocationOn, 
  AccessTime, 
  Groups,
  CheckCircleOutline
} from '@mui/icons-material';
import dayjs from 'dayjs';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useGetPublicEventsQuery, useRegisterForEventMutation } from '../store/api/eventsApi';

const EventsPage = () => {
  const { t } = useTranslation();
  const { user } = useSelector((state) => state.auth);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  const { data: eventsRaw, isLoading, error } = useGetPublicEventsQuery({ page: 1, limit: 100 });
  const [registerForEvent, { isLoading: isRegistering }] = useRegisterForEventMutation();

  // Backend returns plain List<Event> (array). Guard against wrapped shapes.
  const events = Array.isArray(eventsRaw)
    ? eventsRaw
    : eventsRaw?.content ?? eventsRaw?.events ?? eventsRaw?.data ?? [];

  const handleParticipate = async (eventId) => {
    if (!user) {
      setSnackbar({ open: true, message: 'Please log in to register for events.', severity: 'warning' });
      return;
    }
    try {
      await registerForEvent({
        id: eventId,
        name: `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || user.email,
        email: user.email,
      }).unwrap();
      setSnackbar({ open: true, message: 'Successfully registered for the event!', severity: 'success' });
    } catch (err) {
      setSnackbar({ open: true, message: err.data?.message || 'Failed to register for the event.', severity: 'error' });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress size={60} thickness={4} />
      </Box>
    );
  }

  return (
    <Box sx={{ pb: 8 }}>
      {/* Hero Section */}
      <Box 
        sx={{ 
          bgcolor: 'primary.main', 
          color: 'white', 
          py: { xs: 6, md: 10 }, 
          mb: 6,
          borderRadius: { xs: 0, md: '0 0 40px 40px' },
          boxShadow: '0 10px 30px rgba(10, 25, 47, 0.2)'
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={7}>
              <Typography variant="h3" fontWeight="bold" gutterBottom sx={{ letterSpacing: '-0.02em' }}>
                {t('common.events')}
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9, mb: 4, fontWeight: 400, maxWidth: '600px' }}>
                Join professional workshops, networking events, and community gatherings happening in our spaces.
              </Typography>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Container maxWidth="lg">
        {error && <Alert severity="error" sx={{ mb: 4 }}>Error loading events. Please try again later.</Alert>}
        
        {events.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 10, bgcolor: 'background.paper', borderRadius: 4, border: '1px dashed', borderColor: 'divider' }}>
            <Typography variant="h6" color="text.secondary">No public events are currently scheduled.</Typography>
            <Typography variant="body2" color="text.secondary">Check back later for exciting opportunities!</Typography>
          </Box>
        ) : (
          <Grid container spacing={4}>
            {events.map((event, index) => {
              const localImages = ['workshop.png', 'networking.png', 'conference.png'];
              const imageSrc = `/assets/events/${localImages[index % localImages.length]}`;
              
              return (
                <Grid item xs={12} md={6} lg={4} key={event.id}>
                  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', transition: 'transform 0.3s ease', '&:hover': { transform: 'translateY(-8px)' } }}>
                    <CardMedia
                      component="img"
                      height="200"
                      image={imageSrc}
                      alt={event.title}
                      sx={{ filter: 'brightness(0.9)' }}
                    />
                  <CardContent sx={{ flexGrow: 1, p: 3 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
                      <Chip 
                        label={dayjs(event.startTime).format('MMM DD')} 
                        color="secondary" 
                        size="small" 
                        sx={{ fontWeight: 'bold', borderRadius: '4px' }} 
                      />
                      <Chip 
                        label="Public" 
                        variant="outlined" 
                        size="small" 
                        sx={{ borderRadius: '4px' }} 
                      />
                    </Stack>
                    
                    <Typography variant="h5" fontWeight="bold" gutterBottom color="text.primary">
                      {event.title}
                    </Typography>
                    
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      sx={{ 
                        mb: 3, 
                        display: '-webkit-box', 
                        WebkitLineClamp: 3, 
                        WebkitBoxOrient: 'vertical', 
                        overflow: 'hidden',
                        minHeight: '60px'
                      }}
                    >
                      {event.description || 'Join us for this exclusive event. Network with professionals and explore new opportunities in a collaborative environment.'}
                    </Typography>
                    
                    <Divider sx={{ mb: 3 }} />
                    
                    <Stack spacing={1.5} sx={{ mb: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <AccessTime sx={{ color: 'primary.main', fontSize: 20 }} />
                        <Typography variant="body2">{dayjs(event.startTime).format('HH:mm')} - {dayjs(event.endTime).format('HH:mm')}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <LocationOn sx={{ color: 'primary.main', fontSize: 20 }} />
                        <Typography variant="body2">{event.location || 'Conference Center'}</Typography>
                      </Box>
                    </Stack>
                    
                    <Button 
                      fullWidth 
                      variant="contained" 
                      onClick={() => handleParticipate(event.id)}
                      disabled={isRegistering}
                      startIcon={<CheckCircleOutline />}
                    >
                      Participate
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
        )}
      </Container>

      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} variant="filled" sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default EventsPage;


