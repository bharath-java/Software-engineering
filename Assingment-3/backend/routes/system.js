const express = require('express');
const router = express.Router();
const { getSystemHealth } = require('../controllers/systemController');
const { protect, restrictTo } = require('../middleware/auth');

router.use(protect);

router.get('/health', restrictTo('Admin', 'Developer'), getSystemHealth);

module.exports = router;
