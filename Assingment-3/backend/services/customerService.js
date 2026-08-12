const Customer = require('../models/Customer');
const Order = require('../models/Order');
const mock = require('../utils/mockData');
const mongoose = require('mongoose');

class CustomerService {
  async getAllCustomers({ search }) {
    if (mongoose.connection.readyState !== 1) {
      console.warn('⚠️ MongoDB disconnected. Returning offline customers list...');
      let list = [...mock.customers];
      
      if (search) {
        const query = search.toLowerCase();
        list = list.filter(c => 
          c.name.toLowerCase().includes(query) || 
          c.email.toLowerCase().includes(query) || 
          c.city.toLowerCase().includes(query)
        );
      }
      
      return { customers: list, queryTrace: 'db.customers.find() (Offline Mock Cache)' };
    }

    const filter = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } }
      ];
    }

    const queryTrace = `db.customers.find(${JSON.stringify(filter)}).sort({ totalSpent: -1 })`;
    const customers = await Customer.find(filter).sort({ totalSpent: -1 });
    return { customers, queryTrace };
  }

  async getCustomerHistory(customerId) {
    if (mongoose.connection.readyState !== 1) {
      console.warn('⚠️ MongoDB disconnected. Returning offline customer history...');
      const list = mock.orders.filter(o => o.customer === customerId);
      return { orders: list, queryTrace: 'db.orders.find({ customer: "..." }) (Offline Mock Cache)' };
    }

    const queryTrace = `db.orders.find({ customer: "${customerId}" }).sort({ createdAt: -1 })`;
    const orders = await Order.find({ customer: customerId }).sort({ createdAt: -1 });
    return { orders, queryTrace };
  }
}

module.exports = new CustomerService();
