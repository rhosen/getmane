const vocabularyWords = require('./mane-1000-common-english-words-final.json');

const topicDefinitions = [
  {
    slug: 'everyday-words-actions',
    title: 'Everyday Words & Actions',
    titleBn: 'দৈনন্দিন শব্দ ও কাজ',
    categories: [
      'everyday-actions',
      'change-and-development',
      'leisure-and-entertainment',
      'leisure-and-events',
      'sports-and-leisure',
      'abstract-and-everyday-concepts',
      'high-use-practical-verbs',
      'additional-common-nouns'
    ]
  },
  {
    slug: 'people-relationships',
    title: 'People & Relationships',
    titleBn: 'মানুষ ও সম্পর্ক',
    categories: [
      'people-and-family',
      'people-and-social-life',
      'people-and-relationships',
      'society-and-public-life',
      'people-and-life',
      'society-and-culture'
    ]
  },
  {
    slug: 'home-daily-life',
    title: 'Home & Daily Life',
    titleBn: 'ঘর ও দৈনন্দিন জীবন',
    categories: [
      'home-and-objects',
      'home-and-daily-life',
      'clothes-and-appearance',
      'everyday-objects',
      'daily-life-and-support',
      'daily-activities',
      'colors-and-appearance',
      'daily-life-and-habits'
    ]
  },
  {
    slug: 'study-work',
    title: 'Study & Work',
    titleBn: 'পড়াশোনা ও কাজ',
    categories: [
      'study-and-work',
      'work-and-creation',
      'people-and-work',
      'work-and-business',
      'education-and-learning',
      'mind-and-learning',
      'work-and-society'
    ]
  },
  {
    slug: 'communication-thinking',
    title: 'Communication & Thinking',
    titleBn: 'যোগাযোগ ও চিন্তা',
    categories: [
      'communication-and-thinking',
      'communication-and-language',
      'senses-and-communication',
      'responses-and-conversation'
    ]
  },
  {
    slug: 'feelings-wellbeing',
    title: 'Feelings & Wellbeing',
    titleBn: 'অনুভূতি ও সুস্থতা',
    categories: [
      'feelings-and-conditions',
      'feelings-and-emotions',
      'certainty-and-opinion'
    ]
  },
  {
    slug: 'food-money-shopping',
    title: 'Food, Money & Shopping',
    titleBn: 'খাবার, টাকা ও কেনাকাটা',
    categories: [
      'food-and-daily-life',
      'money-and-exchange',
      'shopping-and-services',
      'food-and-kitchen',
      'money-and-shopping',
      'food-and-drink',
      'food-descriptions'
    ]
  },
  {
    slug: 'travel-places',
    title: 'Travel & Places',
    titleBn: 'ভ্রমণ ও স্থান',
    categories: [
      'places-and-travel',
      'travel-and-movement',
      'people-and-travel',
      'travel-and-places',
      'public-places',
      'transport'
    ]
  },
  {
    slug: 'health-body',
    title: 'Health & Body',
    titleBn: 'স্বাস্থ্য ও শরীর',
    categories: [
      'feelings-and-health',
      'body-and-health',
      'health-and-wellbeing',
      'safety-and-emergencies',
      'health-descriptions'
    ]
  },
  {
    slug: 'nature-animals',
    title: 'Nature & Animals',
    titleBn: 'প্রকৃতি ও প্রাণী',
    categories: [
      'nature-and-weather',
      'animals-and-nature',
      'nature-and-society'
    ]
  },
  {
    slug: 'technology-media',
    title: 'Technology & Media',
    titleBn: 'প্রযুক্তি ও গণমাধ্যম',
    categories: [
      'technology-and-communication',
      'media-and-information',
      'technology-and-media',
      'work-and-technology'
    ]
  },
  {
    slug: 'descriptions-qualities',
    title: 'Descriptions & Qualities',
    titleBn: 'বর্ণনা ও গুণাবলি',
    categories: [
      'descriptions',
      'descriptions-and-qualities',
      'additional-common-descriptions'
    ]
  },
  {
    slug: 'time-position-grammar',
    title: 'Time, Position & Grammar',
    titleBn: 'সময়, অবস্থান ও প্রয়োজনীয় ব্যাকরণ',
    categories: [
      'time-and-frequency',
      'position-and-direction',
      'time-and-seasons',
      'time-and-concepts',
      'connectors-and-position',
      'connectors-and-time',
      'quantity-and-degree',
      'connectors-and-emphasis',
      'sequence-and-order',
      'connectors-and-choice',
      'time-and-degree',
      'pronouns-and-reference',
      'connectors-and-manner',
      'manner-and-degree',
      'time-and-manner',
      'questions-and-reference',
      'common-auxiliary-verbs'
    ]
  }
];

