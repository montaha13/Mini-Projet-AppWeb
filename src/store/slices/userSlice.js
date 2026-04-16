import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  preferences: {
    favoriteRooms: [],
    notifications: {
      email: true,
      push: true,
      sms: false,
    },
    theme: 'light',
    language: 'en',
  },
  profile: null,
  isLoading: false,
  error: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setProfile: (state, action) => {
      state.profile = action.payload;
    },
    updateProfile: (state, action) => {
      if (state.profile) {
        state.profile = { ...state.profile, ...action.payload };
      }
    },
    setPreferences: (state, action) => {
      state.preferences = { ...state.preferences, ...action.payload };
    },
    addToFavorites: (state, action) => {
      if (!state.preferences.favoriteRooms.includes(action.payload)) {
        state.preferences.favoriteRooms.push(action.payload);
      }
    },
    removeFromFavorites: (state, action) => {
      state.preferences.favoriteRooms = state.preferences.favoriteRooms.filter(
        roomId => roomId !== action.payload
      );
    },
    updateNotificationPreferences: (state, action) => {
      state.preferences.notifications = { ...state.preferences.notifications, ...action.payload };
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const {
  setProfile,
  updateProfile,
  setPreferences,
  addToFavorites,
  removeFromFavorites,
  updateNotificationPreferences,
  setLoading,
  setError,
} = userSlice.actions;

export default userSlice.reducer;
