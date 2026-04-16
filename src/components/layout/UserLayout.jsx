import { Outlet, useLocation } from 'react-router-dom';
import { Box, CssBaseline } from '@mui/material';
import Header from './Header';
import Footer from './Footer';

const UserLayout = () => {
  const location = useLocation();
  const isDashboard = location.pathname === '/dashboard';

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <CssBaseline />
      <Header />
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          py: isDashboard ? 0 : 3, 
          display: 'flex', 
          flexDirection: 'column' 
        }}
      >
        <Outlet />
      </Box>
      <Footer />
    </Box>
  );
};

export default UserLayout;


