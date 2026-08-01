(() => {
  const resourceRoot = document.querySelector('[data-resource-page]');
  if (!resourceRoot) return;

  const searchInput = document.getElementById('word-search');
  const resetButton = document.getElementById('reset-filters');
  const topicLinks = [...document.querySelectorAll('[data-topic-filter]')];
  const allTopicsLink = topicLinks.find((link) => link.dataset.topicFilter === 'all');
  const defaultTopic = 'all';
  const cards = [...document.querySelectorAll('.resource-topic-card')];
  const defaultOpenCardIds = new Set(cards.filter((card) => card.open).map((card) => card.id));
  const rows = [...document.querySelectorAll('.resource-sentence-row')];
  const searchResultsSection = document.getElementById('resource-search-results');
  const searchResultsCount = document.getElementById('resource-search-results-count');
  const searchResultsGrid = document.getElementById('resource-search-results-grid');
  const browseSection = document.getElementById('resource-browse-section');
  const emptyState = document.getElementById('resource-empty-state');
  const playStoreLinks = [...document.querySelectorAll('[data-resource-play-store]')];
  const pdfLink = document.querySelector('[data-resource-pdf]');
  const loaderName = resourceRoot.dataset.resourceLoader;
  const searchDataset = typeof window[loaderName] === 'function' ? window[loaderName]() : [];

  let activeTopic = 'all';
  let lastTrackedSearch = '';
  let searchTimer;
  let lastRenderedQuery = '';
  let lastRenderedMatches = [];

  const normalize = (value) => String(value || '').toLocaleLowerCase('bn-BD').trim();
  const escapeHtml = (value) => String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

  function trackEvent(name, params = {}) {
    const payload = { event_category: 'resources', ...params };

    if (typeof window.gtag === 'function') {
      window.gtag('event', name, payload);
      return;
    }

    if (Array.isArray(window.dataLayer)) {
      window.dataLayer.push({ event: name, ...payload });
    }
  }

  function setActiveTopic(topic) {
    activeTopic = topic;
    topicLinks.forEach((link) => {
      const active = link.dataset.topicFilter === topic;
      link.classList.toggle('is-active', active);
      link.setAttribute('aria-current', active ? 'page' : 'false');
    });
  }

  function entrySearchText(entry) {
    if (!entry.__searchText) {
      entry.__searchText = normalize([
        entry.english,
        entry.bangla,
        entry.category
      ].filter(Boolean).join(' '));
    }

    return entry.__searchText;
  }

  function findMatches(query) {
    if (!query) return [];
    if (query === lastRenderedQuery) return lastRenderedMatches;

    const matches = searchDataset.filter((entry) => entrySearchText(entry).includes(query));
    lastRenderedQuery = query;
    lastRenderedMatches = matches;
    return matches;
  }

  function renderSearchResults(query) {
    if (!searchResultsGrid) return 0;

    const matches = findMatches(query);

    searchResultsGrid.innerHTML = matches.map((entry) => `
      <article class="resource-search-card">
        <div class="resource-search-card__top">
          <span class="resource-search-card__sequence">#${escapeHtml(entry.sequence)}</span>
        </div>
        <h3>${escapeHtml(entry.english)}</h3>
        <p class="resource-search-card__meaning" lang="bn">${escapeHtml(entry.bangla)}</p>
        <dl class="resource-search-card__meta">
          <div>
            <dt>Topic</dt>
            <dd>${escapeHtml(entry.category)}</dd>
          </div>
        </dl>
      </article>
    `).join('');

    return matches.length;
  }

  function updateFilters() {
    const query = normalize(searchInput.value);

    if (!query) {
      lastRenderedQuery = '';
      lastRenderedMatches = [];
    }

    if (query) {
      const totalVisible = renderSearchResults(query);

      if (searchResultsSection) searchResultsSection.hidden = false;
      if (browseSection) browseSection.hidden = true;
      if (searchResultsCount) {
        searchResultsCount.textContent = `${totalVisible.toLocaleString('en-US')} matching sentence${totalVisible === 1 ? '' : 's'}.`;
      }
      emptyState.hidden = totalVisible !== 0;
      return;
    }

    if (searchResultsSection) searchResultsSection.hidden = true;
    if (browseSection) browseSection.hidden = false;

    cards.forEach((card) => {
      const topicMatches = activeTopic === 'all' || card.dataset.topic === activeTopic;
      let visibleRows = 0;

      card.querySelectorAll('.resource-sentence-row').forEach((row) => {
        const visible = topicMatches;
        row.hidden = !visible;
        if (visible) visibleRows += 1;
      });

      const cardVisible = topicMatches && visibleRows > 0;
      card.hidden = !cardVisible;
      card.querySelector('.resource-topic-visible-count').textContent = visibleRows.toLocaleString('en-US');
      card.open = activeTopic === 'all' ? defaultOpenCardIds.has(card.id) : cardVisible;
    });

    emptyState.hidden = true;
  }

  function trackSearchIfNeeded() {
    clearTimeout(searchTimer);
    searchTimer = window.setTimeout(() => {
      const query = normalize(searchInput.value);
      if (query.length < 2 || query === lastTrackedSearch) return;
      lastTrackedSearch = query;
      const results = lastRenderedQuery === query ? lastRenderedMatches.length : findMatches(query).length;
      trackEvent('resource_search', {
        resource_name: resourceRoot.dataset.resourceName,
        query,
        results
      });
    }, 700);
  }

  topicLinks.forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      const topic = link.dataset.topicFilter;
      setActiveTopic(topic);
      updateFilters();
      const targetId = topic === 'all' ? 'resource-topics' : `topic-${topic}`;
      document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      trackEvent('resource_topic_selected', {
        resource_name: resourceRoot.dataset.resourceName,
        topic
      });
    });
  });

  searchInput.addEventListener('input', () => {
    updateFilters();
    trackSearchIfNeeded();
  });

  resetButton.addEventListener('click', () => {
    searchInput.value = '';
    lastTrackedSearch = '';
    if (searchResultsGrid) searchResultsGrid.innerHTML = '';
    lastRenderedQuery = '';
    lastRenderedMatches = [];
    setActiveTopic(defaultTopic);
    updateFilters();
    searchInput.focus();
  });

  playStoreLinks.forEach((link) => {
    link.addEventListener('click', () => {
      trackEvent('resource_play_store_click', {
        resource_name: resourceRoot.dataset.resourceName,
        placement: link.dataset.resourcePlayStore
      });
    });
  });

  pdfLink?.addEventListener('click', () => {
    trackEvent('pdf_download', {
      resource_name: resourceRoot.dataset.resourceName
    });
  });

  trackEvent('resource_view', {
    resource_name: resourceRoot.dataset.resourceName,
    word_count: rows.length
  });

  if (allTopicsLink) {
    allTopicsLink.setAttribute('aria-current', 'page');
    allTopicsLink.classList.add('is-active');
  }

  setActiveTopic(defaultTopic);
  updateFilters();
})();
