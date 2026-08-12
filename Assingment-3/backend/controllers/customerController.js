const customerService = require('../services/customerService');

const getCustomers = async (req, res) => {
  req.controllerName = 'customerController.getCustomers';
  try {
    const { search } = req.query;
    const { customers, queryTrace } = await customerService.getAllCustomers({ search });
    
    req.mongoQuery = queryTrace;
    res.json(customers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getCustomerHistory = async (req, res) => {
  req.controllerName = 'customerController.getCustomerHistory';
  try {
    const { id } = req.params;
    const { orders, queryTrace } = await customerService.getCustomerHistory(id);
    
    req.mongoQuery = queryTrace;
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getCustomers,
  getCustomerHistory
};
