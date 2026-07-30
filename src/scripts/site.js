const mobileNavToggles = document.querySelectorAll('.mobile-nav-toggle');

mobileNavToggles.forEach((toggle) => {
  const navId = toggle.getAttribute('aria-controls');
  const nav = navId ? document.getElementById(navId) : null;

  if (!nav) return;

  toggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(isOpen));
    toggle.setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation');
  });
});
