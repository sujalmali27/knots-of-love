import { fetchBaseQuery, createApi } from '@reduxjs/toolkit/query/react';
import { BASE_URL } from '../constants';

const baseQuery = fetchBaseQuery({ 
  baseUrl: BASE_URL,
  // Crucial for sending HTTP-Only cookies (JWT) back to the server
  credentials: 'include', 
});

export const apiSlice = createApi({
  baseQuery,
  // tagTypes allow for automatic data re-fetching (cache invalidation)
  tagTypes: ['Product', 'Order', 'User'],
  endpoints: (builder) => ({}),
});