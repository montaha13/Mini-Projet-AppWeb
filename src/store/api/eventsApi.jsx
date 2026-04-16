import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const baseQuery = fetchBaseQuery({
  baseUrl: '/api/events',
  prepareHeaders: (headers) => {
    // We omit the token here because the Gateway's OAuth2 filter requires a strictly 
    // valid Keycloak token. Since we are using user-ms tokens currently, we must bypass it 
    // by not sending a token to these now-public routes.
    return headers;
  },
});

export const eventsApi = createApi({
  reducerPath: 'eventsApi',
  baseQuery,
  tagTypes: ['Event'],
  endpoints: (builder) => ({
    getPublicEvents: builder.query({
      query: ({ page = 1, limit = 10 }) => ({
        url: '/public',
        params: { page, limit },
      }),
      providesTags: ['Event'],
    }),
    getEvents: builder.query({
      query: ({ page = 1, limit = 10 }) => ({
        url: '',
        params: { page, limit },
      }),
      providesTags: ['Event'],
    }),
    getEventById: builder.query({
      query: (id) => `/${id}`,
      providesTags: (result, error, id) => [{ type: 'Event', id }],
    }),
    createEvent: builder.mutation({
      query: (event) => ({
        url: '',
        method: 'POST',
        body: event,
      }),
      invalidatesTags: ['Event'],
    }),
    updateEvent: builder.mutation({
      query: ({ id, ...event }) => ({
        url: `/${id}`,
        method: 'PATCH',
        body: event,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Event', id }],
    }),
    deleteEvent: builder.mutation({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Event'],
    }),
    registerForEvent: builder.mutation({
      query: ({ id, name, email }) => ({
        url: `/${id}/register`,
        method: 'POST',
        body: { name, email },
      }),
      invalidatesTags: ['Event'],
    }),
  }),
});

export const {
  useGetPublicEventsQuery,
  useGetEventsQuery,
  useGetEventByIdQuery,
  useCreateEventMutation,
  useUpdateEventMutation,
  useDeleteEventMutation,
  useRegisterForEventMutation,
} = eventsApi;


