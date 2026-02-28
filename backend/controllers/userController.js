import asyncHandler from 'express-async-handler';
import User from '../models/userModel.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import sendEmail from '../utils/sendEmail.js';

// Helper to generate Token and set Cookie
const generateToken = (res, userId) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });

  res.cookie('jwt', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV !== 'development',
    sameSite: 'strict',
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });
};

// @desc    Register a new user
// @route   POST /api/users
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  const verificationToken = crypto.randomBytes(32).toString('hex');
  const user = await User.create({
    name,
    email,
    password,
    verificationToken,
    isVerified: false,
  });

  if (user) {
    generateToken(res, user._id);

    const verifyUrl = `${process.env.FRONTEND_URL}/verify/${verificationToken}`;
    const emailHtml = `
      <div style="background-color: #f9f9f9; padding: 20px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #1a1a1a; border-radius: 16px; overflow: hidden;">
          <tr><td height="8" style="background-color: #ff85a2;"></td></tr>
          <tr>
            <td style="padding: 50px 40px; text-align: center;">
              <h1 style="color: #ff85a2; font-size: 32px; margin-bottom: 20px;">Welcome to <br/> Knots Of Love!</h1>
              <p style="color: #ffffff; font-size: 18px; margin-bottom: 30px;">Hi ${user.name}, please verify your account to start shopping.</p>
              <a href="${verifyUrl}" style="background-color: #ff85a2; color: #ffffff; padding: 18px 35px; text-decoration: none; border-radius: 50px; font-weight: bold; display: inline-block;">Verify My Account</a>
            </td>
          </tr>
        </table>
      </div>`;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Welcome to Knots Of Love!',
        message: emailHtml,
      });
    } catch (error) {
      console.error("Background Email Error:", error.message);
    }

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      isVerified: user.isVerified,
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

// @desc    Forgot password - send reset link
// @route   POST /api/users/forgotpassword
const forgotPassword = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    res.status(404);
    throw new Error('There is no user with that email');
  }

  // 1. Generate & Hash Token
  const resetToken = crypto.randomBytes(32).toString('hex');
  user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  user.resetPasswordExpire = Date.now() + 30 * 60 * 1000; // 30 Minutes

  await user.save();

  // 2. Email Design
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
  const emailHtml = `
    <div style="background-color: #f9f9f9; padding: 20px; font-family: Arial, sans-serif;">
      <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #1a1a1a; border-radius: 16px; overflow: hidden;">
        <tr><td height="8" style="background-color: #ff85a2;"></td></tr>
        <tr>
          <td style="padding: 50px 40px; text-align: center;">
            <h1 style="color: #ff85a2; font-size: 28px;">Password Reset Request</h1>
            <p style="color: #ffffff; font-size: 16px;">We received a request to reset your password. Click the button below to set a new one. This link expires in 30 minutes.</p>
            <a href="${resetUrl}" style="background-color: #ff85a2; color: #ffffff; padding: 15px 30px; text-decoration: none; border-radius: 50px; font-weight: bold; display: inline-block; margin-top: 20px;">Reset Password</a>
          </td>
        </tr>
      </table>
    </div>`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Knots Of Love - Password Reset',
      message: emailHtml,
    });
    res.status(200).json({ message: 'Reset email sent' });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    res.status(500);
    throw new Error('Email could not be sent');
  }
});

// @desc    Reset password
// @route   PUT /api/users/resetpassword/:token
const resetPassword = asyncHandler(async (req, res) => {
  const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    res.status(400);
    throw new Error('Invalid or expired reset token');
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  res.status(200).json({ message: 'Password reset successful' });
});

// @desc    Verify email token
const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const user = await User.findOne({ verificationToken: token });

  if (!user) {
    res.status(400);
    throw new Error('Verification link is invalid or has expired');
  }

  user.isVerified = true;
  user.verificationToken = undefined; 
  await user.save();
  res.status(200).json({ message: 'Email verified successfully' });
});

// @desc    Auth user & get token (Login)
const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    generateToken(res, user._id);
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      isVerified: user.isVerified,
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

// @desc    Logout user / clear cookie
const logoutUser = (req, res) => {
  res.cookie('jwt', '', {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({ message: 'Logged out successfully' });
};

// ================= ADMIN CONTROLLERS =================

const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({});
  res.json(users);
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
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      isAdmin: updatedUser.isAdmin,
      isVerified: updatedUser.isVerified,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

export {
  authUser,
  registerUser,
  logoutUser,
  verifyEmail,
  forgotPassword,
  resetPassword,
  getUsers,
  deleteUser,
  getUserById,
  updateUser,
};