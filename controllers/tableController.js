const Table = require('../models/Table');

// @desc    Get all tables
// @route   GET /api/tables
const getTables = async (req, res, next) => {
  try {
    const { status, location } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (location) filter.location = location;

    const tables = await Table.find(filter).sort({ number: 1 });
    res.json({ success: true, count: tables.length, tables });
  } catch (error) {
    next(error);
  }
};

// @desc    Create table
// @route   POST /api/tables
const createTable = async (req, res, next) => {
  try {
    const table = await Table.create(req.body);
    res.status(201).json({ success: true, table });
  } catch (error) {
    next(error);
  }
};

// @desc    Update table
// @route   PUT /api/tables/:id
const updateTable = async (req, res, next) => {
  try {
    const table = await Table.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!table) {
      return res.status(404).json({ success: false, message: 'Table not found' });
    }
    res.json({ success: true, table });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete table
// @route   DELETE /api/tables/:id
const deleteTable = async (req, res, next) => {
  try {
    const table = await Table.findById(req.params.id);
    if (!table) {
      return res.status(404).json({ success: false, message: 'Table not found' });
    }
    if (table.status === 'occupied') {
      return res.status(400).json({ success: false, message: 'Cannot delete occupied table' });
    }

    await table.deleteOne();
    res.json({ success: true, message: 'Table deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getTables, createTable, updateTable, deleteTable };