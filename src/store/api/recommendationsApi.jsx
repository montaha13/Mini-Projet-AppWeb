import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Recommendation Service (Node.js, base: /api/recommendations) actual routes:
//   POST /api/recommendations/recommend              → recommend({ roomId, preferences, limit })
//     Response: { success: true, recommendations: [...] }
//   GET  /api/recommendations/equipment-suggestions?type= → getEquipmentSuggestions()
//   GET  /api/recommendations/room/:roomId?limit=    → getRecommendationsByRoom()
//     Response: { success: true, recommendations: [...] }

const baseQuery = fetchBaseQuery({
  baseUrl: '/api/recommendations',
  prepareHeaders: (headers) => {
    // All recommendation endpoints are public.
    // Do NOT send the token, otherwise the Gateway's OAuth2 Resource Server
    // might reject the request if the token isn't from Keycloak.
    return headers;
  },
});

// Helper to extract the recommendations array from any response shape.
// Backend returns: { success: true, recommendations: [...] }
// RTK Query `data` IS the parsed JSON body, so data.recommendations is the list.
const extractRecommendations = (response) => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.recommendations)) return response.recommendations;
  if (Array.isArray(response?.data?.recommendations)) return response.data.recommendations;
  return [];
};

export const recommendationsApi = createApi({
  reducerPath: 'recommendationsApi',
  baseQuery,
  tagTypes: ['Recommendation'],
  endpoints: (builder) => ({
    // POST /api/recommendations/recommend
    // Accepts: { preferences: { guests, ... }, limit }
    // Returns (after transform): plain array of recommendation objects
    getPublicRecommendations: builder.query({
      query: ({ limit = 10 } = {}) => ({
        url: '/recommend',
        method: 'POST',
        body: { preferences: {}, limit },
      }),
      transformResponse: extractRecommendations,
      providesTags: ['Recommendation'],
    }),

    getRecommendations: builder.query({
      query: ({ limit = 10, participants, capacity, title, type, ...rest } = {}) => ({
        url: '/recommend',
        method: 'POST',
        body: {
          preferences: {
            guests: participants || capacity,
            title,
            type,
            ...rest,
          },
          limit,
        },
      }),
      // Always return a flat array — callers do NOT need to drill into .recommendations
      transformResponse: extractRecommendations,
      providesTags: ['Recommendation'],
    }),

    // GET /api/recommendations/room/:roomId?limit=
    getRecommendationsByRoom: builder.query({
      query: ({ roomId, limit = 5 }) => ({
        url: `/room/${roomId}`,
        params: { limit },
      }),
      transformResponse: extractRecommendations,
      providesTags: ['Recommendation'],
    }),

    // GET /api/recommendations/equipment-suggestions?type=
    getEquipmentSuggestions: builder.query({
      query: ({ type }) => ({
        url: '/equipment-suggestions',
        params: { type },
      }),
      // equipment-suggestions returns the plain array directly from service
      transformResponse: (res) => Array.isArray(res) ? res : res?.suggestions ?? [],
      providesTags: ['Recommendation'],
    }),
  }),
});

export const {
  useGetPublicRecommendationsQuery,
  useGetRecommendationsQuery,
  useGetRecommendationsByRoomQuery,
  useGetEquipmentSuggestionsQuery,
} = recommendationsApi;
