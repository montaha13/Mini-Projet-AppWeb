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
  FormControlLabel,
  Checkbox,
  Container,
  Stack,
  InputAdornment,
  IconButton
} from '@mui/material';
import { Visibility, VisibilityOff, Email, Lock } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { loginStart, loginSuccess, loginFailure } from '../store/slices/authSlice.js';
import { useLoginMutation } from '../store/api/authApi.jsx';

const LoginPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isLoading, error } = useSelector((state) => state.auth);
  const [login] = useLoginMutation();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const schema = yup.object().shape({
    email: yup.string().email(t('auth.invalid_email')).required(t('auth.email_required')),
    password: yup.string().min(6, t('auth.pass_min')).required(t('auth.pass_required')),
  });

  const { control, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data) => {
    try {
      dispatch(loginStart());
      const result = await login(data).unwrap();
      dispatch(loginSuccess(result));
      navigate(result.user.role === 'ADMIN' ? '/admin' : '/dashboard');
    } catch (error) {
      dispatch(loginFailure(error?.data?.message || error.message || 'Login failed'));
    }
  };

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
            <Box sx={{ mb: 5, textAlign: 'center' }}>
              <Typography variant="h3" fontWeight="900" sx={{ color: 'primary.main', mb: 1, letterSpacing: -1 }}>
                SRB
              </Typography>
              <Typography variant="h5" fontWeight="800" sx={{ color: 'text.primary', mb: 1 }}>
                {t('auth.welcome_back') || 'Welcome Back'}
              </Typography>
              <Typography variant="body2" color="text.secondary" fontWeight="500">
                {t('auth.sign_in_subtitle')}
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" variant="filled" sx={{ mb: 3, borderRadius: 3, fontWeight: 600 }}>
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit(onSubmit)}>
              <Stack spacing={3}>
                <Controller
                  name="email"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label={t('auth.email_label')}
                      placeholder="admin@example.com"
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

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <FormControlLabel
                    control={<Checkbox checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} color="primary" />}
                    label={<Typography variant="body2" fontWeight="600">{t('auth.remember_me')}</Typography>}
                  />
                  <Link to="/forgot-password" style={{ textDecoration: 'none' }}>
                    <Typography variant="body2" color="primary" fontWeight="700">
                      {t('auth.forgot_password')}
                    </Typography>
                  </Link>
                </Box>

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
                  {isLoading ? <CircularProgress size={24} color="inherit" /> : t('auth.login_btn')}
                </Button>

                <Box sx={{ textAlign: 'center', mt: 2 }}>
                  <Typography variant="body2" color="text.secondary" fontWeight="500">
                    {t('auth.no_account') || "Don't have an account?"}{' '}
                    <Link to="/register" style={{ textDecoration: 'none' }}>
                      <Typography component="span" variant="body2" color="primary" fontWeight="800">
                        {t('auth.register_link') || "Sign Up"}
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

export default LoginPage;


