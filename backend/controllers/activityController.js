const Activity = require('../models/Activity');

// @desc    Log a new activity (notes generated, pdf downloaded)
// @route   POST /api/activity
// @access  Private
exports.logActivity = async (req, res) => {
  const { type, module, title, content } = req.body;
  try {
    const activity = await Activity.create({
      user: req.user._id,
      type,
      module,
      title,
      content
    });
    res.status(201).json(activity);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get activity logs for a user
// @route   GET /api/activity
// @access  Private
exports.getUserActivity = async (req, res) => {
  const { module } = req.query;
  const filter = { user: req.user._id };
  if (module && module !== 'All') filter.module = module;

  try {
    const activities = await Activity.find(filter).sort({ timestamp: -1 });
    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
