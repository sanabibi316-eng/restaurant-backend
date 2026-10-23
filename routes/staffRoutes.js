const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { upload, processImage } = require('../middleware/upload');
const { getStaff, getStaffMember, createStaff, updateStaff, deleteStaff } = require('../controllers/staffController');

router.use(protect);

router.get('/', getStaff);
router.get('/:id', getStaffMember);
router.post('/', upload.single('image'), processImage('staff'), createStaff);
router.put('/:id', upload.single('image'), processImage('staff'), updateStaff);
router.delete('/:id', deleteStaff);

module.exports = router;