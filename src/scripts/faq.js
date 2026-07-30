const faqShowcases = document.querySelectorAll('.faq-showcase');

faqShowcases.forEach((showcase) => {
  const filterButtons = showcase.querySelectorAll('[data-faq-filter]');
  const faqItems = showcase.querySelectorAll('[data-faq-category]');

  if (!filterButtons.length || !faqItems.length) return;

  const setFaqFilter = (filterKey) => {
    filterButtons.forEach((button) => {
      const isActive = button.dataset.faqFilter === filterKey;
      button.classList.toggle('is-active', isActive);
      button.setAttribute('aria-selected', String(isActive));
    });

    faqItems.forEach((item) => {
      const matches = filterKey === 'all' || item.dataset.faqCategory === filterKey;
      item.classList.toggle('is-hidden', !matches);

      if (!matches) {
        item.removeAttribute('open');
      }
    });
  };

  filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      setFaqFilter(button.dataset.faqFilter || 'all');
    });
  });

  const activeButton = showcase.querySelector('[data-faq-filter].is-active');
  setFaqFilter(activeButton?.dataset.faqFilter || 'all');
});
