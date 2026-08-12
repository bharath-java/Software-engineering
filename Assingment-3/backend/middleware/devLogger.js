const AuditLog = require('../models/AuditLog');

const devLogger = (req, res, next) => {
  const start = Date.now();
  const originalJson = res.json;
  
  // Intercept the res.json method to capture latency and enrich dev trace metadata
  res.json = function (body) {
    const duration = Date.now() - start;
    
    // Set response locals for further logging if needed
    res.locals.duration = duration;
    
    // Check if Developer Mode is active via custom header
    const devModeHeader = req.headers['x-dev-mode'] === 'true';
    
    if (devModeHeader && body && typeof body === 'object' && !body.devFlow) {
      body.devFlow = {
        method: req.method,
        url: req.originalUrl || req.url,
        duration: `${duration}ms`,
        query: req.mongoQuery || 'N/A (No DB Query)',
        controller: req.controllerName || 'Router/Middleware',
        role: req.user ? req.user.role : 'Guest',
        timestamp: new Date().toLocaleTimeString()
      };
    }
    
    // Log write/update actions in the Audit Log collection asynchronously
    // Excluding static/doc calls or standard GET requests (except dashboard fetches)
    const isDashboardFetch = req.method === 'GET' && req.originalUrl === '/api/dashboard';
    const isMutation = ['POST', 'PUT', 'DELETE'].includes(req.method);
    const isLogin = req.originalUrl === '/api/auth/login';
    
    if (isMutation || isLogin || isDashboardFetch) {
      const userMail = req.user ? req.user.email : (req.body && req.body.email) || 'guest@system.com';
      const userRole = req.user ? req.user.role : 'Guest';
      
      let actionLabel = '';
      if (isLogin) actionLabel = 'Admin/User Logged In';
      else if (isDashboardFetch) actionLabel = 'Dashboard Metrics Loaded';
      else actionLabel = `${req.method} ${req.baseUrl || req.originalUrl}`;
      
      // Determine description details
      let detailsText = '';
      if (req.method === 'DELETE') detailsText = `Deleted resource ID: ${req.params.id || 'N/A'}`;
      else if (req.method === 'PUT') detailsText = `Updated resource ID: ${req.params.id || 'N/A'}`;
      else if (req.method === 'POST') detailsText = `Created new item: ${req.body.name || req.body.title || 'N/A'}`;
      
      const newAudit = {
        user: userMail,
        role: userRole === 'Guest' ? 'Manager' : userRole, // default fallback role for seeded logs
        action: req.customActionName || actionLabel,
        method: req.method,
        url: req.originalUrl || req.url,
        statusCode: res.statusCode || 200,
        details: detailsText || req.customDetails || `Performed API action on ${req.originalUrl}`,
        mongoQuery: req.mongoQuery || 'N/A'
      };
      
      // Save audit log to DB, catch errors to prevent request hanging
      AuditLog.create(newAudit).catch(err => {
        console.error('Failed to create Audit Log entry:', err.message);
      });
    }

    return originalJson.call(this, body);
  };
  
  next();
};

module.exports = devLogger;
