const Admin = require('../models/Admin');
const { sendTokenResponse } = require('../utils/helpers');
const { validationResult } = require('express-validator');

// @desc    Login admin
// @route   POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }

    const { email, password } = req.body;

    const admin = await Admin.findOne({ email }).select('+password');
    if (!admin) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (!admin.isActive) {
      return res.status(403).json({ success: false, message: 'Account is deactivated' });
    }

    const isMatch = await admin.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    admin.lastLogin = new Date();
    await admin.save();

    sendTokenResponse(admin, 200, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Get current admin profile
// @route   GET /api/auth/me
const getMe = async (req, res, next) => {
  try {
    const admin = await Admin.findById(req.admin._id);
    res.json({ success: true, admin });
  } catch (error) {
    next(error);
  }
};

// @desc    Update admin profile
// @route   PUT /api/auth/profile
const updateProfile = async (req, res, next) => {
  try {
    const { name, email } = req.body;
    const admin = await Admin.findById(req.admin._id);

    if (name) admin.name = name;
    if (email) admin.email = email;

    await admin.save();

    res.json({
      success: true,
      message: 'Profile updated',
      admin: { _id: admin._id, name: admin.name, email: admin.email, role: admin.role }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'All fields required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be 6+ characters' });
    }

    const admin = await Admin.findById(req.admin._id).select('+password');
    const isMatch = await admin.matchPassword(currentPassword);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Current password is wrong' });
    }

    admin.password = newPassword;
    await admin.save();

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Logout
// @route   POST /api/auth/logout
const logout = (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });
  res.json({ success: true, message: 'Logged out' });
};

module.exports = { login, getMe, updateProfile, changePassword, logout };