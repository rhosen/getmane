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

function createSentenceResource({
  sourceRelativePath,
  title,
  shortTitle,
  description,
  pathName,
  ctaFooterContent
}) {
  const sourcePath = path.resolve(__dirname, sourceRelativePath);
  const source = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
  const topicMap = new Map();
  const hasNestedTopics = Array.isArray(source.topics) && source.topics.length > 0;

  const sourceEntries = hasNestedTopics
    ? source.topics.flatMap((topic) => {
      const topicTitle = String(topic.title || '').trim();
      const topicSlug = slugify(topic.slug || topicTitle);

      return (topic.groups || []).flatMap((group) => {
        const groupTitle = String(group.title || '').trim();

        return (group.items || []).map((entry) => ({
          ...entry,
          category: topicTitle,
          group: groupTitle,
          topicTitle,
          topicSlug,
          topicSummary: topic.summary || ''
        }));
      });
    })
    : source.sentences;

  const sentences = sourceEntries.map((entry, index) => {
    const categoryTitle = String(entry.category || '').trim();
    const topicSlug = slugify(entry.topicSlug || categoryTitle);
    const normalizedEntry = {
      ...entry,
      sequence: hasNestedTopics ? index + 1 : entry.id,
      category: categoryTitle,
      topicSlug
    };

    if (!topicMap.has(topicSlug)) {
      topicMap.set(topicSlug, {
        slug: topicSlug,
        title: normalizedEntry.category,
        titleBn: '',
        summary: entry.topicSummary || '',
        groupCount: 0,
        sentences: []
      });
    }

    const sentence = {
      ...normalizedEntry,
      id: `sentence-${normalizedEntry.sequence}`
    };

    topicMap.get(topicSlug).sentences.push(sentence);
    return sentence;
  });

  const topicSource = hasNestedTopics && Array.isArray(source.topics) && source.topics.length
    ? source.topics
    : Array.isArray(source.categories) && source.categories.length
      ? source.categories
      : [...topicMap.values()].map((topic) => ({
        name: topic.title,
        count: topic.sentences.length
      }));

  const topics = topicSource.map((topic, index) => {
    const topicTitle = String(topic.name || topic.title || '').trim();
    const topicSlug = slugify(topic.slug || topicTitle);
    const topicEntry = topicMap.get(topicSlug);
    const sentenceCount = topicEntry ? topicEntry.sentences.length : 0;
    const groupCount = Array.isArray(topic.groups) ? topic.groups.length : 0;

    return {
      slug: topicSlug,
      title: topicTitle,
      titleBn: '',
      summary: topic.summary || topicEntry?.summary || '',
      sentences: topicEntry ? topicEntry.sentences : [],
      number: String(index + 1).padStart(2, '0'),
      id: `topic-${topicSlug}`,
      count: sentenceCount,
      countLabel: formatNumber(sentenceCount),
      groupCount,
      groupCountLabel: formatNumber(groupCount)
    };
  });

  const sentenceCount = sentences.length;

  return {
    title,
    shortTitle,
    description,
    path: pathName,
    hubPath: '/resources/',
    wordCount: sentenceCount,
    wordCountLabel: formatNumber(sentenceCount),
    topicCount: topics.length,
    topicCountLabel: formatNumber(topics.length),
    levelsLabel: '',
    topics,
    sentences,
    ctaFooterContent
  };
}

const spokenEnglishSentences = createSentenceResource({
  sourceRelativePath: './spoken-english.json',
  title: '1200+ Spoken English Sentences with Bangla Meaning',
  shortTitle: '1200+ spoken English sentences',
  description: 'Practical spoken English sentences with Bangla meanings, organized into everyday speaking situations and topic-based lessons.',
  pathName: '/resources/1200-spoken-english-sentences-bangla/',
  ctaFooterContent: 'resource_spoken_english_footer'
});

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

const dailyUseSentences = createSentenceResource({
  sourceRelativePath: '../_data/500-daily-use-english-sentences-with-bangla-meaning.json',
  title: '500 Daily-Use English Sentences with Bangla Meaning',
  shortTitle: '500 daily-use English sentences',
  description: 'A practical collection of 500 everyday English sentences with natural Bangla translations, organized into 20 useful categories.',
  pathName: '/resources/500-daily-use-english-sentences-bangla/',
  ctaFooterContent: 'resource_daily_sentences_footer'
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
      },
      {
        title: dailyUseSentences.title,
        description: 'Practice 500 daily-use English sentences with Bangla translations across 20 practical categories.',
        url: dailyUseSentences.path,
        badge: 'New',
        meta: `${formatNumber(dailyUseSentences.wordCount)} sentences • ${formatNumber(dailyUseSentences.topicCount)} topics`
      },
      {
        title: spokenEnglishSentences.title,
        description: 'Browse 1,200+ spoken English sentences with Bangla meanings for everyday communication and conversation practice.',
        url: spokenEnglishSentences.path,
        badge: 'New',
        meta: `${formatNumber(spokenEnglishSentences.wordCount)} sentences • ${formatNumber(spokenEnglishSentences.topicCount)} topics`
      }
    ]
  },
  vocabulary,
  mostCommonVocabulary,
  dailyUseSentences,
  spokenEnglishSentences
};
