const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const MONGODB_URI = 'mongodb+srv://duongevil123_db_user:TnIrhdn1BSKoBD44@vn-jp-connect.eraedra.mongodb.net/GnoudCRM?appName=VN-JP-CONNECT';
const DEFAULT_PASSWORD = 'GnoudCRM@2026';

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['ADMIN', 'DISPATCHER', 'TECHNICIAN'], required: true },
  status: { type: String, enum: ['ACTIVE', 'DISABLED'], default: 'ACTIVE' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { collection: 'users' });

const User = mongoose.model('User', userSchema);

async function seed() {
  console.log('Đang kết nối tới MongoDB Atlas...');
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Kết nối database thành công!');

    const usersToCreate = [
      {
        fullName: 'Nguyễn Văn A',
        email: 'admin@gnoudcrm.vn',
        role: 'ADMIN',
      },
      {
        fullName: 'Trần Thị B',
        email: 'dispatcher@gnoudcrm.vn',
        role: 'DISPATCHER',
      },
      {
        fullName: 'Phạm Văn C',
        email: 'tech@gnoudcrm.vn',
        role: 'TECHNICIAN',
      }
    ];

    for (const u of usersToCreate) {
      console.log(`Đang xử lý tài khoản: ${u.email}...`);
      
      // Xóa tài khoản cũ nếu tồn tại để tránh xung đột unique email
      await User.deleteOne({ email: u.email });
      
      // Mã hóa mật khẩu chuẩn bcrypt 12 rounds tương đương backend
      const hash = await bcrypt.hash(DEFAULT_PASSWORD, 12);
      
      await User.create({
        fullName: u.fullName,
        email: u.email,
        passwordHash: hash,
        role: u.role,
        status: 'ACTIVE'
      });
      
      console.log(`Khởi tạo thành công tài khoản: ${u.email}`);
    }

    console.log('\nChúc mừng! Đã khởi tạo thành công 3 tài khoản thực tế vào database.');
    console.log('------------------------------------------------------------');
    console.log(`1. Admin: admin@gnoudcrm.vn | Mật khẩu: ${DEFAULT_PASSWORD}`);
    console.log(`2. Dispatcher: dispatcher@gnoudcrm.vn | Mật khẩu: ${DEFAULT_PASSWORD}`);
    console.log(`3. Tech: tech@gnoudcrm.vn | Mật khẩu: ${DEFAULT_PASSWORD}`);
    console.log('------------------------------------------------------------');

  } catch (error) {
    console.error('Lỗi khi thực hiện seed dữ liệu:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Đã ngắt kết nối database.');
  }
}

seed();
