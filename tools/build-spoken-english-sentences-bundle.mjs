import fs from 'node:fs';
import path from 'node:path';

const inputPath = path.resolve('src/_data/spoken-english.json');
const outputPath = path.resolve('src/scripts/spoken-english-sentences.bundle.js');
const source = JSON.parse(fs.readFileSync(inputPath, 'utf8'));

const payload = (source.topics || []).flatMap((topic) => {
  const topicTitle = String(topic.title || '').trim();
  const topicSlug = String(topic.slug || topicTitle)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return (topic.groups || []).flatMap((group) => {
    const groupTitle = String(group.title || '').trim();

    return (group.items || []).map((entry) => ({
      english: entry.english,
      bangla: entry.bangla,
      category: topicTitle,
      group: groupTitle,
      topicSlug
    }));
  });
}).map((entry, index) => ({
  ...entry,
  sequence: index + 1
}));

const output = `!function(){window.__loadManeSpokenEnglishSentences=function(){return ${JSON.stringify(payload)};};}();\n`;

fs.writeFileSync(outputPath, output);
console.log(`Wrote ${outputPath}`);
console.log(`Entries: ${payload.length}`);
