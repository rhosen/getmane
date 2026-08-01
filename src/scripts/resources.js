(() => {
  const resourceRoot = document.querySelector('[data-resource-page]');
  if (!resourceRoot) return;

  const searchInput = document.getElementById('word-search');
  const resetButton = document.getElementById('reset-filters');
  const topicLinks = [...document.querySelectorAll('[data-topic-filter]')];
  const allTopicsLink = topicLinks.find((link) => link.dataset.topicFilter === 'all');
  const defaultTopic = topicLinks.find((link) => link.dataset.topicFilter !== 'all')?.dataset.topicFilter || 'all';
  const cards = [...document.querySelectorAll('.resource-topic-card')];
  const rows = [...document.querySelectorAll('.resource-word-row')];
  const searchResultsSection = document.getElementById('resource-search-results');
  const searchResultsCount = document.getElementById('resource-search-results-count');
  const searchCards = [...document.querySelectorAll('[data-search-card]')];
  const browseSection = document.getElementById('resource-browse-section');
  const emptyState = document.getElementById('resource-empty-state');
  const playStoreLinks = [...document.querySelectorAll('[data-resource-play-store]')];
  const pdfLink = document.querySelector('[data-resource-pdf]');

  let activeTopic = 'all';
  let lastTrackedSearch = '';
  let searchTimer;

  const normalize = (value) => String(value || '').toLocaleLowerCase('bn-BD').trim();

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

  function updateFilters() {
    const query = normalize(searchInput.value);
    if (query) {
      let totalVisible = 0;

      searchCards.forEach((card) => {
        const visible = normalize(card.dataset.search).includes(query);
        card.hidden = !visible;
        if (visible) totalVisible += 1;
      });

      if (searchResultsSection) searchResultsSection.hidden = false;
      if (browseSection) browseSection.hidden = true;
      if (searchResultsCount) {
        searchResultsCount.textContent = `${totalVisible.toLocaleString('en-US')} matching word${totalVisible === 1 ? '' : 's'}.`;
      }
      emptyState.hidden = totalVisible !== 0;
      return;
    }

    if (searchResultsSection) searchResultsSection.hidden = true;
    if (browseSection) browseSection.hidden = false;

    let totalVisible = 0;

    cards.forEach((card) => {
      const topicMatches = activeTopic === 'all' || card.dataset.topic === activeTopic;
      let visibleRows = 0;

      card.querySelectorAll('.resource-word-row').forEach((row) => {
        const visible = topicMatches;
        row.hidden = !visible;
        if (visible) visibleRows += 1;
      });

      const cardVisible = topicMatches && visibleRows > 0;
      card.hidden = !cardVisible;
      card.querySelector('.resource-topic-visible-count').textContent = visibleRows.toLocaleString('en-US');

      if (cardVisible) {
        totalVisible += visibleRows;
      }

      if (activeTopic === 'all') {
        card.open = false;
      } else {
        card.open = cardVisible;
      }
    });

    emptyState.hidden = true;
  }

  function trackSearchIfNeeded() {
    clearTimeout(searchTimer);
    searchTimer = window.setTimeout(() => {
      const query = normalize(searchInput.value);
      if (query.length < 2 || query === lastTrackedSearch) return;
      lastTrackedSearch = query;
      trackEvent('resource_search', {
        resource_name: resourceRoot.dataset.resourceName,
        query,
        results: rows.filter((row) => !row.hidden).length
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
    allTopicsLink.setAttribute('aria-current', 'false');
    allTopicsLink.classList.remove('is-active');
  }

  setActiveTopic(defaultTopic);
  updateFilters();
})();
