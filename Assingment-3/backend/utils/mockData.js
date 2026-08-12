// Mock Data Manager for Offline Mode when MongoDB is disconnected.
// Allows the dashboard and CRUD APIs to operate smoothly in-memory.

const categories = ['Electronics', 'Fashion', 'Home & Kitchen', 'Beauty', 'Sports & Outdoors'];

let products = [
  { _id: 'mock_prod_1', name: 'iPhone 15 Pro Max', price: 149900, category: 'Electronics', stock: 45, sku: 'SKU-201', status: 'In Stock', description: 'Apple flagship smartphone.', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60' },
  { _id: 'mock_prod_2', name: 'Samsung Galaxy S24 Ultra', price: 124900, category: 'Electronics', stock: 55, sku: 'SKU-202', status: 'In Stock', description: 'Samsung flagship smartphone.', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60' },
  { _id: 'mock_prod_3', name: 'Sony WH-1000XM5 Wireless Headphones', price: 29990, category: 'Electronics', stock: 8, sku: 'SKU-203', status: 'Low Stock', description: 'Best in class noise cancellation.', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60' },
  { _id: 'mock_prod_4', name: 'MacBook Air M3', price: 114900, category: 'Electronics', stock: 0, sku: 'SKU-204', status: 'Out of Stock', description: 'Supercharged by Apple M3 chip.', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60' },
  { _id: 'mock_prod_5', name: 'Nike Air Max Sneakers', price: 8999, category: 'Fashion', stock: 40, sku: 'SKU-205', status: 'In Stock', description: 'Iconic sporty fashion shoes.', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60' },
  { _id: 'mock_prod_6', name: 'Philips Air Fryer XL', price: 9999, category: 'Home & Kitchen', stock: 25, sku: 'SKU-206', status: 'In Stock', description: 'Healthy oil-free cooking.', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60' },
  { _id: 'mock_prod_7', name: 'L’Oreal Paris Hair Serum', price: 699, category: 'Beauty', stock: 120, sku: 'SKU-207', status: 'In Stock', description: 'Silky smooth frizz-free hair.', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60' },
  { _id: 'mock_prod_8', name: 'Boldfit Yoga Mat 6mm', price: 699, category: 'Sports & Outdoors', stock: 95, sku: 'SKU-208', status: 'In Stock', description: 'Anti-slip double layer yoga mat.', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60' }
];

let customers = [
  { _id: 'mock_cust_1', name: 'Amit Sharma', email: 'amit.sharma@domain.com', phone: '+91 9876543210', city: 'Mumbai', totalOrders: 4, totalSpent: 164800 },
  { _id: 'mock_cust_2', name: 'Priya Reddy', email: 'priya.reddy@domain.com', phone: '+91 9988776655', city: 'Bangalore', totalOrders: 2, totalSpent: 38980 },
  { _id: 'mock_cust_3', name: 'Rohan Gupta', email: 'rohan.gupta@domain.com', phone: '+91 8877665544', city: 'Delhi', totalOrders: 1, totalSpent: 114900 }
];

let orders = [
  {
    _id: 'mock_ord_1',
    orderNumber: 'ORD-2001',
    customer: 'mock_cust_1',
    customerName: 'Amit Sharma',
    customerEmail: 'amit.sharma@domain.com',
    products: [
      { product: 'mock_prod_1', name: 'iPhone 15 Pro Max', quantity: 1, price: 149900 }
    ],
    totalAmount: 149900,
    status: 'Delivered',
    paymentStatus: 'Paid',
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    _id: 'mock_ord_2',
    orderNumber: 'ORD-2002',
    customer: 'mock_cust_2',
    customerName: 'Priya Reddy',
    customerEmail: 'priya.reddy@domain.com',
    products: [
      { product: 'mock_prod_3', name: 'Sony WH-1000XM5 Wireless Headphones', quantity: 1, price: 29990 },
      { product: 'mock_prod_6', name: 'Philips Air Fryer XL', quantity: 1, price: 9999 }
    ],
    totalAmount: 39989,
    status: 'Shipped',
    paymentStatus: 'Paid',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    _id: 'mock_ord_3',
    orderNumber: 'ORD-2003',
    customer: 'mock_cust_3',
    customerName: 'Rohan Gupta',
    customerEmail: 'rohan.gupta@domain.com',
    products: [
      { product: 'mock_prod_4', name: 'MacBook Air M3', quantity: 1, price: 114900 }
    ],
    totalAmount: 114900,
    status: 'Pending',
    paymentStatus: 'Pending',
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
  }
];

let auditLogs = [
  { _id: 'mock_log_1', user: 'system@offline.com', role: 'Developer', action: 'Offline Cache Initialized', method: 'SYSTEM', url: 'N/A', statusCode: 200, details: 'Application connected to Local Memory Mock Data Store due to MongoDB connection offline state.', timestamp: new Date() }
];

module.exports = {
  products,
  customers,
  orders,
  auditLogs,
  categories
};
