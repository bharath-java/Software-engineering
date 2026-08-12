const Product = require('../models/Product');
const mock = require('../utils/mockData');
const mongoose = require('mongoose');

class ProductService {
  async getAllProducts({ search, category, status, sort }) {
    if (mongoose.connection.readyState !== 1) {
      console.warn('⚠️ MongoDB disconnected. Returning offline products list...');
      let list = [...mock.products];
      
      if (search) {
        const query = search.toLowerCase();
        list = list.filter(p => p.name.toLowerCase().includes(query) || p.sku.toLowerCase().includes(query));
      }
      if (category && category !== 'All') {
        list = list.filter(p => p.category === category);
      }
      if (status && status !== 'All') {
        list = list.filter(p => p.status === status);
      }
      
      // Sorting
      if (sort === 'price_asc') list.sort((a, b) => a.price - b.price);
      else if (sort === 'price_desc') list.sort((a, b) => b.price - a.price);
      else if (sort === 'stock_asc') list.sort((a, b) => a.stock - b.stock);
      else if (sort === 'stock_desc') list.sort((a, b) => b.stock - a.stock);
      
      return { products: list, queryTrace: 'db.products.find() (Offline Mock Cache)' };
    }

    const filter = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } }
      ];
    }
    if (category && category !== 'All') {
      filter.category = category;
    }
    if (status && status !== 'All') {
      filter.status = status;
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'price_asc') sortOption = { price: 1 };
    else if (sort === 'price_desc') sortOption = { price: -1 };
    else if (sort === 'stock_asc') sortOption = { stock: 1 };
    else if (sort === 'stock_desc') sortOption = { stock: -1 };

    const queryTrace = `db.products.find(${JSON.stringify(filter)}).sort(${JSON.stringify(sortOption)})`;
    const products = await Product.find(filter).sort(sortOption);
    return { products, queryTrace };
  }

  async createProduct(productData) {
    if (mongoose.connection.readyState !== 1) {
      const newProduct = {
        _id: 'mock_prod_' + (mock.products.length + 1),
        ...productData,
        stock: Number(productData.stock),
        price: Number(productData.price),
        status: Number(productData.stock) === 0 ? 'Out of Stock' : Number(productData.stock) < 10 ? 'Low Stock' : 'In Stock',
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60'
      };
      mock.products.push(newProduct);
      return { product: newProduct, queryTrace: 'db.products.insertOne(...) (Offline Mock Cache)' };
    }

    const product = new Product(productData);
    const queryTrace = `db.products.insertOne(${JSON.stringify(productData)})`;
    const savedProduct = await product.save();
    return { product: savedProduct, queryTrace };
  }

  async updateProduct(id, productData) {
    if (mongoose.connection.readyState !== 1) {
      const idx = mock.products.findIndex(p => p._id === id);
      if (idx === -1) throw new Error('Product not found in offline cache');
      const updated = {
        ...mock.products[idx],
        ...productData,
        stock: Number(productData.stock),
        price: Number(productData.price),
        status: Number(productData.stock) === 0 ? 'Out of Stock' : Number(productData.stock) < 10 ? 'Low Stock' : 'In Stock'
      };
      mock.products[idx] = updated;
      return { product: updated, queryTrace: 'db.products.updateOne(...) (Offline Mock Cache)' };
    }

    const queryTrace = `db.products.findByIdAndUpdate("${id}", ${JSON.stringify(productData)}, { new: true })`;
    const updatedProduct = await Product.findByIdAndUpdate(id, productData, { new: true, runValidators: true });
    return { product: updatedProduct, queryTrace };
  }

  async deleteProduct(id) {
    if (mongoose.connection.readyState !== 1) {
      const idx = mock.products.findIndex(p => p._id === id);
      if (idx === -1) throw new Error('Product not found in offline cache');
      const deleted = mock.products[idx];
      mock.products.splice(idx, 1);
      return { product: deleted, queryTrace: 'db.products.deleteOne(...) (Offline Mock Cache)' };
    }

    const queryTrace = `db.products.findByIdAndDelete("${id}")`;
    const deletedProduct = await Product.findByIdAndDelete(id);
    return { product: deletedProduct, queryTrace };
  }
}

module.exports = new ProductService();
