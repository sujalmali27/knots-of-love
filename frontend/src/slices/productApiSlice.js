import { PRODUCTS_URL } from '../constants';
import { apiSlice } from './apiSlice';

export const productsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getProducts: builder.query({
      query: ({ keyword = '', category = '' } = {}) => ({
        url: PRODUCTS_URL,
        params: { keyword, category }, 
      }),
      providesTags: (result, error, { keyword, category }) => 
        result 
          ? [
              ...result.map(({ _id }) => ({ type: 'Products', id: _id })),
              { type: 'Products', id: `LIST-${keyword}-${category}` }, 
            ]
          : [{ type: 'Products', id: 'LIST' }],
      keepUnusedDataFor: 5,
    }),
    getProductDetails: builder.query({
      query: (productId) => ({
        url: `${PRODUCTS_URL}/${productId}`,
      }),
      keepUnusedDataFor: 5,
      providesTags: (result, error, productId) => [{ type: 'Products', id: productId }],
    }),

    // ✅ NEW: Recommendation System Endpoint
    getRelatedProducts: builder.query({
      query: (productId) => ({
        url: `${PRODUCTS_URL}/${productId}/related`,
      }),
      keepUnusedDataFor: 5,
      providesTags: (result, error, productId) => [{ type: 'Products', id: `RELATED-${productId}` }],
    }),

    createProduct: builder.mutation({
      query: () => ({
        url: PRODUCTS_URL,
        method: 'POST',
      }),
      invalidatesTags: ['Products'],
    }),
    updateProduct: builder.mutation({
      query: (data) => ({
        url: `${PRODUCTS_URL}/${data.productId}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { productId }) => [
        { type: 'Products', id: productId },
        { type: 'Products', id: 'Products' },
        { type: 'Products', id: `RELATED-${productId}` }, // Invalidate related cache
      ],
    }),
    uploadProductImage: builder.mutation({
      query: (data) => ({
        url: `/api/upload`, 
        method: 'POST',
        body: data,
      }),
    }),
    deleteProduct: builder.mutation({
      query: (productId) => ({
        url: `${PRODUCTS_URL}/${productId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Products'],
    }),
    createReview: builder.mutation({
      query: (data) => ({
        url: `${PRODUCTS_URL}/${data.productId}/reviews`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (result, error, { productId }) => [
        { type: 'Products', id: productId },
      ],
    }),
    deleteReview: builder.mutation({
      query: ({ productId, reviewId }) => ({
        url: `${PRODUCTS_URL}/${productId}/reviews/${reviewId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { productId }) => [
        { type: 'Products', id: productId },
      ],
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetProductDetailsQuery,
  useGetRelatedProductsQuery, // ✅ Exporting for Recommendation System
  useCreateProductMutation,
  useUpdateProductMutation,
  useUploadProductImageMutation,
  useDeleteProductMutation,
  useCreateReviewMutation,
  useDeleteReviewMutation,
} = productsApiSlice;