import React, { useMemo, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider, useSelector } from 'react-redux';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import { prefixer } from 'stylis';
import rtlPlugin from 'stylis-plugin-rtl';

import './i18n.jsx'; // Initialize i18n
import i18n from 'i18next';
import { store } from './store/index.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import LoginPage from './pages/LoginPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import RoomsPage from './pages/RoomsPage.jsx';
import BookingsPage from './pages/BookingsPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import AdminLayout from './components/layout/AdminLayout.jsx';
import UserLayout from './components/layout/UserLayout.jsx';
import BookRoom from './pages/user/BookRoom.jsx';
import EventsPage from './pages/EventsPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';

import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import AdminUsers from './pages/admin/AdminUsers.jsx';
import AdminRooms from './pages/admin/AdminRooms.jsx';
import AdminEvents from './pages/admin/AdminEvents.jsx';
import AdminReservations from './pages/admin/AdminReservations.jsx';
import AdminEquipment from './pages/admin/AdminEquipment.jsx';
import ForgotPasswordPage from './pages/ForgotPasswordPage.jsx';
import ResetPasswordPage from './pages/ResetPasswordPage.jsx';
import UnauthorizedPage from './pages/UnauthorizedPage.jsx';

// Create RTL cache
const cacheRtl = createCache({
  key: 'muirtl',
  stylisPlugins: [prefixer, rtlPlugin],
});

const cacheLtr = createCache({
  key: 'mui',
});

const AppContent = () => {
  const themeMode = useSelector((state) => state.ui.theme || 'light');
  const language = useSelector((state) => state.ui.language || 'en');
  const isRtl = language === 'ar';

  useEffect(() => {
    i18n.changeLanguage(language);
    document.dir = isRtl ? 'rtl' : 'ltr';
  }, [language, isRtl]);

  const theme = useMemo(() => createTheme({
    direction: isRtl ? 'rtl' : 'ltr',
    palette: {
      mode: themeMode,
      primary: {
        main: '#0a192f', // Professional Slate Blue
        light: '#172a45',
        dark: '#020c1b',
      },
      secondary: {
        main: '#64ffda', // Teal/Safe Green
      },
      error: {
        main: '#f44336',
      },
      background: {
        default: themeMode === 'light' ? '#f8fafc' : '#0b1120',
        paper: themeMode === 'light' ? '#ffffff' : '#111827',
      },
    },
    typography: {
      fontFamily: isRtl 
        ? '"Tajawal", "Inter", "Roboto", sans-serif'
        : '"Inter", "Outfit", "Roboto", sans-serif',
      h3: {
        fontWeight: 800,
        letterSpacing: '-0.02em',
      },
      h4: {
        fontWeight: 800,
        letterSpacing: '-0.02em',
      },
      button: {
        fontWeight: 600,
        textTransform: 'none',
      }
    },
    shape: {
      borderRadius: 12,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 50, // Ultra rounded buttons like dashboard
            padding: '10px 24px',
            boxShadow: 'none',
            '&:hover': {
              boxShadow: '0 4px 12px rgba(10, 25, 47, 0.15)',
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            boxShadow: themeMode === 'light' 
              ? '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
              : '0 4px 6px -1px rgba(0, 0, 0, 0.2), 0 2px 4px -1px rgba(0, 0, 0, 0.1)',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            border: themeMode === 'light' ? '1px solid #e2e8f0' : '1px solid #1e293b',
          },
        },
      },
    },
  }), [themeMode, isRtl]);

  return (
    <CacheProvider value={isRtl ? cacheRtl : cacheLtr}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            
            {/* User Routes inside UserLayout */}
            <Route
              element={
                <ProtectedRoute>
                  <UserLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/rooms" element={<RoomsPage />} />
              <Route path="/events" element={<EventsPage />} />
              <Route path="/book/:roomId" element={<BookRoom />} />
              <Route path="/bookings" element={<BookingsPage />} />
              <Route path="/my-bookings" element={<BookingsPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Route>

            {/* Admin Routes inside AdminLayout */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute requiredRole="ADMIN">
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="rooms" element={<AdminRooms />} />
              <Route path="events" element={<AdminEvents />} />
              <Route path="reservations" element={<AdminReservations />} />
              <Route path="equipment" element={<AdminEquipment />} />
            </Route>
            
            <Route path="/unauthorized" element={<UnauthorizedPage />} />
            
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Router>
      </ThemeProvider>
    </CacheProvider>
  );
};

function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}

export default App;


