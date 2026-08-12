const express = require('express');
const router = express.Router();
const { getCustomers, getCustomerHistory } = require('../controllers/customerController');
const { protect, restrictTo } = require('../middleware/auth');

router.use(protect);

router.get('/', restrictTo('Admin', 'Manager', 'Developer'), getCustomers);
router.get('/:id/history', restrictTo('Admin', 'Manager', 'Developer'), getCustomerHistory);

module.exports = router;
