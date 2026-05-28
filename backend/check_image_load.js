const mongoose = require('dns'); // use dns for timeout checks if needed
const mongooseLib = require('mongoose');
try {
  process.loadEnvFile?.();
} catch (e) {}

const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
  console.error("Missing MONGODB_URI");
  process.exit(1);
}

const machinerySchema = new mongooseLib.Schema({
  name: String,
  serialNumber: String,
  imageUrl: String,
});

const Machinery = mongooseLib.model('Machinery', machinerySchema);

async function run() {
  await mongooseLib.connect(mongoUri);
  console.log(`Connected to database: ${mongooseLib.connection.name}`);
  
  const machineries = await Machinery.find({}).lean();
  console.log(`Analyzing ${machineries.length} machinery image URLs...`);
  
  const uniqueUrls = [...new Set(machineries.map(m => m.imageUrl).filter(Boolean))];
  console.log(`Found ${uniqueUrls.length} unique image URLs.`);
  
  const brokenUrls = new Set();
  const statusCounts = {};
  
  console.log("Verifying image links loading status (checking first 40 unique links)...");
  
  // Test first 40 URLs to see if they block or fail
  for (let i = 0; i < Math.min(uniqueUrls.length, 50); i++) {
    const url = uniqueUrls[i];
    try {
      const res = await fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Referer': 'https://google.com'
        },
        signal: AbortSignal.timeout(3000) // 3 seconds timeout
      });
      
      statusCounts[res.status] = (statusCounts[res.status] || 0) + 1;
      if (res.status !== 200) {
        console.log(`❌ Broken Link (HTTP ${res.status}): ${url}`);
        brokenUrls.add(url);
      }
    } catch (e) {
      console.log(`❌ Link Failed (Error: ${e.message}): ${url}`);
      brokenUrls.add(url);
      statusCounts['ERROR'] = (statusCounts['ERROR'] || 0) + 1;
    }
  }
  
  console.log("\nSummary of image link tests:");
  console.log(statusCounts);
  
  // Count how many equipment records are affected by these broken URLs
  let affectedCount = 0;
  machineries.forEach(m => {
    if (m.imageUrl && brokenUrls.has(m.imageUrl)) {
      affectedCount++;
    }
  });
  
  console.log(`\nAffected equipment records: ${affectedCount}`);
}

run()
  .catch(console.error)
  .finally(() => mongooseLib.disconnect());
