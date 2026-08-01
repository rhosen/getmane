import fs from 'node:fs';
import path from 'node:path';

const inputPath = path.resolve('src/_data/500-daily-use-english-sentences-with-bangla-meaning.json');
const outputPath = path.resolve('src/scripts/daily-use-english-sentences.bundle.js');
const source = JSON.parse(fs.readFileSync(inputPath, 'utf8'));

const payload = source.sentences.map((entry) => ({
  sequence: entry.id,
  english: entry.english,
  bangla: entry.bangla,
  category: entry.category
}));

const output = `!function(){window.__loadManeDailySentences=function(){return ${JSON.stringify(payload)};};}();\n`;

fs.writeFileSync(outputPath, output);
console.log(`Wrote ${outputPath}`);
console.log(`Entries: ${payload.length}`);
