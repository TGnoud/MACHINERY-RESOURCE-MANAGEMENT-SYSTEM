/* eslint-disable no-console */
const bcrypt = require('bcrypt');
let modelImages = {};
try {
  modelImages = require('./model_images.json');
  console.log('Loaded model-specific images dictionary.');
} catch (e) {
  console.log('No model_images.json found, using category fallbacks.');
}
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
    imageUrl: String,
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
      enum: ['PENDING', 'ACTIVE', 'COMPLETED'],
      default: 'PENDING',
    },
    notes: String,
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
  ['Máy trộn bê tông', 'Thiết bị trộn bê tông tươi tại công trường.'],
  ['Máy ép cọc', 'Thiết bị ép/đóng cọc bê tông phục vụ nền móng.'],
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
  ['Nguyễn Hoàng Long', 'long.nguyen@gnoudcrm.vn', 'DISPATCHER'],
  ['Phạm Minh Thư', 'thu.pham@gnoudcrm.vn', 'DISPATCHER'],
  ['Lê Quang Đạo', 'dao.le@gnoudcrm.vn', 'DISPATCHER'],
  ['Trần Bảo Vy', 'vy.tran@gnoudcrm.vn', 'DISPATCHER'],
  ['Nguyễn Thanh Sơn', 'son.nguyen@gnoudcrm.vn', 'DISPATCHER'],
];

const CATEGORY_DISTRIBUTION = [55, 45, 35, 35, 30, 25, 25];

const LOCATIONS = [
  'Kho trung tâm',
  'Dự án VSIP',
  'Kho Cát Lái',
  'Công trường Thủ Thiêm',
  'Kho dự phòng',
  'Dự án Metro',
  'Kho Bình Dương',
  'Công trường PMH',
  'Dự án Ecopark',
  'Kho Long An',
  'Công trường Vành đai 3',
  'Dự án Đại Quang Minh',
  'Kho Đồng Nai',
  'Công trường Cầu Thủ Thiêm 2',
  'Kho Tân Cảng',
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
  'Dự án sân bay Long Thành, Đồng Nai',
  'Cảng trung chuyển quốc tế Cần Giờ, TP.HCM',
  'Tuyến cao tốc Biên Hòa - Vũng Tàu',
  'Khu đô thị Vinhomes Grand Park, Quận 9',
  'Công trường cầu Nhơn Trạch, Đồng Nai',
  'Khu công nghệ cao TP.HCM, Quận 9',
  'Công trường cầu Thủ Thiêm 4',
  'Dự án đường Vành Đai 3, Bình Dương',
  'Công trình cầu Cần Giờ, TP.HCM',
  'Khu công nghiệp VSIP II, Bình Dương',
  'Tòa nhà Landmark 81, Bình Thạnh',
  'Nhà ga T3 Sân bay Tân Sơn Nhất',
];

const NOTES_POOL = [
  'Thiết bị cần được bàn giao đúng giờ hẹn. Liên hệ giám sát công trường trước khi đến.',
  'Kiểm tra lại mức dầu và hệ thống phanh trước khi xuất phát.',
  'Hồ sơ máy móc đi kèm đầy đủ bao gồm giấy đăng kiểm và bảo hiểm.',
  'Yêu cầu lái máy vận hành cẩn thận, tuân thủ nội quy an toàn lao động tại công trường.',
  'Thiết bị dự phòng cho ca làm việc ban đêm. Cần bố trí đèn chiếu sáng đầy đủ.',
  'Đã kiểm tra kỹ thuật đạt tiêu chuẩn vận hành. Bàn giao biên bản đầy đủ.',
  'Cần lưu ý thời tiết mưa bão. Che chắn cẩn thận các chi tiết máy nhạy cảm.',
  'Thiết bị vừa được bảo dưỡng định kỳ. Vận hành nhẹ nhàng trong 10 giờ đầu.',
];

