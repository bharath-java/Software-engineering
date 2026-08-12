const auditService = require('../services/auditService');

const getRecentLogs = async (req, res) => {
  req.controllerName = 'auditController.getRecentLogs';
  try {
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : 50;
    const { logs, queryTrace } = await auditService.getRecentLogs(limit);
    req.mongoQuery = queryTrace;
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getRecentLogs
};
