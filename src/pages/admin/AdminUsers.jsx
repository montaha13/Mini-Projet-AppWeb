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
  Avatar
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useTranslation } from 'react-i18next';
import { useGetUsersQuery, useDeactivateUserMutation, useUpdateUserMutation } from '../../store/api/usersApi';
import { useRegisterMutation } from '../../store/api/authApi';
import PageHeader from '../../components/layout/PageHeader';

const AdminUsers = () => {
  const { t } = useTranslation();
  // getUsers no longer accepts page/limit — backend returns all users and transformResponse
  // normalises the response to a plain User[] array.
  const { data, refetch } = useGetUsersQuery();
  const [registerUser] = useRegisterMutation();
  const [updateUser] = useUpdateUserMutation();
  const [deactivateUser] = useDeactivateUserMutation();

  const [open, setOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const schema = yup.object().shape({
    firstName: yup.string().required(t('profile.first_name') + ' is required'),
    lastName: yup.string().required(t('profile.last_name') + ' is required'),
    email: yup.string().email('Invalid email').required(t('common.email') + ' is required'),
    role: yup.string().required(t('common.role') + ' is required'),
  });

  const { control, handleSubmit, reset, setValue, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { firstName: '', lastName: '', email: '', role: 'USER' },
  });

  const handleOpenAdd = () => {
    setEditMode(false);
    reset({ firstName: '', lastName: '', email: '', role: 'USER' });
    setSelectedUser(null);
    setOpen(true);
  };

  const handleOpenEdit = (user) => {
    setEditMode(true);
    setSelectedUser(user);
    setValue('firstName', user.firstName || '');
    setValue('lastName', user.lastName || '');
    setValue('email', user.email || '');
    setValue('role', user.role || 'USER');
    setOpen(true);
  };

  const handleOpenView = (user) => {
    setSelectedUser(user);
    setViewOpen(true);
  };

  const onSubmit = async (formData) => {
    try {
      if (editMode && selectedUser) {
        const userId = selectedUser.id ?? selectedUser._id;
        await updateUser({ id: userId, ...formData }).unwrap();
      } else {
        await registerUser(formData).unwrap();
      }
      setOpen(false);
      reset();
      refetch();
    } catch (err) {
      console.error('Failed to save user', err);
    }
  };

  const handleDeactivate = async (id) => {
    if (window.confirm(t('common.confirm_delete'))) {
      try {
        await deactivateUser(id).unwrap();
        refetch();
      } catch (err) {
        console.error('Failed to deactivate user', err);
      }
    }
  };

  // transformResponse in usersApi.getUsers already guarantees a plain array.
  const users = data ?? [];

  return (
    <Box sx={{ pb: 4 }}>
      <PageHeader
        title={t('admin.user_mgmt')}
        subtitle={t('manage users') || "Administrate users and their access levels"}
        breadcrumbs={[{ label: t('admin.dashboard'), path: '/admin' }, { label: t('admin.users') }]}
        action={
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenAdd}
            sx={{ borderRadius: 50, px: 3 }}
          >
            {t('admin.create_user')}
          </Button>
        }
      />

      <Paper elevation={0} sx={{ mx: 3, borderRadius: 4, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 800, py: 2.5 }}>{t('common.user')}</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>{t('common.email')}</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>{t('common.role')}</TableCell>
                <TableCell sx={{ fontWeight: 800 }} align="right">{t('common.actions')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id || user._id} hover sx={{ '&:last-child td': { border: 0 } }}>
                  <TableCell>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar sx={{ width: 36, height: 36, fontSize: '0.875rem', fontWeight: 800, bgcolor: 'primary.main' }}>
                        {(user.firstName?.[0] || '') + (user.lastName?.[0] || '')}
                      </Avatar>
                      <Typography variant="body2" fontWeight="700">
                        {user.firstName} {user.lastName}
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.875rem', color: 'text.secondary', fontWeight: 500 }}>{user.email}</TableCell>
                  <TableCell>
                    <Chip
                      label={user.role}
                      color={user.role === 'ADMIN' ? 'error' : 'primary'}
                      size="small"
                      variant="soft"
                      sx={{ fontWeight: 800, fontSize: '0.75rem' }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                      <IconButton size="small" color="primary" onClick={() => handleOpenView(user)}>
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" color="secondary" onClick={() => handleOpenEdit(user)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => handleDeactivate(user.id || user._id)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
              {users.length === 0 && (
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
          <DialogTitle sx={{ fontWeight: 800 }}>{editMode ? t('admin.edit_user') : t('admin.create_user')}</DialogTitle>
          <DialogContent>
            <Stack spacing={2.5} sx={{ pt: 1 }}>
              <Stack direction="row" spacing={2}>
                <Controller name="firstName" control={control} render={({ field }) => (
                  <TextField {...field} label={t('profile.first_name')} fullWidth error={!!errors.firstName} helperText={errors.firstName?.message} InputProps={{ sx: { borderRadius: 3 } }} />
                )} />
                <Controller name="lastName" control={control} render={({ field }) => (
                  <TextField {...field} label={t('profile.last_name')} fullWidth error={!!errors.lastName} helperText={errors.lastName?.message} InputProps={{ sx: { borderRadius: 3 } }} />
                )} />
              </Stack>
              <Controller name="email" control={control} render={({ field }) => (
                <TextField {...field} label={t('common.email')} fullWidth error={!!errors.email} helperText={errors.email?.message} InputProps={{ sx: { borderRadius: 3 } }} />
              )} />
              <Controller name="role" control={control} render={({ field }) => (
                <TextField select {...field} label={t('common.role')} fullWidth error={!!errors.role} helperText={errors.role?.message} InputProps={{ sx: { borderRadius: 3 } }}>
                  <MenuItem value="USER">User</MenuItem>
                  <MenuItem value="ADMIN">Admin</MenuItem>
                  <MenuItem value="ORGANIZER">Organizer</MenuItem>
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
        <DialogTitle sx={{ fontWeight: 800 }}>{t('admin.view_user')}</DialogTitle>
        <DialogContent dividers>
          {selectedUser && (
            <Stack spacing={3} sx={{ py: 2 }}>
              <Stack direction="row" spacing={3} alignItems="center">
                <Avatar sx={{ width: 80, height: 80, fontSize: '2rem', fontWeight: 800, bgcolor: 'primary.main' }}>
                  {(selectedUser.firstName?.[0] || '') + (selectedUser.lastName?.[0] || '')}
                </Avatar>
                <Box>
                  <Typography variant="h5" fontWeight="800">
                    {selectedUser.firstName} {selectedUser.lastName}
                  </Typography>
                  <Chip label={selectedUser.role} color="primary" size="small" variant="soft" sx={{ mt: 1, fontWeight: 800 }} />
                </Box>
              </Stack>
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight="800" sx={{ textTransform: 'uppercase' }}>{t('common.email')}</Typography>
                <Typography variant="body1" fontWeight="600">{selectedUser.email}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight="800" sx={{ textTransform: 'uppercase' }}>ID</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'monospace' }}>{selectedUser.id || selectedUser._id}</Typography>
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

export default AdminUsers;


