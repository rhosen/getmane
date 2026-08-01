const fs = require('node:fs');
const path = require('node:path');

const bundlePath = path.resolve(__dirname, '../scripts/mane-resource.bundle.js');
const bundleSource = fs.readFileSync(bundlePath, 'utf8');
const bundleMatch = bundleSource.match(/const q=(\{a:\d+,b:\d+,c:\[[\s\S]*?\]\});window\.__loadMane1000Words/);

if (!bundleMatch) {
  throw new Error('Unable to parse mane-1000-common-english-words.bundle.js');
}

const bundleConfig = Function(`return (${bundleMatch[1].replace(/([,{])(a|b|c):/g, '$1"$2":')});`)();

function decodeBundle(bundle) {
  const seedMaskA = 0xA5C3D29B;
  let state = (bundle.a ^ seedMaskA) >>> 0;
  const base64 = bundle.c.join('');
  const input = Buffer.from(base64, 'base64').toString('binary');
  const bytes = Buffer.alloc(input.length);

  for (let index = 0; index < input.length; index += 1) {
    state ^= (state << 13) >>> 0;
    state ^= state >>> 17;
    state ^= (state << 5) >>> 0;
    bytes[index] = input.charCodeAt(index) ^ (state & 255);
  }

  return JSON.parse(bytes.toString('utf8'));
}

const vocabularyWords = decodeBundle(bundleConfig);

const posAbbreviations = {
  noun: 'n.',
  verb: 'v.',
  adjective: 'adj.',
  adverb: 'adv.',
  pronoun: 'pron.',
  determiner: 'det.',
  preposition: 'prep.',
  conjunction: 'conj.',
  article: 'art.',
  interjection: 'int.'
};

function slugify(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function formatNumber(value) {
  return Number(value).toLocaleString('en-US');
}

const topicMap = new Map();

const words = vocabularyWords.map((entry) => {
  const normalizedEntry = {
    ...entry,
    topicSlug: slugify(entry.category)
  };

  if (!topicMap.has(normalizedEntry.topicSlug)) {
    topicMap.set(normalizedEntry.topicSlug, {
      slug: normalizedEntry.topicSlug,
      title: normalizedEntry.category,
      titleBn: '',
      words: []
    });
  }

  const word = {
    ...normalizedEntry,
    id: `word-${slugify(normalizedEntry.word)}-${normalizedEntry.sequence}`,
    posShort: posAbbreviations[normalizedEntry.part_of_speech?.toLowerCase?.() || normalizedEntry.part_of_speech] || normalizedEntry.part_of_speech,
    searchText: [
      normalizedEntry.word,
      normalizedEntry.pronunciation_bn,
      normalizedEntry.bangla_meaning,
      normalizedEntry.part_of_speech,
      normalizedEntry.category
    ].join(' ')
  };

  topicMap.get(normalizedEntry.topicSlug).words.push(word);
  return word;
});

const topics = [...topicMap.values()].map((topic, index) => ({
  ...topic,
  number: String(index + 1).padStart(2, '0'),
  id: `topic-${topic.slug}`,
  count: topic.words.length,
  countLabel: formatNumber(topic.words.length)
}));

const wordCount = words.length;

module.exports = {
  hub: {
    title: 'Free English learning resources',
    description: 'Browse practical English-learning resources from Mane for Bangla-speaking learners.',
    featured: {
      title: '1,000 Common English Words with Bangla Meanings',
      description: 'Build your vocabulary with Bangla readings, parts of speech, simple meanings, and topic filters.',
      url: '/resources/1000-common-english-words-bangla/',
      badge: 'Available now',
      meta: `${formatNumber(wordCount)} words • ${formatNumber(topics.length)} topics`
    }
  },
  vocabulary: {
    title: '1,000 Common English Words with Bangla Meanings',
    shortTitle: '1,000 common English words',
    description: 'Learn 1,000 useful English words with Bangla readings, meanings, parts of speech, topic filters, and free vocabulary practice.',
    path: '/resources/1000-common-english-words-bangla/',
    hubPath: '/resources/',
    wordCount,
    wordCountLabel: formatNumber(wordCount),
    topicCount: topics.length,
    topicCountLabel: formatNumber(topics.length),
    levelsLabel: '',
    topics,
    words,
    ctaFooterContent: 'resource_1000_words_footer'
  }
};
