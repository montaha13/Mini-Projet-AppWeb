import React from 'react';
import { Box, Typography, Container, Breadcrumbs, Link, Stack } from '@mui/material';
import { NavigateNext as NavigateNextIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink } from 'react-router-dom';

const PageHeader = ({ title, subtitle, breadcrumbs = [], action }) => {
  const { t } = useTranslation();

  return (
    <Box 
      sx={{ 
        bgcolor: 'background.paper', 
        pt: 6, 
        pb: 4, 
        mb: 4,
        borderBottom: '1px solid',
        borderColor: 'divider',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <Container maxWidth="lg">
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={2}>
          <Stack spacing={1}>
            {breadcrumbs.length > 0 && (
              <Breadcrumbs 
                separator={<NavigateNextIcon fontSize="small" />} 
                aria-label="breadcrumb"
                sx={{ mb: 1 }}
              >
                <Link 
                  component={RouterLink} 
                  to="/dashboard" 
                  underline="hover" 
                  color="inherit"
                  sx={{ fontSize: '0.875rem' }}
                >
                  {t('common.dashboard')}
                </Link>
                {breadcrumbs.map((crumb, index) => (
                  <Typography 
                    key={index} 
                    color={index === breadcrumbs.length - 1 ? 'text.primary' : 'inherit'}
                    sx={{ fontSize: '0.875rem', fontWeight: index === breadcrumbs.length - 1 ? 600 : 400 }}
                  >
                    {crumb.label}
                  </Typography>
                ))}
              </Breadcrumbs>
            )}

            <Typography variant="h3" color="text.primary" gutterBottom sx={{ fontWeight: 800 }}>
              {title}
            </Typography>
            
            {subtitle && (
              <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 700 }}>
                {subtitle}
              </Typography>
            )}
          </Stack>
          
          {action && (
            <Box sx={{ alignSelf: { xs: 'flex-start', sm: 'center' } }}>
              {action}
            </Box>
          )}
        </Stack>
      </Container>
    </Box>
  );
};

export default PageHeader;


