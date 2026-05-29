const fs = require('fs');
const readline = require('readline');

const logPath = 'C:\\Users\\Thai Duong\\.gemini\\antigravity\\brain\\36f99e40-b11c-4e40-acf4-5659b256fbe7\\.system_generated\\logs\\transcript.jsonl';

async function processLineByLine() {
  const fileStream = fs.createReadStream(logPath);

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  const urlMap = new Set();

  for await (const line of rl) {
    // Regex for urls
    const regex = /https?:\/\/[^\s"',;()<>\\*\[\]]+/g;
    let match;
    while ((match = regex.exec(line)) !== null) {
      const url = match[0];
      // Filter out common system urls
      if (
        url.includes('unsplash.com') ||
        url.includes('github.com') ||
        url.includes('google.com') ||
        url.includes('lucide') ||
        url.includes('vercel.app') ||
        url.includes('onrender.com') ||
        url.includes('nextjs.org') ||
        url.includes('npmjs.com') ||
        url.includes('schema.org')
      ) {
        continue;
      }
      urlMap.add(url);
    }
  }

  console.log(`Found ${urlMap.size} custom URLs:`);
  const sorted = Array.from(urlMap).sort();
  fs.writeFileSync('C:\\Users\\Thai Duong\\Desktop\\GR1\\scratch\\custom_urls.txt', sorted.join('\n'));
  console.log("Wrote results to custom_urls.txt");
}

processLineByLine();
