import asyncHandler from 'express-async-handler';
import Order from '../models/orderModel.js';
import Product from '../models/Product.js'; // ✅ Matches your capital 'P' filename
import Razorpay from 'razorpay';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const addOrderItems = asyncHandler(async (req, res) => {
  const {
    orderItems,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    customizationMessage,
  } = req.body;

  if (orderItems && orderItems.length === 0) {
    res.status(400);
    throw new Error('No order items');
  } else {
    const shippingPrice = 40; 
    const taxPrice = 0;
    const totalPrice = Number(itemsPrice) + shippingPrice;

    const order = new Order({
      orderItems: orderItems.map((x) => ({
        name: x.name,
        qty: x.qty,
        image: x.image,
        price: x.price,
        product: x._id, 
        _id: undefined, 
      })),
      user: req.user._id,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      customizationMessage,
    });

    const createdOrder = await order.save();
    res.status(201).json(createdOrder);
  }
});

// @desc    Get logged in user orders
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(orders);
});

// @desc    Get order by ID
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email');
  if (order) {
    res.json(order);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

// @desc    Create Razorpay order (With Stock Check)
// @route   POST /api/orders/:id/razorpay
const createRazorpayOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    // ✅ STEP 1: PRE-PAYMENT STOCK VERIFICATION
    for (const item of order.orderItems) {
      const product = await Product.findById(item.product);
      if (!product || product.countInStock < item.qty) {
        res.status(400);
        throw new Error(`${item.name} is now out of stock.`);
      }
    }

    const options = {
      amount: Math.round(order.totalPrice * 100), 
      currency: 'INR',
      receipt: `receipt_order_${order._id}`,
    };

    try {
      const rzpOrder = await razorpay.orders.create(options);
      res.json(rzpOrder);
    } catch (error) {
      res.status(500);
      throw new Error('Razorpay Order Creation Failed');
    }
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

// @desc    Update order to paid (With Stock Reduction)
// @route   PUT /api/orders/:id/pay
const updateOrderToPaid = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  const body = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body.toString())
    .digest('hex');

  if (expectedSignature !== razorpay_signature) {
    res.status(400);
    throw new Error('Payment verification failed');
  }

  const order = await Order.findById(req.params.id);

  if (order) {
    // ✅ STEP 2: REDUCE STOCK UPON SUCCESSFUL PAYMENT
    for (const item of order.orderItems) {
      const product = await Product.findById(item.product);
      if (product) {
        product.countInStock -= item.qty;
        await product.save();
      }
    }

    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentResult = {
      id: razorpay_payment_id,
      status: 'success',
      update_time: new Date().toISOString(),
      email_address: req.user.email,
    };

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

// @desc    Cancel an unpaid order
// @route   PUT /api/orders/:id/cancel
// @access  Private
const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    if (order.isPaid) {
      res.status(400);
      throw new Error('Paid orders cannot be cancelled manually.');
    }
    
    // Check if user owns the order
    if (order.user.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('Not authorized to cancel this order');
    }

    await Order.findByIdAndDelete(req.params.id);
    res.json({ message: 'Order cancelled successfully' });
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

// @desc    Get all orders (Admin)
const getOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({}).populate('user', 'id name').sort({ createdAt: -1 });
  res.json(orders);
});

// @desc    Update order status (Admin)
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body; 
  const order = await Order.findById(req.params.id);

  if (order) {
    order.status = status;
    if (status === 'Arrived' || status === 'Delivered') {
      order.isDelivered = true;
      order.deliveredAt = Date.now();
    } else {
      order.isDelivered = false;
    }

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

export { 
  addOrderItems, 
  getMyOrders, 
  getOrderById, 
  createRazorpayOrder, 
  updateOrderToPaid,
  updateOrderStatus,
  getOrders,
  cancelOrder 
};