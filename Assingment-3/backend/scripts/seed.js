require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Customer = require('../models/Customer');
const Order = require('../models/Order');
const AuditLog = require('../models/AuditLog');

const categoriesData = [
  { name: 'Electronics', description: 'Smartphones, Laptops, Accessories, and Smart Devices' },
  { name: 'Fashion', description: 'Apparel, Footwear, and Accessories' },
  { name: 'Home & Kitchen', description: 'Furniture, Decor, Appliances, and Utensils' },
  { name: 'Beauty', description: 'Skincare, Makeup, Perfumes, and Personal Care' },
  { name: 'Sports & Outdoors', description: 'Fitness gear, Outdoor accessories, and Apparel' },
  { name: 'Books', description: 'Fiction, Non-fiction, Academic, and Self-help' },
  { name: 'Automotive', description: 'Car Accessories, Tools, and Care products' },
  { name: 'Toys & Games', description: 'Board games, Action figures, and Kids toys' },
  { name: 'Office Supplies', description: 'Stationery, Calculators, Notebooks, and Desk items' },
  { name: 'Health & Wellness', description: 'Vitamins, Supplements, and Health Monitors' }
];

const indianCities = [
  'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Ahmedabad', 
  'Chennai', 'Kolkata', 'Pune', 'Jaipur', 'Lucknow'
];

const firstNames = ['Amit', 'Rahul', 'Priya', 'Sneha', 'Vikram', 'Anjali', 'Rohan', 'Neha', 'Sanjay', 'Aditi', 'Rajesh', 'Kirti', 'Abhishek', 'Pooja', 'Deepak', 'Manish', 'Shalini', 'Karan', 'Meera', 'Ravi'];
const lastNames = ['Sharma', 'Verma', 'Gupta', 'Patel', 'Reddy', 'Nair', 'Joshi', 'Singh', 'Kumar', 'Mishra', 'Deshmukh', 'Choudhury', 'Sen', 'Banerjee', 'Rao', 'Bose', 'Pillai', 'Saxena', 'Kapoor', 'Mehta'];

const productTemplates = {
  'Electronics': [
    { name: 'iPhone 15 Pro Max', basePrice: 149900 },
    { name: 'Samsung Galaxy S24 Ultra', basePrice: 124900 },
    { name: 'MacBook Air M3', basePrice: 114900 },
    { name: 'Sony WH-1000XM5 Wireless Headphones', basePrice: 29990 },
    { name: 'Dell XPS 13 Laptop', basePrice: 98900 },
    { name: 'iPad Pro 11-inch', basePrice: 79900 },
    { name: 'Apple Watch Series 9', basePrice: 41900 },
    { name: 'Bose SoundLink Revolve+', basePrice: 24500 }
  ],
  'Fashion': [
    { name: 'Levis 511 Slim Fit Jeans', basePrice: 3499 },
    { name: 'Nike Air Max Sneakers', basePrice: 8999 },
    { name: 'Adidas Originals Hoodie', basePrice: 4599 },
    { name: 'Tommy Hilfiger Leather Wallet', basePrice: 2999 },
    { name: 'Ray-Ban Wayfarer Sunglasses', basePrice: 7890 },
    { name: 'Casio Edifice Analog Watch', basePrice: 11995 }
  ],
  'Home & Kitchen': [
    { name: 'Philips Air Fryer XL', basePrice: 9999 },
    { name: 'Prestige Induction Cooktop', basePrice: 2899 },
    { name: 'Milton Steel Thermos Flask', basePrice: 1290 },
    { name: 'Kent Grand Plus RO Water Purifier', basePrice: 16500 },
    { name: 'Pigeon Stainless Steel Cookware Set', basePrice: 3499 },
    { name: 'Wonderchef Nutri-Blend Mixer', basePrice: 3199 }
  ],
  'Beauty': [
    { name: 'L’Oreal Paris Serum', basePrice: 699 },
    { name: 'Nivea Body Lotion 400ml', basePrice: 399 },
    { name: 'Maybelline Colossal Kajal', basePrice: 199 },
    { name: 'Forest Essentials Facial Ubtan', basePrice: 1295 },
    { name: 'The Body Shop Tea Tree Face Wash', basePrice: 795 }
  ],
  'Sports & Outdoors': [
    { name: 'Nivia Storm Football', basePrice: 799 },
    { name: 'Yonex Carbonex 8000 Badminton Racket', basePrice: 2490 },
    { name: 'Decathlon Quechua Hiking Backpack 30L', basePrice: 1999 },
    { name: 'Boldfit Yoga Mat 6mm', basePrice: 699 },
    { name: 'Fitkit FT100 Series Motorized Treadmill', basePrice: 18999 }
  ],
  'Books': [
    { name: 'Atomic Habits by James Clear', basePrice: 599 },
    { name: 'The Psychology of Money by Morgan Housel', basePrice: 399 },
    { name: 'Ikigai: The Japanese Secret to a Long Life', basePrice: 450 },
    { name: 'Rich Dad Poor Dad by Robert Kiyosaki', basePrice: 499 },
    { name: 'Sapiens: A Brief History of Humankind', basePrice: 699 }
  ],
  'Automotive': [
    { name: 'Car Vacuum Cleaner High Power', basePrice: 1599 },
    { name: 'Windshield Washer Fluid Concentrate', basePrice: 349 },
    { name: 'Mobile Holder for Car Dashboard', basePrice: 599 },
    { name: '3M Car Polish Liquid', basePrice: 499 },
    { name: 'Dual Port Fast Car Charger', basePrice: 799 }
  ],
  'Toys & Games': [
    { name: 'Monopoly Deluxe Edition Board Game', basePrice: 1499 },
    { name: 'Hot Wheels Gift Pack of 5 Cars', basePrice: 699 },
    { name: 'LEGO Classic Creative Bricks Set', basePrice: 1999 },
    { name: 'Uno Flip Card Game', basePrice: 299 },
    { name: 'Rubiks 3x3 Speed Cube', basePrice: 499 }
  ],
  'Office Supplies': [
    { name: 'Casio Financial Calculator', basePrice: 1895 },
    { name: 'Parker Vector Fountain Pen', basePrice: 499 },
    { name: 'Classmate Notebooks Pack of 6', basePrice: 360 },
    { name: 'Whiteboard Marker Pens Pack of 4', basePrice: 150 },
    { name: 'Lapis Obo Desk Organizer Stand', basePrice: 599 }
  ],
  'Health & Wellness': [
    { name: 'Dr. Trust Digital Blood Pressure Monitor', basePrice: 1999 },
    { name: 'Omron Digital Weighing Scale', basePrice: 1490 },
    { name: 'Optimum Nutrition Gold Standard Whey 1kg', basePrice: 3899 },
    { name: 'MuscleBlaze Multi-Vitamins 60 Tabs', basePrice: 599 },
    { name: 'Cumi Gummy Bear ACV Gummies', basePrice: 899 }
  ]
};

const seedDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error('❌ MONGODB_URI not found in env variables.');
      process.exit(1);
    }
    
    console.log('Connecting to database for seeding...');
    await mongoose.connect(mongoUri);
    console.log('Clear existing data...');
    
    await User.deleteMany({});
    await Category.deleteMany({});
    await Product.deleteMany({});
    await Customer.deleteMany({});
    await Order.deleteMany({});
    await AuditLog.deleteMany({});
    
    console.log('Creating Admin, Manager, and Developer users...');
    const users = [
      new User({ name: 'Admin User', email: 'admin@dashboard.com', password: 'admin123', role: 'Admin' }),
      new User({ name: 'Manager User', email: 'manager@dashboard.com', password: 'manager123', role: 'Manager' }),
      new User({ name: 'Developer User', email: 'developer@dashboard.com', password: 'developer123', role: 'Developer' })
    ];
    for (const u of users) {
      await u.save();
    }
    console.log('Users created.');

    console.log('Creating Categories...');
    const categories = [];
    for (const cat of categoriesData) {
      const c = await Category.create(cat);
      categories.push(c);
    }
    console.log(`${categories.length} Categories created.`);

    console.log('Creating 50 Products...');
    const products = [];
    let skuCounter = 100;
    
    for (const catName of Object.keys(productTemplates)) {
      const templates = productTemplates[catName];
      for (const t of templates) {
        skuCounter++;
        const p = await Product.create({
          name: t.name,
          price: t.basePrice,
          category: catName,
          stock: Math.floor(Math.random() * 80) + 2, // Stock between 2 and 81
          sku: `SKU-${skuCounter}`,
          description: `Premium ${t.name} from ${catName} section. Features high-quality materials and warranty.`,
          image: `https://images.unsplash.com/photo-${1500000000000 + skuCounter}?w=500&auto=format&fit=crop&q=60` // Mock image URLs
        });
        products.push(p);
      }
    }
    console.log(`${products.length} Products created.`);

    console.log('Creating 100 Customers...');
    const customers = [];
    for (let i = 0; i < 100; i++) {
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const name = `${firstName} ${lastName}`;
      const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@domain.com`;
      const phone = `+91 ${9000000000 + Math.floor(Math.random() * 999999999)}`;
      const city = indianCities[Math.floor(Math.random() * indianCities.length)];
      
      const c = await Customer.create({
        name,
        email,
        phone,
        city
      });
      customers.push(c);
    }
    console.log(`${customers.length} Customers created.`);

    console.log('Creating 500 Orders programmatically over last 6 months...');
    const orderStatuses = ['Delivered', 'Delivered', 'Delivered', 'Shipped', 'Packed', 'Pending'];
    const paymentStatuses = ['Paid', 'Paid', 'Paid', 'Paid', 'Pending'];

    const ordersToInsert = [];
    const customerAggMap = {}; // Keep track of total spent/orders for customer save

    const dateToday = new Date();
    
    for (let i = 1; i <= 500; i++) {
      // Pick random customer
      const customer = customers[Math.floor(Math.random() * customers.length)];
      
      // Pick 1 to 3 products
      const orderProducts = [];
      const numProducts = Math.floor(Math.random() * 3) + 1;
      let totalAmount = 0;
      
      // Avoid adding duplicate products in the same order
      const addedProductIds = new Set();
      
      for (let j = 0; j < numProducts; j++) {
        const product = products[Math.floor(Math.random() * products.length)];
        if (addedProductIds.has(product._id.toString())) continue;
        addedProductIds.add(product._id.toString());
        
        const quantity = Math.floor(Math.random() * 2) + 1; // 1 or 2 items
        const price = product.price;
        
        orderProducts.push({
          product: product._id,
          name: product.name,
          quantity,
          price
        });
        
        totalAmount += price * quantity;
      }
      
      // Statuses
      const status = orderStatuses[Math.floor(Math.random() * orderStatuses.length)];
      const paymentStatus = status === 'Delivered' || status === 'Shipped' || status === 'Packed'
        ? 'Paid' 
        : paymentStatuses[Math.floor(Math.random() * paymentStatuses.length)];
      
      // Random date in the last 180 days
      const daysAgo = Math.floor(Math.random() * 180);
      const orderDate = new Date();
      orderDate.setDate(dateToday.getDate() - daysAgo);
      orderDate.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60));

      const ordNum = `ORD-${1000 + i}`;
      
      ordersToInsert.push({
        orderNumber: ordNum,
        customer: customer._id,
        customerName: customer.name,
        customerEmail: customer.email,
        products: orderProducts,
        totalAmount,
        status,
        paymentStatus,
        createdAt: orderDate,
        updatedAt: orderDate
      });

      // Track customer aggregates
      if (!customerAggMap[customer._id]) {
        customerAggMap[customer._id] = { totalOrders: 0, totalSpent: 0 };
      }
      if (paymentStatus === 'Paid') {
        customerAggMap[customer._id].totalOrders += 1;
        customerAggMap[customer._id].totalSpent += totalAmount;
      }
    }

    // Insert orders
    await Order.insertMany(ordersToInsert);
    console.log(`500 Orders inserted.`);

    console.log('Updating customer aggregate spending stats in database...');
    for (const customerId of Object.keys(customerAggMap)) {
      const stats = customerAggMap[customerId];
      await Customer.findByIdAndUpdate(customerId, {
        totalOrders: stats.totalOrders,
        totalSpent: stats.totalSpent
      });
    }
    console.log('Customer aggregates updated.');

    console.log('Creating initial Audit Logs to seed developer view...');
    const auditEvents = [
      { user: 'admin@dashboard.com', role: 'Admin', action: 'Database Seeded', method: 'SEED', url: 'scripts/seed.js', statusCode: 200, details: 'Database successfully populated with 50 products and 500 orders.', mongoQuery: 'db.dropDatabase(); db.users.insertMany(...);' },
      { user: 'admin@dashboard.com', role: 'Admin', action: 'Admin Login', method: 'POST', url: '/api/auth/login', statusCode: 200, details: 'Admin logged in from IP 192.168.1.10' },
      { user: 'developer@dashboard.com', role: 'Developer', action: 'Developer Login', method: 'POST', url: '/api/auth/login', statusCode: 200, details: 'Developer logged in, session expires in 1h' },
      { user: 'manager@dashboard.com', role: 'Manager', action: 'Manager Login', method: 'POST', url: '/api/auth/login', statusCode: 200, details: 'Manager logged in, session token issued' },
      { user: 'developer@dashboard.com', role: 'Developer', action: 'Product Created', method: 'POST', url: '/api/products', statusCode: 201, details: 'Created Product: Apple Watch Series 9', mongoQuery: 'db.products.insertOne({ name: "Apple Watch Series 9" })' }
    ];
    await AuditLog.insertMany(auditEvents);
    console.log('Audit Logs seeded.');

    console.log('🟢 Seeding completed successfully!');
    mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
    process.exit(1);
  }
};

seedDB();
