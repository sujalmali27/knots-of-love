// If in development, use empty string (proxy)
// If in production, you can specify your actual domain if needed
export const BASE_URL = process.env.NODE_ENV === 'development' ? '' : ''; 

export const PRODUCTS_URL = '/api/products';
export const USERS_URL = '/api/users';
export const ORDERS_URL = '/api/orders';

// This is where your frontend fetches the Razorpay Key ID from the backend
export const RAZORPAY_URL = '/api/config/razorpay'; 

// Added for clarity: Uploads constant for product images
export const UPLOAD_URL = '/api/uploads';