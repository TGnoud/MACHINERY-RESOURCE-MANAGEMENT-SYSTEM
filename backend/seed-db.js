/* eslint-disable no-console */
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');

try {
  process.loadEnvFile?.();
} catch {
  // Environment variables can also be provided by the shell or Render.
}

const mongoUri = process.env.MONGODB_URI;

if (!mongoUri) {
  console.error('Missing MONGODB_URI. Set it before running seed-db.js.');
  process.exit(1);
}

const { Schema, model, Types } = mongoose;

const userSchema = new Schema(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ['ADMIN', 'TECHNICIAN', 'DISPATCHER'],
      required: true,
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'DISABLED'],
      default: 'ACTIVE',
    },
    lastLoginAt: Date,
  },
  { timestamps: true },
);

const categorySchema = new Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    description: String,
  },
  { timestamps: true },
);

const machinerySchema = new Schema(
  {
    name: { type: String, required: true },
    serialNumber: { type: String, required: true, unique: true, index: true },
    manufacturer: String,
    operatingHours: { type: Number, default: 0 },
    fuelConsumption: { type: Number, default: 0 },
    purchaseYear: Number,
    status: {
      type: String,
      enum: ['AVAILABLE', 'RENTED', 'MAINTENANCE'],
      default: 'AVAILABLE',
    },
    category: { type: Schema.Types.ObjectId, ref: 'Category' },
    specs: { type: Schema.Types.Mixed, default: {} },
    location: String,
  },
  { timestamps: true },
);

const sparePartSchema = new Schema(
  {
    name: { type: String, required: true },
    quantity: { type: Number, default: 1 },
    cost: { type: Number, default: 0 },
  },
  { _id: false },
);

const maintenanceLogSchema = new Schema(
  {
    machinery: { type: Schema.Types.ObjectId, ref: 'Machinery', required: true },
    technician: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    cost: { type: Number, default: 0 },
    type: {
      type: String,
      enum: ['ROUTINE', 'EMERGENCY', 'INSPECTION', 'REPLACEMENT'],
      default: 'ROUTINE',
    },
    priority: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      default: 'MEDIUM',
    },
    status: {
      type: String,
      enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED'],
      default: 'PENDING',
    },
    description: { type: String, required: true },
    completedAt: Date,
    spareParts: { type: [sparePartSchema], default: [] },
  },
  { timestamps: true },
);

const assignmentSchema = new Schema(
  {
    machinery: { type: Schema.Types.ObjectId, ref: 'Machinery', required: true },
    dispatcher: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    destination: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: Date,
    status: {
      type: String,
      enum: ['PENDING', 'IN_TRANSIT', 'ACTIVE', 'COMPLETED'],
      default: 'PENDING',
    },
  },
  { timestamps: true },
);

const User = model('User', userSchema);
const Category = model('Category', categorySchema);
const Machinery = model('Machinery', machinerySchema);
const MaintenanceLog = model('MaintenanceLog', maintenanceLogSchema);
const Assignment = model('Assignment', assignmentSchema);

const categorySeeds = [
  ['Máy xúc', 'Nhóm thiết bị đào, xúc, san lấp mặt bằng.'],
  ['Cần cẩu', 'Thiết bị nâng hạ phục vụ công trường cao tầng.'],
  ['Xe nâng', 'Thiết bị nâng chuyển pallet và vật tư kho bãi.'],
  ['Xe tải ben', 'Phương tiện vận chuyển vật liệu nặng.'],
  ['Máy phát điện', 'Thiết bị cung cấp nguồn điện dự phòng.'],
];

const primaryUsers = [
  ['Nguyễn Văn Admin', 'admin@gnoudcrm.vn', 'ADMIN'],
  ['Trần Thị Điều Phối', 'dispatcher@gnoudcrm.vn', 'DISPATCHER'],
  ['Lê Văn Kỹ Thuật', 'tech@gnoudcrm.vn', 'TECHNICIAN'],
  ['Phạm Văn Cường', 'cuong.pham@gnoudcrm.vn', 'TECHNICIAN'],
  ['Hoàng Minh Tuấn', 'tuan.hoang@gnoudcrm.vn', 'TECHNICIAN'],
  ['Nguyễn Thị Lan', 'lan.nguyen@gnoudcrm.vn', 'DISPATCHER'],
  ['Vũ Đức Hải', 'hai.vu@gnoudcrm.vn', 'DISPATCHER'],
  ['Đỗ Nhật Nam', 'nam.do@gnoudcrm.vn', 'TECHNICIAN'],
];

