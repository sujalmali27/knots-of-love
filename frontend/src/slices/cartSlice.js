import { createSlice } from '@reduxjs/toolkit';
import { updateCart } from '../utils/cartUtils';

// ✅ Added customizationMessage to the fallback initial state
const initialState = localStorage.getItem('cart')
  ? JSON.parse(localStorage.getItem('cart'))
  : { 
      cartItems: [], 
      shippingAddress: {}, 
      paymentMethod: 'PayPal',
      customizationMessage: '', // New field for crochet requests
    };

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const item = action.payload;
      const existItem = state.cartItems.find((x) => x._id === item._id);

      if (existItem) {
        state.cartItems = state.cartItems.map((x) =>
          x._id === existItem._id ? item : x
        );
      } else {
        state.cartItems = [...state.cartItems, item];
      }

      return updateCart(state);
    },
    removeFromCart: (state, action) => {
      state.cartItems = state.cartItems.filter((x) => x._id !== action.payload);
      return updateCart(state);
    },
    saveShippingAddress: (state, action) => {
      state.shippingAddress = action.payload;
      return updateCart(state);
    },
    savePaymentMethod: (state, action) => {
      state.paymentMethod = action.payload;
      return updateCart(state);
    },
    // ✅ NEW REDUCER: Saves the gift note or custom message
    saveCustomizationMessage: (state, action) => {
      state.customizationMessage = action.payload;
      return updateCart(state);
    },
    clearCartItems: (state, action) => {
      state.cartItems = [];
      // We also clear the message when the cart is cleared
      state.customizationMessage = ''; 
      return updateCart(state);
    },
    resetCart: (state) => {
      state.cartItems = [];
      state.shippingAddress = {};
      state.paymentMethod = 'PayPal';
      state.customizationMessage = ''; // Clear message on reset
      localStorage.removeItem('cart');
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  saveShippingAddress,
  savePaymentMethod,
  saveCustomizationMessage, // ✅ Exported new action
  clearCartItems,
  resetCart,
} = cartSlice.actions;

export default cartSlice.reducer;