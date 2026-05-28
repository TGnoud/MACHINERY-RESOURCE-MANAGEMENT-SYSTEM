const fs = require('fs');

async function test() {
  const q = encodeURIComponent('Komatsu PC200-8 excavator');
  const res = await fetch('https://www.bing.com/images/search?q=' + q, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
  });
  const html = await res.text();
  fs.writeFileSync('C:\\Users\\Thai Duong\\.gemini\\antigravity\\brain\\36f99e40-b11c-4e40-acf4-5659b256fbe7\\scratch\\bing_modern.html', html, 'utf8');
  console.log("HTML written, size:", html.length);
  
  // Find all matches of m="{\"murl\":\"...\"}" or murl="..."
  const murls = [];
  // In modern Bing, image metadata is stored inside m="{"murl":"url","turl":"url",...}"
  const regex = /m="({[^"]+?})"/g;
  let match;
  while ((match = regex.exec(html)) !== null) {
    try {
      const decoded = match[1].replace(/&quot;/g, '"');
      const obj = JSON.parse(decoded);
      if (obj.murl) {
        murls.push(obj.murl);
      }
    } catch (e) {}
  }
  
  console.log("Total high-res murls found on Bing Modern:", murls.length);
  murls.slice(0, 10).forEach((url, i) => {
    console.log(i, url);
  });
}
test().catch(console.error);