const INSTRUCTIONS_POOL = [
  '1. Di chuyển thiết bị bằng xe fooc chuyên dụng.\n2. Bàn giao chìa khóa và biên bản cho kỹ sư trưởng.\n3. Hướng dẫn vận hành cơ bản cho đội ngũ tại công trường.',
  '1. Liên hệ ông Nguyễn Văn B (090xxxxxxx) để nhận vị trí đỗ.\n2. Thực hiện đo đạc và ký nhận bàn giao thiết bị.\n3. Chụp ảnh lưu trữ trạng thái máy lúc bàn giao.',
  '1. Kéo thiết bị về vị trí tập kết an toàn.\n2. Kiểm tra nhiên liệu trước khi bàn giao.\n3. Ký xác nhận phụ tùng đi kèm máy.',
  '1. Vận chuyển máy đến phân khu A công trường.\n2. Bàn giao sổ nhật ký vận hành cho đội trưởng.\n3. Kiểm tra các biển báo an toàn trên thân máy.',
  '1. Bàn giao máy tại cổng số 2 của nhà máy.\n2. Cùng giám sát bên thuê nghiệm thu chức năng gàu xúc/nâng.\n3. Hoàn tất ký tá biên bản giao nhận 3 bên.',
];

const MODELS = {
  'Máy xúc': [
    ['Máy xúc Komatsu PC200-8', 'Komatsu'],
    ['Máy xúc Komatsu PC300-8', 'Komatsu'],
    ['Máy xúc Komatsu PC138US-10', 'Komatsu'],
    ['Máy xúc Komatsu PC350LC-8', 'Komatsu'],
    ['Máy xúc Komatsu PC210-10', 'Komatsu'],
    ['Máy xúc Komatsu WA320-6', 'Komatsu'],
    ['Máy xúc Caterpillar CAT 320', 'Caterpillar'],
    ['Máy xúc Caterpillar CAT 330', 'Caterpillar'],
    ['Máy xúc Caterpillar CAT 312', 'Caterpillar'],
    ['Máy xúc Caterpillar CAT 336', 'Caterpillar'],
    ['Máy xúc Caterpillar CAT 349', 'Caterpillar'],
    ['Volvo EC210B', 'Volvo'],
    ['Volvo EC250D', 'Volvo'],
    ['Volvo EC350D', 'Volvo'],
    ['Volvo L120F', 'Volvo'],
    ['Hyundai R220LC-9S', 'Hyundai'],
    ['Hyundai R330LC-9S', 'Hyundai'],
    ['Hyundai R140W-9S', 'Hyundai'],
    ['Doosan DX225LC-5', 'Doosan'],
    ['Doosan DX340LC-5', 'Doosan'],
    ['Doosan DX190W-5', 'Doosan'],
    ['Hitachi ZX200-5G', 'Hitachi'],
    ['Hitachi ZX350LC-5G', 'Hitachi'],
    ['Hitachi ZX130-5A', 'Hitachi'],
    ['Kobelco SK200-10', 'Kobelco'],
    ['Kobelco SK350LC-10', 'Kobelco'],
    ['JCB JS205LC', 'JCB'],
    ['JCB JS220', 'JCB'],
    ['XCMG XE215C', 'XCMG'],
    ['XCMG XE370CA', 'XCMG'],
    ['Sany SY215C', 'Sany'],
    ['Sany SY365H', 'Sany'],
  ],
  'Cần cẩu': [
    ['Cẩu tháp Liebherr 280 EC-H', 'Liebherr'],
    ['Cẩu tháp Liebherr 172 EC-B', 'Liebherr'],
    ['Cẩu tháp Liebherr 370 EC-B', 'Liebherr'],
    ['Cẩu tháp Liebherr LTM 1050', 'Liebherr'],
    ['Cẩu tháp Liebherr LTM 1100', 'Liebherr'],
    ['Cẩu bánh xích Kobelco CKE900G', 'Kobelco'],
    ['Cẩu bánh xích Kobelco CKE1350G', 'Kobelco'],
    ['Cẩu bánh xích Kobelco 7400', 'Kobelco'],
    ['Cẩu xích Hitachi SCX2800-2', 'Hitachi'],
    ['Cẩu xích Hitachi SCX1500A-3', 'Hitachi'],
    ['Cẩu tự hành Tadano GR-700EX', 'Tadano'],
    ['Cẩu tự hành Tadano GR-500EX', 'Tadano'],
    ['Cẩu tự hành Tadano ATF 100G-4', 'Tadano'],
    ['Cẩu bánh lốp Zoomlion QY50V', 'Zoomlion'],
    ['Cẩu bánh lốp Zoomlion QY70V', 'Zoomlion'],
    ['Cẩu bánh lốp Zoomlion ZTC250V', 'Zoomlion'],
    ['Cẩu xích Sany SCC800C', 'Sany'],
    ['Cẩu xích Sany SCC1000A', 'Sany'],
    ['Cẩu bánh lốp Sany STC250', 'Sany'],
    ['Cẩu xích XCMG QUY80', 'XCMG'],
    ['Cẩu bánh lốp XCMG QY25K5', 'XCMG'],
    ['Cẩu tự hành Manitowoc 999', 'Manitowoc'],
    ['Cẩu tự hành Manitowoc 16000', 'Manitowoc'],
    ['Cẩu tháp Manitowoc Potain MCT 205', 'Manitowoc'],
  ],
  'Xe nâng': [
    ['Xe nâng Toyota 8FD25', 'Toyota'],
    ['Xe nâng Toyota 8FD30', 'Toyota'],
    ['Xe nâng Toyota 8FG15', 'Toyota'],
    ['Xe nâng Toyota 8FBN25', 'Toyota'],
    ['Xe nâng Komatsu FD30T-17', 'Komatsu'],
    ['Xe nâng Komatsu FD50AT-10', 'Komatsu'],
    ['Xe nâng Komatsu FB20-12', 'Komatsu'],
    ['Xe nâng Hyundai 30D-9', 'Hyundai'],
    ['Xe nâng Hyundai 25L-9A', 'Hyundai'],
    ['Xe nâng Hyundai 50D-9', 'Hyundai'],
    ['Xe nâng Doosan D30S-7', 'Doosan'],
    ['Xe nâng Doosan D50SC-7', 'Doosan'],
    ['Xe nâng JCB TLT30D', 'JCB'],
    ['Xe nâng JCB 940-4', 'JCB'],
    ['Xe nâng Hino SS1', 'Hino'],
    ['Xe nâng XCMG XCB-D30', 'XCMG'],
    ['Xe nâng Sany SCP30C2', 'Sany'],
    ['Xe nâng Bomag BW120AD-5', 'Bomag'],
  ],
  'Xe tải ben': [
    ['Xe tải ben Hino 500 FM8JNSA 15T', 'Hino'],
    ['Xe tải ben Hino 700 FS1ELVD 20T', 'Hino'],
    ['Xe tải ben Hino 300 XZU730L 5T', 'Hino'],
    ['Xe tải ben Hyundai HD270 15T', 'Hyundai'],
    ['Xe tải ben Hyundai HD320 19T', 'Hyundai'],
    ['Xe tải ben Hyundai Xcient 25T', 'Hyundai'],
    ['Xe tải ben Volvo FMX 8x4 32T', 'Volvo'],
    ['Xe tải ben Volvo FMX 6x4 25T', 'Volvo'],
    ['Xe tải ben Caterpillar CT660', 'Caterpillar'],
    ['Xe tải ben Caterpillar 740 GC', 'Caterpillar'],
    ['Xe tải ben Doosan DA30-5', 'Doosan'],
    ['Xe tải ben XCMG NXG3250D5NC 12T', 'XCMG'],
    ['Xe tải ben XCMG XGA3310D2KE 18T', 'XCMG'],
    ['Xe tải ben Sany SKT90S', 'Sany'],
    ['Xe tải ben Komatsu HM300-5', 'Komatsu'],
    ['Xe tải ben Komatsu HM400-5', 'Komatsu'],
    ['Xe tải ben JCB 722', 'JCB'],
    ['Xe tải ben Bomag BC 573 RB-4', 'Bomag'],
  ],
  'Máy phát điện': [
    ['Máy phát điện Cummins C275D5', 'Cummins'],
    ['Máy phát điện Cummins C500D5', 'Cummins'],
    ['Máy phát điện Cummins C110D5', 'Cummins'],
    ['Máy phát điện Cummins C825D5A', 'Cummins'],
    ['Máy phát điện Caterpillar DE150E0', 'Caterpillar'],
    ['Máy phát điện Caterpillar DE330E0', 'Caterpillar'],
    ['Máy phát điện Caterpillar DE500E0', 'Caterpillar'],
    ['Máy phát điện Volvo TAD734GE 200kVA', 'Volvo'],
    ['Máy phát điện Volvo TAD1345GE 400kVA', 'Volvo'],
    ['Máy phát điện Doosan DP086TA 250kVA', 'Doosan'],
    ['Máy phát điện Doosan DP158LD 500kVA', 'Doosan'],
    ['Máy phát điện Komatsu EG150BS-3', 'Komatsu'],
    ['Máy phát điện Komatsu EG300BS-3', 'Komatsu'],
    ['Máy phát điện Hitachi H25U', 'Hitachi'],
    ['Máy phát điện XCMG XAMG-C80 80kVA', 'XCMG'],
  ],
  'Máy trộn bê tông': [
    ['Xe trộn bê tông Zoomlion K9JB-R 9m³', 'Zoomlion'],
    ['Xe trộn bê tông Zoomlion K6JB-R 6m³', 'Zoomlion'],
    ['Xe trộn bê tông Zoomlion K12JB 12m³', 'Zoomlion'],
    ['Xe trộn bê tông Sany SY312C-8 12m³', 'Sany'],
    ['Xe trộn bê tông Sany SY306C-6 6m³', 'Sany'],
    ['Xe trộn bê tông Sany SY308C-8 8m³', 'Sany'],
    ['Máy bơm bê tông Schwing SP 1800', 'Schwing'],
    ['Máy bơm bê tông Schwing SP 2800', 'Schwing'],
    ['Máy bơm bê tông Schwing S 36 SX', 'Schwing'],
    ['Xe trộn bê tông XCMG G09ZZ 9m³', 'XCMG'],
    ['Xe trộn bê tông XCMG G12ZZ 12m³', 'XCMG'],
    ['Máy trộn bê tông Liebherr HTM 904', 'Liebherr'],
    ['Máy trộn bê tông Liebherr HTM 1204', 'Liebherr'],
    ['Xe trộn bê tông Hino 700 9m³', 'Hino'],
  ],
  'Máy ép cọc': [
    ['Máy ép cọc thủy lực Junttan PM20', 'Junttan'],
    ['Máy ép cọc thủy lực Junttan PM25', 'Junttan'],
    ['Máy ép cọc thủy lực Junttan HHK 5A', 'Junttan'],
    ['Máy ép cọc thủy lực Junttan PM16', 'Junttan'],
    ['Máy ép cọc Liebherr LRH 200', 'Liebherr'],
    ['Máy ép cọc Liebherr LRH 600', 'Liebherr'],
    ['Máy ép cọc Sany SF808', 'Sany'],
    ['Máy ép cọc Sany SF818', 'Sany'],
    ['Máy đóng cọc XCMG XZ360E', 'XCMG'],
    ['Máy đóng cọc XCMG XZC280', 'XCMG'],
    ['Máy ép cọc Kobelco KMC300', 'Kobelco'],
    ['Máy ép cọc Hitachi KH125-3', 'Hitachi'],
    ['Máy ép cọc Manitowoc M2250', 'Manitowoc'],
  ],
};

