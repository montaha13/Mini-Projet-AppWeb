import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import EventIcon from '@mui/icons-material/Event';
import BookOnlineIcon from '@mui/icons-material/BookOnline';
import ComputerIcon from '@mui/icons-material/Computer';
import LogoutIcon from '@mui/icons-material/Logout';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import { setTheme } from '../../store/slices/uiSlice';

const drawerWidth = 240;

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { theme: currentTheme } = useSelector((state) => state.ui);
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleTheme = () => {
    dispatch(setTheme(currentTheme === 'light' ? 'dark' : 'light'));
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/admin' },
    { text: 'Users', icon: <PeopleIcon />, path: '/admin/users' },
    { text: 'Rooms', icon: <MeetingRoomIcon />, path: '/admin/rooms' },
    { text: 'Events', icon: <EventIcon />, path: '/admin/events' },
    { text: 'Reservations', icon: <BookOnlineIcon />, path: '/admin/reservations' },
    { text: 'Equipment', icon: <ComputerIcon />, path: '/admin/equipment' },
  ];

  const drawer = (
    <Box sx={{ bgcolor: '#0a192f', height: '100%', color: 'white' }}>
      <Toolbar sx={{ mb: 2 }}>
        <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 800, color: 'white', letterSpacing: 0.5 }}>
          SRB ADMIN
        </Typography>
      </Toolbar>
      <List sx={{ px: 2 }}>
        {menuItems.map((item) => {
          const active = location.pathname === item.path;
          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                selected={active}
                onClick={() => navigate(item.path)}
                sx={{
                  borderRadius: 3,
                  '&.Mui-selected': {
                    bgcolor: 'primary.main',
                    color: 'white',
                    '&:hover': { bgcolor: 'primary.dark' },
                    '& .MuiListItemIcon-root': { color: 'white' }
                  },
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.05)'
                  }
                }}
              >
                <ListItemIcon sx={{ color: active ? 'white' : 'rgba(255,255,255,0.7)', minWidth: 40 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: active ? 700 : 500 }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
      <Box sx={{ position: 'absolute', bottom: 0, width: drawerWidth, p: 2 }}>
        <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', mb: 2 }} />
        <ListItemButton
          onClick={handleLogout}
          sx={{
            borderRadius: 3,
            color: '#ff8a80',
            '&:hover': { bgcolor: 'rgba(255,138,128,0.1)' }
          }}
        >
          <ListItemIcon sx={{ color: '#ff8a80', minWidth: 40 }}>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText primary="Logout" primaryTypographyProps={{ fontWeight: 600 }} />
        </ListItemButton>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', bgcolor: 'background.default', minHeight: '100vh' }}>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          bgcolor: 'background.paper',
          color: 'text.primary',
          borderBottom: '1px solid',
          borderColor: 'divider'
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 800, fontSize: '1.1rem', flexGrow: 1 }}>
            Smart Room Booker
          </Typography>
          <Tooltip title={currentTheme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}>
            <IconButton onClick={toggleTheme} color="inherit">
              {currentTheme === 'light' ? <Brightness4Icon /> : <Brightness7Icon />}
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, border: 'none' },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, borderRight: 'none' },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 4,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mt: 8,
          bgcolor: 'background.default'
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default AdminLayout;


