const Category = require('../models/Category');
const { deleteImage } = require('../middleware/upload');

// @desc    Get all categories
// @route   GET /api/categories
const getCategories = async (req, res, next) => {
  try {
    const { active } = req.query;
    const filter = {};
    if (active !== undefined) filter.isActive = active === 'true';

    const categories = await Category.find(filter).sort({ sortOrder: 1, createdAt: -1 });
    res.json({ success: true, count: categories.length, categories });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single category
// @route   GET /api/categories/:id
const getCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    res.json({ success: true, category });
  } catch (error) {
    next(error);
  }
};

// @desc    Create category
// @route   POST /api/categories
const createCategory = async (req, res, next) => {
  try {
    const { name, description, isActive, sortOrder } = req.body;

    const category = await Category.create({
      name,
      description,
      isActive: isActive !== false,
      sortOrder: sortOrder || 0,
      image: req.file ? req.file.path : ''
    });

    res.status(201).json({ success: true, category });
  } catch (error) {
    next(error);
  }
};

// @desc    Update category
// @route   PUT /api/categories/:id
const updateCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    const { name, description, isActive, sortOrder } = req.body;

    if (name) category.name = name;
    if (description !== undefined) category.description = description;
    if (isActive !== undefined) category.isActive = isActive;
    if (sortOrder !== undefined) category.sortOrder = sortOrder;

    if (req.file) {
      deleteImage(category.image);
      category.image = req.file.path;
    }

    await category.save();
    res.json({ success: true, category });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete category
// @route   DELETE /api/categories/:id
const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    deleteImage(category.image);
    await category.deleteOne();

    res.json({ success: true, message: 'Category deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getCategories, getCategory, createCategory, updateCategory, deleteCategory };