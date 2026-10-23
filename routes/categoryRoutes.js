const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { upload, processImage } = require('../middleware/upload');
const { getCategories, getCategory, createCategory, updateCategory, deleteCategory } = require('../controllers/categoryController');

router.use(protect);

router.get('/', getCategories);
router.get('/:id', getCategory);
router.post('/', upload.single('image'), processImage('categories'), createCategory);
router.put('/:id', upload.single('image'), processImage('categories'), updateCategory);
router.delete('/:id', deleteCategory);

module.exports = router;