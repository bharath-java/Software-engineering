const swaggerUi = require('swagger-ui-express');

const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'E-Commerce Analytics Dashboard API',
    version: '1.0.0',
    description: 'REST API documentation for the E-Commerce Analytics Dashboard system. Includes Admin/Manager/Developer roles and JWT authentication.'
  },
  servers: [
    {
      url: 'http://localhost:5000',
      description: 'Local Development Server'
    }
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    }
  },
  security: [
    {
      BearerAuth: []
    }
  ],
  paths: {
    '/api/auth/login': {
      post: {
        summary: 'Authenticate user & retrieve token',
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  email: { type: 'string', example: 'admin@dashboard.com' },
                  password: { type: 'string', example: 'admin123' }
                },
                required: ['email', 'password']
              }
            }
          }
        },
        responses: {
          200: { description: 'Successful login' },
          401: { description: 'Invalid credentials' }
        }
      }
    },
    '/api/dashboard': {
      get: {
        summary: 'Fetch dynamic aggregated stats and charts',
        responses: {
          200: { description: 'Success' },
          401: { description: 'Unauthorized' }
        }
      }
    },
    '/api/products': {
      get: {
        summary: 'Get all products (with search/filters)',
        parameters: [
          { name: 'search', in: 'query', schema: { type: 'string' } },
          { name: 'category', in: 'query', schema: { type: 'string' } },
          { name: 'status', in: 'query', schema: { type: 'string' } }
        ],
        responses: {
          200: { description: 'Success' }
        }
      },
      post: {
        summary: 'Create a new product',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string', example: 'Sony WH-1000XM4' },
                  price: { type: 'number', example: 24990 },
                  category: { type: 'string', example: 'Electronics' },
                  stock: { type: 'number', example: 45 },
                  sku: { type: 'string', example: 'SONY-XM4-01' },
                  description: { type: 'string', example: 'Wireless Noise Cancelling Headphones' }
                }
              }
            }
          }
        },
        responses: {
          201: { description: 'Created' }
        }
      }
    },
    '/api/products/{id}': {
      put: {
        summary: 'Update a product details',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Success' }
        }
      },
      delete: {
        summary: 'Delete a product (Admin/Developer only)',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Deleted' }
        }
      }
    },
    '/api/orders': {
      get: {
        summary: 'Get all orders',
        responses: {
          200: { description: 'Success' }
        }
      },
      post: {
        summary: 'Create a new order',
        responses: {
          201: { description: 'Created' }
        }
      }
    },
    '/api/orders/{id}': {
      put: {
        summary: 'Update order status (Pending, Packed, Shipped, Delivered)',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  status: { type: 'string', example: 'Shipped' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Success' }
        }
      }
    },
    '/api/customers': {
      get: {
        summary: 'Get customer listings',
        responses: {
          200: { description: 'Success' }
        }
      }
    },
    '/api/system/health': {
      get: {
        summary: 'Fetch live system performance metrics (Admin/Developer only)',
        responses: {
          200: { description: 'Success' }
        }
      }
    }
  }
};

const setupSwagger = (app) => {
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  console.log('📖 API Docs available at http://localhost:5000/api/docs');
};

module.exports = setupSwagger;
