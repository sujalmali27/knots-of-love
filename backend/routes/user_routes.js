import express from 'express';
const router = express.Router();
import asyncHandler from 'express-async-handler';
import User from '../models/User.js'; 
import generateToken from '../utils/generateToken.js'; 
import { protect, admin } from '../middleware/auth_middleware.js';
import crypto from 'crypto'; 
import sendEmail from '../utils/sendEmail.js'; 

// --- EMAIL TEMPLATE HELPER ---
const getEmailTemplate = (title, body, buttonText, link) => `
  <div style="background-color: #0f0f0f; padding: 40px 20px; font-family: 'Segoe UI', Arial, sans-serif; text-align: center;">
    <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #1a1a1a; border-radius: 24px; overflow: hidden; border: 1px solid #333;">
      <tr><td height="6" style="background: linear-gradient(90deg, #ff85a2 0%, #ffacbd 100%);"></td></tr>
      <tr>
        <td style="padding: 50px 40px;">
          <div style="margin-bottom: 30px;">
            <span style="color: #ff85a2; font-size: 26px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase;">Knots Of Love</span>
          </div>
          <h1 style="color: #ffffff; font-size: 28px; font-weight: 700; margin: 0 0 20px 0;">${title}</h1>
          <p style="color: #b0b0b0; font-size: 16px; line-height: 1.8; margin: 0 0 35px 0;">${body}</p>
          <a href="${link}" style="background: #ff85a2; color: #ffffff; padding: 18px 40px; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 15px; display: inline-block; box-shadow: 0 10px 20px rgba(255, 133, 162, 0.2);">${buttonText}</a>
          <p style="color: #555; font-size: 12px; margin-top: 40px;">If the button fails, use this link: <br/> <a href="${link}" style="color: #ff85a2;">${link}</a></p>
        </td>
      </tr>
    </table>
  </div>`;

// --- ADMIN CONTROLLERS ---
const getUsers = asyncHandler(async (req, res) => {
    const users = await User.find({});
    res.json(users);
});

const getUserById = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id).select('-password');
    if (user) {
        res.json(user);
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

const updateUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (user) {
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        user.isAdmin = Boolean(req.body.isAdmin);
        user.isVerified = Boolean(req.body.isVerified);
        const updatedUser = await user.save();
        res.json(updatedUser);
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

const deleteUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (user) {
        if (user.isAdmin) {
            res.status(400);
            throw new Error('Cannot delete admin user');
        }
        await User.deleteOne({ _id: user._id });
        res.json({ message: 'User removed' });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// --- AUTH ROUTES ---

router.post('/login', asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
        if (!user.isVerified) {
            res.status(401);
            throw new Error('Please verify your email.');
        }

        // ✅ LOGIC ADDED: Update Last Login
        user.lastLogin = Date.now();
        await user.save();

        generateToken(res, user._id); 
        res.json({ 
            _id: user._id, 
            name: user.name, 
            email: user.email, 
            isAdmin: user.isAdmin,
            createdAt: user.createdAt,
            lastLogin: user.lastLogin // Sent to frontend for the tracker
        });
    } else {
        res.status(401);
        throw new Error('Invalid credentials');
    }
}));

router.post('/logout', (req, res) => {
    res.cookie('jwt', '', { httpOnly: true, expires: new Date(0) });
    res.status(200).json({ message: 'Logged out' });
});

// ✅ LOGIC UPDATED: Ensure updateProfile returns all data
router.route('/profile')
    .get(protect, asyncHandler(async (req, res) => {
        const user = await User.findById(req.user._id);
        if (user) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                isAdmin: user.isAdmin,
                createdAt: user.createdAt,
                lastLogin: user.lastLogin,
            });
        } else {
            res.status(404);
            throw new Error('User not found');
        }
    }))
    .put(protect, asyncHandler(async (req, res) => {
        const user = await User.findById(req.user._id);
        if (user) {
            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email;
            if (req.body.password) {
                user.password = req.body.password;
            }
            const updatedUser = await user.save();
            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                isAdmin: updatedUser.isAdmin,
                createdAt: updatedUser.createdAt,
                lastLogin: updatedUser.lastLogin,
            });
        } else {
            res.status(404);
            throw new Error('User not found');
        }
    }));

// --- PASSWORD RECOVERY ---

router.post('/forgotpassword', asyncHandler(async (req, res) => {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
        res.status(404);
        throw new Error('There is no user with that email');
    }
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = Date.now() + 30 * 60 * 1000; 
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    const emailHtml = getEmailTemplate("Secure Your Account", "Click below to reset your password.", "RESET PASSWORD", resetUrl);

    try {
        await sendEmail({ email: user.email, subject: 'Knots Of Love - Password Reset', message: emailHtml });
        res.status(200).json({ message: 'Reset email sent' });
    } catch (err) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();
        res.status(500);
        throw new Error('Email delivery failed');
    }
}));

router.put('/resetpassword/:token', asyncHandler(async (req, res) => {
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({ resetPasswordToken: hashedToken, resetPasswordExpire: { $gt: Date.now() } });
    if (!user) {
        res.status(400);
        throw new Error('Invalid or expired token');
    }
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    res.status(200).json({ message: 'Password updated successfully' });
}));

// --- VERIFICATION ---

router.get('/verify/:token', asyncHandler(async (req, res) => {
    const { token } = req.params;
    let user = await User.findOne({ verificationToken: token, verificationTokenExpire: { $gt: Date.now() } });
    if (!user) {
        res.status(400);
        throw new Error('Invalid or expired token');
    }
    user.isVerified = true;
    user.verificationToken = undefined; 
    user.verificationTokenExpire = undefined;
    await user.save({ validateBeforeSave: false });
    generateToken(res, user._id); 
    res.status(200).json({ message: 'Verified!' });
}));

// --- COMBINED ADMIN & REGISTER ROUTES ---

router.route('/')
    .get(protect, admin, getUsers) 
    .post(asyncHandler(async (req, res) => {
        const { name, email, password } = req.body;
        const userExists = await User.findOne({ email });
        if (userExists) {
            res.status(400);
            throw new Error('User already exists');
        }
        const verificationToken = crypto.randomBytes(32).toString('hex');
        const verificationTokenExpire = Date.now() + 24 * 60 * 60 * 1000; 

        const user = await User.create({ name, email, password, verificationToken, verificationTokenExpire });
        if (user) {
            const verifyUrl = `${process.env.FRONTEND_URL}/verify/${verificationToken}`;
            const emailHtml = getEmailTemplate("Verify Your Journey", `Hi ${user.name}, please verify your account.`, "VERIFY MY ACCOUNT", verifyUrl);
            try {
                await sendEmail({ email: user.email, subject: 'Welcome to Knots Of Love', message: emailHtml });
                res.status(201).json({ message: 'Check email to verify!' });
            } catch (err) {
                await User.findByIdAndDelete(user._id);
                res.status(500);
                throw new Error('Email delivery failed.');
            }
        }
    }));

// DYNAMIC ID ROUTES AT THE BOTTOM
router.route('/:id')
    .get(protect, admin, getUserById)
    .put(protect, admin, updateUser)
    .delete(protect, admin, deleteUser);

export default router;