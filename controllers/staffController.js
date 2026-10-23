const Staff = require('../models/Staff');
const { deleteImage } = require('../middleware/upload');

// @desc    Get all staff
// @route   GET /api/staff
const getStaff = async (req, res, next) => {
  try {
    const { role, active } = req.query;
    const filter = {};
    if (role) filter.role = role;
    if (active !== undefined) filter.isActive = active === 'true';

    const staff = await Staff.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, count: staff.length, staff });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single staff
// @route   GET /api/staff/:id
const getStaffMember = async (req, res, next) => {
  try {
    const member = await Staff.findById(req.params.id);
    if (!member) {
      return res.status(404).json({ success: false, message: 'Staff not found' });
    }
    res.json({ success: true, staff: member });
  } catch (error) {
    next(error);
  }
};

// @desc    Create staff
// @route   POST /api/staff
const createStaff = async (req, res, next) => {
  try {
    const staffData = { ...req.body };
    if (req.file) { staffData.image = req.file.path; } else if (typeof staffData.image !== 'string') { delete staffData.image; }

    const member = await Staff.create(staffData);
    res.status(201).json({ success: true, staff: member });
  } catch (error) {
    next(error);
  }
};

// @desc    Update staff
// @route   PUT /api/staff/:id
const updateStaff = async (req, res, next) => {
  try {
    const member = await Staff.findById(req.params.id);
    if (!member) {
      return res.status(404).json({ success: false, message: 'Staff not found' });
    }

    const updateData = { ...req.body };
    if (req.file) {
      deleteImage(member.image);
      updateData.image = req.file.path;
    }

    Object.assign(member, updateData);
    await member.save();

    res.json({ success: true, staff: member });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete staff
// @route   DELETE /api/staff/:id
const deleteStaff = async (req, res, next) => {
  try {
    const member = await Staff.findById(req.params.id);
    if (!member) {
      return res.status(404).json({ success: false, message: 'Staff not found' });
    }

    deleteImage(member.image);
    await member.deleteOne();

    res.json({ success: true, message: 'Staff deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getStaff, getStaffMember, createStaff, updateStaff, deleteStaff };