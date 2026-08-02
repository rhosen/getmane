import fs from 'node:fs';
import path from 'node:path';

const inputPath = path.resolve('src/_data/200-common-english-idioms-bangla.json');
const outputPath = path.resolve('src/scripts/common-english-idioms.bundle.js');
const source = JSON.parse(fs.readFileSync(inputPath, 'utf8'));

const payload = source.map((entry, index) => ({
  sequence: index + 1,
  idiom: entry.idiom,
  literalMeaning: entry.literalMeaning,
  banglaMeaning: entry.banglaMeaning,
  example: entry.example,
  exampleBangla: entry.exampleBangla,
  category: entry.category
}));

const output = `!function(){window.__loadManeCommonIdioms=function(){return ${JSON.stringify(payload)};};}();\n`;

fs.writeFileSync(outputPath, output);
console.log(`Wrote ${outputPath}`);
console.log(`Entries: ${payload.length}`);
