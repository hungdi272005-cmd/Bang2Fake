const mongoose = require('mongoose');
require('dotenv').config();

const fixIndexes = async () => {
  try {
    console.log('🔄 Đang kết nối tới MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tankbangbang');
    console.log('✅ Đã kết nối MongoDB.');

    const db = mongoose.connection.db;
    const collection = db.collection('users');

    console.log('🔄 Đang kiểm tra các index hiện tại...');
    const indexes = await collection.indexes();
    console.log('Hiện có các index:', indexes.map(idx => idx.name));

    // Xóa index phone_1 nếu tồn tại (đây là index gây lỗi)
    if (indexes.find(idx => idx.name === 'phone_1')) {
      console.log('🗑️ Đang xóa index phone_1 cũ...');
      await collection.dropIndex('phone_1');
      console.log('✅ Đã xóa index phone_1.');
    }

    // Xóa index googleId_1 nếu tồn tại để reset
    if (indexes.find(idx => idx.name === 'googleId_1')) {
      console.log('🗑️ Đang xóa index googleId_1 cũ...');
      await collection.dropIndex('googleId_1');
      console.log('✅ Đã xóa index googleId_1.');
    }

    console.log('✨ Đang tạo lại các index mới với Partial Filter Expression...');
    // Index phone: chỉ duy nhất nếu là String (bỏ qua null/undefined)
    await collection.createIndex(
      { phone: 1 }, 
      { 
        unique: true, 
        partialFilterExpression: { phone: { $type: "string" } } 
      }
    );

    // Index googleId: chỉ duy nhất nếu là String
    await collection.createIndex(
      { googleId: 1 }, 
      { 
        unique: true, 
        partialFilterExpression: { googleId: { $type: "string" } } 
      }
    );

    console.log('✅ TẤT CẢ ĐÃ XONG! Bây giờ lình vực phone=null sẽ bị bỏ qua trong Unique check.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi:', error);
    process.exit(1);
  }
};

fixIndexes();
