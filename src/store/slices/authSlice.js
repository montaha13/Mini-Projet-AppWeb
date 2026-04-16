import { createSlice } from '@reduxjs/toolkit';

const getSafeUser = () => {
  try {
    const user = localStorage.getItem('user');
    if (!user || user === 'undefined') return null;
    return JSON.parse(user);
  } catch (e) {
    return null;
  }
};

const initialState = {
  user: getSafeUser(),
  accessToken: localStorage.getItem('accessToken'),
  refreshToken: localStorage.getItem('refreshToken'),
  isAuthenticated: !!localStorage.getItem('accessToken') && localStorage.getItem('accessToken') !== 'undefined',
  isLoading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    loginSuccess: (state, action) => {
      state.isLoading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      const tkn = action.payload.accessToken || action.payload.token;
      state.accessToken = tkn;
      state.refreshToken = action.payload.refreshToken;
      state.error = null;
      localStorage.setItem('accessToken', tkn);
      localStorage.setItem('user', JSON.stringify(action.payload.user));
      if (action.payload.refreshToken) {
        localStorage.setItem('refreshToken', action.payload.refreshToken);
      }
    },
    loginFailure: (state, action) => {
      state.isLoading = false;
      state.isAuthenticated = false;
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.error = action.payload;
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.error = null;
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    },
    refreshTokenSuccess: (state, action) => {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      localStorage.setItem('accessToken', action.payload.accessToken);
      localStorage.setItem('refreshToken', action.payload.refreshToken);
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const { loginStart, loginSuccess, loginFailure, logout, refreshTokenSuccess, clearError } = authSlice.actions;
export default authSlice.reducer;
