import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isLoading: false,
  sidebarOpen: true,
  theme: localStorage.getItem('app-theme') || 'light',
  language: localStorage.getItem('app-language') || 'en',
  notifications: [],
  modals: {
    bookingModal: false,
    roomDetailsModal: false,
    userProfileModal: false,
    confirmModal: false,
  },
  snackbar: {
    open: false,
    message: '',
    severity: 'info',
  },
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action) => {
      state.sidebarOpen = action.payload;
    },
    setTheme: (state, action) => {
      state.theme = action.payload;
      localStorage.setItem('app-theme', action.payload);
    },
    setLanguage: (state, action) => {
      state.language = action.payload;
      localStorage.setItem('app-language', action.payload);
    },
    addNotification: (state, action) => {
      const notification = {
        ...action.payload,
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        read: false,
      };
      state.notifications.push(notification);
    },
    markNotificationAsRead: (state, action) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification) {
        notification.read = true;
      }
    },
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(n => n.id !== action.payload);
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },
    openModal: (state, action) => {
      state.modals[action.payload] = true;
    },
    closeModal: (state, action) => {
      state.modals[action.payload] = false;
    },
    closeAllModals: (state) => {
      Object.keys(state.modals).forEach(key => {
        state.modals[key] = false;
      });
    },
    showSnackbar: (state, action) => {
      state.snackbar = {
        open: true,
        message: action.payload.message,
        severity: action.payload.severity || 'info',
      };
    },
    hideSnackbar: (state) => {
      state.snackbar.open = false;
    },
  },
});

export const {
  setLoading,
  toggleSidebar,
  setSidebarOpen,
  setTheme,
  setLanguage,
  addNotification,
  markNotificationAsRead,
  removeNotification,
  clearNotifications,
  openModal,
  closeModal,
  closeAllModals,
  showSnackbar,
  hideSnackbar,
} = uiSlice.actions;

export default uiSlice.reducer;
