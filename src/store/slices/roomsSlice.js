import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  rooms: [],
  selectedRoom: null,
  filters: {},
  isLoading: false,
  error: null,
  searchQuery: '',
  sortBy: 'name',
  sortOrder: 'asc',
  viewMode: 'grid',
};

const roomsSlice = createSlice({
  name: 'rooms',
  initialState,
  reducers: {
    setRooms: (state, action) => {
      state.rooms = action.payload;
    },
    setSelectedRoom: (state, action) => {
      state.selectedRoom = action.payload;
    },
    setFilters: (state, action) => {
      state.filters = action.payload;
    },
    updateFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {};
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    setSortBy: (state, action) => {
      state.sortBy = action.payload;
    },
    setSortOrder: (state, action) => {
      state.sortOrder = action.payload;
    },
    setViewMode: (state, action) => {
      state.viewMode = action.payload;
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
  setRooms,
  setSelectedRoom,
  setFilters,
  updateFilters,
  clearFilters,
  setSearchQuery,
  setSortBy,
  setSortOrder,
  setViewMode,
  setLoading,
  setError,
} = roomsSlice.actions;

export default roomsSlice.reducer;
