import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Container,
  Stack,
  InputAdornment,
  IconButton
} from '@mui/material';
import { 
  Lock, 
  Visibility, 
  VisibilityOff, 
  ArrowBack,
  CheckCircle 
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useResetPasswordMutation } from '../store/api/authApi.jsx';

const ResetPasswordPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const [resetPassword, { isLoading, isSuccess, error }] = useResetPasswordMutation();
  const [showPassword, setShowPassword] = useState(false);
  
  const schema = yup.object().shape({
    password: yup.string().min(6, t('auth.pass_min')).required(t('auth.pass_required')),
    confirmPassword: yup.string()
      .oneOf([yup.ref('password'), null], t('profile.passwords_do_not_match') || 'Passwords must match')
      .required(t('auth.pass_required')),
  });

  const { control, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  const onSubmit = async (data) => {
    try {
      if (!token) throw new Error('Reset token is missing');
      await resetPassword({ token, password: data.password }).unwrap();
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      console.error('Reset password error:', err);
    }
  };

  if (!token) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #0a192f 0%, #172a45 100%)', p: 2 }}>
        <Container maxWidth="xs">
          <Alert severity="error" variant="filled" sx={{ borderRadius: 3, fontWeight: 600 }}>
            {t('auth.invalid_token') || 'Invalid or missing reset token.'}
          </Alert>
          <Button component={Link} to="/login" fullWidth sx={{ mt: 2, color: 'white' }} startIcon={<ArrowBack />}>
            {t('auth.back_to_login')}
          </Button>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #0a192f 0%, #172a45 100%)',
      p: 2
    }}>
      <Container maxWidth="xs" sx={{ p: 0 }}>
        <Card elevation={24} sx={{ borderRadius: 6, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
          <CardContent sx={{ p: { xs: 4, sm: 6 } }}>
            <Box sx={{ mb: 4, textAlign: 'center' }}>
              <Typography variant="h3" fontWeight="900" sx={{ color: 'primary.main', mb: 1, letterSpacing: -1 }}>
                SRB
              </Typography>
              <Typography variant="h5" fontWeight="800" sx={{ color: 'text.primary', mb: 1 }}>
                {t('auth.reset_password_title')}
              </Typography>
              <Typography variant="body2" color="text.secondary" fontWeight="500">
                {t('auth.reset_subtitle') || "Enter your new secure password below"}
              </Typography>
            </Box>

            {isSuccess ? (
              <Stack spacing={3} alignItems="center">
                <Box sx={{ p: 2, borderRadius: '50%', bgcolor: 'success.soft', color: 'success.main', display: 'flex' }}>
                  <CheckCircle sx={{ fontSize: 48 }} />
                </Box>
                <Alert severity="success" variant="filled" sx={{ borderRadius: 3, fontWeight: 600, width: '100%' }}>
                  {t('auth.reset_success')}
                </Alert>
                <Typography variant="body2" color="text.secondary" align="center">
                  {t('auth.redirecting_to_login') || "Redirecting to login"}...
                </Typography>
              </Stack>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)}>
                <Stack spacing={3}>
                  {error && (
                    <Alert severity="error" variant="filled" sx={{ borderRadius: 3, fontWeight: 600 }}>
                      {error.data?.message || 'Failed to reset password'}
                    </Alert>
                  )}

                  <Controller
                    name="password"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label={t('auth.new_password')}
                        type={showPassword ? 'text' : 'password'}
                        autoFocus
                        error={!!errors.password}
                        helperText={errors.password?.message}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Lock color="action" fontSize="small" />
                            </InputAdornment>
                          ),
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small">
                                {showPassword ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            </InputAdornment>
                          ),
                          sx: { borderRadius: 3 }
                        }}
                      />
                    )}
                  />

                  <Controller
                    name="confirmPassword"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label={t('auth.confirm_new_password')}
                        type="password"
                        error={!!errors.confirmPassword}
                        helperText={errors.confirmPassword?.message}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Lock color="action" fontSize="small" />
                            </InputAdornment>
                          ),
                          sx: { borderRadius: 3 }
                        }}
                      />
                    )}
                  />

                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    size="large"
                    disabled={isLoading}
                    sx={{ 
                      borderRadius: 50, 
                      height: 56, 
                      fontSize: '1rem', 
                      fontWeight: 800,
                      textTransform: 'none',
                      boxShadow: '0 8px 16px rgba(10, 25, 47, 0.2)'
                    }}
                  >
                    {isLoading ? <CircularProgress size={24} color="inherit" /> : (t('auth.reset_btn') || "Save Password")}
                  </Button>

                  <Box sx={{ textAlign: 'center', mt: 1 }}>
                    <Link to="/login" style={{ textDecoration: 'none' }}>
                      <Stack direction="row" spacing={1} alignItems="center" justifyContent="center" sx={{ color: 'primary.main' }}>
                        <ArrowBack fontSize="small" />
                        <Typography variant="body2" fontWeight="700">
                          {t('auth.back_to_login')}
                        </Typography>
                      </Stack>
                    </Link>
                  </Box>
                </Stack>
              </form>
            )}
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default ResetPasswordPage;


