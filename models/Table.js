const mongoose = require('mongoose');

const tableSchema = new mongoose.Schema({
  number: {
    type: Number,
    required: [true, 'Table number is required'],
    unique: true
  },
  capacity: {
    type: Number,
    required: [true, 'Capacity is required'],
    min: 1,
    max: 20
  },
  status: {
    type: String,
    enum: ['available', 'occupied', 'reserved', 'maintenance'],
    default: 'available'
  },
  location: {
    type: String,
    enum: ['indoor', 'outdoor', 'vip', 'bar'],
    default: 'indoor'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Table', tableSchema);