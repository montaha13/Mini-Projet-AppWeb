import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  IconButton,
} from '@mui/material';
import { 
  Person, 
  Email, 
  Lock, 
  Visibility, 
  VisibilityOff,
  ArrowBack
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { loginStart, loginSuccess, loginFailure } from '../store/slices/authSlice.js';
import { useRegisterMutation } from '../store/api/authApi.jsx';

const RegisterPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isLoading, error } = useSelector((state) => state.auth);
  const [register] = useRegisterMutation();
  const [showPassword, setShowPassword] = useState(false);

  const schema = yup.object().shape({
    firstName: yup.string().required(t('profile.first_name') + ' is required'),
    lastName: yup.string().required(t('profile.last_name') + ' is required'),
    email: yup.string().email(t('auth.invalid_email')).required(t('auth.email_required')),
    password: yup.string().min(6, t('auth.pass_min')).required(t('auth.pass_required')),
    confirmPassword: yup.string().oneOf([yup.ref('password')], t('auth.pass_mismatch') || 'Passwords must match'),
  });

  const { control, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data) => {
    try {
      dispatch(loginStart());
      const { confirmPassword, ...registerData } = data;
      const result = await register(registerData).unwrap();
      dispatch(loginSuccess(result));
      navigate('/dashboard');
    } catch (error) {
      const errorMessage = error?.data?.message || error.message || 'Registration failed';
      dispatch(loginFailure(errorMessage));
    }
  };

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #0a192f 0%, #172a45 100%)',
      p: 2,
      py: 8
    }}>
      <Container maxWidth="sm" sx={{ p: 0 }}>
        <Card elevation={24} sx={{ borderRadius: 6, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
          <CardContent sx={{ p: { xs: 4, sm: 6 } }}>
            <Box sx={{ mb: 4, textAlign: 'center' }}>
              <Typography variant="h3" fontWeight="900" sx={{ color: 'primary.main', mb: 1, letterSpacing: -1 }}>
                SRB
              </Typography>
              <Typography variant="h5" fontWeight="800" sx={{ color: 'text.primary', mb: 1 }}>
                {t('auth.create_account') || 'Create Account'}
              </Typography>
              <Typography variant="body2" color="text.secondary" fontWeight="500">
                {t('auth.register_subtitle') || "Join the campus resource network today"}
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" variant="filled" sx={{ mb: 3, borderRadius: 3, fontWeight: 600 }}>
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit(onSubmit)}>
              <Stack spacing={2.5}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <Controller
                    name="firstName"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label={t('profile.first_name')}
                        error={!!errors.firstName}
                        helperText={errors.firstName?.message}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Person color="action" fontSize="small" />
                            </InputAdornment>
                          ),
                          sx: { borderRadius: 3 }
                        }}
                      />
                    )}
                  />
                  <Controller
                    name="lastName"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label={t('profile.last_name')}
                        error={!!errors.lastName}
                        helperText={errors.lastName?.message}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Person color="action" fontSize="small" />
                            </InputAdornment>
                          ),
                          sx: { borderRadius: 3 }
                        }}
                      />
                    )}
                  />
                </Stack>

                <Controller
                  name="email"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label={t('auth.email_label')}
                      placeholder="user@campus.edu"
                      error={!!errors.email}
                      helperText={errors.email?.message}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Email color="action" fontSize="small" />
                          </InputAdornment>
                        ),
                        sx: { borderRadius: 3 }
                      }}
                    />
                  )}
                />

                <Controller
                  name="password"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label={t('auth.password_label')}
                      type={showPassword ? 'text' : 'password'}
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
                      label={t('auth.confirm_password_label') || "Confirm Password"}
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
                    mt: 2,
                    textTransform: 'none',
                    boxShadow: '0 8px 16px rgba(10, 25, 47, 0.2)'
                  }}
                >
                  {isLoading ? <CircularProgress size={24} color="inherit" /> : (t('auth.register_btn') || "Create Account")}
                </Button>

                <Box sx={{ textAlign: 'center', mt: 2 }}>
                  <Typography variant="body2" color="text.secondary" fontWeight="500">
                    {t('auth.already_have_account') || "Already have an account?"}{' '}
                    <Link to="/login" style={{ textDecoration: 'none' }}>
                      <Typography component="span" variant="body2" color="primary" fontWeight="800">
                        {t('auth.login_link') || "Sign In"}
                      </Typography>
                    </Link>
                  </Typography>
                </Box>
              </Stack>
            </form>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default RegisterPage;


