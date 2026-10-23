const Order = require('../models/Order');
const Table = require('../models/Table');

// @desc    Get all orders
// @route   GET /api/orders
const getOrders = async (req, res, next) => {
  try {
    const { status, paymentStatus, date, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (paymentStatus) filter.paymentStatus = paymentStatus;
    if (date) {
      const d = new Date(date);
      filter.createdAt = {
        $gte: new Date(d.setHours(0, 0, 0, 0)),
        $lt: new Date(d.setHours(23, 59, 59, 999))
      };
    }

    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate('table', 'number')
        .populate('items.menuItem', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Order.countDocuments(filter)
    ]);

    res.json({
      success: true,
      count: orders.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: Number(page),
      orders
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single order
// @route   GET /api/orders/:id
const getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('table', 'number capacity')
      .populate('items.menuItem', 'name price image');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    res.json({ success: true, order });
  } catch (error) {
    next(error);
  }
};

// @desc    Create order
// @route   POST /api/orders
const createOrder = async (req, res, next) => {
  try {
    const { table, items, paymentMethod, customerName, customerPhone, notes } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Order must have items' });
    }

    // Calculate totals
    let subtotal = 0;
    items.forEach(item => {
      subtotal += item.price * item.quantity;
    });

    const Setting = require('../models/Setting');
    const settings = await Setting.findOne();
    const taxRate = settings?.taxRate || 5;
    const tax = Math.round(subtotal * (taxRate / 100) * 100) / 100;
    const total = subtotal + tax;

    const order = await Order.create({
      table,
      items,
      subtotal,
      tax,
      total,
      paymentMethod: paymentMethod || 'cash',
      customerName: customerName || 'Walk-in',
      customerPhone: customerPhone || '',
      notes: notes || ''
    });

    // Mark table occupied
    if (table) {
      await Table.findByIdAndUpdate(table, { status: 'occupied' });
    }

    const populated = await Order.findById(order._id)
      .populate('table', 'number')
      .populate('items.menuItem', 'name');

    res.status(201).json({ success: true, order: populated });
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
const updateOrderStatus = async (req, res, next) => {
  try {
    const { status, paymentStatus } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (status) order.status = status;
    if (paymentStatus) order.paymentStatus = paymentStatus;

    // Free table when order completed or cancelled
    if ((status === 'completed' || status === 'cancelled') && order.table) {
      await Table.findByIdAndUpdate(order.table, { status: 'available' });
    }

    await order.save();
    const populated = await Order.findById(order._id)
      .populate('table', 'number')
      .populate('items.menuItem', 'name');

    res.json({ success: true, order: populated });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete order
// @route   DELETE /api/orders/:id
const deleteOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.table && order.status !== 'completed') {
      await Table.findByIdAndUpdate(order.table, { status: 'available' });
    }

    await order.deleteOne();
    res.json({ success: true, message: 'Order deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getOrders, getOrder, createOrder, updateOrderStatus, deleteOrder };