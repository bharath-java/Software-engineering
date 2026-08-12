const express = require('express');
const router = express.Router();
const { getRecentLogs } = require('../controllers/auditController');
const { protect, restrictTo } = require('../middleware/auth');

router.use(protect);

router.get('/', restrictTo('Admin', 'Developer'), getRecentLogs);

module.exports = router;
