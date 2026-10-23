const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { upload, processImage } = require('../middleware/upload');
const { getMenuItems, getMenuItem, createMenuItem, updateMenuItem, deleteMenuItem, toggleAvailability } = require('../controllers/menuController');

router.use(protect);

router.get('/', getMenuItems);
router.get('/:id', getMenuItem);
router.post('/', upload.single('image'), processImage('menu'), createMenuItem);
router.put('/:id', upload.single('image'), processImage('menu'), updateMenuItem);
router.delete('/:id', deleteMenuItem);
router.patch('/:id/toggle', toggleAvailability);

module.exports = router;