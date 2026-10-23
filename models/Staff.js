const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: 50
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    default: ''
  },
  phone: {
    type: String,
    required: [true, 'Phone is required'],
    trim: true
  },
  role: {
    type: String,
    enum: ['chef', 'waiter', 'cashier', 'manager', 'cleaner', 'other'],
    required: [true, 'Role is required']
  },
  salary: {
    type: Number,
    default: 0,
    min: 0
  },
  image: {
    type: String,
    default: ''
  },
  address: {
    type: String,
    trim: true,
    default: ''
  },
  joiningDate: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  shift: {
    type: String,
    enum: ['morning', 'evening', 'night', 'flexible'],
    default: 'flexible'
  }
}, { timestamps: true });

module.exports = mongoose.model('Staff', staffSchema);