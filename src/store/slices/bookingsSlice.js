import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  bookings: [],
  selectedBooking: null,
  isLoading: false,
  error: null,
  activeTab: 'upcoming',
};

const bookingsSlice = createSlice({
  name: 'bookings',
  initialState,
  reducers: {
    setBookings: (state, action) => {
      state.bookings = action.payload;
    },
    addBooking: (state, action) => {
      state.bookings.push(action.payload);
    },
    updateBooking: (state, action) => {
      const index = state.bookings.findIndex(booking => booking.id === action.payload.id);
      if (index !== -1) {
        state.bookings[index] = action.payload;
      }
    },
    removeBooking: (state, action) => {
      state.bookings = state.bookings.filter(booking => booking.id !== action.payload);
    },
    setSelectedBooking: (state, action) => {
      state.selectedBooking = action.payload;
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    setActiveTab: (state, action) => {
      state.activeTab = action.payload;
    },
  },
});

export const {
  setBookings,
  addBooking,
  updateBooking,
  removeBooking,
  setSelectedBooking,
  setLoading,
  setError,
  setActiveTab,
} = bookingsSlice.actions;

export default bookingsSlice.reducer;
