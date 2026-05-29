const fs = require('fs');
const readline = require('readline');

const logPath = 'C:\\Users\\Thai Duong\\.gemini\\antigravity\\brain\\36f99e40-b11c-4e40-acf4-5659b256fbe7\\.system_generated\\logs\\transcript.jsonl';

async function processLineByLine() {
  const fileStream = fs.createReadStream(logPath);

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  const outputLines = [];
  let lineCount = 0;

  for await (const line of rl) {
    lineCount++;
    if (line.includes('serialNumber')) {
      outputLines.push(`=== Line ${lineCount} ===\n${line.slice(0, 10000)}\n`);
    }
  }

  fs.writeFileSync('C:\\Users\\Thai Duong\\Desktop\\GR1\\scratch\\serial_number_lines.txt', outputLines.join('\n'));
  console.log(`Finished writing ${outputLines.length} serialNumber lines.`);
}

processLineByLine();
