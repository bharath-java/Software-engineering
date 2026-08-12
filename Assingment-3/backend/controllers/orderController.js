const orderService = require('../services/orderService');

const getOrders = async (req, res) => {
  req.controllerName = 'orderController.getOrders';
  try {
    const { search, status, paymentStatus } = req.query;
    const { orders, queryTrace } = await orderService.getAllOrders({ search, status, paymentStatus });
    
    req.mongoQuery = queryTrace;
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createOrder = async (req, res) => {
  req.controllerName = 'orderController.createOrder';
  try {
    const { order, queryTrace } = await orderService.createOrder(req.body);
    
    req.mongoQuery = queryTrace;
    req.customActionName = 'Order Placed';
    req.customDetails = `Order placed for customer ${order.customerName} (Total: ₹${order.totalAmount})`;
    
    res.status(201).json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateOrderStatus = async (req, res) => {
  req.controllerName = 'orderController.updateOrderStatus';
  try {
    const { status } = req.body;
    const { order, queryTrace } = await orderService.updateOrderStatus(req.params.id, status);
    
    req.mongoQuery = queryTrace;
    req.customActionName = 'Order Status Updated';
    req.customDetails = `Updated order ${order.orderNumber} status to: ${status}`;
    
    res.json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteOrder = async (req, res) => {
  req.controllerName = 'orderController.deleteOrder';
  try {
    const { order, queryTrace } = await orderService.deleteOrder(req.params.id);
    
    req.mongoQuery = queryTrace;
    req.customActionName = 'Order Deleted';
    req.customDetails = `Deleted order ID: ${req.params.id}`;
    
    res.json({ message: 'Order deleted successfully', id: req.params.id });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  getOrders,
  createOrder,
  updateOrderStatus,
  deleteOrder
};