const machineryNames = [
  ['Komatsu PC200-8', 'Komatsu', 'Máy xúc'],
  ['Komatsu PC350LC-8', 'Komatsu', 'Máy xúc'],
  ['Caterpillar 320D2', 'Caterpillar', 'Máy xúc'],
  ['Hitachi ZX200-5G', 'Hitachi', 'Máy xúc'],
  ['Volvo EC210D', 'Volvo', 'Máy xúc'],
  ['Liebherr 112 EC-H', 'Liebherr', 'Cần cẩu'],
  ['Liebherr LTM 1050', 'Liebherr', 'Cần cẩu'],
  ['Kobelco 7055', 'Kobelco', 'Cần cẩu'],
  ['Zoomlion QY50V', 'Zoomlion', 'Cần cẩu'],
  ['Tadano GR-700EX', 'Tadano', 'Cần cẩu'],
  ['Komatsu FD30T-17', 'Komatsu', 'Xe nâng'],
  ['Toyota 8FD25', 'Toyota', 'Xe nâng'],
  ['Mitsubishi FD35N', 'Mitsubishi', 'Xe nâng'],
  ['TCM FD25T3', 'TCM', 'Xe nâng'],
  ['Heli CPCD30', 'Heli', 'Xe nâng'],
  ['Hino 500 Ben 15T', 'Hino', 'Xe tải ben'],
  ['Isuzu QKR Ben 5T', 'Isuzu', 'Xe tải ben'],
  ['Hyundai HD270', 'Hyundai', 'Xe tải ben'],
  ['Thaco Forland FD950', 'Thaco', 'Xe tải ben'],
  ['Fuso Fighter FJ', 'Fuso', 'Xe tải ben'],
  ['Cummins C275D5', 'Cummins', 'Máy phát điện'],
  ['Cummins C500D5', 'Cummins', 'Máy phát điện'],
  ['Denyo DCA-150ESK', 'Denyo', 'Máy phát điện'],
  ['Mitsubishi MGS1500B', 'Mitsubishi', 'Máy phát điện'],
  ['Perkins 1106A-70TG1', 'Perkins', 'Máy phát điện'],
  ['Komatsu WA320-6', 'Komatsu', 'Máy xúc'],
  ['Volvo L120F', 'Volvo', 'Máy xúc'],
  ['Sany SCC800C', 'Sany', 'Cần cẩu'],
  ['Toyota 8FG30', 'Toyota', 'Xe nâng'],
  ['Hino 700 Ben 20T', 'Hino', 'Xe tải ben'],
];

const locations = [
  'Kho trung chuyển Cát Lái',
  'Công trường VSIP Bình Dương',
  'Dự án hầm Thủ Thiêm',
  'Mỏ đá Kiên Giang',
  'Khu công nghiệp Long Hậu',
  'Kho bảo trì Quận 9',
  'Cảng ICD Sóng Thần',
  'Công trình Metro Bến Thành',
];

const destinations = [
  'Dự án VSIP mở rộng, Bình Dương',
  'Kho trung chuyển Cát Lái, TP.HCM',
  'Công trường hầm Thủ Thiêm',
  'Mỏ đá Kiên Giang',
  'Khu công nghiệp Long Hậu',
  'Cảng ICD Sóng Thần',
  'Dự án Metro Bến Thành - Suối Tiên',
  'Nhà máy cơ khí Đồng Nai',
];

function addMonths(date, amount) {
  const result = new Date(date);
  result.setMonth(result.getMonth() + amount);
  return result;
}

function pick(items, index) {
  return items[index % items.length];
}

function objectId() {
  return new Types.ObjectId();
}

