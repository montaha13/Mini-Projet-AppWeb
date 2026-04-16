import React, { useState } from 'react';
import { Link } from 'react-router-dom';
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
} from '@mui/material';
import { Email, ArrowBack } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useForgotPasswordMutation } from '../store/api/authApi.jsx';

const ForgotPasswordPage = () => {
  const { t } = useTranslation();
  const [forgotPassword, { isLoading, isSuccess, error }] = useForgotPasswordMutation();
  
  const schema = yup.object().shape({
    email: yup.string().email(t('auth.invalid_email')).required(t('auth.email_required')),
  });

  const { control, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (data) => {
    try {
      await forgotPassword(data.email).unwrap();
    } catch (err) {
      console.error('Forgot password error:', err);
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
            <Box sx={{ mb: 4, textAlign: 'center' }}>
              <Typography variant="h3" fontWeight="900" sx={{ color: 'primary.main', mb: 1, letterSpacing: -1 }}>
                SRB
              </Typography>
              <Typography variant="h5" fontWeight="800" sx={{ color: 'text.primary', mb: 1 }}>
                {t('auth.forgot_password_title')}
              </Typography>
              <Typography variant="body2" color="text.secondary" fontWeight="500">
                {t('auth.forgot_password_desc')}
              </Typography>
            </Box>

            {isSuccess ? (
              <Stack spacing={4} alignItems="center">
                <Alert severity="success" variant="filled" sx={{ borderRadius: 3, fontWeight: 600, width: '100%' }}>
                  {t('auth.check_email_success')}
                </Alert>
                <Button 
                  component={Link} 
                  to="/login" 
                  variant="outlined" 
                  startIcon={<ArrowBack />}
                  sx={{ borderRadius: 50, px: 4 }}
                >
                  {t('auth.back_to_login')}
                </Button>
              </Stack>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)}>
                <Stack spacing={3}>
                  {error && (
                    <Alert severity="error" variant="filled" sx={{ borderRadius: 3, fontWeight: 600 }}>
                      {error.data?.message || 'Failed to send reset link'}
                    </Alert>
                  )}

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
                    {isLoading ? <CircularProgress size={24} color="inherit" /> : t('auth.send_reset_link')}
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

export default ForgotPasswordPage;


