const mongoose = require('mongoose');
try {
  process.loadEnvFile?.();
} catch (e) {}

const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
  console.error("Missing MONGODB_URI");
  process.exit(1);
}

async function run() {
  await mongoose.connect(mongoUri);
  console.log(`Connected successfully to database: ${mongoose.connection.name}`);
  
  // Get all database names in the cluster
  const admin = mongoose.connection.db.admin();
  const dbsInfo = await admin.listDatabases();
  console.log("\nDatabases in Cluster:");
  dbsInfo.databases.forEach(db => {
    console.log(`- Database Name: "${db.name}", Size: ${(db.sizeOnDisk / (1024*1024)).toFixed(2)} MB`);
  });
  
  // List collections in the current database
  const collections = await mongoose.connection.db.listCollections().toArray();
  console.log(`\nCollections in current DB "${mongoose.connection.name}":`);
  for (const col of collections) {
    const count = await mongoose.connection.db.collection(col.name).countDocuments({});
    console.log(`- Collection Name: "${col.name}", Document Count: ${count}`);
  }
}

run()
  .catch(console.error)
  .finally(() => mongoose.disconnect());
