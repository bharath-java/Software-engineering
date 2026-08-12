const systemService = require('../services/systemService');

const getSystemHealth = async (req, res) => {
  req.controllerName = 'systemController.getSystemHealth';
  req.mongoQuery = 'admin.ping()';
  try {
    const health = await systemService.getHealthMetrics();
    res.json(health);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getSystemHealth
};
