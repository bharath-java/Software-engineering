const authService = require('../services/authService');

const login = async (req, res) => {
  req.controllerName = 'authController.login';
  req.mongoQuery = 'db.users.findOne({ email: "..." })';
  try {
    const { email, password } = req.body;
    const data = await authService.loginUser({ email, password });
    
    // Add custom audit action
    req.customActionName = 'Admin/Manager Login';
    req.customDetails = `Successful login of ${email}`;
    
    res.json(data);
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
};

const updatePassword = async (req, res) => {
  req.controllerName = 'authController.updatePassword';
  req.mongoQuery = 'db.users.findById("...")';
  try {
    const { currentPassword, newPassword } = req.body;
    const result = await authService.updatePassword(req.user.id, { currentPassword, newPassword });
    
    req.customActionName = 'Password Updated';
    req.customDetails = `Updated password for user ID ${req.user.id}`;
    
    res.json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getMe = async (req, res) => {
  req.controllerName = 'authController.getMe';
  req.mongoQuery = 'db.users.findById("...")';
  res.json({ user: req.user });
};

module.exports = {
  login,
  updatePassword,
  getMe
};
