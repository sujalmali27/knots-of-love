export const addDecimals = (num) => {
  return (Math.round(num * 100) / 100).toFixed(2);
};

export const updateCart = (state) => {
  // 1. Items Price
  state.itemsPrice = addDecimals(
    state.cartItems.reduce((acc, item) => acc + item.price * item.qty, 0)
  );

  // 2. Shipping Price (Fixed at ₹40 as per Knots Of Love policy)
  // We've removed the "Free over $100" logic to keep it consistent
  state.shippingPrice = addDecimals(state.cartItems.length > 0 ? 40 : 0);

  // 3. Tax Price (Fixed at ₹0)
  state.taxPrice = addDecimals(0);

  // 4. Total Price (Items + Shipping)
  state.totalPrice = (
    Number(state.itemsPrice) +
    Number(state.shippingPrice) +
    Number(state.taxPrice)
  ).toFixed(2);

  localStorage.setItem('cart', JSON.stringify(state));

  return state;
};