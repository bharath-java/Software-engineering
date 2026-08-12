const productService = require('../services/productService');

const getProducts = async (req, res) => {
  req.controllerName = 'productController.getProducts';
  try {
    const { search, category, status, sort } = req.query;
    const { products, queryTrace } = await productService.getAllProducts({ search, category, status, sort });
    
    req.mongoQuery = queryTrace;
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createProduct = async (req, res) => {
  req.controllerName = 'productController.createProduct';
  try {
    const { product, queryTrace } = await productService.createProduct(req.body);
    
    req.mongoQuery = queryTrace;
    req.customActionName = 'Product Created';
    req.customDetails = `Created product: ${product.name} (SKU: ${product.sku})`;
    
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateProduct = async (req, res) => {
  req.controllerName = 'productController.updateProduct';
  try {
    const { product, queryTrace } = await productService.updateProduct(req.params.id, req.body);
    
    req.mongoQuery = queryTrace;
    req.customActionName = 'Product Updated';
    req.customDetails = `Updated product ID: ${req.params.id}`;
    
    res.json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteProduct = async (req, res) => {
  req.controllerName = 'productController.deleteProduct';
  try {
    const { product, queryTrace } = await productService.deleteProduct(req.params.id);
    
    req.mongoQuery = queryTrace;
    req.customActionName = 'Product Deleted';
    req.customDetails = `Deleted product ID: ${req.params.id}`;
    
    res.json({ message: 'Product deleted successfully', id: req.params.id });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct
};
