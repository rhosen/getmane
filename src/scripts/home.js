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

window.__m?.();

const sampleSearchInput = document.querySelector('#sample-search-input');
const sampleSearchPlaceholder = document.querySelector('.search-demo-placeholder');
const sampleSearchBox = sampleSearchInput?.closest('.search-box');

if (sampleSearchInput && sampleSearchPlaceholder && sampleSearchBox) {
  const demoText = 'Search English, বাংলা, or Banglish';
  let demoIndex = 0;
  let isDeleting = false;
  let demoTimer;
  let isDemoRunning = false;

  const clearDemoTimer = () => {
    clearTimeout(demoTimer);
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

  sampleSearchInput.addEventListener('focus', () => {
    if (!sampleSearchInput.value) startDemoPlaceholder();
  });

  sampleSearchInput.addEventListener('blur', () => {
    if (!sampleSearchInput.value) startDemoPlaceholder({ reset: true });
  });

  sampleSearchInput.addEventListener('input', () => {
    if (sampleSearchInput.value) {
      stopDemoPlaceholder();
      return;
    }

    startDemoPlaceholder({ reset: true });
  });

  sampleSearchInput.addEventListener('pointerdown', stopDemoPlaceholder);
  sampleSearchInput.addEventListener('keydown', stopDemoPlaceholder);

  startDemoPlaceholder({ reset: true });
}
