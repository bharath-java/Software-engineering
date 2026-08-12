const Order = require('../models/Order');
const Product = require('../models/Product');
const Customer = require('../models/Customer');
const mock = require('../utils/mockData');
const mongoose = require('mongoose');

class DashboardService {
  async getMetrics() {
    if (mongoose.connection.readyState !== 1) {
      console.warn('⚠️ MongoDB disconnected. Compiling offline metrics...');
      
      const totalRevenue = mock.orders
        .filter(o => o.paymentStatus === 'Paid')
        .reduce((sum, o) => sum + o.totalAmount, 0);

      const totalOrders = mock.orders.length;
      const totalCustomers = mock.customers.length;
      const totalProducts = mock.products.length;
      const pendingOrders = mock.orders.filter(o => o.status === 'Pending').length;
      const completedOrders = mock.orders.filter(o => o.status === 'Delivered').length;
      const lowStockProducts = mock.products.filter(p => p.stock < 10).length;

      const averageOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;
      
      const repeatCustomers = mock.customers.filter(c => c.totalOrders > 1).length;
      const repeatCustomerRate = totalCustomers > 0 ? Math.round((repeatCustomers / totalCustomers) * 100) : 0;

      return {
        metrics: {
          totalRevenue,
          totalOrders,
          totalCustomers,
          totalProducts,
          pendingOrders,
          completedOrders,
          growth: 18, // Mocked 18% growth index
          averageOrderValue,
          repeatCustomerRate,
          lowStockProducts
        },
        queryTrace: 'db.orders.aggregate(...) (Offline Mock Cache)'
      };
    }

    const startOfCurrentMonth = new Date();
    startOfCurrentMonth.setDate(1);
    startOfCurrentMonth.setHours(0, 0, 0, 0);

    const startOfPrevMonth = new Date(startOfCurrentMonth);
    startOfPrevMonth.setMonth(startOfPrevMonth.getMonth() - 1);

    const revenueResult = await Order.aggregate([
      { $match: { paymentStatus: 'Paid' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const totalRevenue = revenueResult[0]?.total || 0;

    const currentMonthRevenue = await Order.aggregate([
      { $match: { paymentStatus: 'Paid', createdAt: { $gte: startOfCurrentMonth } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const prevMonthRevenue = await Order.aggregate([
      { $match: { paymentStatus: 'Paid', createdAt: { $gte: startOfPrevMonth, $lt: startOfCurrentMonth } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const curRev = currentMonthRevenue[0]?.total || 0;
    const prevRev = prevMonthRevenue[0]?.total || 0;
    let growth = 0;
    if (prevRev > 0) {
      growth = Math.round(((curRev - prevRev) / prevRev) * 100);
    } else if (curRev > 0) {
      growth = 100;
    }

    const totalOrders = await Order.countDocuments();
    const totalCustomers = await Customer.countDocuments();
    const totalProducts = await Product.countDocuments();
    const pendingOrders = await Order.countDocuments({ status: 'Pending' });
    const completedOrders = await Order.countDocuments({ status: 'Delivered' });
    const lowStockProducts = await Product.countDocuments({ status: 'Low Stock' });
    const outOfStockProducts = await Product.countDocuments({ status: 'Out of Stock' });
    const totalLowStock = lowStockProducts + outOfStockProducts;

    const totalWithMultipleOrders = await Customer.countDocuments({ totalOrders: { $gt: 1 } });
    const repeatCustomerRate = totalCustomers > 0 
      ? Math.round((totalWithMultipleOrders / totalCustomers) * 100) 
      : 0;

    const averageOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

    const queryTrace = `
// 1. Calculate Total Revenue
db.orders.aggregate([{ $match: { paymentStatus: 'Paid' } }, { $group: { _id: null, total: { $sum: '$totalAmount' } } }]);

// 2. Count metrics
db.orders.countDocuments();
db.customers.countDocuments();
db.products.countDocuments();
db.orders.countDocuments({ status: 'Pending' });
    `.trim();

    return {
      metrics: {
        totalRevenue,
        totalOrders,
        totalCustomers,
        totalProducts,
        pendingOrders,
        completedOrders,
        growth,
        averageOrderValue,
        repeatCustomerRate,
        lowStockProducts: totalLowStock
      },
      queryTrace
    };
  }

  async getCharts() {
    if (mongoose.connection.readyState !== 1) {
      console.warn('⚠️ MongoDB disconnected. Compiling offline charts stats...');
      
      // Compiling sales trend
      const salesTrend = [
        { label: 'May 26', revenue: 75000, orders: 4 },
        { label: 'Jun 26', revenue: 128000, orders: 7 },
        { label: 'Jul 26', revenue: 189000, orders: 11 }
      ];

      // Compiling category distributions
      const categoryDistribution = [
        { name: 'Electronics', value: 3, revenue: 294790 },
        { name: 'Fashion', value: 1, text: 'Fashion', revenue: 8999 },
        { name: 'Home & Kitchen', value: 1, revenue: 9999 }
      ];

      // Top selling products
      const topProducts = [
        { name: 'iPhone 15 Pro Max', salesCount: 1, revenue: 149900 },
        { name: 'MacBook Air M3', salesCount: 1, revenue: 114900 },
        { name: 'Sony WH-1000XM5 Headphones', salesCount: 1, revenue: 29990 }
      ];

      // Revenue comparison
      const revenueComparison = [
        { month: 'May 26', actual: 75000, target: 80000 },
        { month: 'Jun 26', actual: 128000, target: 120000 },
        { month: 'Jul 26', actual: 189000, target: 175000 }
      ];

      return {
        charts: {
          salesTrend,
          categoryDistribution,
          topProducts,
          revenueComparison
        },
        queryTrace: 'db.orders.aggregate(...) (Offline Mock Cache)'
      };
    }

    const salesTrend = await Order.aggregate([
      { $match: { paymentStatus: 'Paid' } },
      { $group: {
        _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
        revenue: { $sum: "$totalAmount" },
        orders: { $sum: 1 }
      }},
      { $sort: { _id: 1 } },
      { $limit: 6 }
    ]);

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const formattedTrend = salesTrend.map(item => {
      const [year, month] = item._id.split('-');
      const label = `${monthNames[parseInt(month, 10) - 1]} ${year.substring(2)}`;
      return {
        label,
        revenue: Math.round(item.revenue),
        orders: item.orders
      };
    });

    const categoryDistribution = await Order.aggregate([
      { $unwind: "$products" },
      { $lookup: {
        from: "products",
        localField: "products.product",
        foreignField: "_id",
        as: "productInfo"
      }},
      { $unwind: "$productInfo" },
      { $group: {
        _id: "$productInfo.category",
        value: { $sum: "$products.quantity" },
        revenue: { $sum: { $multiply: ["$products.price", "$products.quantity"] } }
      }},
      { $project: {
        name: "$_id",
        value: 1,
        revenue: 1,
        _id: 0
      }},
      { $sort: { value: -1 } }
    ]);

    const topProducts = await Order.aggregate([
      { $unwind: "$products" },
      { $group: {
        _id: "$products.product",
        name: { $first: "$products.name" },
        salesCount: { $sum: "$products.quantity" },
        revenue: { $sum: { $multiply: ["$products.price", "$products.quantity"] } }
      }},
      { $sort: { salesCount: -1 } },
      { $limit: 5 }
    ]);

    const revenueComparison = formattedTrend.map(item => ({
      month: item.label,
      actual: item.revenue,
      target: Math.round(item.revenue * 0.9 + Math.random() * item.revenue * 0.2)
    }));

    const queryTrace = `
// 1. Sales Trend
db.orders.aggregate([
  { $match: { paymentStatus: 'Paid' } },
  { $group: { _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } }, revenue: { $sum: "$totalAmount" } } }
]);

// 2. Lookup join for category split
db.orders.aggregate([
  { $unwind: "$products" },
  { $lookup: { from: "products", localField: "products.product", foreignField: "_id", as: "productInfo" } },
  { $unwind: "$productInfo" },
  { $group: { _id: "$productInfo.category", value: { $sum: "$products.quantity" } } }
]);
    `.trim();

    return {
      charts: {
        salesTrend: formattedTrend,
        categoryDistribution,
        topProducts,
        revenueComparison
      },
      queryTrace
    };
  }
}

module.exports = new DashboardService();
