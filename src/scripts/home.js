const statusTime = document.querySelector('#status-time');

if (statusTime) {
  const updateStatusTime = () => {
    statusTime.textContent = new Date().toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  updateStatusTime();
  setInterval(updateStatusTime, 1000);
}

const sampleSearchInput = document.querySelector('#sample-search-input');
const sampleSearchPlaceholder = document.querySelector('.search-demo-placeholder');
const sampleSearchBox = sampleSearchInput?.closest('.search-box');
const wordCardLabel = document.querySelector('#word-card-label');
const wordCardTitle = document.querySelector('#word-card-title');
const wordCardPronunciation = document.querySelector('#word-card-pronunciation');
const wordCardTranslation = document.querySelector('#word-card-translation');
const wordCardDescription = document.querySelector('#word-card-description');
const searchDataset = typeof window.__loadManeMostCommonWords === 'function' ? window.__loadManeMostCommonWords() : [];
const defaultWord = searchDataset[0] || null;

const normalize = (value) => String(value || '').toLocaleLowerCase('bn-BD').trim();

function renderWordCard(entry, { unavailable = false } = {}) {
  if (!wordCardTitle || !wordCardPronunciation || !wordCardTranslation || !wordCardDescription || !wordCardLabel) return;

  wordCardTitle.classList.toggle('word-card-title--small', unavailable);

  if (unavailable) {
    wordCardLabel.hidden = true;
    wordCardTitle.textContent = 'Not found';
    wordCardPronunciation.textContent = '/full dictionary/';
    wordCardTranslation.textContent = 'Download Mane to look it up.';
    wordCardDescription.textContent = 'This word is not in the preview list.';
    return;
  }

  if (!entry) return;

  wordCardLabel.hidden = !entry.sequence;
  wordCardLabel.textContent = entry.sequence ? `#${entry.sequence}` : '';
  wordCardTitle.textContent = entry.word || 'meaning';
  wordCardPronunciation.textContent = entry.pronunciation_bn ? `/${entry.pronunciation_bn}/` : '/ˈmiː.nɪŋ/';
  wordCardTranslation.textContent = entry.bangla_meaning || 'অর্থ, মানে';
  wordCardDescription.textContent = entry.example_en || 'The idea or message that a word, sentence, or action expresses.';
}

function findExactMatch(query) {
  const normalizedQuery = normalize(query);
  if (!normalizedQuery) return defaultWord;

  return searchDataset.find((entry) => [
    entry.word,
    entry.pronunciation_bn,
    entry.bangla_meaning,
    entry.part_of_speech,
    entry.category,
    entry.example_en,
    entry.example_bn
  ].some((field) => normalize(field) === normalizedQuery));
}

if (sampleSearchInput && sampleSearchPlaceholder && sampleSearchBox) {
  const demoText = 'Search English, বাংলা, or Banglish';
  let demoIndex = 0;
  let isDeleting = false;
  let demoTimer;
  let idleTimer;
  let isDemoRunning = false;

  const clearDemoTimer = () => {
    clearTimeout(demoTimer);
  };

  const clearIdleTimer = () => {
    clearTimeout(idleTimer);
  };

  const renderDemoPlaceholder = () => {
    sampleSearchPlaceholder.textContent = demoText.slice(0, demoIndex);
  };

  const stopDemoPlaceholder = () => {
    isDemoRunning = false;
    clearDemoTimer();
    sampleSearchBox.classList.remove('is-demo-active');
    sampleSearchPlaceholder.classList.add('is-hidden');
  };

  const typeDemoPlaceholder = () => {
    if (!isDemoRunning) return;

    renderDemoPlaceholder();

    if (!isDeleting && demoIndex < demoText.length) {
      demoIndex += 1;
      demoTimer = setTimeout(typeDemoPlaceholder, 70);
      return;
    }

    if (!isDeleting) {
      isDeleting = true;
      demoTimer = setTimeout(typeDemoPlaceholder, 1800);
      return;
    }

    if (demoIndex > 0) {
      demoIndex -= 1;
      demoTimer = setTimeout(typeDemoPlaceholder, 35);
      return;
    }

    isDeleting = false;
    demoTimer = setTimeout(typeDemoPlaceholder, 500);
  };

  const startDemoPlaceholder = ({ reset = false } = {}) => {
    if (sampleSearchInput.value) {
      stopDemoPlaceholder();
      return;
    }

    if (reset) {
      demoIndex = 0;
      isDeleting = false;
      renderDemoPlaceholder();
    }

    sampleSearchBox.classList.add('is-demo-active');
    sampleSearchPlaceholder.classList.remove('is-hidden');

    if (isDemoRunning) return;

    isDemoRunning = true;
    clearDemoTimer();
    typeDemoPlaceholder();
  };

  const syncPreview = ({ commit = false } = {}) => {
    const query = sampleSearchInput.value.trim();

    if (!query) {
      renderWordCard(defaultWord);
      if (commit) startDemoPlaceholder({ reset: true });
      return;
    }

    const match = findExactMatch(query);
    if (match) {
      renderWordCard(match);
      return;
    }

    if (commit) {
      renderWordCard(null, { unavailable: true });
    }
  };

  sampleSearchInput.addEventListener('focus', () => {
    stopDemoPlaceholder();
    syncPreview();
  });

  sampleSearchInput.addEventListener('blur', () => {
    clearIdleTimer();
    syncPreview({ commit: true });
  });

  sampleSearchInput.addEventListener('input', () => {
    clearIdleTimer();
    syncPreview();

    if (sampleSearchInput.value.trim()) {
      idleTimer = setTimeout(() => syncPreview({ commit: true }), 450);
    }
  });

  sampleSearchInput.addEventListener('pointerdown', stopDemoPlaceholder);
  sampleSearchInput.addEventListener('keydown', stopDemoPlaceholder);

  renderWordCard(defaultWord);
  startDemoPlaceholder({ reset: true });
  syncPreview();
}

window.__m = () => {
  if (defaultWord) {
    renderWordCard(defaultWord);
  }
};

window.__m?.();
