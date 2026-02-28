import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path'; // Added for path handling
import products from './data/products.js'; 
import Product from './models/Product.js'; 
import User from './models/User.js';       

// ✅ FIX: Explicitly point to the .env file in the current directory
const __dirname = path.resolve();
dotenv.config({ path: path.join(__dirname, '.env') });

const connectDB = async () => {
    try {
        // Debug: Check if the URI is being read correctly
        if (!process.env.MONGO_URI) {
            throw new Error("MONGO_URI is undefined. Check your .env file location.");
        }
        
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`--- MongoDB Connected: ${conn.connection.host} ---`);
    } catch (error) {
        console.error(`Database Connection Error: ${error.message}`);
        process.exit(1);
    }
};

const importData = async () => {
    await connectDB();
    try {
        console.log('Step 1: Clearing existing data...');
        await Product.deleteMany();
        await User.deleteMany();
        console.log('✅ Existing data cleared.');

        console.log('Step 2: Creating Admin User...');
        const sampleUsers = [
            {
                name: 'Admin User',
                email: 'admin@crochet.com',
                password: 'password123', 
                isAdmin: true,
                isVerified: true, 
            },
        ];
        
        // Using .create to trigger middleware
        const createdUsers = await User.create(sampleUsers);
        const adminUser = createdUsers[0];
        console.log(`✅ Admin User Created: ${adminUser.email}`);

        console.log('Step 3: Mapping products...');
        const sampleProductsWithUser = products.map((product) => {
            return { ...product, user: adminUser._id };
        });

        console.log('Step 4: Inserting products into MongoDB...');
        await Product.insertMany(sampleProductsWithUser);

        console.log('🚀 SUCCESS: Sample data imported successfully!');
        process.exit();
    } catch (error) {
        console.error(`❌ IMPORT ERROR: ${error.message}`);
        process.exit(1);
    }
};

if (process.argv[2] === '-d') {
    // Logic for destroyData remains same but add similar logging if needed
} else {
    importData();
}