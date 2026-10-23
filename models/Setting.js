const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
  restaurantName: {
    type: String,
    default: 'My Restaurant',
    trim: true
  },
  tagline: {
    type: String,
    default: '',
    trim: true
  },
  email: {
    type: String,
    default: '',
    trim: true
  },
  phone: {
    type: String,
    default: '',
    trim: true
  },
  address: {
    type: String,
    default: '',
    trim: true
  },
  taxRate: {
    type: Number,
    default: 5,
    min: 0,
    max: 100
  },
  currency: {
    type: String,
    default: '₹'
  },
  openTime: {
    type: String,
    default: '09:00'
  },
  closeTime: {
    type: String,
    default: '23:00'
  },
  logo: {
    type: String,
    default: ''
  }
}, { timestamps: true });

module.exports = mongoose.model('Setting', settingSchema);