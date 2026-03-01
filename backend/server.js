import path from 'path';
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";

// Route Imports
import userRoutes from "./routes/user_routes.js";
import productRoutes from "./routes/product_routes.js";
import orderRoutes from "./routes/orderRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js"; 

// Middleware & Utility Imports
import { notFound, errorHandler } from './middleware/error_middleware.js';
import startOrderCleanup from './utils/orderCleanup.js'; 

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("--- MongoDB connected successfully! ---");
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

connectDB();

startOrderCleanup(); 

// --- MIDDLEWARE ---
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// --- API ROUTES ---
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/upload", uploadRoutes);

app.get("/api/config/razorpay", (req, res) => {
  res.send({ keyId: process.env.RAZORPAY_KEY_ID });
});

// --- STATIC FOLDER & PRODUCTION SETUP ---
const __dirname = path.resolve();
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'frontend', 'dist')));

  // Use a Regex literal to catch all non-API routes for Express 5
  app.get(/^((?!\/api).)*$/, (req, res) =>
    res.sendFile(path.resolve(__dirname, 'frontend', 'dist', 'index.html'))
  );
} else {
  app.get("/", (req, res) => {
    res.send("Crochet E-commerce Backend API is running!");
  });
}

// --- ERROR HANDLERS ---
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});