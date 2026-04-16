import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import authSlice from './slices/authSlice.js';
import roomsSlice from './slices/roomsSlice.js';
import bookingsSlice from './slices/bookingsSlice.js';
import uiSlice from './slices/uiSlice.js';
import userSlice from './slices/userSlice.js';
import { authApi } from './api/authApi.jsx';
import { roomsApi } from './api/roomsApi.jsx';
import { bookingsApi } from './api/bookingsApi.jsx';
import { equipmentApi } from './api/equipmentApi.jsx';
import { eventsApi } from './api/eventsApi.jsx';
import { recommendationsApi } from './api/recommendationsApi.jsx';
import { usersApi } from './api/usersApi.jsx';
import { systemApi } from './api/systemApi.jsx';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    rooms: roomsSlice,
    bookings: bookingsSlice,
    ui: uiSlice,
    user: userSlice,
    [authApi.reducerPath]: authApi.reducer,
    [roomsApi.reducerPath]: roomsApi.reducer,
    [bookingsApi.reducerPath]: bookingsApi.reducer,
    [equipmentApi.reducerPath]: equipmentApi.reducer,
    [eventsApi.reducerPath]: eventsApi.reducer,
    [recommendationsApi.reducerPath]: recommendationsApi.reducer,
    [usersApi.reducerPath]: usersApi.reducer,
    [systemApi.reducerPath]: systemApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    })
      .concat(authApi.middleware)
      .concat(roomsApi.middleware)
      .concat(bookingsApi.middleware)
      .concat(equipmentApi.middleware)
      .concat(eventsApi.middleware)
      .concat(recommendationsApi.middleware)
      .concat(usersApi.middleware)
      .concat(systemApi.middleware),
});

setupListeners(store.dispatch);