const posAbbreviations = {
  noun: 'n.',
  verb: 'v.',
  adjective: 'adj.',
  adverb: 'adv.',
  pronoun: 'pron.',
  determiner: 'det.',
  preposition: 'prep.',
  conjunction: 'conj.',
  'auxiliary verb': 'aux.',
  'modal verb': 'modal'
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

const categoryToTopic = new Map();

topicDefinitions.forEach((topic) => {
  topic.categories.forEach((category) => categoryToTopic.set(category, topic.slug));
});

const words = vocabularyWords.map((entry) => {
  const normalizedEntry = {
    ...entry,
    sequence: entry.sequence ?? entry.rank,
    pronunciation_bn: entry.pronunciation_bn ?? entry.pronunciation,
    bangla_meaning: entry.bangla_meaning ?? entry.meaning_bn,
    level: entry.level ?? entry.cefr,
    topicSlug: slugify(entry.category)
  };
  return {
    ...normalizedEntry,
    id: `word-${slugify(normalizedEntry.word)}-${normalizedEntry.sequence}`,
    posShort: posAbbreviations[normalizedEntry.part_of_speech?.toLowerCase?.() || normalizedEntry.part_of_speech] || normalizedEntry.part_of_speech,
    searchText: [
      normalizedEntry.word,
      normalizedEntry.pronunciation_bn,
      normalizedEntry.bangla_meaning,
      normalizedEntry.part_of_speech,
      normalizedEntry.category,
      normalizedEntry.level,
      normalizedEntry.topicSlug
    ].join(' ')
  };
});

const topicMap = new Map();

words.forEach((word) => {
  if (!topicMap.has(word.topicSlug)) {
    topicMap.set(word.topicSlug, {
      slug: word.topicSlug,
      title: word.category,
      titleBn: '',
      words: []
    });
  }

  topicMap.get(word.topicSlug).words.push(word);
});

const topics = [...topicMap.values()].map((topic, index) => ({
  ...topic,
  number: String(index + 1).padStart(2, '0'),
  id: `topic-${topic.slug}`,
  count: topic.words.length,
  countLabel: formatNumber(topic.words.length)
}));

const wordCount = words.length;
const levelCounts = ['A1', 'A2', 'B1'].map((level) => ({
  level,
  count: words.filter((word) => word.level === level).length
}));

module.exports = {
  hub: {
    title: 'Free English learning resources',
    description: 'Helpful vocabulary resources for Bangla-speaking English learners from Mane.',
    items: [
      {
        title: '1,000 Common English Words with Bangla Meanings',
        description: 'Build your vocabulary with Bangla readings, parts of speech, simple meanings, and topic filters.',
        url: '/resources/1000-common-english-words-bangla/',
        badge: '1,000 words'
      }
    ]
  },
  vocabulary: {
    title: '1,000 Common English Words with Bangla Meanings',
    shortTitle: '1,000 common English words',
    description: 'Learn 1,000 useful English words with Bangla readings, meanings, parts of speech, topic filters, and free vocabulary practice.',
    intro: 'Build practical vocabulary with Bangla readings, parts of speech, and clear Bangla meanings—organized into useful topics for faster review.',
    note: 'Bangla reading is an approximate pronunciation guide. Listening to native audio is still the best way to learn exact pronunciation.',
    // Set to published PDF path or absolute URL to enable download button.
    pdfUrl: '',
    path: '/resources/1000-common-english-words-bangla/',
    hubPath: '/resources/',
    wordCount,
    wordCountLabel: formatNumber(wordCount),
    topicCount: topics.length,
    topicCountLabel: formatNumber(topics.length),
    levelsLabel: '',
    levelCounts,
    topics,
    words,
    ctaIntroContent: 'resource_1000_words_intro',
    ctaFooterContent: 'resource_1000_words_footer'
  }
};
