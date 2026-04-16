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
  Stack,
  Avatar,
  Grid
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  MeetingRoom,
  People,
  LocationOn
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useTranslation } from 'react-i18next';
import { useGetRoomsQuery, useCreateRoomMutation, useUpdateRoomMutation, useDeleteRoomMutation } from '../../store/api/roomsApi';
import PageHeader from '../../components/layout/PageHeader';

const AdminRooms = () => {
  const { t } = useTranslation();

  const schema = yup.object().shape({
    name: yup.string().required(t('common.name') + ' is required'),
    capacity: yup.number().required(t('common.capacity') + ' is required').min(1),
    price: yup.number().required(t('price') + ' is required').min(0),
    location: yup.string().required(t('common.location') + ' is required'),
    type: yup.string().required(t('rooms.type') + ' is required').default('MEETING_ROOM'),
    status: yup.string().default('AVAILABLE'),
  });

  const { data, refetch } = useGetRoomsQuery({ page: 1, limit: 100 });
  const [createRoom] = useCreateRoomMutation();
  const [updateRoom] = useUpdateRoomMutation();
  const [deleteRoom] = useDeleteRoomMutation();

  const [open, setOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);

  const { control, handleSubmit, reset, setValue, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { name: '', capacity: 10, price: 0, location: '', type: 'MEETING_ROOM', status: 'AVAILABLE' }
  });

  const handleOpenAdd = () => {
    setEditMode(false);
    reset({ name: '', capacity: 10, price: 0, location: '', type: 'MEETING_ROOM', status: 'AVAILABLE' });
    setSelectedRoom(null);
    setOpen(true);
  };

  const handleOpenEdit = (room) => {
    setEditMode(true);
    setSelectedRoom(room);
    setValue('name', room.name || '');
    setValue('capacity', room.capacity || 10);
    setValue('price', room.price || 0);
    setValue('location', room.location || '');
    setValue('type', room.type || 'MEETING_ROOM');
    setValue('status', room.status || 'AVAILABLE');
    setOpen(true);
  };

  const handleOpenView = (room) => {
    setSelectedRoom(room);
    setViewOpen(true);
  };

  const onSubmit = async (formData) => {
    try {
      if (editMode && selectedRoom) {
        await updateRoom({ id: selectedRoom.id || selectedRoom._id, ...formData }).unwrap();
      } else {
        await createRoom(formData).unwrap();
      }
      setOpen(false);
      reset();
      refetch();
    } catch (err) {
      console.error('Failed to save room', err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm(t('common.confirm_delete'))) {
      try {
        await deleteRoom(id).unwrap();
        refetch();
      } catch (err) {
        console.error('Failed to delete room', err);
      }
    }
  };

  const roomsList = data?.rooms || data || [];

  return (
    <Box sx={{ pb: 4 }}>
      <PageHeader
        title={t('admin.room_mgmt')}
        subtitle={t('manage rooms') || "Create and organize meeting spaces"}
        breadcrumbs={[{ label: t('admin.dashboard'), path: '/admin' }, { label: t('admin.rooms') }]}
        action={
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenAdd}
            sx={{ borderRadius: 50, px: 3 }}
          >
            {t('add room')}
          </Button>
        }
      />

      <Paper elevation={0} sx={{ mx: 3, borderRadius: 4, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 800, py: 2.5 }}>{t('room')}</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>{t('rooms.type')}</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>{t('common.capacity')}</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>{t('price') || 'Price'}</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>{t('common.location')}</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>{t('common.status')}</TableCell>
                <TableCell sx={{ fontWeight: 800 }} align="right">{t('common.actions')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {roomsList.map((item) => (
                <TableRow key={item.id || item._id} hover sx={{ '&:last-child td': { border: 0 } }}>
                  <TableCell>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar sx={{ bgcolor: 'primary.soft', color: 'primary.main', borderRadius: 2 }}>
                        <MeetingRoom />
                      </Avatar>
                      <Typography variant="body2" fontWeight="700">
                        {item.name}
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="500">
                      {t(`rooms.${item.type?.toLowerCase()}`) || item.type}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <People fontSize="small" color="action" />
                      <Typography variant="body2" fontWeight="500">{item.capacity}</Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="700" color="primary.main">
                      {item.price || 0} DT
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <LocationOn fontSize="small" color="action" />
                      <Typography variant="body2" fontWeight="500">{item.location}</Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={item.status === 'AVAILABLE' ? t('rooms.active') : t('rooms.not_available')}
                      color={item.status === 'AVAILABLE' ? 'success' : 'default'}
                      size="small"
                      variant="soft"
                      sx={{ fontWeight: 800, fontSize: '0.75rem' }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                      <IconButton size="small" color="primary" onClick={() => handleOpenView(item)}>
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" color="secondary" onClick={() => handleOpenEdit(item)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => handleDelete(item.id || item._id)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
              {roomsList.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 8, color: 'text.secondary' }}>
                    {t('common.no_data')}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Add/Edit Dialog */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 4, p: 1 } }}
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogTitle sx={{ fontWeight: 800 }}>{editMode ? t('admin.edit_room') : t('admin.create_room')}</DialogTitle>
          <DialogContent>
            <Stack spacing={2.5} sx={{ pt: 1 }}>
              <Controller name="name" control={control} render={({ field }) => (
                <TextField {...field} label={t('common.name')} fullWidth error={!!errors.name} helperText={errors.name?.message} InputProps={{ sx: { borderRadius: 3 } }} />
              )} />
              <Stack direction="row" spacing={2}>
                <Controller name="capacity" control={control} render={({ field }) => (
                  <TextField {...field} type="number" label={t('common.capacity')} fullWidth error={!!errors.capacity} helperText={errors.capacity?.message} InputProps={{ sx: { borderRadius: 3 } }} />
                )} />
                <Controller name="price" control={control} render={({ field }) => (
                  <TextField {...field} type="number" label={t('price') || 'Price'} fullWidth error={!!errors.price} helperText={errors.price?.message} InputProps={{ sx: { borderRadius: 3 } }} />
                )} />
              </Stack>
              <Controller name="location" control={control} render={({ field }) => (
                <TextField {...field} label={t('common.location')} fullWidth error={!!errors.location} helperText={errors.location?.message} InputProps={{ sx: { borderRadius: 3 } }} />
              )} />
              <Controller name="type" control={control} render={({ field }) => (
                <TextField select {...field} label={t('rooms.type')} fullWidth error={!!errors.type} helperText={errors.type?.message} InputProps={{ sx: { borderRadius: 3 } }}>
                  <MenuItem value="MEETING_ROOM">{t('rooms.meeting_room')}</MenuItem>
                  <MenuItem value="CONFERENCE_ROOM">{t('rooms.conference_room')}</MenuItem>
                  <MenuItem value="AUDITORIUM">{t('rooms.auditorium')}</MenuItem>
                  <MenuItem value="LABORATORY">{t('rooms.laboratory')}</MenuItem>
                  <MenuItem value="OFFICE">{t('rooms.office')}</MenuItem>
                  <MenuItem value="WORKSHOP">{t('rooms.workshop')}</MenuItem>
                </TextField>
              )} />
              <Controller name="status" control={control} render={({ field }) => (
                <TextField select {...field} label={t('common.status')} fullWidth error={!!errors.status} helperText={errors.status?.message} InputProps={{ sx: { borderRadius: 3 } }}>
                  <MenuItem value="AVAILABLE">{t('rooms.active')}</MenuItem>
                  <MenuItem value="MAINTENANCE">{t('rooms.maintenance')}</MenuItem>
                  <MenuItem value="UNAVAILABLE">{t('rooms.not_available')}</MenuItem>
                </TextField>
              )} />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setOpen(false)}>{t('common.cancel')}</Button>
            <Button type="submit" variant="contained" sx={{ px: 4 }}>{editMode ? t('common.save_changes') : t('common.create')}</Button>
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
        <DialogTitle sx={{ fontWeight: 800 }}>{t('admin.view_room')}</DialogTitle>
        <DialogContent dividers>
          {selectedRoom && (
            <Stack spacing={3} sx={{ py: 2 }}>
              <Stack direction="row" spacing={3} alignItems="center">
                <Avatar sx={{ width: 64, height: 64, bgcolor: 'primary.soft', color: 'primary.main', borderRadius: 3 }}>
                  <MeetingRoom sx={{ fontSize: 32 }} />
                </Avatar>
                <Box>
                  <Typography variant="h5" fontWeight="800">{selectedRoom.name}</Typography>
                  <Chip
                    label={selectedRoom.status === 'AVAILABLE' ? t('rooms.active') : t('rooms.not_available')}
                    color={selectedRoom.status === 'AVAILABLE' ? 'success' : 'default'}
                    size="small"
                    variant="soft"
                    sx={{ mt: 1, fontWeight: 800 }}
                  />
                </Box>
              </Stack>
              <Grid container spacing={3}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary" fontWeight="800" sx={{ textTransform: 'uppercase' }}>{t('rooms.type')}</Typography>
                  <Typography variant="body1" fontWeight="600">{t(`rooms.${selectedRoom.type?.toLowerCase()}`) || selectedRoom.type}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary" fontWeight="800" sx={{ textTransform: 'uppercase' }}>{t('common.capacity')}</Typography>
                  <Typography variant="body1" fontWeight="600">{selectedRoom.capacity} {t('rooms.seats')}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary" fontWeight="800" sx={{ textTransform: 'uppercase' }}>{t('common.location')}</Typography>
                  <Typography variant="body1" fontWeight="600">{selectedRoom.location}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary" fontWeight="800" sx={{ textTransform: 'uppercase' }}>{t('price') || 'Price'}</Typography>
                  <Typography variant="body1" fontWeight="700" color="primary.main">{selectedRoom.price || 0} DT</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary" fontWeight="800" sx={{ textTransform: 'uppercase' }}>ID</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'monospace' }}>{selectedRoom.id || selectedRoom._id}</Typography>
                </Grid>
              </Grid>
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

export default AdminRooms;


