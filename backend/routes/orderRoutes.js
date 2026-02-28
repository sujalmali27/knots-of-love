import express from 'express';
const router = express.Router();
import { protect, admin } from '../middleware/auth_middleware.js'; 
import {
    addOrderItems,
    getMyOrders,
    getOrderById,
    createRazorpayOrder,
    updateOrderToPaid,
    updateOrderStatus,
    getOrders,
    cancelOrder // ✅ Now imported from the controller
} from '../controllers/orderController.js';

// --- 1. USER & BASE ROUTES ---
// Handles creating a new order and the Admin's view of all orders
router.route('/')
    .post(protect, addOrderItems) 
    .get(protect, admin, getOrders); 

// Fetches the specific logged-in user's order history for the Profile screen
router.route('/myorders').get(protect, getMyOrders); 

// --- 2. SPECIFIC ORDER ID ROUTES ---
// Fetches full details for a single order (Shipping, Items, Payment status)
router.route('/:id').get(protect, getOrderById); 

// --- 3. PAYMENT & CANCELLATION ROUTES ---
// Step A: Creates the Razorpay Order ID (checks stock before allowing payment)
router.route('/:id/razorpay').post(protect, createRazorpayOrder); 

// Step B: Verifies the payment signature and reduces product stock count
router.route('/:id/pay').put(protect, updateOrderToPaid); 

// Step C: Allows a user to manually cancel their own unpaid order
router.route('/:id/cancel').put(protect, cancelOrder); // ✅ Now safely added

// --- 4. STATUS & TRACKING ROUTES ---
// Allows Admin to move order from 'Placed' to 'Processing', 'Shipped', or 'Arrived'
router.route('/:id/status').put(protect, admin, updateOrderStatus); 

export default router;