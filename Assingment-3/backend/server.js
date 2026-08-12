require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const devLogger = require('./middleware/devLogger');
const setupSwagger = require('./config/swagger');

// Route Imports
const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const customerRoutes = require('./routes/customers');
const systemRoutes = require('./routes/system');
const auditRoutes = require('./routes/audit');

const app = express();

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:') || origin === process.env.CLIENT_URL) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'), false);
  },
  credentials: true
}));
app.use(express.json());

// Dev logging interceptor for API flow mapping & Auditing
app.use(devLogger);

// API Routing Setup
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/system', systemRoutes);
app.use('/api/audit-logs', auditRoutes);

// Setup Swagger API documentation
setupSwagger(app);

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to E-Commerce Analytics Dashboard API Server.',
    docs: '/api/docs',
    status: 'Online'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error stack:', err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error'
  });
});

const PORT = process.env.PORT || 5000;

// Connect to MongoDB & Start Server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Express server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode.`);
  });
});
