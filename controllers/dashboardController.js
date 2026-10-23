const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
const Table = require('../models/Table');
const Staff = require('../models/Staff');

// @desc    Get dashboard stats
// @route   GET /api/dashboard/stats
const getStats = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const [
      totalOrders,
      todayOrders,
      totalRevenue,
      todayRevenue,
      pendingOrders,
      totalItems,
      totalTables,
      occupiedTables,
      totalStaff,
      monthlyRevenue
    ] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ createdAt: { $gte: today } }),
      Order.aggregate([
        { $match: { paymentStatus: 'paid' } },
        { $group: { _id: null, total: { $sum: '$total' } } }
      ]),
      Order.aggregate([
        { $match: { paymentStatus: 'paid', createdAt: { $gte: today } } },
        { $group: { _id: null, total: { $sum: '$total' } } }
      ]),
      Order.countDocuments({ status: { $in: ['pending', 'confirmed', 'preparing'] } }),
      MenuItem.countDocuments({ isAvailable: true }),
      Table.countDocuments({ isActive: true }),
      Table.countDocuments({ status: 'occupied' }),
      Staff.countDocuments({ isActive: true }),
      Order.aggregate([
        { $match: { paymentStatus: 'paid', createdAt: { $gte: startOfMonth } } },
        { $group: { _id: null, total: { $sum: '$total' } } }
      ])
    ]);

    res.json({
      success: true,
      stats: {
        totalOrders,
        todayOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
        todayRevenue: todayRevenue[0]?.total || 0,
        pendingOrders,
        totalItems,
        totalTables,
        occupiedTables,
        totalStaff,
        monthlyRevenue: monthlyRevenue[0]?.total || 0
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get recent orders for dashboard
// @route   GET /api/dashboard/recent-orders
const getRecentOrders = async (req, res, next) => {
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('table', 'number')
      .select('orderNumber status total paymentStatus createdAt customerName');

    res.json({ success: true, orders });
  } catch (error) {
    next(error);
  }
};

// @desc    Get revenue chart data (last 7 days)
// @route   GET /api/dashboard/revenue-chart
const getRevenueChart = async (req, res, next) => {
  try {
    const days = 7;
    const data = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);

      const result = await Order.aggregate([
        { $match: { paymentStatus: 'paid', createdAt: { $gte: date, $lt: nextDay } } },
        { $group: { _id: null, total: { $sum: '$total' }, count: { $sum: 1 } } }
      ]);

      data.push({
        date: date.toISOString().split('T')[0],
        revenue: result[0]?.total || 0,
        orders: result[0]?.count || 0
      });
    }

    res.json({ success: true, chart: data });
  } catch (error) {
    next(error);
  }
};

module.exports = { getStats, getRecentOrders, getRevenueChart };