import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true, 
        },
        password: {
            type: String,
            required: true,
        },
        isAdmin: {
            type: Boolean,
            required: true,
            default: false,
        },
        isVerified: {
            type: Boolean,
            required: true,
            default: false,
        },
        // ✅ NEW: Tracking User Activity
        lastLogin: {
            type: Date,
        },
        verificationToken: {
            type: String,
        },
        verificationTokenExpire: {
            type: Date,
        },
        // 🚀 NEW: Fields for Password Recovery
        resetPasswordToken: {
            type: String,
        },
        resetPasswordExpire: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

// Method to compare login password with hash
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Password Hashing Middleware
userSchema.pre('save', async function () {
    // Only hash if password is modified AND exists
    if (!this.isModified('password') || !this.password) {
        return; 
    }

    try {
        const salt = await bcrypt.genSalt(10);
        // Ensure password is a string to prevent "Illegal arguments: number" error
        this.password = await bcrypt.hash(String(this.password), salt);
    } catch (error) {
        throw new Error(`Hashing failed: ${error.message}`);
    }
});

const User = mongoose.model('User', userSchema);

export default User;