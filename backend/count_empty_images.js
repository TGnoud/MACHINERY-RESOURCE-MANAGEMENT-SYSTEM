const mongoose = require('mongoose');
try {
  process.loadEnvFile?.();
} catch (e) {}

const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
  console.error("Missing MONGODB_URI");
  process.exit(1);
}

const machinerySchema = new mongoose.Schema({
  name: String,
  serialNumber: String,
  imageUrl: String,
});

const Machinery = mongoose.model('Machinery', machinerySchema);

async function run() {
  await mongoose.connect(mongoUri);
  console.log(`Connected to database: ${mongoose.connection.name}`);
  
  const allMachineries = await Machinery.find({}).lean();
  console.log(`Total machineries in database: ${allMachineries.length}`);
  
  const emptyImages = allMachineries.filter(m => !m.imageUrl || m.imageUrl.trim() === '' || m.imageUrl === '#');
  console.log(`Number of machineries WITHOUT images: ${emptyImages.length}`);
  
  if (emptyImages.length > 0) {
    console.log("\nSample of machineries without images:");
    emptyImages.slice(0, 15).forEach((m, idx) => {
      console.log(`${idx + 1}. Name: "${m.name}", Serial: "${m.serialNumber}", Image: "${m.imageUrl || 'undefined'}"`);
    });
  }
}

run()
  .catch(console.error)
  .finally(() => mongoose.disconnect());
