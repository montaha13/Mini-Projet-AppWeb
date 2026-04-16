import React, { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { 
  Box, 
  Container, 
  Typography, 
  Paper, 
  Grid, 
  TextField, 
  Button, 
  Divider, 
  Card, 
  CardContent, 
  Checkbox, 
  FormControlLabel,
  Alert,
  CircularProgress,
  Stack,
  Stepper,
  Step,
  StepLabel,
  Chip,
  IconButton
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import { useGetRoomByIdQuery } from '../../store/api/roomsApi';
import { useGetEquipmentQuery } from '../../store/api/equipmentApi';
import { useGetEquipmentSuggestionsQuery } from '../../store/api/recommendationsApi';
import { useCreateBookingMutation, useLazyCheckAvailabilityQuery } from '../../store/api/bookingsApi';

const steps = ['Booking Details', 'Add Equipment', 'Confirm Reservation'];

const BookRoom = () => {
  const { t } = useTranslation();
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [activeStep, setActiveStep] = useState(0);
  const [availabilityError, setAvailabilityError] = useState(null);
  
  // Form State
  const [bookingData, setBookingData] = useState({
    title: '',
    date: dayjs().format('YYYY-MM-DD'),
    startTime: '09:00',
    endTime: '10:00',
    participantCount: 1,
    notes: ''
  });
  
  const [selectedEquipment, setSelectedEquipment] = useState([]); // Array of { id, quantity }
  
  // API Hooks
  const { data: room, isLoading: roomLoading } = useGetRoomByIdQuery(roomId);
  const { data: equipmentData, isLoading: equipLoading } = useGetEquipmentQuery({ page: 1, limit: 100 });
  const [createBooking, { isLoading: isBooking }] = useCreateBookingMutation();
  const [checkAvailability, { isFetching: isChecking }] = useLazyCheckAvailabilityQuery();

  const roomType = room?.room?.type || room?.type;
  const { data: suggestionsData } = useGetEquipmentSuggestionsQuery({ type: roomType }, { skip: !roomType });
  const suggestedTypes = suggestionsData?.data || [];

  const equipmentList = useMemo(() => {
    return Array.isArray(equipmentData?.equipment) ? equipmentData.equipment : (Array.isArray(equipmentData?.items) ? equipmentData.items : (Array.isArray(equipmentData) ? equipmentData : []));
  }, [equipmentData]);

  // Price Calculation Logic
  const priceDetails = useMemo(() => {
    if (!room) return { duration: 0, roomTotal: 0, equipTotal: 0, total: 0 };
    
    const start = dayjs(`${bookingData.date} ${bookingData.startTime}`);
    const end = dayjs(`${bookingData.date} ${bookingData.endTime}`);
    const duration = Math.max(0, end.diff(start, 'hour', true));
    
    // Support both room object or room.room if wrapped
    const roomData = room.room || room;
    const roomPrice = parseFloat(roomData?.price) || 0;
    const roomTotal = duration * roomPrice;
    
    const equipTotal = selectedEquipment.reduce((acc, selected) => {
      const item = equipmentList.find(eq => String(eq.id) === String(selected.id));
      const qty = parseInt(selected.quantity) || 0;
      const itemPrice = parseFloat(item?.price) || 0;
      return acc + (itemPrice * qty);
    }, 0);
    
    return {
      duration,
      roomTotal,
      equipTotal,
      total: roomTotal + equipTotal
    };
  }, [room, bookingData.date, bookingData.startTime, bookingData.endTime, selectedEquipment, equipmentList]);

  const handleNext = async () => {
    if (activeStep === 0) {
      setAvailabilityError(null);
      try {
        const startTime = dayjs(`${bookingData.date} ${bookingData.startTime}`).toISOString();
        const endTime = dayjs(`${bookingData.date} ${bookingData.endTime}`).toISOString();
        
        const result = await checkAvailability({ 
          roomId: parseInt(roomId), 
          startTime, 
          endTime 
        }).unwrap();

        if (!result.available) {
          setAvailabilityError("This time slot is already reserved. Please choose another one.");
          return;
        }
      } catch (err) {
        console.error('Availability check failed', err);
        setAvailabilityError("Unable to verify availability. Please try again.");
        return;
      }
    }
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setAvailabilityError(null);
    setActiveStep((prev) => prev - 1);
  };

  const handleEquipmentToggle = (id) => {
    setSelectedEquipment(prev => {
      const isSelected = prev.find(item => item.id === id);
      if (isSelected) {
        return prev.filter(item => item.id !== id);
      } else {
        return [...prev, { id, quantity: 1 }];
      }
    });
  };

  const handleQuantityChange = (id, delta) => {
    setSelectedEquipment(prev => 
      prev.map(item => {
        if (item.id === id) {
          const itemInList = equipmentList.find(eq => eq.id === id);
          const maxQty = itemInList?.quantity || 1;
          const newQty = Math.max(1, Math.min(maxQty, item.quantity + delta));
          return { ...item, quantity: newQty };
        }
        return item;
      })
    );
  };

  const handleBooking = async () => {
    try {
      const startTime = dayjs(`${bookingData.date} ${bookingData.startTime}`).toISOString();
      const endTime = dayjs(`${bookingData.date} ${bookingData.endTime}`).toISOString();
      
      const pCount = parseInt(bookingData.participantCount);
      
      const payload = {
        roomId: parseInt(roomId),
        userId: user?.id,
        title: bookingData.title.trim(),
        startTime,
        endTime,
        participantCount: parseInt(bookingData.participantCount) || 1,
        notes: (bookingData.notes || '').trim(),
      };

      if (selectedEquipment.length > 0) {
        payload.equipments = selectedEquipment.map(item => ({
          id: parseInt(item.id),
          quantity: parseInt(item.quantity)
        }));
      }
      
      await createBooking(payload).unwrap();
      
      navigate('/my-bookings', { state: { message: 'Reservation created successfully!' } });
    } catch (err) {
      console.error('Booking failed', err);
      if (err.data?.message) {
        alert("Validation Error: " + (Array.isArray(err.data.message) ? err.data.message.join(", ") : err.data.message));
      } else {
        alert("Booking failed. Please check the console for details.");
      }
    }
  };

  if (roomLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box>;

  return (
    <Container maxWidth="md">
      <Paper sx={{ p: 4, mt: 4, borderRadius: 3, boxShadow: 3 }}>
        <Typography variant="h4" gutterBottom fontWeight="bold" color="primary">
          Reserve {room?.room?.name || room?.name || 'Room'}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          {room?.location} • {room?.type ? t(`rooms.${room.type.toLowerCase()}`) : t('rooms.workspace')} • Up to {room?.capacity} people
        </Typography>

        <Stepper activeStep={activeStep} sx={{ mb: 6 }}>
          {steps.map((label) => (
            <Step key={label}><StepLabel>{label}</StepLabel></Step>
          ))}
        </Stepper>

        {activeStep === 0 && (
          <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {availabilityError && (
              <Alert severity="error" onClose={() => setAvailabilityError(null)}>
                {availabilityError}
              </Alert>
            )}
            <TextField 
              label="Meeting Title" 
              fullWidth 
              value={bookingData.title}
              onChange={(e) => setBookingData({...bookingData, title: e.target.value})}
              placeholder="e.g., Weekly Team Sync"
            />
            <Grid container spacing={3}>
              <Grid xs={12} md={4}>
                <TextField 
                  label="Date" 
                  type="date" 
                  fullWidth 
                  InputLabelProps={{ shrink: true }}
                  value={bookingData.date}
                  onChange={(e) => setBookingData({...bookingData, date: e.target.value})}
                />
              </Grid>
              <Grid xs={6} md={4}>
                <TextField 
                  label="Start Time" 
                  type="time" 
                  fullWidth 
                  InputLabelProps={{ shrink: true }}
                  value={bookingData.startTime}
                  onChange={(e) => setBookingData({...bookingData, startTime: e.target.value})}
                />
              </Grid>
              <Grid xs={6} md={4}>
                <TextField 
                  label="End Time" 
                  type="time" 
                  fullWidth 
                  InputLabelProps={{ shrink: true }}
                  value={bookingData.endTime}
                  onChange={(e) => setBookingData({...bookingData, endTime: e.target.value})}
                />
              </Grid>
            </Grid>
            <TextField 
              label="Number of Participants" 
              type="number" 
              fullWidth 
              value={bookingData.participantCount}
              onChange={(e) => setBookingData({...bookingData, participantCount: e.target.value})}
            />
            <TextField 
              label="Additional Notes (Optional)" 
              multiline 
              rows={3} 
              fullWidth 
              value={bookingData.notes}
              onChange={(e) => setBookingData({...bookingData, notes: e.target.value})}
            />
          </Box>
        )}

        {activeStep === 1 && (
          <Box>
            <Typography variant="h6" gutterBottom fontWeight="bold">Available Equipment</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Select any additional items you need for your meeting.
            </Typography>
            {equipmentList.length > 0 ? (
              <Grid container spacing={2}>
                {equipmentList.map((item) => (
                  <Grid item xs={12} sm={6} key={item.id}>
                    <Card 
                      variant="outlined" 
                      sx={{ 
                        borderColor: selectedEquipment.find(e => e.id === item.id) ? 'primary.main' : 'divider',
                        backgroundColor: selectedEquipment.find(e => e.id === item.id) ? 'primary.50' : 'transparent',
                        position: 'relative'
                      }}
                    >
                      {suggestedTypes.includes(item.type) && (
                        <Chip 
                          label="RECOMMENDED" 
                          color="secondary" 
                          size="small" 
                          sx={{ 
                            position: 'absolute', 
                            top: -10, 
                            right: 10, 
                            height: 20, 
                            fontSize: '0.65rem', 
                            fontWeight: 900,
                            boxShadow: 2
                          }} 
                        />
                      )}
                      <CardContent sx={{ py: '12px !important' }}>
                        <Stack direction="row" alignItems="center" justifyContent="space-between">
                          <FormControlLabel
                            control={
                              <Checkbox 
                                checked={!!selectedEquipment.find(e => e.id === item.id)} 
                                onChange={() => handleEquipmentToggle(item.id)}
                              />
                            }
                            label={<Box sx={{ ml: 1 }}>
                              <Typography variant="subtitle2" fontWeight="bold">{item.name}</Typography>
                              <Typography variant="caption" color="text.secondary">
                                {item.condition || item.status || 'Operational'} • Max: {item.quantity || 1}
                              </Typography>
                            </Box>}
                          />
                          
                          {selectedEquipment.find(e => e.id === item.id) && (
                            <Stack direction="row" alignItems="center" spacing={1}>
                              <IconButton 
                                size="small" 
                                onClick={(e) => { e.stopPropagation(); handleQuantityChange(item.id, -1); }}
                                disabled={(selectedEquipment.find(e => e.id === item.id)?.quantity || 1) <= 1}
                              >
                                <Typography variant="h6" sx={{ lineHeight: 1 }}>-</Typography>
                              </IconButton>
                              <Typography variant="body2" fontWeight="bold">
                                {selectedEquipment.find(e => e.id === item.id)?.quantity || 1}
                              </Typography>
                              <IconButton 
                                size="small" 
                                onClick={(e) => { e.stopPropagation(); handleQuantityChange(item.id, 1); }}
                                disabled={(selectedEquipment.find(e => e.id === item.id)?.quantity || 1) >= (item.quantity || 1)}
                              >
                                <Typography variant="h6" sx={{ lineHeight: 1 }}>+</Typography>
                              </IconButton>
                            </Stack>
                          )}
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Paper sx={{ p: 4, textAlign: 'center', backgroundColor: 'grey.50', borderRadius: 2 }}>
                <Typography color="text.secondary">No additional equipment is available in the inventory.</Typography>
              </Paper>
            )}
          </Box>
        )}

        {activeStep === 2 && (
          <Box>
            <Alert severity="info" sx={{ mb: 4 }}>Please review your booking details before confirmation.</Alert>
            <Stack spacing={2}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography color="text.secondary">Room</Typography>
                <Typography fontWeight="bold">{room?.room?.name || room?.name || 'N/A'}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography color="text.secondary">Date & Time</Typography>
                <Typography fontWeight="bold">{dayjs(bookingData.date).format('MMMM DD, YYYY')} at {bookingData.startTime} - {bookingData.endTime}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography color="text.secondary">Participants</Typography>
                <Typography fontWeight="bold">{bookingData.participantCount}</Typography>
              </Box>
              
              <Divider sx={{ my: 1 }} />
              
              <Typography variant="subtitle1" fontWeight="bold" color="primary">Price Breakdown</Typography>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography color="text.secondary">Room ({priceDetails.duration.toFixed(1)} hrs x {(parseFloat(room?.room?.price || room?.price) || 0).toFixed(2)} DT/hr)</Typography>
                <Typography fontWeight="bold">{priceDetails.roomTotal.toFixed(2)} DT</Typography>
              </Box>
              
              {selectedEquipment.length > 0 && (
                <>
                  <Typography variant="subtitle2" sx={{ mt: 1 }}>Equipment Fees:</Typography>
                  {selectedEquipment.map(selected => {
                    const item = equipmentList.find(eq => eq.id === selected.id);
                    return (
                      <Box key={selected.id} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
                          • {item?.name} (x{selected.quantity})
                        </Typography>
                        <Typography variant="body2">
                          {((parseFloat(item?.price || 0)) * (parseInt(selected.quantity) || 1)).toFixed(2)} DT
                        </Typography>
                      </Box>
                    );
                  })}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                    <Typography variant="body2" sx={{ ml: 2 }}>Equipment Subtotal</Typography>
                    <Typography variant="body2" fontWeight="bold">{priceDetails.equipTotal.toFixed(2)} DT</Typography>
                  </Box>
                </>
              )}

              <Divider sx={{ my: 1 }} />
              
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                p: 2,
                backgroundColor: 'primary.50',
                borderRadius: 2
              }}>
                <Typography variant="h6" fontWeight="bold">Total Amount</Typography>
                <Typography variant="h5" fontWeight="bold" color="primary">{priceDetails.total.toFixed(2)} DT</Typography>
              </Box>
            </Stack>
          </Box>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 6, gap: 2 }}>
          {activeStep > 0 && <Button onClick={handleBack}>Back</Button>}
          {activeStep < steps.length - 1 ? (
            <Button 
              variant="contained" 
              onClick={handleNext} 
              disabled={!bookingData.title || isChecking}
              startIcon={isChecking && <CircularProgress size={20} color="inherit" />}
            >
              {isChecking ? 'Checking...' : 'Continue'}
            </Button>
          ) : (
            <Button 
              variant="contained" 
              color="success" 
              onClick={handleBooking}
              disabled={isBooking}
              startIcon={isBooking && <CircularProgress size={20} color="inherit" />}
            >
              {isBooking ? 'Confirming...' : 'Confirm Reservation'}
            </Button>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default BookRoom;


