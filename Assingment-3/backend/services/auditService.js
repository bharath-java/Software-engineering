const AuditLog = require('../models/AuditLog');
const mock = require('../utils/mockData');
const mongoose = require('mongoose');

class AuditService {
  async getRecentLogs(limit = 50) {
    if (mongoose.connection.readyState !== 1) {
      console.warn('⚠️ MongoDB disconnected. Returning offline audit logs...');
      const list = [...mock.auditLogs].slice(0, limit);
      return { logs: list, queryTrace: 'db.auditlogs.find().sort({ timestamp: -1 }) (Offline Mock Cache)' };
    }

    const queryTrace = `db.auditlogs.find().sort({ timestamp: -1 }).limit(${limit})`;
    const logs = await AuditLog.find().sort({ timestamp: -1 }).limit(limit);
    return { logs, queryTrace };
  }
}

module.exports = new AuditService();
