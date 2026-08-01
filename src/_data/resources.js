const fs = require('node:fs');
const path = require('node:path');

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

function loadBundleConfig(bundleRelativePath, loaderName) {
  const bundlePath = path.resolve(__dirname, bundleRelativePath);
  const bundleSource = fs.readFileSync(bundlePath, 'utf8');
  const escapedLoaderName = loaderName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const bundleMatch = bundleSource.match(new RegExp(`const q=(\\{a:\\d+,b:\\d+,c:\\[[\\s\\S]*?\\]\\});window\\.${escapedLoaderName}`));

  if (!bundleMatch) {
    throw new Error(`Unable to parse ${path.basename(bundlePath)}`);
  }

  return Function(`return (${bundleMatch[1].replace(/([,{])(a|b|c):/g, '$1"$2":')});`)();
}

function createVocabularyResource({
  bundleRelativePath,
  loaderName,
  title,
  shortTitle,
  description,
  pathName,
  ctaFooterContent
}) {
  const vocabularyWords = decodeBundle(loadBundleConfig(bundleRelativePath, loaderName));
  const topicMap = new Map();

  const words = vocabularyWords.map((entry) => {
    const categoryTitle = String(entry.category || '').trim();
    const normalizedEntry = {
      ...entry,
      category: categoryTitle,
      topicSlug: slugify(categoryTitle)
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
      posShort: posAbbreviations[normalizedEntry.part_of_speech?.toLowerCase?.() || normalizedEntry.part_of_speech] || normalizedEntry.part_of_speech
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

  return {
    title,
    shortTitle,
    description,
    path: pathName,
    hubPath: '/resources/',
    wordCount,
    wordCountLabel: formatNumber(wordCount),
    topicCount: topics.length,
    topicCountLabel: formatNumber(topics.length),
    levelsLabel: '',
    topics,
    words,
    ctaFooterContent
  };
}

const vocabulary = createVocabularyResource({
  bundleRelativePath: '../scripts/mane-resource.bundle.js',
  loaderName: '__loadMane1000Words',
  title: '1,000 Common English Words with Bangla Meanings',
  shortTitle: '1,000 common English words',
  description: 'Learn 1,000 useful English words with Bangla readings, meanings, parts of speech, topic filters, and free vocabulary practice.',
  pathName: '/resources/1000-common-english-words-bangla/',
  ctaFooterContent: 'resource_1000_words_footer'
});

const mostCommonVocabulary = createVocabularyResource({
  bundleRelativePath: '../scripts/site-data.bundle.js',
  loaderName: '__loadManeMostCommonWords',
  title: '4,000 Most Common English Words with Bangla Meanings',
  shortTitle: '4,000 most common English words',
  description: 'Browse 4,000 high-frequency English words with Bangla readings, meanings, parts of speech, topic filters, and example sentences.',
  pathName: '/resources/most-common-english-words-bangla/',
  ctaFooterContent: 'resource_most_common_words_footer'
});

module.exports = {
  hub: {
    title: 'Free English learning resources',
    description: 'Browse practical English-learning resources from Mane for Bangla-speaking learners.',
    featured: {
      title: vocabulary.title,
      description: 'Build your vocabulary with Bangla readings, parts of speech, simple meanings, and topic filters.',
      url: vocabulary.path,
      badge: 'Available now',
      meta: `${formatNumber(vocabulary.wordCount)} words • ${formatNumber(vocabulary.topicCount)} topics`
    },
    items: [
      {
        title: mostCommonVocabulary.title,
        description: 'Explore 4,000 high-frequency English words with Bangla readings, meanings, examples, and topic browse.',
        url: mostCommonVocabulary.path,
        badge: 'New',
        meta: `${formatNumber(mostCommonVocabulary.wordCount)} words • ${formatNumber(mostCommonVocabulary.topicCount)} topics`
      }
    ]
  },
  vocabulary,
  mostCommonVocabulary
};
