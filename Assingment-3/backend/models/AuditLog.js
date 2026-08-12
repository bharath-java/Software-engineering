const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    default: Date.now
  },
  user: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['Admin', 'Manager', 'Developer'],
    required: true
  },
  action: {
    type: String,
    required: true
  },
  method: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  statusCode: {
    type: Number,
    required: true
  },
  details: {
    type: String
  },
  mongoQuery: {
    type: String
  }
});

module.exports = mongoose.model('AuditLog', auditLogSchema);
