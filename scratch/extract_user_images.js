const fs = require('fs');
const readline = require('readline');

const logPath = 'C:\\Users\\Thai Duong\\.gemini\\antigravity\\brain\\36f99e40-b11c-4e40-acf4-5659b256fbe7\\.system_generated\\logs\\transcript.jsonl';

async function processLineByLine() {
  const fileStream = fs.createReadStream(logPath);

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  const machineryMap = {}; // serialNumber -> Set of imageUrls

  console.log("Parsing transcript.jsonl...");
  
  for await (const line of rl) {
    // Search for matches
    if (line.includes('GCRM-')) {
      // Find all JSON matches of machinery object
      // Let's use a regex to find all GCRM-xxxx and their surrounding JSON
      const regex = /{"_id":"[^"]+","name":"[^"]+","serialNumber":"(GCRM-\d{4})"[^}]+"imageUrl":"([^"]+)"/g;
      let match;
      while ((match = regex.exec(line)) !== null) {
        const serial = match[1];
        const url = match[2];
        if (!machineryMap[serial]) {
          machineryMap[serial] = new Set();
        }
        machineryMap[serial].add(url);
      }
      
      // Also look for other formats
      const regex2 = /"serialNumber"\s*:\s*"(GCRM-\d{4})"[^}]+"imageUrl"\s*:\s*"([^"]+)"/g;
      let match2;
      while ((match2 = regex2.exec(line)) !== null) {
        const serial = match2[1];
        const url = match2[2];
        if (!machineryMap[serial]) {
          machineryMap[serial] = new Set();
        }
        machineryMap[serial].add(url);
      }
    }
  }

  console.log("Extracted image sets per machinery:");
  const results = {};
  for (const [serial, urls] of Object.entries(machineryMap)) {
    results[serial] = Array.from(urls);
    console.log(`${serial}:`, results[serial]);
  }
  
  fs.writeFileSync('C:\\Users\\Thai Duong\\Desktop\\GR1\\scratch\\extracted_user_images.json', JSON.stringify(results, null, 2));
  console.log("Wrote results to extracted_user_images.json");
}

processLineByLine();
