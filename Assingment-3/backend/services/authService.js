const User = require('../models/User');
const { generateToken } = require('../utils/jwt');

class AuthService {
  async loginUser({ email, password }) {
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState !== 1) {
      console.warn('⚠️ MongoDB disconnected. Using offline auth fallback...');
      const presets = {
        'admin@dashboard.com': { name: 'Admin User', role: 'Admin', pass: 'admin123' },
        'manager@dashboard.com': { name: 'Manager User', role: 'Manager', pass: 'manager123' },
        'developer@dashboard.com': { name: 'Developer User', role: 'Developer', pass: 'developer123' }
      };
      
      const preset = presets[email.toLowerCase()];
      if (preset && preset.pass === password) {
        const tempUser = { _id: 'offline_id', name: preset.name, email, role: preset.role };
        const token = generateToken(tempUser);
        return {
          token,
          user: {
            id: 'offline_id',
            name: preset.name,
            email: email,
            role: preset.role,
            isOffline: true
          }
        };
      }
      throw new Error('Invalid email or password (Offline Mode)');
    }

    const user = await User.findOne({ email });
    if (!user) {
      throw new Error('Invalid email or password');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new Error('Invalid email or password');
    }

    const token = generateToken(user);
    return {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    };
  }

  async updatePassword(userId, { currentPassword, newPassword }) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      throw new Error('Current password is incorrect');
    }

    user.password = newPassword;
    await user.save();
    return { success: true };
  }
}

module.exports = new AuthService();
