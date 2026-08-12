const dashboardService = require('../services/dashboardService');

const getDashboardData = async (req, res) => {
  req.controllerName = 'dashboardController.getDashboardData';
  try {
    const { metrics, queryTrace: metricTrace } = await dashboardService.getMetrics();
    const { charts, queryTrace: chartTrace } = await dashboardService.getCharts();
    
    req.mongoQuery = `${metricTrace}\n\n${chartTrace}`;
    
    res.json({
      metrics,
      charts
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getDashboardData
};
