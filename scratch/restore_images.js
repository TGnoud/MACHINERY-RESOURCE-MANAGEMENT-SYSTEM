const fs = require('fs');
const readline = require('readline');
const path = require('path');

const logPath = 'C:\\Users\\Thai Duong\\.gemini\\antigravity\\brain\\36f99e40-b11c-4e40-acf4-5659b256fbe7\\.system_generated\\tasks\\task-584.log';
const outputPath = 'C:\\Users\\Thai Duong\\Desktop\\GR1\\backend\\model_images.json';

async function processLineByLine() {
  const fileStream = fs.createReadStream(logPath);

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  const modelImages = {};
  let currentModel = null;

  for await (const line of rl) {
    if (line.includes('Searching image for:')) {
      const match = line.match(/Searching image for:\s*"([^"]+)"/);
      if (match) {
        currentModel = match[1];
      }
    } else if (line.includes('-> Found Image:') && currentModel) {
      const match = line.match(/-> Found Image:\s*(https?:\/\/\S+)/);
      if (match) {
        let url = match[1];
        // Clean up any html entities like &amp;
        url = url.replace(/&amp;/g, '&');
        modelImages[currentModel] = url;
      }
      currentModel = null;
    }
  }

  console.log(`Parsed ${Object.keys(modelImages).length} model images.`);
  
  // Write to backend/model_images.json
  fs.writeFileSync(outputPath, JSON.stringify(modelImages, null, 2));
  console.log("Wrote restored images to backend/model_images.json!");
}

processLineByLine();
