const Setting = require('../models/Setting');

// @desc    Get settings
// @route   GET /api/settings
const getSettings = async (req, res, next) => {
  try {
    let settings = await Setting.findOne();
    if (!settings) {
      settings = await Setting.create({});
    }
    res.json({ success: true, settings });
  } catch (error) {
    next(error);
  }
};

// @desc    Update settings
// @route   PUT /api/settings
const updateSettings = async (req, res, next) => {
  try {
    let settings = await Setting.findOne();
    if (!settings) {
      settings = await Setting.create(req.body);
    } else {
      Object.assign(settings, req.body);
      await settings.save();
    }

    res.json({ success: true, settings });
  } catch (error) {
    next(error);
  }
};

module.exports = { getSettings, updateSettings };