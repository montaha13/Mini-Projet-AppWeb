import React from 'react';
import { Box, Typography, Button, Container, Paper, Stack } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import SecurityIcon from '@mui/icons-material/Security';
import { useTranslation } from 'react-i18next';

const UnauthorizedPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <Container maxWidth="sm">
      <Box 
        sx={{ 
          mt: 10, 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          textAlign: 'center'
        }}
      >
        <Paper 
          elevation={0} 
          sx={{ 
            p: 5, 
            borderRadius: 8, 
            border: '1px solid', 
            borderColor: 'divider',
            bgcolor: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.05)'
          }}
        >
          <Box 
            sx={{ 
              mb: 3, 
              display: 'inline-flex', 
              p: 2, 
              bgcolor: 'error.soft', 
              color: 'error.main', 
              borderRadius: 4 
            }}
          >
            <SecurityIcon sx={{ fontSize: 64 }} />
          </Box>
          
          <Typography variant="h4" fontWeight="900" gutterBottom sx={{ letterSpacing: -1 }}>
            Access Denied
          </Typography>
          
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4, fontWeight: 500 }}>
            {t('unauthorized_message') || "You do not have the necessary permissions to access this page. This area is reserved for administrators or managers."}
            <br />
            <br />
            <strong>Please make sure you are logged in with the correct account.</strong>
          </Typography>
          
          <Stack spacing={2}>
            <Button 
              variant="contained" 
              fullWidth 
              onClick={() => navigate('/dashboard')}
              sx={{ py: 1.5 }}
            >
              Go to User Dashboard
            </Button>
            
            <Button 
              variant="outlined" 
              fullWidth 
              onClick={() => navigate('/login')}
              sx={{ py: 1.5 }}
            >
              Log in with different account
            </Button>
          </Stack>
        </Paper>
      </Box>
    </Container>
  );
};

export default UnauthorizedPage;
