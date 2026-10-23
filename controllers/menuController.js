const MenuItem = require('../models/MenuItem');
const { deleteImage } = require('../middleware/upload');

// @desc    Get all menu items
// @route   GET /api/menu
const getMenuItems = async (req, res, next) => {
  try {
    const { category, available, search, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (category) filter.category = category;
    if (available !== undefined) filter.isAvailable = available === 'true';
    if (search) filter.$text = { $search: search };

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      MenuItem.find(filter)
        .populate('category', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      MenuItem.countDocuments(filter)
    ]);

    res.json({
      success: true,
      count: items.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: Number(page),
      items
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single menu item
// @route   GET /api/menu/:id
const getMenuItem = async (req, res, next) => {
  try {
    const item = await MenuItem.findById(req.params.id).populate('category', 'name');
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }
    res.json({ success: true, item });
  } catch (error) {
    next(error);
  }
};

// @desc    Create menu item
// @route   POST /api/menu
const createMenuItem = async (req, res, next) => {
  try {
    const itemData = { ...req.body };
    if (req.file) { itemData.image = req.file.path; } else if (typeof itemData.image !== 'string') { delete itemData.image; }

    const item = await MenuItem.create(itemData);
    const populated = await MenuItem.findById(item._id).populate('category', 'name');

    res.status(201).json({ success: true, item: populated });
  } catch (error) {
    next(error);
  }
};

// @desc    Update menu item
// @route   PUT /api/menu/:id
const updateMenuItem = async (req, res, next) => {
  try {
    const item = await MenuItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    const updateData = { ...req.body };

    if (req.file) {
      deleteImage(item.image);
      updateData.image = req.file.path;
    }

    Object.assign(item, updateData);
    await item.save();

    const populated = await MenuItem.findById(item._id).populate('category', 'name');
    res.json({ success: true, item: populated });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete menu item
// @route   DELETE /api/menu/:id
const deleteMenuItem = async (req, res, next) => {
  try {
    const item = await MenuItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    deleteImage(item.image);
    await item.deleteOne();

    res.json({ success: true, message: 'Item deleted' });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle availability
// @route   PATCH /api/menu/:id/toggle
const toggleAvailability = async (req, res, next) => {
  try {
    const item = await MenuItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    item.isAvailable = !item.isAvailable;
    await item.save();

    res.json({ success: true, message: `Item is now ${item.isAvailable ? 'available' : 'unavailable'}`, item });
  } catch (error) {
    next(error);
  }
};

module.exports = { getMenuItems, getMenuItem, createMenuItem, updateMenuItem, deleteMenuItem, toggleAvailability };