import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const baseQuery = fetchBaseQuery({
  baseUrl: '/api/equipment',
  prepareHeaders: (headers) => {
    // We omit the token because the Gateway's OAuth2 filter requires a strictly 
    // valid Keycloak token. Since we are using user-ms tokens currently, we must bypass it 
    // by not sending a token to these routes.
    return headers;
  },
});

export const equipmentApi = createApi({
  reducerPath: 'equipmentApi',
  baseQuery,
  tagTypes: ['Equipment'],
  endpoints: (builder) => ({
    getEquipment: builder.query({
      query: ({ page = 1, limit = 10, type }) => ({
        url: '',
        params: { page, limit, ...(type && { type }) },
      }),
      providesTags: ['Equipment'],
    }),
    getEquipmentById: builder.query({
      query: (id) => `/${id}`,
      providesTags: (result, error, id) => [{ type: 'Equipment', id }],
    }),
    createEquipment: builder.mutation({
      query: (equipment) => ({
        url: '',
        method: 'POST',
        body: equipment,
      }),
      invalidatesTags: ['Equipment'],
    }),
    updateEquipment: builder.mutation({
      query: ({ id, ...equipment }) => ({
        url: `/${id}`,
        method: 'PUT',
        body: equipment,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Equipment', id }],
    }),
    deleteEquipment: builder.mutation({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Equipment'],
    }),
    getAvailableEquipment: builder.query({
      query: ({ date, startTime, endTime }) => ({
        url: '/available',
        params: { date, startTime, endTime },
      }),
    }),
  }),
});

export const {
  useGetEquipmentQuery,
  useGetEquipmentByIdQuery,
  useCreateEquipmentMutation,
  useUpdateEquipmentMutation,
  useDeleteEquipmentMutation,
  useGetAvailableEquipmentQuery,
} = equipmentApi;


