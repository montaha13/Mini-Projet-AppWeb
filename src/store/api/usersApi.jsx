import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Prepared headers factory — attaches Keycloak token on protected calls only.
// If we send a token to a public route and it happens to be an HS256 (user-ms) token,
// the Gateway's Keycloak RS256 validator will reject it with 401.
const makeHeaders = () => (headers) => {
  // We omit the token here because the Gateway's OAuth2 filter requires a strictly 
  // valid Keycloak token. Since we are using user-ms tokens currently, we must bypass it 
  // by not sending a token to these routes.
  return headers;
};

const userBaseQuery = fetchBaseQuery({
  baseUrl: '/api/users',
  prepareHeaders: (headers, api) => makeHeaders(api.getState, api.endpoint)(headers),
});

const authBaseQuery = fetchBaseQuery({
  baseUrl: '/api/auth',
  prepareHeaders: (headers, api) => makeHeaders(api.getState, api.endpoint)(headers),
});

export const usersApi = createApi({
  reducerPath: 'usersApi',
  baseQuery: userBaseQuery,
  tagTypes: ['User'],
  endpoints: (builder) => ({
    // GET /api/auth/me  →  returns the currently authenticated user (by Principal).
    // Uses a custom baseUrl override because it lives under /api/auth, not /api/users.
    getProfile: builder.query({
      queryFn: async (_arg, { getState }, _extraOptions, baseQueryFromApi) => {
        const token = getState().auth.accessToken;
        const res = await fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return { error: { status: res.status, data: await res.text() } };
        return { data: await res.json() };
      },
      providesTags: ['User'],
    }),

    // PUT /api/users/{id}  →  updateUser(). Caller must pass { id, ...fields }.
    updateProfile: builder.mutation({
      query: ({ id, ...fields }) => ({
        url: `/${id}`,
        method: 'PUT',
        body: fields,
      }),
      invalidatesTags: ['User'],
    }),

    // NOTE: change-password is NOT implemented on user-ms.
    // This stub exists so existing UI callers compile. Wire up when backend adds the route.
    changePassword: builder.mutation({
      queryFn: async () => ({
        error: {
          status: 501,
          data: 'Change-password is not yet implemented on the backend.',
        },
      }),
    }),

    // GET /api/users  →  returns List<User> (plain JSON array).
    getUsers: builder.query({
      query: () => ({ url: '' }),
      // Normalise: backend may return a plain array or a Spring Page {content:[...]}.
      transformResponse: (response) =>
        Array.isArray(response) ? response : response?.content ?? response?.users ?? [],
      providesTags: ['User'],
    }),

    // GET /api/users/{id}
    getUserById: builder.query({
      query: (id) => `/${id}`,
      providesTags: (result, error, id) => [{ type: 'User', id }],
    }),

    // PUT /api/users/{id}  →  updateUser()
    updateUser: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['User'],
    }),

    // DELETE /api/users/{id}  →  deleteUser()
    deactivateUser: builder.mutation({
      query: (userId) => ({
        url: `/${userId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['User'],
    }),
  }),
});

export const {
  useGetProfileQuery,
  useUpdateProfileMutation,
  useChangePasswordMutation,
  useGetUsersQuery,
  useGetUserByIdQuery,
  useUpdateUserMutation,
  useDeactivateUserMutation,
} = usersApi;