const CATEGORY_IMAGES = {
  'Máy xúc': [
    'https://images.unsplash.com/photo-1579294800821-694d95e86143?q=80&w=600',
    'https://images.unsplash.com/photo-1586191582159-6d5be9c23b5d?q=80&w=600',
    'https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=600',
    'https://images.unsplash.com/photo-1580901368919-7738efb0f87e?q=80&w=600',
  ],
  'Cần cẩu': [
    'https://images.unsplash.com/photo-1542385151-efd9000785a0?q=80&w=600',
    'https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=600',
    'https://images.unsplash.com/photo-1495516387989-a5f73bc8839d?q=80&w=600',
    'https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=600',
  ],
  'Xe nâng': [
    'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=600',
    'https://images.unsplash.com/photo-1605787020600-b9ebd5df1d07?q=80&w=600',
    'https://images.unsplash.com/photo-1578575437130-527eed3abbec?q=80&w=600',
    'https://images.unsplash.com/photo-1533722744747-d5d1c25f4cc0?q=80&w=600',
  ],
  'Xe tải ben': [
    'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?q=80&w=600',
    'https://images.unsplash.com/photo-1516575150278-77136aed6920?q=80&w=600',
    'https://images.unsplash.com/photo-1599740831627-72be1c210d32?q=80&w=600',
    'https://images.unsplash.com/photo-1616422285623-13ff0162193c?q=80&w=600',
  ],
  'Máy phát điện': [
    'https://images.unsplash.com/photo-1620714223084-8fcacc6dfd8d?q=80&w=600',
    'https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=600',
    'https://images.unsplash.com/photo-1585713181935-d5f622cc2415?q=80&w=600',
    'https://images.unsplash.com/photo-1618042164219-62c820f10723?q=80&w=600',
  ],
  'Máy trộn bê tông': [
    'https://images.unsplash.com/photo-1534710961216-75c88202f43e?q=80&w=600',
    'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=600',
    'https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?q=80&w=600',
    'https://images.unsplash.com/photo-1590069261209-f8e9b8642343?q=80&w=600',
  ],
  'Máy ép cọc': [
    'https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=600',
    'https://images.unsplash.com/photo-1581092335397-9583fe92d232?q=80&w=600',
    'https://images.unsplash.com/photo-1508450859948-4e04fabaa4e1?q=80&w=600',
    'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=600',
  ],
};

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

