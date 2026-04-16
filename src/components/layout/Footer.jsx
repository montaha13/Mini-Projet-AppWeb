import React from 'react';
import { Box, Container, Typography, Link, Divider } from '@mui/material';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        py: 4,
        px: 2,
        mt: 'auto',
        backgroundColor: '#0f172a',
        color: 'white',
      }}
    >
      <Container maxWidth={false} sx={{ px: { xs: 3, md: 10 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
          <Typography variant="body2" sx={{ opacity: 0.8 }}>
            {'Copyright © '}
            <Link color="inherit" href="/" sx={{ fontWeight: 'bold' }}>
              SmartRoomBooker
            </Link>{' '}
            {new Date().getFullYear()}
            {'.'}
          </Typography>
          <Box sx={{ display: 'flex', gap: 4 }}>
            <Link href="#" variant="body2" color="inherit" sx={{ textDecoration: 'none', opacity: 0.8, '&:hover': { opacity: 1 } }}>
              Terms of Service
            </Link>
            <Link href="#" variant="body2" color="inherit" sx={{ textDecoration: 'none', opacity: 0.8, '&:hover': { opacity: 1 } }}>
              Privacy Policy
            </Link>
            <Link href="#" variant="body2" color="inherit" sx={{ textDecoration: 'none', opacity: 0.8, '&:hover': { opacity: 1 } }}>
              Contact Us
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;


