const fs = require('fs');

async function test() {
  const q = encodeURIComponent('Komatsu PC200-8 excavator');
  const res = await fetch('https://www.bing.com/images/search?q=' + q, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; WOW64; Trident/5.0)'
    }
  });
  const html = await res.text();
  fs.writeFileSync('C:\\Users\\Thai Duong\\.gemini\\antigravity\\brain\\36f99e40-b11c-4e40-acf4-5659b256fbe7\\scratch\\bing.html', html, 'utf8');
  
  // Find matches of img URLs inside src="..." or murl="..."
  // Bing Image search often puts the actual high-res image URL in a json attribute like m="{\"murl\":\"...\"}"
  const murls = [];
  const regex = /murl&quot;:&quot;(https?:\/\/.*?)&quot;/g;
  let match;
  while ((match = regex.exec(html)) !== null) {
    murls.push(match[1]);
  }
  
  console.log("Total high-res murls found on Bing:", murls.length);
  murls.slice(0, 10).forEach((url, i) => {
    console.log(i, url);
  });
}
test().catch(console.error);
