import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Backend RoomController (base: /api/rooms) actual endpoints:
//   GET    /api/rooms               → getAllRooms()         returns List<Room>
//   GET    /api/rooms/{id}          → getRoomById()
//   GET    /api/rooms/search?name=  → searchRoomsByName()   ← param is 'name', NOT 'q'
//   GET    /api/rooms/name/{name}   → getRoomByName()
//   POST   /api/rooms               → addRoom()
//   PATCH  /api/rooms/{id}          → updateRoom()  (also accepts PUT to same method)
//   DELETE /api/rooms/{id}          → deleteRoom()

const baseQuery = fetchBaseQuery({
  baseUrl: '/api/rooms',
  prepareHeaders: (headers) => {
    // We omit the token because the Gateway's OAuth2 filter requires a strictly 
    // valid Keycloak token. Since we are using user-ms tokens currently, we must bypass 
    // it by not sending a token to these routes.
    return headers;
  },
});

export const roomsApi = createApi({
  reducerPath: 'roomsApi',
  baseQuery,
  tagTypes: ['Room'],
  endpoints: (builder) => ({
    // GET /api/rooms — returns plain List<Room>. No pagination in the backend.
    getRooms: builder.query({
      query: () => ({ url: '' }),
      // Normalise: accept plain array, or wrapped shapes from older proxy responses.
      transformResponse: (res) => Array.isArray(res) ? res : res?.rooms ?? res?.content ?? [],
      providesTags: ['Room'],
    }),
    getRoomById: builder.query({
      query: (id) => `/${id}`,
      providesTags: (result, error, id) => [{ type: 'Room', id }],
    }),
    // GET /api/rooms/search?name=  ← backend param is 'name', not 'q'
    searchRooms: builder.query({
      query: ({ query: nameQuery }) => ({
        url: '/search',
        params: { name: nameQuery },
      }),
      transformResponse: (res) => Array.isArray(res) ? res : [],
      providesTags: ['Room'],
    }),
    createRoom: builder.mutation({
      query: (room) => ({
        url: '',
        method: 'POST',
        body: room,
      }),
      invalidatesTags: ['Room'],
    }),
    // Backend registers both @PatchMapping and @PutMapping on the same method — PATCH preferred.
    updateRoom: builder.mutation({
      query: ({ id, ...room }) => ({
        url: `/${id}`,
        method: 'PATCH',
        body: room,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Room', id }],
    }),
    deleteRoom: builder.mutation({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Room'],
    }),
    // Availability check lives on the reservation service, not roomm.
    // Called via /api/reservations/room/{roomId}/check
    getRoomAvailability: builder.query({
      query: ({ roomId, date }) => `/${roomId}/availability?date=${date}`,
    }),
  }),
});

export const {
  useGetRoomsQuery,
  useGetRoomByIdQuery,
  useSearchRoomsQuery,
  useCreateRoomMutation,
  useUpdateRoomMutation,
  useDeleteRoomMutation,
  useGetRoomAvailabilityQuery,
} = roomsApi;


