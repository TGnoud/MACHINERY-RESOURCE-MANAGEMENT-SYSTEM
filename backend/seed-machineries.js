/* eslint-disable no-console */
// ---------------------------------------------------------------------------
// seed-machineries.js
// Generates 7 equipment categories and 250 diverse machinery records.
// Idempotent – safe to run multiple times (uses upsert).
//
// Usage:
//   MONGODB_URI=mongodb+srv://... node seed-machineries.js
//   node seed-machineries.js          # defaults to localhost
// ---------------------------------------------------------------------------

const { MongoClient, ObjectId } = require('mongodb');

const MONGO_URI =
  process.env.MONGODB_URI || 'mongodb://localhost:27017/GnoudCRM';

// ── helpers ────────────────────────────────────────────────────────────────
function seededRandom(seed) {
  // Simple mulberry32 PRNG so output is deterministic across runs
  let t = (seed + 0x6d2b79f5) | 0;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

function pick(arr, rng) {
  return arr[Math.floor(rng * arr.length)];
}

function randInt(min, max, rng) {
  return Math.floor(rng * (max - min + 1)) + min;
}

function randFloat(min, max, rng, decimals = 1) {
  return Number((rng * (max - min) + min).toFixed(decimals));
}

// ── reference data ─────────────────────────────────────────────────────────

const CATEGORIES = [
  { name: 'Máy xúc', description: 'Nhóm thiết bị đào, xúc, san lấp mặt bằng.' },
  { name: 'Cần cẩu', description: 'Thiết bị nâng hạ phục vụ công trường cao tầng.' },
  { name: 'Xe nâng', description: 'Thiết bị nâng chuyển pallet và vật tư kho bãi.' },
  { name: 'Xe tải ben', description: 'Phương tiện vận chuyển vật liệu nặng.' },
  { name: 'Máy phát điện', description: 'Thiết bị cung cấp nguồn điện dự phòng.' },
  { name: 'Máy trộn bê tông', description: 'Thiết bị trộn bê tông tươi tại công trường.' },
  { name: 'Máy ép cọc', description: 'Thiết bị ép/đóng cọc bê tông phục vụ nền móng.' },
];

// Category distribution weights (sum = 250)
// Máy xúc 55, Cần cẩu 45, Xe nâng 35, Xe tải ben 35,
// Máy phát điện 30, Máy trộn bê tông 25, Máy ép cọc 25
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
];

// ── model definitions per category ─────────────────────────────────────────
// Each entry: [displayName, manufacturer]
// displayName is the full machinery name shown in the UI.

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
    ['Máy xúc Volvo EC210B', 'Volvo'],
    ['Máy xúc Volvo EC250D', 'Volvo'],
    ['Máy xúc Volvo EC350D', 'Volvo'],
    ['Máy xúc Volvo L120F', 'Volvo'],
    ['Máy xúc Hyundai R220LC-9S', 'Hyundai'],
    ['Máy xúc Hyundai R330LC-9S', 'Hyundai'],
    ['Máy xúc Hyundai R140W-9S', 'Hyundai'],
    ['Máy xúc Doosan DX225LC-5', 'Doosan'],
    ['Máy xúc Doosan DX340LC-5', 'Doosan'],
    ['Máy xúc Doosan DX190W-5', 'Doosan'],
    ['Máy xúc Hitachi ZX200-5G', 'Hitachi'],
    ['Máy xúc Hitachi ZX350LC-5G', 'Hitachi'],
    ['Máy xúc Hitachi ZX130-5A', 'Hitachi'],
    ['Máy xúc Kobelco SK200-10', 'Kobelco'],
    ['Máy xúc Kobelco SK350LC-10', 'Kobelco'],
    ['Máy xúc JCB JS205LC', 'JCB'],
    ['Máy xúc JCB JS220', 'JCB'],
    ['Máy xúc XCMG XE215C', 'XCMG'],
    ['Máy xúc XCMG XE370CA', 'XCMG'],
    ['Máy xúc Sany SY215C', 'Sany'],
    ['Máy xúc Sany SY365H', 'Sany'],
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

// ── spec generators ────────────────────────────────────────────────────────
// Each function receives a PRNG value (0..1) per field so specs vary.

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
    'Loại nhiên liệu': pick(fuels, r3),
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
    'Điện áp': `${pick(['380V/220V', '400V/230V', '380V'], r2)}`,
    'Tần số': '50 Hz',
    'Loại nhiên liệu': pick(fuels, r4),
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

// ── main seed logic ────────────────────────────────────────────────────────

