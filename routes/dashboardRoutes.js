const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getStats, getRecentOrders, getRevenueChart } = require('../controllers/dashboardController');

router.use(protect);

router.get('/stats', getStats);
router.get('/recent-orders', getRecentOrders);
router.get('/revenue-chart', getRevenueChart);

module.exports = router;