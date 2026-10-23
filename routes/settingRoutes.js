const express = require('express');
const router = express.Router();
const { protect, superAdminOnly } = require('../middleware/auth');
const { getSettings, updateSettings } = require('../controllers/settingController');

router.use(protect);

router.get('/', getSettings);
router.put('/', superAdminOnly, updateSettings);

module.exports = router;