async function main() {
  console.log('Connecting to MongoDB …');
  const client = new MongoClient(MONGO_URI);
  await client.connect();

  const dbName = new URL(MONGO_URI.replace('mongodb+srv://', 'https://')).pathname.replace('/', '') || 'GnoudCRM';
  const db = client.db(dbName);
  console.log(`Connected ✓  database: ${db.databaseName}`);

  // ── 1. Upsert categories ────────────────────────────────────────────────
  const categoriesCol = db.collection('categories');
  const categoryIdByName = {};

  for (const cat of CATEGORIES) {
    const result = await categoriesCol.updateOne(
      { name: cat.name },
      {
        $set: { description: cat.description },
        $setOnInsert: { name: cat.name, createdAt: new Date() },
        $currentDate: { updatedAt: true },
      },
      { upsert: true },
    );

    // Retrieve the _id (either existing or newly inserted)
    const doc = await categoriesCol.findOne({ name: cat.name }, { projection: { _id: 1 } });
    categoryIdByName[cat.name] = doc._id;

    const action = result.upsertedCount ? 'created' : 'exists';
    console.log(`  Category "${cat.name}" … ${action}`);
  }
  console.log(`Categories ready: ${Object.keys(categoryIdByName).length}\n`);

  // ── 2. Build the flat list assigning each index to a category ───────────
  //    Index 0..54  → Máy xúc (55)
  //    Index 55..99 → Cần cẩu (45)  etc.
  const categorySlots = [];
  for (let c = 0; c < CATEGORIES.length; c++) {
    for (let n = 0; n < CATEGORY_DISTRIBUTION[c]; n++) {
      categorySlots.push(CATEGORIES[c].name);
    }
  }
  // categorySlots.length should be 250

  // ── 3. Upsert 250 machineries ───────────────────────────────────────────
  const machineriesCol = db.collection('machineries');
  let created = 0;
  let updated = 0;

  const statusPool = [
    // ~60% AVAILABLE, ~25% RENTED, ~15% MAINTENANCE
    'AVAILABLE', 'AVAILABLE', 'AVAILABLE', 'AVAILABLE', 'AVAILABLE', 'AVAILABLE',
    'AVAILABLE', 'AVAILABLE', 'AVAILABLE', 'AVAILABLE', 'AVAILABLE', 'AVAILABLE',
    'RENTED', 'RENTED', 'RENTED', 'RENTED', 'RENTED',
    'MAINTENANCE', 'MAINTENANCE', 'MAINTENANCE',
  ]; // 12 AVAILABLE (60%), 5 RENTED (25%), 3 MAINTENANCE (15%)

  const BATCH_SIZE = 50;

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
    const modelEntry = models[i % models.length]; // cycle through models
    const [name, manufacturer] = modelEntry;

    const serialNumber = `GCRM-${String(i + 1).padStart(4, '0')}`;
    const status = statusPool[Math.floor(rng1 * statusPool.length)];
    const location = pick(LOCATIONS, rng2);
    const purchaseYear = randInt(2014, 2025, rng3);
    const operatingHours = randInt(200, 15000, rng4);
    const fuelConsumption = randFloat(3, 50, rng5, 1);

    const specGen = SPEC_GENERATORS[categoryName];
    const specs = specGen(rng4, rng5, rng6, rng7);

    const imgList = CATEGORY_IMAGES[categoryName];
    const imageUrl = imgList[i % imgList.length];

    const doc = {
      name,
      manufacturer,
      operatingHours,
      fuelConsumption,
      purchaseYear,
      status,
      category: categoryIdByName[categoryName],
      specs,
      location,
      imageUrl,
    };

    const result = await machineriesCol.updateOne(
      { serialNumber },
      {
        $set: doc,
        $setOnInsert: { serialNumber, createdAt: new Date() },
        $currentDate: { updatedAt: true },
      },
      { upsert: true },
    );

    if (result.upsertedCount) created++;
    else updated++;

    // Log progress every BATCH_SIZE records
    if ((i + 1) % BATCH_SIZE === 0 || i === 249) {
      console.log(`  Progress: ${i + 1}/250 machineries processed …`);
    }
  }

  // ── 4. Summary ──────────────────────────────────────────────────────────
  console.log('\n══════════════════════════════════════════════');
  console.log('  SEED COMPLETED');
  console.log('══════════════════════════════════════════════');
  console.log(`  Categories :  ${CATEGORIES.length}`);
  console.log(`  Machineries:  250 total  (${created} created, ${updated} updated)`);
  console.log('──────────────────────────────────────────────');

  // Per-category breakdown
  const catCounts = {};
  CATEGORY_DISTRIBUTION.forEach((count, idx) => {
    catCounts[CATEGORIES[idx].name] = count;
  });
  console.log('  Distribution by category:');
  for (const [cat, count] of Object.entries(catCounts)) {
    console.log(`    ${cat.padEnd(20)} ${count}`);
  }

  // Status breakdown (query actual data)
  const statusAgg = await machineriesCol
    .aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ])
    .toArray();
  console.log('  Status breakdown:');
  for (const s of statusAgg) {
    console.log(`    ${s._id.padEnd(20)} ${s.count}`);
  }
  console.log('══════════════════════════════════════════════\n');

  await client.close();
  console.log('MongoDB connection closed. Done ✓');
}

main().catch((err) => {
  console.error('Seed failed:', err);
  process.exitCode = 1;
});
