const mongoose = require('mongoose');
try {
  process.loadEnvFile?.();
} catch (e) {}

const mongoUri = process.env.MONGODB_URI;

const machinerySchema = new mongoose.Schema({
  name: String,
  serialNumber: String,
  imageUrl: String,
});

const Machinery = mongoose.model('Machinery', machinerySchema, 'machinery');

async function run() {
  await mongoose.connect(mongoUri);
  console.log("Connected to GnoudCRM");
  
  const docs = await Machinery.find({}).limit(5).lean();
  console.log("\nFirst 5 machinery documents:");
  docs.forEach((doc, idx) => {
    console.log(`${idx + 1}. "${doc.name}" (${doc.serialNumber}) -> "${doc.imageUrl}"`);
  });
}

run()
  .catch(console.error)
  .finally(() => mongoose.disconnect());
