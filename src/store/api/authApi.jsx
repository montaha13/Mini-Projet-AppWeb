import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { mockBackendService } from '../../utils/mockBackend.jsx';

// Check if we should use mock backend (when real backend is not available)
const USE_MOCK_BACKEND = false;

const baseQuery = fetchBaseQuery({
  baseUrl: '/api/auth',
  prepareHeaders: (headers) => {
    headers.set('Content-Type', 'application/json');
    // We omit the token because the Gateway's OAuth2 filter requires a strictly 
    // valid Keycloak token. Since we are using user-ms tokens currently, we must bypass 
    // it by not sending a token to these routes.
    return headers;
  },
});

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: USE_MOCK_BACKEND ? async (arg, api, extraOptions) => {
    const url = typeof arg === 'string' ? arg : arg.url;
    const method = (typeof arg === 'object' && arg.method) ? arg.method : 'GET';
    const body = typeof arg === 'object' ? arg.body : null;

    if (method === 'POST' && url === '/register') {
      return { data: await mockBackendService.register(body) };
    }
    if (method === 'POST' && url === '/login') {
      return { data: await mockBackendService.login(body) };
    }
    if (url === '/me') {
      return { data: await mockBackendService.getCurrentUser() };
    }
    return { data: null };
  } : baseQuery,
  tagTypes: ['User'],
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        url: '/login',
        method: 'POST',
        body: credentials,
      }),
    }),
    register: builder.mutation({
      query: (userData) => {
        console.log('API call to register:', userData);
        return {
          url: '/register',
          method: 'POST',
          body: userData,
          headers: {
            'Content-Type': 'application/json',
          },
        };
      },
    }),
    refreshToken: builder.mutation({
      query: () => ({
        url: '/refresh',
        method: 'POST',
      }),
    }),
    getCurrentUser: builder.query({
      query: () => '/me',
      providesTags: ['User'],
    }),
    logout: builder.mutation({
      query: () => ({
        url: '/logout',
        method: 'POST',
      }),
    }),
    forgotPassword: builder.mutation({
      query: (email) => ({
        url: '/forgot-password',
        method: 'POST',
        body: { email },
      }),
    }),
    resetPassword: builder.mutation({
      query: ({ token, password }) => ({
        url: '/reset-password',
        method: 'POST',
        body: { token, password },
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useRefreshTokenMutation,
  useGetCurrentUserQuery,
  useLogoutMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
} = authApi;


