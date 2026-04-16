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
  Grid,
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  EventOutlined,
  CalendarMonth,
  AccessTime,
  Description
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useTranslation } from 'react-i18next';
import { useGetEventsQuery, useCreateEventMutation, useUpdateEventMutation, useDeleteEventMutation } from '../../store/api/eventsApi';
import PageHeader from '../../components/layout/PageHeader';

const AdminEvents = () => {
  const { t } = useTranslation();

  const schema = yup.object().shape({
    title: yup.string().required(t('common.title') + ' is required'),
    description: yup.string().required(t('common.description') + ' is required'),
    date: yup.string().required(t('common.date') + ' is required'),
    startTime: yup.string().required(t('common.start_time') + ' is required'),
    endTime: yup.string().required(t('common.end_time') + ' is required'),
    status: yup.string().default('SCHEDULED'),
  });

  const { data, refetch } = useGetEventsQuery({ page: 1, limit: 100 });
  const [createEvent] = useCreateEventMutation();
  const [updateEvent] = useUpdateEventMutation();
  const [deleteEvent] = useDeleteEventMutation();

  const [open, setOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const { control, handleSubmit, reset, setValue, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { title: '', description: '', date: '', startTime: '', endTime: '', status: 'SCHEDULED' }
  });

  const handleOpenAdd = () => {
    reset({ title: '', description: '', date: '', startTime: '', endTime: '', status: 'SCHEDULED' });
    setEditMode(false);
    setSelectedEvent(null);
    setOpen(true);
  };

  const handleOpenEdit = (event) => {
    const eventDate = new Date(event.startTime);
    const dateStr = !isNaN(eventDate) ? eventDate.toISOString().split('T')[0] : '';
    const startStr = !isNaN(eventDate) ? eventDate.toTimeString().substring(0, 5) : '09:00';

    const endDateObj = new Date(event.endTime);
    const endStr = !isNaN(endDateObj) ? endDateObj.toTimeString().substring(0, 5) : '10:00';

    setValue('title', event.title || '');
    setValue('description', event.description || '');
    setValue('date', dateStr);
    setValue('startTime', startStr);
    setValue('endTime', endStr);
    setValue('status', event.status || 'SCHEDULED');

    setSelectedEvent(event);
    setEditMode(true);
    setOpen(true);
  };

  const handleOpenView = (event) => {
    setSelectedEvent(event);
    setViewOpen(true);
  };

  const onSubmit = async (formData) => {
    try {
      // Precise formatting for backend: yyyy-MM-ddTHH:mm:ss (no millis, no Z)
      const formatDateTime = (date, time) => {
        return `${date}T${time}:00`;
      };

      const payload = {
        title: formData.title,
        description: formData.description,
        startTime: formatDateTime(formData.date, formData.startTime),
        endTime: formatDateTime(formData.date, formData.endTime),
        status: formData.status,
        isPublic: true, // Default to true if not specified
        location: 'Campus' // Default location
      };

      if (editMode && selectedEvent) {
        await updateEvent({ id: selectedEvent.id || selectedEvent._id, ...payload }).unwrap();
      } else {
        await createEvent(payload).unwrap();
      }
      setOpen(false);
      reset();
      refetch();
    } catch (err) {
      console.error('Failed to save event', err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm(t('common.confirm_delete'))) {
      try {
        await deleteEvent(id).unwrap();
        refetch();
      } catch (err) {
        console.error('Failed to delete event', err);
      }
    }
  };

  const eventsList = data?.events || data || [];

  return (
    <Box sx={{ pb: 4 }}>
      <PageHeader
        title={t('admin.event_mgmt')}
        subtitle={t('manage events') || "Conferences, workshops and university gatherings"}
        breadcrumbs={[{ label: t('admin.dashboard'), path: '/admin' }, { label: t('admin.events') }]}
        action={
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenAdd}
            sx={{ borderRadius: 50, px: 3 }}
          >
            {t('add event')}
          </Button>
        }
      />

      <Paper elevation={0} sx={{ mx: 3, borderRadius: 4, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 800, py: 2.5 }}>{t('common.title')}</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>{t('common.date')}</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>{t('common.time')}</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>{t('common.status')}</TableCell>
                <TableCell sx={{ fontWeight: 800 }} align="right">{t('common.actions')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {eventsList.map((item) => {
                const st = new Date(item.startTime);
                const et = new Date(item.endTime);
                
                const isValidDate = st && !isNaN(st.getTime());
                
                return (
                  <TableRow key={item.id || item._id} hover sx={{ '&:last-child td': { border: 0 }, transition: 'all 0.2s', '&:hover': { bgcolor: 'action.hover' } }}>
                    <TableCell>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar variant="rounded" sx={{ bgcolor: 'primary.soft', color: 'primary.main', fontWeight: 700 }}>
                          {item.title ? item.title.charAt(0).toUpperCase() : '?'}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight="700">
                            {item.title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" noWrap sx={{ maxWidth: 200, display: 'block' }}>
                            {item.description}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <CalendarMonth fontSize="small" sx={{ color: 'text.secondary', opacity: 0.7 }} />
                        <Typography variant="body2" fontWeight="500">
                          {isValidDate ? st.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <AccessTime fontSize="small" sx={{ color: 'text.secondary', opacity: 0.7 }} />
                        <Typography variant="body2" fontWeight="500">
                          {isValidDate ? `${st.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })} - ${et.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}` : 'TBD'}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={item.status || 'SCHEDULED'}
                        color={item.status === 'CANCELLED' ? 'error' : 'primary'}
                        size="small"
                        variant="soft"
                        sx={{ fontWeight: 800, fontSize: '0.7rem', px: 1 }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                        <IconButton size="small" onClick={() => handleOpenView(item)} sx={{ color: 'primary.main', bgcolor: 'primary.soft', '&:hover': { bgcolor: 'primary.main', color: 'white' } }}>
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" onClick={() => handleOpenEdit(item)} sx={{ color: 'info.main', bgcolor: 'info.soft', '&:hover': { bgcolor: 'info.main', color: 'white' } }}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" onClick={() => handleDelete(item.id || item._id)} sx={{ color: 'error.main', bgcolor: 'error.soft', '&:hover': { bgcolor: 'error.main', color: 'white' } }}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                );
              })}
              {eventsList.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 8, color: 'text.secondary' }}>
                    <Stack spacing={2} alignItems="center">
                      <CalendarMonth sx={{ fontSize: 64, opacity: 0.1 }} />
                      <Typography variant="body1" fontWeight="600">{t('common.no_data')}</Typography>
                    </Stack>
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
          <DialogTitle sx={{ fontWeight: 800 }}>{editMode ? t('admin.edit_event') : t('admin.create_event')}</DialogTitle>
          <DialogContent>
            <Stack spacing={2.5} sx={{ pt: 1 }}>
              <Controller name="title" control={control} render={({ field }) => (
                <TextField {...field} label={t('common.title')} fullWidth error={!!errors.title} helperText={errors.title?.message} InputProps={{ sx: { borderRadius: 3 } }} />
              )} />
              <Controller name="description" control={control} render={({ field }) => (
                <TextField {...field} label={t('common.description')} fullWidth multiline rows={3} error={!!errors.description} helperText={errors.description?.message} InputProps={{ sx: { borderRadius: 3 } }} />
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
        <DialogTitle sx={{ fontWeight: 800 }}>{t('admin.view_event')}</DialogTitle>
        <DialogContent dividers sx={{ bgcolor: 'grey.50' }}>
          {selectedEvent && (
            <Stack spacing={3} sx={{ py: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', p: 3, bgcolor: 'white', borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                <Avatar variant="rounded" sx={{ width: 80, height: 80, bgcolor: 'primary.soft', color: 'primary.main', borderRadius: 4, mr: 3 }}>
                  <EventOutlined sx={{ fontSize: 40 }} />
                </Avatar>
                <Box>
                  <Typography variant="h5" fontWeight="900" sx={{ color: 'text.primary', mb: 0.5 }}>{selectedEvent.title}</Typography>
                  <Stack direction="row" spacing={1}>
                    <Chip
                      label={selectedEvent.status || 'SCHEDULED'}
                      color="primary"
                      size="small"
                      variant="soft"
                      sx={{ fontWeight: 800, textTransform: 'uppercase', fontSize: '0.65rem' }}
                    />
                    <Chip
                      label={selectedEvent.isPublic ? 'PUBLIC' : 'PRIVATE'}
                      color={selectedEvent.isPublic ? 'success' : 'warning'}
                      size="small"
                      variant="soft"
                      sx={{ fontWeight: 800, textTransform: 'uppercase', fontSize: '0.65rem' }}
                    />
                  </Stack>
                </Box>
              </Box>

              <Box sx={{ px: 1 }}>
                <Typography variant="overline" color="text.secondary" fontWeight="900" sx={{ mb: 1, display: 'block', letterSpacing: 1 }}>
                  {t('common.description')}
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.7 }}>
                  {selectedEvent.description || 'No description provided.'}
                </Typography>
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider', bgcolor: 'white' }}>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Box sx={{ p: 1, bgcolor: 'primary.soft', borderRadius: 2, color: 'primary.main' }}>
                        <CalendarMonth fontSize="small" />
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary" fontWeight="800" sx={{ display: 'block', textTransform: 'uppercase' }}>
                          {t('common.date')}
                        </Typography>
                        <Typography variant="body2" fontWeight="700">
                          {selectedEvent.startTime ? new Date(selectedEvent.startTime).toLocaleDateString(undefined, { dateStyle: 'long' }) : 'N/A'}
                        </Typography>
                      </Box>
                    </Stack>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider', bgcolor: 'white' }}>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Box sx={{ p: 1, bgcolor: 'secondary.soft', borderRadius: 2, color: 'secondary.main' }}>
                        <AccessTime fontSize="small" />
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary" fontWeight="800" sx={{ display: 'block', textTransform: 'uppercase' }}>
                          {t('common.time')}
                        </Typography>
                        <Typography variant="body2" fontWeight="700">
                          {selectedEvent.startTime ? `${new Date(selectedEvent.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${new Date(selectedEvent.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'TBD'}
                        </Typography>
                      </Box>
                    </Stack>
                  </Paper>
                </Grid>
              </Grid>

              <Box sx={{ px: 1, opacity: 0.5 }}>
                <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>ID: {selectedEvent.id || selectedEvent._id}</Typography>
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

export default AdminEvents;


