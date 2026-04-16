import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Backend ReservationController (base: /api/reservations) actual endpoints:
//   POST   /api/reservations              → createReservation()
//   GET    /api/reservations              → getAllReservations()      List<Reservation>
//   GET    /api/reservations/my?userId=   → getMyReservations()      List<Reservation>
//   PUT    /api/reservations/{id}/approve → approveReservation()
//   PUT    /api/reservations/{id}/reject  → rejectReservation()
//   PATCH  /api/reservations/{id}/confirm → confirmBooking()          (alias for approve)
//   DELETE /api/reservations/{id}/cancel  → cancelBooking()           (alias for reject)
//   POST   /api/reservations/recommendations → getRecommendations()
//   GET    /api/reservations/room/{roomId}/check?startTime=&endTime=  → checkRoomAvailability()
//
// NOTE: PUT /api/reservations/{id} does NOT exist on the backend.

const baseQuery = fetchBaseQuery({
  baseUrl: '/api/reservations',
  prepareHeaders: (headers) => {
    // We omit the token because the Gateway's OAuth2 filter requires a strictly 
    // valid Keycloak token. Since we are using user-ms tokens currently, we must bypass 
    // it by not sending a token to these routes.
    return headers;
  },
});

export const bookingsApi = createApi({
  reducerPath: 'bookingsApi',
  baseQuery,
  tagTypes: ['Booking'],
  endpoints: (builder) => ({
    // POST /api/reservations
    createBooking: builder.mutation({
      query: (booking) => ({
        url: '',
        method: 'POST',
        body: booking,
      }),
      invalidatesTags: ['Booking'],
    }),

    // GET /api/reservations — returns plain List<Reservation>
    getBookings: builder.query({
      query: ({ status } = {}) => ({
        url: '',
        params: status ? { status } : undefined,
      }),
      transformResponse: (res) => Array.isArray(res) ? res : res?.content ?? [],
      providesTags: ['Booking'],
    }),

    // GET /api/reservations/my?userId=
    getUserBookings: builder.query({
      query: ({ userId, status } = {}) => ({
        url: '/my',
        params: { userId, ...(status && { status }) },
      }),
      transformResponse: (res) => Array.isArray(res) ? res : [],
      providesTags: ['Booking'],
    }),

    // PUT /api/reservations/{id}/approve
    approveBooking: builder.mutation({
      query: (id) => ({
        url: `/${id}/approve`,
        method: 'PUT',
      }),
      invalidatesTags: ['Booking'],
    }),

    // PUT /api/reservations/{id}/reject
    rejectBooking: builder.mutation({
      query: (id) => ({
        url: `/${id}/reject`,
        method: 'PUT',
      }),
      invalidatesTags: ['Booking'],
    }),

    // PATCH /api/reservations/{id}/confirm  (alias for approve in backend)
    confirmBooking: builder.mutation({
      query: (id) => ({
        url: `/${id}/confirm`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Booking'],
    }),

    // DELETE /api/reservations/{id}/cancel  (alias for reject in backend)
    cancelBooking: builder.mutation({
      query: (id) => ({
        url: `/${id}/cancel`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Booking'],
    }),

    // GET /api/reservations/room/{roomId}/check?startTime=&endTime=
    // startTime/endTime must be ISO-8601 strings (e.g. dayjs().toISOString())
    checkAvailability: builder.query({
      query: ({ roomId, startTime, endTime }) => ({
        url: `/room/${roomId}/check`,
        params: { startTime, endTime },
      }),
    }),

    // POST /api/reservations/recommendations
    getReservationRecommendations: builder.mutation({
      query: (preferences) => ({
        url: '/recommendations',
        method: 'POST',
        body: preferences,
      }),
    }),
  }),
});

export const {
  useCreateBookingMutation,
  useGetBookingsQuery,
  useGetUserBookingsQuery,
  useApproveBookingMutation,
  useRejectBookingMutation,
  useConfirmBookingMutation,
  useCancelBookingMutation,
  useLazyCheckAvailabilityQuery,
  useGetReservationRecommendationsMutation,
} = bookingsApi;



