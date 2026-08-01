import fs from 'node:fs';
import path from 'node:path';

const inputPath = path.resolve('src/_data/mane-1000-common-english-words-final.json');
const outputPath = path.resolve('src/scripts/mane-resource.bundle.js');

const seedMaskA = 0xA5C3D29B;
const seedMaskB = 0x7F4A7C15;
const source = JSON.parse(fs.readFileSync(inputPath, 'utf8'));

const payload = source.map((entry) => ({
  sequence: entry.rank,
  word: entry.word,
  pronunciation_bn: entry.pronunciation,
  part_of_speech: entry.part_of_speech,
  bangla_meaning: entry.meaning_bn,
  category: entry.category
}));

const json = JSON.stringify(payload);
const bytes = Buffer.from(json, 'utf8');
const a = 2272101724;
let state = (a ^ seedMaskA) >>> 0;
const b = (state ^ seedMaskB) >>> 0;
const encoded = Buffer.alloc(bytes.length);

for (let index = 0; index < bytes.length; index += 1) {
  state ^= (state << 13) >>> 0;
  state ^= state >>> 17;
  state ^= (state << 5) >>> 0;
  encoded[index] = bytes[index] ^ (state & 255);
}

const base64Chunks = Buffer.from(encoded)
  .toString('base64')
  .match(/.{1,16000}/g) || [''];

const output = `!function(){const q={a:${a},b:${b},c:${JSON.stringify(base64Chunks)}};window.__loadMane1000Words=function(){let r=(q.a^0xA5C3D29B)>>>0;if(((q.b^0x7F4A7C15)>>>0)!==r)return[];const x=atob(q.c.join('')),y=new Uint8Array(x.length);for(let i=0;i<x.length;i++)r^=(r<<13)>>>0,r^=r>>>17,r^=(r<<5)>>>0,y[i]=x.charCodeAt(i)^(r&255);try{return JSON.parse(new TextDecoder().decode(y))}catch{return[]}}}();\n`;

fs.writeFileSync(outputPath, output);
console.log(`Wrote ${outputPath}`);
console.log(`Entries: ${payload.length}`);
