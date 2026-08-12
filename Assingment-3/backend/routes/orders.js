const express = require('express');
const router = express.Router();
const { getOrders, createOrder, updateOrderStatus, deleteOrder } = require('../controllers/orderController');
const { protect, restrictTo } = require('../middleware/auth');

router.use(protect);

router.get('/', restrictTo('Admin', 'Manager', 'Developer'), getOrders);
router.post('/', restrictTo('Admin', 'Manager', 'Developer'), createOrder);
router.put('/:id', restrictTo('Admin', 'Manager', 'Developer'), updateOrderStatus);
router.delete('/:id', restrictTo('Admin', 'Developer'), deleteOrder); // Managers cannot delete orders

module.exports = router;
