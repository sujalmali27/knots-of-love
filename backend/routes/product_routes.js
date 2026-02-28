import express from 'express';
const router = express.Router();
import { 
  getProducts, 
  getProductById, 
  getRelatedProducts, // ✅ Added for recommendation system
  createProduct, 
  updateProduct, 
  deleteProduct,
  createProductReview,
  deleteProductReview 
} from '../controllers/productController.js'; 
import { protect, admin } from '../middleware/auth_middleware.js'; 

// --- 1. BASE PRODUCT ROUTES ---
router.route('/')
  .get(getProducts) 
  .post(protect, admin, createProduct);

// --- 2. RECOMMENDATION ROUTE ---
// ✅ Public route to get products in the same category
router.get('/:id/related', getRelatedProducts);

// --- 3. REVIEW ROUTES ---
router.route('/:id/reviews').post(protect, createProductReview);
router.route('/:id/reviews/:reviewId').delete(protect, deleteProductReview);

// --- 4. SPECIFIC PRODUCT ID ROUTES ---
router.route('/:id')
  .get(getProductById)
  .put(protect, admin, updateProduct)
  .delete(protect, admin, deleteProduct);

export default router;