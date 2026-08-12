const express = require('express');
const router = express.Router();
const { getProducts, createProduct, updateProduct, deleteProduct } = require('../controllers/productController');
const { protect, restrictTo } = require('../middleware/auth');

router.use(protect);

router.get('/', restrictTo('Admin', 'Manager', 'Developer'), getProducts);
router.post('/', restrictTo('Admin', 'Manager', 'Developer'), createProduct);
router.put('/:id', restrictTo('Admin', 'Manager', 'Developer'), updateProduct);
router.delete('/:id', restrictTo('Admin', 'Developer'), deleteProduct); // Managers cannot delete products

module.exports = router;
