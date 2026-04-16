import React, { useState } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Box, 
  Container, 
  IconButton, 
  Menu, 
  MenuItem, 
  Avatar,
  Tooltip,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { 
  Menu as MenuIcon, 
  AccountCircle, 
  Brightness4, 
  Brightness7, 
  Language as LanguageIcon,
  Translate
} from '@mui/icons-material';
import { logout } from '../../store/slices/authSlice';
import { setTheme, setLanguage } from '../../store/slices/uiSlice';

const Header = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { theme: currentTheme, language: currentLanguage } = useSelector((state) => state.ui);
  
  const isDashboard = location.pathname === '/dashboard';
  const [anchorEl, setAnchorEl] = useState(null);
  const [langAnchorEl, setLangAnchorEl] = useState(null);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleLangMenu = (event) => {
    setLangAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLangClose = () => {
    setLangAnchorEl(null);
  };

  const handleLanguageChange = (lang) => {
    dispatch(setLanguage(lang));
    handleLangClose();
  };

  const toggleTheme = () => {
    dispatch(setTheme(currentTheme === 'light' ? 'dark' : 'light'));
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <AppBar 
      position={isDashboard ? "absolute" : "sticky"} 
      elevation={isDashboard ? 0 : 1} 
      sx={{ 
        backgroundColor: isDashboard ? 'transparent' : (currentTheme === 'dark' ? 'background.paper' : 'white'), 
        color: isDashboard ? 'white' : 'text.primary',
        transition: 'all 0.3s ease',
        borderBottom: isDashboard ? 'none' : '1px solid',
        borderColor: 'divider'
      }}
    >
      <Container maxWidth={false} sx={{ px: { xs: 2, md: 8 } }}>
        <Toolbar disableGutters>
          <Typography
            variant="h6"
            noWrap
            component={RouterLink}
            to="/"
            sx={{
              mr: 2,
              display: { xs: 'none', md: 'flex' },
              fontWeight: 700,
              color: isDashboard || currentTheme === 'dark' ? 'white' : 'primary.main',
              textDecoration: 'none',
              flexGrow: 0
            }}
          >
            SmartRoomBooker
          </Typography>

          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, ml: 4 }}>
            <Button
              component={RouterLink}
              to="/rooms"
              sx={{ my: 2, color: isDashboard ? 'white' : 'text.primary', display: 'block', fontWeight: 500 }}
            >
              {t('rooms_plural')}
            </Button>
            <Button
              component={RouterLink}
              to="/my-bookings"
              sx={{ my: 2, color: isDashboard ? 'white' : 'text.primary', display: 'block', fontWeight: 500 }}
            >
              {t('common.my_bookings')}
            </Button>
            <Button
              component={RouterLink}
              to="/events"
              sx={{ my: 2, color: isDashboard ? 'white' : 'text.primary', display: 'block', fontWeight: 500 }}
            >
              {t('common.events')}
            </Button>
          </Box>

          <Box sx={{ flexGrow: 0, display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* Theme Toggle */}
            <Tooltip title={currentTheme === 'light' ? t('profile.dark') : t('profile.light')}>
              <IconButton onClick={toggleTheme} color="inherit">
                {currentTheme === 'light' ? <Brightness4 /> : <Brightness7 />}
              </IconButton>
            </Tooltip>

            {/* Language Selector */}
            <Tooltip title={t('profile.language')}>
              <IconButton onClick={handleLangMenu} color="inherit">
                <LanguageIcon />
              </IconButton>
            </Tooltip>
            <Menu
              anchorEl={langAnchorEl}
              open={Boolean(langAnchorEl)}
              onClose={handleLangClose}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
              <MenuItem onClick={() => handleLanguageChange('en')} selected={currentLanguage === 'en'}>
                <ListItemIcon><Translate fontSize="small" /></ListItemIcon>
                <ListItemText>{t('profile.english')}</ListItemText>
              </MenuItem>
              <MenuItem onClick={() => handleLanguageChange('fr')} selected={currentLanguage === 'fr'}>
                <ListItemIcon><Translate fontSize="small" /></ListItemIcon>
                <ListItemText>{t('profile.french')}</ListItemText>
              </MenuItem>
              <MenuItem onClick={() => handleLanguageChange('ar')} selected={currentLanguage === 'ar'}>
                <ListItemIcon><Translate fontSize="small" /></ListItemIcon>
                <ListItemText>{t('profile.arabic')}</ListItemText>
              </MenuItem>
            </Menu>

            {user ? (
              <>
                <Tooltip title={t('profile.title')}>
                  <IconButton onClick={handleMenu} sx={{ p: 0, ml: 1 }}>
                    <Avatar 
                      sx={{ bgcolor: 'primary.main' }}
                      alt={user.firstName}
                    >
                      {user.firstName?.charAt(0)}
                    </Avatar>
                  </IconButton>
                </Tooltip>
                <Menu
                  sx={{ mt: '45px' }}
                  id="menu-appbar"
                  anchorEl={anchorEl}
                  anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  open={Boolean(anchorEl)}
                  onClose={handleClose}
                >
                  <MenuItem onClick={() => { handleClose(); navigate('/profile'); }}>
                    {t('profile.title')}
                  </MenuItem>
                  {user.role === 'ADMIN' && (
                    <MenuItem onClick={() => { handleClose(); navigate('/admin'); }}>
                      {t('common.admin')}
                    </MenuItem>
                  )}
                  <MenuItem onClick={handleLogout}>{t('common.logout')}</MenuItem>
                </Menu>
              </>
            ) : (
              <Button component={RouterLink} to="/login" variant="contained" sx={{ ml: 1 }}>
                Login
              </Button>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Header;


