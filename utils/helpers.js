const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

// Seed default admin
const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const Admin = require('../models/Admin');
    const Setting = require('../models/Setting');

    // Create default admin
    const exists = await Admin.findOne({ email: 'admin@restaurant.com' });
    if (!exists) {
      await Admin.create({
        name: 'Super Admin',
        email: 'admin@restaurant.com',
        password: 'admin123',
        role: 'superadmin'
      });
      console.log('✅ Default admin created: admin@restaurant.com / admin123');
    } else {
      console.log('ℹ️ Admin already exists');
    }

    // Create default settings
    const settingExists = await Setting.findOne();
    if (!settingExists) {
      await Setting.create({
        restaurantName: 'Flavour Haven',
        tagline: 'Where taste meets elegance',
        email: 'info@flavourhaven.com',
        phone: '+91 9876543210',
        address: '123 Food Street, Mumbai',
        taxRate: 5,
        currency: '₹'
      });
      console.log('✅ Default settings created');
    }

    console.log('✅ Seed completed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error.message);
    process.exit(1);
  }
};

if (process.argv[2] === 'seed') {
  seedAdmin();
}

// Helper: send token response
const sendTokenResponse = (admin, statusCode, res) => {
  const token = admin.getToken();

  const options = {
    expires: new Date(Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  };

  const adminData = {
    _id: admin._id,
    name: admin.name,
    email: admin.email,
    role: admin.role,
    avatar: admin.avatar
  };

  res.status(statusCode)
    .cookie('token', token, options)
    .json({ success: true, token, admin: adminData });
};

module.exports = { sendTokenResponse };