import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Avatar,
  Switch,
  FormControlLabel,
  Divider,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  IconButton,
} from '@mui/material';
import { Person, Edit, Security, Notifications, CameraAlt } from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import PageHeader from '../components/layout/PageHeader';

const ProfilePage = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { language: currentLanguage } = useSelector((state) => state.ui);
  
  const [isEditing, setIsEditing] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: '',
    department: '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
  });

  const handleInputChange = (field) => (event) => {
    setFormData({
      ...formData,
      [field]: event.target.value,
    });
  };

  const handleNotificationChange = (field) => (event) => {
    setPreferences({
      ...preferences,
      [field]: event.target.checked,
    });
  };

  const handleSaveProfile = () => {
    setIsEditing(false);
    setSuccessMessage(t('profile.save_success') || 'Profile updated successfully!');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handlePasswordChange = () => {
    setPasswordDialogOpen(false);
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
    setSuccessMessage(t('profile.password_success') || 'Password changed successfully!');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', pb: 8 }}>
      <PageHeader 
        title={t('profile.title')}
        subtitle={t('profile.personal_info')}
        breadcrumbs={[{ label: t('profile.title') }]}
      />

      <Container maxWidth="md">
        {successMessage && (
          <Alert severity="success" variant="filled" sx={{ mb: 4, borderRadius: 3 }}>
            {successMessage}
          </Alert>
        )}

        <Stack spacing={4}>
          {/* Header Profile Card */}
          <Card elevation={0} sx={{ borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
            <CardContent sx={{ p: 4 }}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={4} alignItems="center">
                <Box sx={{ position: 'relative' }}>
                  <Avatar 
                    sx={{ 
                      width: 120, 
                      height: 120, 
                      fontSize: '3rem', 
                      fontWeight: 800,
                      bgcolor: 'primary.main',
                      boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
                    }}
                  >
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </Avatar>
                  <IconButton 
                    size="small" 
                    sx={{ 
                      position: 'absolute', 
                      bottom: 0, 
                      right: 0, 
                      bgcolor: 'white', 
                      boxShadow: 2,
                      '&:hover': { bgcolor: '#f5f5f5' }
                    }}
                  >
                    <CameraAlt fontSize="small" color="primary" />
                  </IconButton>
                </Box>

                <Box sx={{ flexGrow: 1, textAlign: { xs: 'center', sm: 'left' } }}>
                  <Typography variant="h4" fontWeight="800" sx={{ mb: 0.5 }}>
                    {user?.firstName} {user?.lastName}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 2, fontWeight: 500 }}>
                    {user?.role} • {user?.email}
                  </Typography>
                  <Button
                    variant={isEditing ? 'contained' : 'outlined'}
                    startIcon={<Edit />}
                    onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
                    sx={{ borderRadius: 50, px: 3 }}
                  >
                    {isEditing ? t('profile.save') : t('profile.edit')}
                  </Button>
                </Box>
              </Stack>
            </CardContent>
          </Card>

          {/* Personal Information Form */}
          <Card elevation={0} sx={{ borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
            <CardContent sx={{ p: 4 }}>
              <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 4 }}>
                <Person color="primary" />
                <Typography variant="h6" fontWeight="800">{t('profile.personal_info')}</Typography>
              </Stack>

              <Stack spacing={3}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
                  <TextField
                    fullWidth
                    label={t('profile.first_name')}
                    value={formData.firstName}
                    onChange={handleInputChange('firstName')}
                    disabled={!isEditing}
                    InputProps={{ sx: { borderRadius: 3 } }}
                  />
                  <TextField
                    fullWidth
                    label={t('profile.last_name')}
                    value={formData.lastName}
                    onChange={handleInputChange('lastName')}
                    disabled={!isEditing}
                    InputProps={{ sx: { borderRadius: 3 } }}
                  />
                </Stack>
                <TextField
                  fullWidth
                  label={t('profile.email')}
                  value={formData.email}
                  onChange={handleInputChange('email')}
                  disabled={!isEditing}
                  type="email"
                  InputProps={{ sx: { borderRadius: 3 } }}
                />
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
                  <TextField
                    fullWidth
                    label={t('profile.phone')}
                    value={formData.phone}
                    onChange={handleInputChange('phone')}
                    disabled={!isEditing}
                    InputProps={{ sx: { borderRadius: 3 } }}
                  />
                  <TextField
                    fullWidth
                    label={t('profile.department')}
                    value={formData.department}
                    onChange={handleInputChange('department')}
                    disabled={!isEditing}
                    InputProps={{ sx: { borderRadius: 3 } }}
                  />
                </Stack>
              </Stack>
            </CardContent>
          </Card>

          {/* Settings & Security */}
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={4}>
            <Card elevation={0} sx={{ flex: 1, borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
              <CardContent sx={{ p: 4 }}>
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 3 }}>
                  <Notifications color="primary" />
                  <Typography variant="h6" fontWeight="800">{t('profile.notifications')}</Typography>
                </Stack>
                <Stack spacing={1}>
                  <FormControlLabel
                    control={<Switch checked={preferences.emailNotifications} onChange={handleNotificationChange('emailNotifications')} />}
                    label={t('profile.email_notif') || "Email Notifications"}
                    sx={{ '& .MuiTypography-root': { fontWeight: 500 } }}
                  />
                  <FormControlLabel
                    control={<Switch checked={preferences.pushNotifications} onChange={handleNotificationChange('pushNotifications')} />}
                    label={t('profile.push_notif') || "Push Notifications"}
                    sx={{ '& .MuiTypography-root': { fontWeight: 500 } }}
                  />
                </Stack>
              </CardContent>
            </Card>

            <Card elevation={0} sx={{ flex: 1, borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
              <CardContent sx={{ p: 4 }}>
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 3 }}>
                  <Security color="primary" />
                  <Typography variant="h6" fontWeight="800">{t('profile.security')}</Typography>
                </Stack>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3, fontWeight: 500 }}>
                  {t('profile.security_desc') || "Keep your account secure by updating your password regularly."}
                </Typography>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => setPasswordDialogOpen(true)}
                  sx={{ borderRadius: 3, py: 1.5, fontWeight: 700 }}
                >
                  {t('profile.change_password')}
                </Button>
              </CardContent>
            </Card>
          </Stack>
        </Stack>

        {/* Change Password Dialog */}
        <Dialog 
          open={passwordDialogOpen} 
          onClose={() => setPasswordDialogOpen(false)} 
          maxWidth="sm" 
          fullWidth
          PaperProps={{ sx: { borderRadius: 4, p: 1 } }}
        >
          <DialogTitle sx={{ fontWeight: 800 }}>{t('profile.change_password')}</DialogTitle>
          <DialogContent>
            <Stack spacing={3} sx={{ pt: 1 }}>
              <TextField
                fullWidth
                label={t('profile.current_password') || "Current Password"}
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                InputProps={{ sx: { borderRadius: 3 } }}
              />
              <TextField
                fullWidth
                label={t('profile.new_password') || "New Password"}
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                InputProps={{ sx: { borderRadius: 3 } }}
              />
              <TextField
                fullWidth
                label={t('profile.confirm_password') || "Confirm New Password"}
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                InputProps={{ sx: { borderRadius: 3 } }}
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setPasswordDialogOpen(false)}>{t('common.cancel') || "Cancel"}</Button>
            <Button onClick={handlePasswordChange} variant="contained" sx={{ px: 4 }}>
              {t('profile.change_password')}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default ProfilePage;