function seededRandom(seed) {
  let t = (seed + 0x6d2b79f5) | 0;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

function pickRandom(arr, rng) {
  return arr[Math.floor(rng * arr.length)];
}

function randInt(min, max, rng) {
  return Math.floor(rng * (max - min + 1)) + min;
}

function randFloat(min, max, rng, decimals = 1) {
  return Number((rng * (max - min) + min).toFixed(decimals));
}

function specsForMayXuc(r1, r2, r3, r4) {
  return {
    'Trọng lượng': `${randInt(12, 52, r1)} tấn`,
    'Công suất động cơ': `${randInt(75, 280, r2)} kW`,
    'Dung tích gàu': `${randFloat(0.3, 2.5, r3)} m³`,
    'Chiều sâu đào tối đa': `${randFloat(4.0, 9.5, r4)} m`,
  };
}

function specsForCanCau(r1, r2, r3, r4) {
  return {
    'Tải trọng nâng tối đa': `${randInt(25, 300, r1)} tấn`,
    'Chiều cao nâng': `${randInt(20, 85, r2)} m`,
    'Tầm với': `${randInt(15, 70, r3)} m`,
    'Công suất': `${randInt(100, 450, r4)} kW`,
  };
}

function specsForXeNang(r1, r2, r3, r4) {
  const fuels = ['Diesel', 'LPG', 'Điện', 'Diesel/LPG'];
  return {
    'Tải trọng': `${randFloat(1.5, 7.0, r1)} tấn`,
    'Chiều cao nâng': `${randFloat(3.0, 6.5, r2)} m`,
    'Loại nhiên liệu': pickRandom(fuels, r3),
    'Bán kính quay': `${randFloat(2.0, 4.0, r4)} m`,
  };
}

function specsForXeTaiBen(r1, r2, r3, r4) {
  return {
    'Tải trọng': `${randInt(5, 35, r1)} tấn`,
    'Dung tích thùng': `${randInt(6, 25, r2)} m³`,
    'Công suất': `${randInt(150, 450, r3)} HP`,
    'Số trục': `${randInt(2, 4, r4)}`,
  };
}

function specsForMayPhatDien(r1, r2, r3, r4) {
  const fuels = ['Diesel', 'Khí gas', 'Diesel/Khí gas'];
  return {
    'Công suất': `${randInt(50, 1000, r1)} kVA`,
    'Điện áp': `${pickRandom(['380V/220V', '400V/230V', '380V'], r2)}`,
    'Tần số': '50 Hz',
    'Loại nhiên liệu': pickRandom(fuels, r4),
  };
}

function specsForMayTronBeTong(r1, r2, r3, r4) {
  return {
    'Dung tích trộn': `${randInt(4, 14, r1)} m³`,
    'Công suất': `${randInt(180, 400, r2)} HP`,
    'Tốc độ trộn': `${randInt(8, 18, r3)} vòng/phút`,
    'Chiều cao xả': `${randFloat(3.5, 4.8, r4)} m`,
  };
}

function specsForMayEpCoc(r1, r2, r3, r4) {
  return {
    'Lực ép tối đa': `${randInt(200, 1200, r1)} tấn`,
    'Chiều dài cọc': `${randInt(8, 30, r2)} m`,
    'Công suất': `${randInt(150, 500, r3)} kW`,
    'Trọng lượng': `${randInt(30, 120, r4)} tấn`,
  };
}

const SPEC_GENERATORS = {
  'Máy xúc': specsForMayXuc,
  'Cần cẩu': specsForCanCau,
  'Xe nâng': specsForXeNang,
  'Xe tải ben': specsForXeTaiBen,
  'Máy phát điện': specsForMayPhatDien,
  'Máy trộn bê tông': specsForMayTronBeTong,
  'Máy ép cọc': specsForMayEpCoc,
};

async function seed() {
  await mongoose.connect(mongoUri);
  console.log(`Connected to ${mongoose.connection.name}`);

  await Promise.all([
    Assignment.deleteMany({}),
    MaintenanceLog.deleteMany({}),
  ]);
  console.log('Cleared old assignments and maintenance logs.');

  // Smart Upsert Categories
  const categories = [];
  for (const [name, description] of categorySeeds) {
    let cat = await Category.findOne({ name });
    if (!cat) {
      cat = await Category.create({ name, description });
      console.log(`Created category: ${name}`);
    }
    categories.push(cat);
  }
  const categoryByName = new Map(
    categories.map((category) => [category.name, category]),
  );

  // Smart Upsert Users
  const passwordHash = await bcrypt.hash('Gnoud@123456', 12);
  const users = [];
  for (const [fullName, email, role] of primaryUsers) {
    let u = await User.findOne({ email });
    if (!u) {
      u = await User.create({ fullName, email, role, status: 'ACTIVE', passwordHash });
      console.log(`Created user: ${email}`);
    }
    users.push(u);
  }
  const technicians = users.filter((user) => user.role === 'TECHNICIAN');
  const dispatchers = users.filter((user) => user.role === 'DISPATCHER');

  const categorySlots = [];
  for (let c = 0; c < categorySeeds.length; c++) {
    for (let n = 0; n < CATEGORY_DISTRIBUTION[c]; n++) {
      categorySlots.push(categorySeeds[c][0]);
    }
  }

  const statusPool = [
    'AVAILABLE', 'AVAILABLE', 'AVAILABLE', 'AVAILABLE', 'AVAILABLE', 'AVAILABLE',
    'AVAILABLE', 'AVAILABLE', 'AVAILABLE', 'AVAILABLE', 'AVAILABLE', 'AVAILABLE',
    'RENTED', 'RENTED', 'RENTED', 'RENTED', 'RENTED',
  ];

  // Smart Upsert Machinery
  const machineries = [];
  for (let i = 0; i < 250; i++) {
    const rng1 = seededRandom(i * 7 + 1);
    const rng2 = seededRandom(i * 7 + 2);
    const rng3 = seededRandom(i * 7 + 3);
    const rng4 = seededRandom(i * 7 + 4);
    const rng5 = seededRandom(i * 7 + 5);
    const rng6 = seededRandom(i * 7 + 6);
    const rng7 = seededRandom(i * 7 + 7);

    const categoryName = categorySlots[i];
    const models = MODELS[categoryName];
    const modelEntry = models[i % models.length];
    const [name, manufacturer] = modelEntry;

    const serialNumber = `GCRM-${String(i + 1).padStart(4, '0')}`;
    const status = statusPool[Math.floor(rng1 * statusPool.length)];
    const location = pickRandom(LOCATIONS, rng2);
    const purchaseYear = randInt(2014, 2025, rng3);
    const operatingHours = randInt(200, 15000, rng4);
    const fuelConsumption = randFloat(3, 50, rng5, 1);

    const specGen = SPEC_GENERATORS[categoryName];
    const specs = specGen(rng4, rng5, rng6, rng7);

    const imgList = CATEGORY_IMAGES[categoryName];
    const defaultImageUrl = modelImages[name] || imgList[i % imgList.length];

    let mach = await Machinery.findOne({ serialNumber });
    if (mach) {
      const updateData = {
        name,
        manufacturer,
        operatingHours,
        fuelConsumption,
        purchaseYear,
        status,
        category: categoryByName.get(categoryName)?._id,
        location,
        specs
      };
      // ONLY update the imageUrl if it doesn't already exist OR is currently set to an Unsplash fallback URL
      if (mach.imageUrl && !mach.imageUrl.includes('unsplash.com')) {
        // preserve existing custom image!
      } else {
        updateData.imageUrl = defaultImageUrl;
      }
      mach = await Machinery.findOneAndUpdate({ serialNumber }, updateData, { new: true });
    } else {
      mach = await Machinery.create({
        name,
        serialNumber,
        manufacturer,
        operatingHours,
        fuelConsumption,
        purchaseYear,
        status,
        category: categoryByName.get(categoryName)?._id,
        location,
        specs,
        imageUrl: defaultImageUrl,
      });
    }
    machineries.push(mach);
  }

  const now = new Date('2026-05-29T00:00:00Z');
  const assignments = [];
  machineries.forEach((m, mIdx) => {
    // Generate exactly 3 assignments per machinery (750 in total)
    for (let j = 0; j < 3; j++) {
      let status = 'COMPLETED';
      let startDate;
      let endDate;

      if (j === 0) {
        // First assignment: Completed in the distant past (8-11 months ago)
        status = 'COMPLETED';
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 8 - (mIdx % 4));
        startDate.setDate(1 + (mIdx * 7 + j * 11) % 28);
        
        endDate = new Date(startDate);
        endDate.setMonth(startDate.getMonth() + 1 + (mIdx % 2));
        endDate.setDate(startDate.getDate() + 10);
      } else if (j === 1) {
        // Second assignment: Completed in the recent past (3-5 months ago)
        status = 'COMPLETED';
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 3 - (mIdx % 3));
        startDate.setDate(1 + (mIdx * 7 + j * 11) % 28);
        
        endDate = new Date(startDate);
        endDate.setMonth(startDate.getMonth() + 1 + (mIdx % 2));
        endDate.setDate(startDate.getDate() + 10);
      } else {
        // Third assignment: Current status relative to May 29, 2026
        const rand = (mIdx + j) % 3;
        if (rand === 0) {
          status = 'PENDING';
          // PENDING: starts 2 to 10 days in the future
          startDate = new Date(now);
          startDate.setDate(now.getDate() + 2 + (mIdx % 9));
          
          endDate = new Date(startDate);
          endDate.setDate(startDate.getDate() + 15 + (mIdx % 15));
        } else if (rand === 1) {
          status = 'ACTIVE';
          // ACTIVE: starts 5 to 25 days ago
          startDate = new Date(now);
          startDate.setDate(now.getDate() - 5 - (mIdx % 21));
          
          if ((mIdx % 2) === 0) {
            // Ongoing with no end date
            endDate = undefined;
          } else {
            // Finishes in the future
            endDate = new Date(now);
            endDate.setDate(now.getDate() + 10 + (mIdx % 15));
          }
        } else {
          status = 'COMPLETED';
          // COMPLETED: completed in the past few weeks
          startDate = new Date(now);
          startDate.setDate(now.getDate() - 35 - (mIdx % 25));
          
          endDate = new Date(startDate);
          endDate.setDate(startDate.getDate() + 15 + (mIdx % 10));
        }
      }

      assignments.push({
        machinery: m._id,
        dispatcher: dispatchers[(mIdx + j) % dispatchers.length]._id,
        destination: pick(destinations, mIdx * 3 + j),
        startDate,
        endDate,
        status,
        notes: `${pick(NOTES_POOL, mIdx * 3 + j)}\n\nHướng dẫn điều phối:\n${pick(INSTRUCTIONS_POOL, mIdx * 3 + j)}`,
        _id: objectId(),
        createdAt: startDate,
        updatedAt: startDate,
      });
    }
  });

  let maintenanceLogs = Array.from({ length: 20 }, (_, index) => {
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

  maintenanceLogs = [];
  const activeMaintenanceMachineryIds = new Set();
  machineries.forEach((machinery, mIdx) => {
    const logCount = 2 + (mIdx % 2);

    for (let j = 0; j < logCount; j++) {
      const index = mIdx * 3 + j;
      const dateSeed = seededRandom(index * 13 + 29);
      const createdAt =
        j === logCount - 1 && mIdx % 5 === 0
          ? new Date(now)
          : addMonths(now, -Math.floor(dateSeed * 11));
      createdAt.setDate(1 + Math.floor(seededRandom(index * 17 + 7) * 27));
      createdAt.setHours(
        7 + Math.floor(seededRandom(index * 19 + 3) * 10),
        Math.floor(seededRandom(index * 23 + 5) * 60),
        0,
        0,
      );
      const status =
        j < logCount - 1
          ? 'COMPLETED'
          : pick(['COMPLETED', 'IN_PROGRESS', 'PENDING'], mIdx);
      const priority = pick(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], index);
      const baseCost = 1200000 + ((mIdx * 17 + j * 11) % 18) * 450000;
      const technicianIndex = Math.floor(
        seededRandom(index * 31 + 11) * technicians.length,
      );

      maintenanceLogs.push({
        machinery: machinery._id,
        technician: technicians[technicianIndex]._id,
        cost: baseCost,
        type: pick(['ROUTINE', 'EMERGENCY', 'INSPECTION', 'REPLACEMENT'], index),
        priority,
        status,
        description: pick(
          [
            'Kiem tra he thong thuy luc va thay dau dinh ky.',
            'Xu ly canh bao hao mon bac dan truc chinh.',
            'Thay loc nhien lieu, ve sinh ket nuoc va kiem tra cam bien.',
            'Khac phuc tieng on bat thuong khi van hanh tai cao.',
            'Thay day curoa, siet lai bu long khung gam va can chinh phanh.',
          ],
          index,
        ),
        completedAt: status === 'COMPLETED' ? createdAt : undefined,
        spareParts: [
          {
            name: pick(
              [
                'Loc dau thuy luc',
                'Bac dan truc',
                'Day curoa',
                'Cam bien nhiet',
                'Ma phanh',
              ],
              index,
            ),
            quantity: 1 + (index % 3),
            cost: Math.round(baseCost * 0.35),
          },
        ],
        _id: objectId(),
        createdAt,
        updatedAt: createdAt,
      });

      if (status === 'IN_PROGRESS') {
        activeMaintenanceMachineryIds.add(String(machinery._id));
      }
    }
  });

  assignments.forEach((assignment, index) => {
    if (
      assignment.status === 'ACTIVE' &&
      activeMaintenanceMachineryIds.has(String(assignment.machinery))
    ) {
      assignment.status = 'PENDING';
      assignment.startDate = new Date(now);
      assignment.startDate.setDate(now.getDate() + 3 + (index % 10));
      assignment.endDate = new Date(assignment.startDate);
      assignment.endDate.setDate(assignment.startDate.getDate() + 12 + (index % 8));
      assignment.createdAt = assignment.startDate;
      assignment.updatedAt = assignment.startDate;
    }
  });

  const activeAssignmentMachineryIds = new Set(
    assignments
      .filter(
        (assignment) =>
          assignment.status === 'ACTIVE' &&
          !activeMaintenanceMachineryIds.has(String(assignment.machinery)),
      )
      .map((assignment) => String(assignment.machinery)),
  );

  if (activeMaintenanceMachineryIds.size > 0) {
    await Machinery.updateMany(
      { _id: { $in: Array.from(activeMaintenanceMachineryIds) } },
      { status: 'MAINTENANCE' },
    );
  }

  if (activeAssignmentMachineryIds.size > 0) {
    await Machinery.updateMany(
      { _id: { $in: Array.from(activeAssignmentMachineryIds) } },
      { status: 'RENTED' },
    );
  }

  await Machinery.updateMany(
    {
      _id: {
        $nin: [
          ...Array.from(activeMaintenanceMachineryIds),
          ...Array.from(activeAssignmentMachineryIds),
        ],
      },
    },
    { status: 'AVAILABLE' },
  );

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