async function seed() {
  await mongoose.connect(mongoUri);
  console.log(`Connected to ${mongoose.connection.name}`);

  await Promise.all([
    Assignment.deleteMany({}),
    MaintenanceLog.deleteMany({}),
    Machinery.deleteMany({}),
    Category.deleteMany({}),
    User.deleteMany({}),
  ]);
  console.log('Cleared old seed data.');

  const categories = await Category.insertMany(
    categorySeeds.map(([name, description]) => ({ name, description })),
  );
  const categoryByName = new Map(
    categories.map((category) => [category.name, category]),
  );

  const passwordHash = await bcrypt.hash('Gnoud@123456', 12);
  const users = await User.insertMany(
    primaryUsers.map(([fullName, email, role]) => ({
      fullName,
      email,
      role,
      status: 'ACTIVE',
      passwordHash,
    })),
  );
  const technicians = users.filter((user) => user.role === 'TECHNICIAN');
  const dispatchers = users.filter((user) => user.role === 'DISPATCHER');

  const machineries = await Machinery.insertMany(
    machineryNames.map(([name, manufacturer, categoryName], index) => {
      const status = pick(
        ['AVAILABLE', 'AVAILABLE', 'AVAILABLE', 'RENTED', 'MAINTENANCE'],
        index,
      );

      return {
        name,
        serialNumber: `GCRM-${String(index + 1).padStart(4, '0')}`,
        manufacturer,
        operatingHours: 720 + index * 137,
        fuelConsumption: Number((9 + (index % 7) * 1.8).toFixed(1)),
        purchaseYear: 2017 + (index % 7),
        status,
        category: categoryByName.get(categoryName)?._id,
        location: pick(locations, index),
        specs: {
          công_suất: `${90 + index * 5} kW`,
          tải_trọng: `${5 + (index % 12)} tấn`,
          động_cơ: `${manufacturer} Series ${100 + index}`,
        },
      };
    }),
  );

  const now = new Date();
  const assignments = Array.from({ length: 20 }, (_, index) => {
    const startDate = addMonths(now, -Math.floor(index / 4));
    startDate.setDate(3 + (index % 24));

    return {
      machinery: machineries[index % machineries.length]._id,
      dispatcher: dispatchers[index % dispatchers.length]._id,
      destination: pick(destinations, index),
      startDate,
      endDate: addMonths(startDate, index % 5 === 0 ? 2 : 1),
      status: pick(['PENDING', 'IN_TRANSIT', 'ACTIVE', 'COMPLETED'], index),
      _id: objectId(),
      createdAt: startDate,
      updatedAt: startDate,
    };
  });

  const maintenanceLogs = Array.from({ length: 20 }, (_, index) => {
    const createdAt = addMonths(now, -Math.floor(index / 4));
    createdAt.setDate(5 + (index % 20));
    const status = pick(['COMPLETED', 'COMPLETED', 'IN_PROGRESS', 'PENDING'], index);
    const priority = pick(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], index);
    const baseCost = 2500000 + index * 780000;

    return {
      machinery: machineries[(index * 2) % machineries.length]._id,
      technician: technicians[index % technicians.length]._id,
      cost: baseCost,
      type: pick(['ROUTINE', 'EMERGENCY', 'INSPECTION', 'REPLACEMENT'], index),
      priority,
      status,
      description: pick(
        [
          'Kiểm tra hệ thống thủy lực và thay dầu định kỳ.',
          'Xử lý cảnh báo hao mòn bạc đạn trục chính.',
          'Thay lọc nhiên liệu, vệ sinh két nước và kiểm tra cảm biến.',
          'Khắc phục tiếng ồn bất thường khi vận hành tải cao.',
          'Thay dây curoa, siết lại bu lông khung gầm và cân chỉnh phanh.',
        ],
        index,
      ),
      completedAt: status === 'COMPLETED' ? createdAt : undefined,
      spareParts: [
        {
          name: pick(
            ['Lọc dầu thủy lực', 'Bạc đạn trục', 'Dây curoa', 'Cảm biến nhiệt', 'Má phanh'],
            index,
          ),
          quantity: 1 + (index % 3),
          cost: Math.round(baseCost * 0.35),
        },
      ],
      _id: objectId(),
      createdAt,
      updatedAt: createdAt,
    };
  });

  await Assignment.insertMany(assignments);
  await MaintenanceLog.insertMany(maintenanceLogs);

  console.log('Seed completed:');
  console.table({
    categories: categories.length,
    users: users.length,
    machineries: machineries.length,
    assignments: assignments.length,
    maintenanceLogs: maintenanceLogs.length,
  });
  console.log('Login accounts:');
  console.table([
    { email: 'admin@gnoudcrm.vn', password: 'Gnoud@123456' },
    { email: 'dispatcher@gnoudcrm.vn', password: 'Gnoud@123456' },
    { email: 'tech@gnoudcrm.vn', password: 'Gnoud@123456' },
  ]);
}

seed()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
