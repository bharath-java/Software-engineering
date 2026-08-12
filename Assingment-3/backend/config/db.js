const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const connStr = process.env.MONGODB_URI;
    if (!connStr) {
      console.warn('⚠️ Warning: MONGODB_URI is not set in environment variables.');
      console.warn('The application is running in database-less mode. DB operations will fail.');
      return null;
    }
    
    const conn = await mongoose.connect(connStr, { serverSelectionTimeoutMS: 2000 });
    console.log(`🟢 MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.warn(`⚠️ MongoDB Connection Error: ${error.message}`);
    console.warn('The application will run, but database queries will return errors.');
    return null;
  }
};

module.exports = connectDB;
