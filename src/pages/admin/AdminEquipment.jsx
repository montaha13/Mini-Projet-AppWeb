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
  Grid,
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  HomeRepairService,
  Category,
  FactCheck
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useTranslation } from 'react-i18next';
import { useGetEquipmentQuery, useCreateEquipmentMutation, useUpdateEquipmentMutation, useDeleteEquipmentMutation } from '../../store/api/equipmentApi';
import PageHeader from '../../components/layout/PageHeader';

const AdminEquipment = () => {
  const { t } = useTranslation();

  const schema = yup.object().shape({
    name: yup.string().required(t('common.name') + ' is required'),
    type: yup.string().required(t('common.type') + ' is required'),
    price: yup.number().required(t('price') + ' is required').min(0),
    quantity: yup.number().required(t('quantity') + ' is required').min(1),
    condition: yup.string().default('OPERATIONAL'),
  });

  const { data, refetch } = useGetEquipmentQuery({ page: 1, limit: 100 });
  const [createEquipment] = useCreateEquipmentMutation();
  const [updateEquipment] = useUpdateEquipmentMutation();
  const [deleteEquipment] = useDeleteEquipmentMutation();

  const [open, setOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState(null);

  const { control, handleSubmit, reset, setValue, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { name: '', type: 'PROJECTOR', price: 0, quantity: 1, condition: 'OPERATIONAL' }
  });

  const handleOpenAdd = () => {
    setEditMode(false);
    reset({ name: '', type: 'PROJECTOR', price: 0, quantity: 1, condition: 'OPERATIONAL' });
    setSelectedEquipment(null);
    setOpen(true);
  };

  const handleOpenEdit = (equipment) => {
    setEditMode(true);
    setSelectedEquipment(equipment);
    setValue('name', equipment.name || '');
    setValue('type', equipment.type || '');
    setValue('price', equipment.price || 0);
    setValue('quantity', equipment.quantity || 1);
    setValue('condition', equipment.condition || equipment.status || 'OPERATIONAL');
    setOpen(true);
  };

  const handleOpenView = (equipment) => {
    setSelectedEquipment(equipment);
    setViewOpen(true);
  };

  const onSubmit = async (formData) => {
    try {
      const payload = {
        name: formData.name,
        type: formData.type,
        price: formData.price,
        quantity: formData.quantity,
        status: formData.condition
      };

      if (editMode && selectedEquipment) {
        await updateEquipment({ id: selectedEquipment.id || selectedEquipment._id, ...payload }).unwrap();
      } else {
        await createEquipment(payload).unwrap();
      }
      setOpen(false);
      reset();
      refetch();
    } catch (err) {
      console.error('Failed to save equipment', err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm(t('common.confirm_delete'))) {
      try {
        await deleteEquipment(id).unwrap();
        refetch();
      } catch (err) {
        console.error('Failed to delete equipment', err);
      }
    }
  };

  const equipmentList = Array.isArray(data?.equipment) ? data.equipment : (Array.isArray(data) ? data : (data?.data || data?.items || []));

  const getConditionColor = (cond) => {
    switch (cond) {
      case 'OPERATIONAL': return 'success';
      case 'DEFECTIVE': return 'error';
      case 'UNDER_MAINTENANCE': return 'warning';
      case 'RETIRED': return 'default';
      default: return 'primary';
    }
  };

  return (
    <Box sx={{ pb: 4 }}>
      <PageHeader
        title={t('admin.equip_mgmt')}
        subtitle={t('manage equipment') || "Projectors, screens and university resources"}
        breadcrumbs={[{ label: t('admin.dashboard'), path: '/admin' }, { label: t('admin.equipment') }]}
        action={
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenAdd}
            sx={{ borderRadius: 50, px: 3 }}
          >
            {t('admin.create_equip')}
          </Button>
        }
      />

      <Paper elevation={0} sx={{ mx: 3, borderRadius: 4, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 800, py: 2.5 }}>{t('common.equipment')}</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>{t('common.type')}</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>{t('price') || 'Price'}</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>{t('quantity') || 'Quantity'}</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>{t('common.condition')}</TableCell>
                <TableCell sx={{ fontWeight: 800 }} align="right">{t('common.actions')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {equipmentList.map((item) => (
                <TableRow key={item.id || item._id} hover sx={{ '&:last-child td': { border: 0 } }}>
                  <TableCell>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar sx={{ bgcolor: 'info.soft', color: 'info.main', borderRadius: 2 }}>
                        <HomeRepairService />
                      </Avatar>
                      <Typography variant="body2" fontWeight="700">
                        {item.name}
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Category fontSize="small" color="action" />
                      <Typography variant="body2" fontWeight="500">{item.type}</Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="700" color="primary.main">
                      {item.price || 0} DT
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="700">
                      {item.quantity || 1}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={item.condition || item.status || 'UNKNOWN'}
                      color={getConditionColor(item.condition || item.status)}
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
              {equipmentList.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 8, color: 'text.secondary' }}>
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
          <DialogTitle sx={{ fontWeight: 800 }}>{editMode ? t('admin.edit_equip') : t('admin.create_equip')}</DialogTitle>
          <DialogContent>
            <Stack spacing={2.5} sx={{ pt: 1 }}>
              <Controller name="name" control={control} render={({ field }) => (
                <TextField {...field} label={t('common.name')} fullWidth error={!!errors.name} helperText={errors.name?.message} InputProps={{ sx: { borderRadius: 3 } }} />
              )} />
              <Controller name="type" control={control} render={({ field }) => (
                <TextField select {...field} label={t('common.type')} fullWidth error={!!errors.type} helperText={errors.type?.message} InputProps={{ sx: { borderRadius: 3 } }}>
                  <MenuItem value="PROJECTOR">Projector</MenuItem>
                  <MenuItem value="MICROPHONE">Microphone</MenuItem>
                  <MenuItem value="PC">PC</MenuItem>
                  <MenuItem value="SCREEN">Screen</MenuItem>
                  <MenuItem value="WEBCAM">Webcam</MenuItem>
                  <MenuItem value="WHITEBOARD">Whiteboard</MenuItem>
                  <MenuItem value="TV">TV</MenuItem>
                  <MenuItem value="OTHER">Other</MenuItem>
                </TextField>
              )} />
              <Controller name="price" control={control} render={({ field }) => (
                <TextField {...field} type="number" label={t('price') || 'Price'} fullWidth error={!!errors.price} helperText={errors.price?.message} InputProps={{ sx: { borderRadius: 3 } }} />
              )} />
              <Controller name="quantity" control={control} render={({ field }) => (
                <TextField {...field} type="number" label={t('quantity') || 'Quantity'} fullWidth error={!!errors.quantity} helperText={errors.quantity?.message} InputProps={{ sx: { borderRadius: 3 } }} />
              )} />
              <Controller name="condition" control={control} render={({ field }) => (
                <TextField select {...field} label={t('common.condition')} fullWidth error={!!errors.condition} helperText={errors.condition?.message} InputProps={{ sx: { borderRadius: 3 } }}>
                  <MenuItem value="OPERATIONAL">Operational</MenuItem>
                  <MenuItem value="DEFECTIVE">Defective</MenuItem>
                  <MenuItem value="UNDER_MAINTENANCE">Under Maintenance</MenuItem>
                  <MenuItem value="RETIRED">Retired</MenuItem>
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
        <DialogTitle sx={{ fontWeight: 800 }}>{t('admin.view_equip')}</DialogTitle>
        <DialogContent dividers>
          {selectedEquipment && (
            <Stack spacing={3} sx={{ py: 2 }}>
              <Stack direction="row" spacing={3} alignItems="center">
                <Avatar sx={{ width: 64, height: 64, bgcolor: 'info.soft', color: 'info.main', borderRadius: 3 }}>
                  <HomeRepairService sx={{ fontSize: 32 }} />
                </Avatar>
                <Box>
                  <Typography variant="h5" fontWeight="800">{selectedEquipment.name}</Typography>
                  <Chip
                    label={selectedEquipment.condition || selectedEquipment.status || 'UNKNOWN'}
                    color={getConditionColor(selectedEquipment.condition || selectedEquipment.status)}
                    size="small"
                    variant="soft"
                    sx={{ mt: 1, fontWeight: 800 }}
                  />
                </Box>
              </Stack>
              <Grid container spacing={3}>
                <Grid item xs={6}>
                  <Stack spacing={0.5}>
                    <Typography variant="caption" color="text.secondary" fontWeight="800" sx={{ textTransform: 'uppercase' }}>{t('common.type')}</Typography>
                    <Typography variant="body1" fontWeight="600">{selectedEquipment.type}</Typography>
                  </Stack>
                </Grid>
                <Grid item xs={6}>
                  <Stack spacing={0.5}>
                    <Typography variant="caption" color="text.secondary" fontWeight="800" sx={{ textTransform: 'uppercase' }}>{t('common.condition')}</Typography>
                    <Typography variant="body1" fontWeight="600">{selectedEquipment.condition || selectedEquipment.status || 'Operational'}</Typography>
                  </Stack>
                </Grid>
                <Grid item xs={6}>
                  <Stack spacing={0.5}>
                    <Typography variant="caption" color="text.secondary" fontWeight="800" sx={{ textTransform: 'uppercase' }}>{t('price') || 'Price'}</Typography>
                    <Typography variant="body1" fontWeight="700" color="primary.main">{selectedEquipment.price || 0} DT</Typography>
                  </Stack>
                </Grid>
                <Grid item xs={12}>
                  <Divider />
                  <Typography variant="caption" color="text.secondary" fontWeight="800" sx={{ textTransform: 'uppercase', mt: 2, display: 'block' }}>ID</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>{selectedEquipment.id || selectedEquipment._id}</Typography>
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

export default AdminEquipment;


