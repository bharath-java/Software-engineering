const Order = require('../models/Order');
const Product = require('../models/Product');
const Customer = require('../models/Customer');
const mock = require('../utils/mockData');
const mongoose = require('mongoose');

class OrderService {
  async getAllOrders({ search, status, paymentStatus }) {
    if (mongoose.connection.readyState !== 1) {
      console.warn('⚠️ MongoDB disconnected. Returning offline orders list...');
      let list = [...mock.orders];
      
      if (status && status !== 'All') {
        list = list.filter(o => o.status === status);
      }
      if (paymentStatus && paymentStatus !== 'All') {
        list = list.filter(o => o.paymentStatus === paymentStatus);
      }
      if (search) {
        const query = search.toLowerCase();
        list = list.filter(o => 
          o.orderNumber.toLowerCase().includes(query) || 
          o.customerName.toLowerCase().includes(query) || 
          o.customerEmail.toLowerCase().includes(query)
        );
      }
      
      return { orders: list, queryTrace: 'db.orders.find() (Offline Mock Cache)' };
    }

    const filter = {};
    if (status && status !== 'All') {
      filter.status = status;
    }
    if (paymentStatus && paymentStatus !== 'All') {
      filter.paymentStatus = paymentStatus;
    }
    if (search) {
      filter.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { customerName: { $regex: search, $options: 'i' } },
        { customerEmail: { $regex: search, $options: 'i' } }
      ];
    }

    const queryTrace = `db.orders.find(${JSON.stringify(filter)}).sort({ createdAt: -1 })`;
    const orders = await Order.find(filter).sort({ createdAt: -1 });
    return { orders, queryTrace };
  }

  async createOrder(orderData) {
    if (mongoose.connection.readyState !== 1) {
      const orderNumber = `ORD-MOCK-${2000 + mock.orders.length + 1}`;
      
      // Deduct mock stock
      for (const item of orderData.products) {
        const pIdx = mock.products.findIndex(p => p._id === item.product);
        if (pIdx !== -1) {
          mock.products[pIdx].stock = Math.max(0, mock.products[pIdx].stock - item.quantity);
          if (mock.products[pIdx].stock === 0) mock.products[pIdx].status = 'Out of Stock';
          else if (mock.products[pIdx].stock < 10) mock.products[pIdx].status = 'Low Stock';
        }
      }

      // Update customer stats
      const cIdx = mock.customers.findIndex(c => c._id === orderData.customer);
      if (cIdx !== -1) {
        mock.customers[cIdx].totalOrders += 1;
        mock.customers[cIdx].totalSpent += orderData.totalAmount;
      }

      const newOrder = {
        _id: 'mock_ord_' + (mock.orders.length + 1),
        orderNumber,
        customer: orderData.customer,
        customerName: orderData.customerName || 'Offline Buyer',
        customerEmail: orderData.customerEmail || 'offline@domain.com',
        products: orderData.products,
        totalAmount: orderData.totalAmount,
        status: 'Pending',
        paymentStatus: 'Pending',
        createdAt: new Date().toISOString()
      };

      mock.orders.push(newOrder);
      return { order: newOrder, queryTrace: 'db.orders.create(...) (Offline Mock Cache)' };
    }

    // Generate order number
    const count = await Order.countDocuments();
    const orderNumber = `ORD-${1000 + count + 1}`;
    orderData.orderNumber = orderNumber;

    // Verify stock and update product stock levels
    for (const item of orderData.products) {
      const product = await Product.findById(item.product);
      if (!product) {
        throw new Error(`Product not found: ${item.product}`);
      }
      if (product.stock < item.quantity) {
        throw new Error(`Insufficient stock for product ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`);
      }
      product.stock -= item.quantity;
      await product.save();
    }

    // Save order
    const order = new Order(orderData);
    const savedOrder = await order.save();

    // Update customer spending history
    const customer = await Customer.findById(orderData.customer);
    if (customer) {
      customer.totalOrders += 1;
      customer.totalSpent += orderData.totalAmount;
      await customer.save();
    }

    const queryTrace = `db.orders.create({ orderNumber: "${orderNumber}", customer: "${orderData.customer}", ... })`;
    return { order: savedOrder, queryTrace };
  }

  async updateOrderStatus(id, status) {
    if (mongoose.connection.readyState !== 1) {
      const idx = mock.orders.findIndex(o => o._id === id);
      if (idx === -1) throw new Error('Order not found in offline cache');
      mock.orders[idx].status = status;
      return { order: mock.orders[idx], queryTrace: 'db.orders.updateOne(...) (Offline Mock Cache)' };
    }

    const queryTrace = `db.orders.findByIdAndUpdate("${id}", { status: "${status}" }, { new: true })`;
    const updatedOrder = await Order.findByIdAndUpdate(id, { status }, { new: true });
    if (!updatedOrder) {
      throw new Error('Order not found');
    }
    return { order: updatedOrder, queryTrace };
  }

  async deleteOrder(id) {
    if (mongoose.connection.readyState !== 1) {
      const idx = mock.orders.findIndex(o => o._id === id);
      if (idx === -1) throw new Error('Order not found in offline cache');
      const deleted = mock.orders[idx];
      mock.orders.splice(idx, 1);
      return { order: deleted, queryTrace: 'db.orders.deleteOne(...) (Offline Mock Cache)' };
    }

    const queryTrace = `db.orders.findByIdAndDelete("${id}")`;
    const deletedOrder = await Order.findByIdAndDelete(id);
    return { order: deletedOrder, queryTrace };
  }
}

module.exports = new OrderService();
