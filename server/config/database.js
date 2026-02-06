const mongoose = require('mongoose');

/**
 * Kết nối tới MongoDB database
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tankbangbang', {
      // Mongoose 6+ không cần các options này nữa
    });
    
    console.log(`✅ MongoDB đã kết nối: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Lỗi kết nối MongoDB: ${error.message}`);
    // Thoát process nếu không kết nối được database
    process.exit(1);
  }
};

module.exports = connectDB;
