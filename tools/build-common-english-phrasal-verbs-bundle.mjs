import fs from 'node:fs';
import path from 'node:path';

const inputPath = path.resolve('src/_data/200-common-english-phrasal-verbs-bangla.json');
const outputPath = path.resolve('src/scripts/common-english-phrasal-verbs.bundle.js');
const source = JSON.parse(fs.readFileSync(inputPath, 'utf8'));

const payload = source.map((entry, index) => ({
  sequence: index + 1,
  phrasalVerb: entry.phrasalVerb,
  englishMeaning: entry.englishMeaning,
  banglaMeaning: entry.banglaMeaning,
  example: entry.example,
  exampleBangla: entry.exampleBangla,
  category: entry.category
}));

const output = `!function(){window.__loadManeCommonPhrasalVerbs=function(){return ${JSON.stringify(payload)};};}();\n`;

fs.writeFileSync(outputPath, output);
console.log(`Wrote ${outputPath}`);
console.log(`Entries: ${payload.length}`);
