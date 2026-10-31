/* Three palette experiments + section-edge parallax.
   Separate from the legacy animation engine to avoid duplicated global loops. */
(() => {
  'use strict';

  const choices = ['sky', 'midnight', 'galactic'];
  const labels = { sky: '01', midnight: '02', galactic: '03' };
  const root = document.documentElement;
  const panel = document.getElementById('palettePanel');
  const trigger = document.getElementById('paletteTrigger');
  const count = document.getElementById('paletteTriggerCount');
  const options = Array.from(document.querySelectorAll('[data-portfolio-theme-choice]'));
  const storageKey = 'varun-portfolio-theme';

  function selectTheme(theme) {
    if (!choices.includes(theme)) return;
    root.dataset.portfolioTheme = theme;
    if (count) count.textContent = labels[theme];
    options.forEach(option => {
      option.setAttribute('aria-pressed', String(option.dataset.portfolioThemeChoice === theme));
      const check = option.querySelector('.palette-check');
      if (check) check.textContent = option.dataset.portfolioThemeChoice === theme ? '✓' : '';
    });
    try { window.localStorage.setItem(storageKey, theme); } catch (_) { /* private browsing */ }
  }

  function closePalette() {
    if (!panel || !trigger) return;
    panel.hidden = true;
    trigger.setAttribute('aria-expanded', 'false');
  }

  if (trigger && panel) {
    trigger.addEventListener('click', () => {
      panel.hidden = !panel.hidden;
      trigger.setAttribute('aria-expanded', String(!panel.hidden));
    });
    options.forEach(option => option.addEventListener('click', () => {
      selectTheme(option.dataset.portfolioThemeChoice);
      closePalette();
      trigger.focus();
    }));
    document.addEventListener('pointerdown', event => {
      if (!panel.hidden && !event.target.closest('.palette-lab')) closePalette();
    });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && !panel.hidden) { closePalette(); trigger.focus(); }
    });
  }
  selectTheme(choices.includes(root.dataset.portfolioTheme) ? root.dataset.portfolioTheme : 'sky');

  /* No cloned sections: one pair of atmospheric layers per existing section.
     The hero already has a mouse-driven 3D engine, so we only add scroll depth. */
  const sections = Array.from(document.querySelectorAll('section[id]'));
  sections.forEach(section => {
    section.dataset.portfolioDepth = '';
    const atmosphere = document.createElement('div');
    atmosphere.className = 'portfolio-atmosphere';
    atmosphere.setAttribute('aria-hidden', 'true');
    atmosphere.innerHTML = '<span class="portfolio-haze portfolio-haze--a"></span><span class="portfolio-haze portfolio-haze--b"></span>';
    section.prepend(atmosphere);

    const edge = document.createElement('span');
    edge.className = 'portfolio-edge';
    edge.setAttribute('aria-hidden', 'true');
    section.append(edge);
  });

  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (motionQuery.matches || !('IntersectionObserver' in window)) return;

  const visible = new Set();
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) visible.add(entry.target);
      else visible.delete(entry.target);
    });
    queueUpdate();
  }, { rootMargin: '25% 0px 25% 0px', threshold: 0 });
  sections.forEach(section => observer.observe(section));

  let raf = 0;
  function queueUpdate() {
    if (!raf) raf = window.requestAnimationFrame(updateDepth);
  }
  function updateDepth() {
    raf = 0;
    const height = Math.max(1, window.innerHeight);
    visible.forEach(section => {
      const r = section.getBoundingClientRect();
      const range = Math.max(height, r.height);
      const normalized = Math.max(-1, Math.min(1,
        (r.top + r.height * .5 - height * .5) / range
      ));
      const depth = -normalized * 46;
      section.style.setProperty('--depth-travel', depth.toFixed(2) + 'px');
      section.style.setProperty('--depth-travel-b', (-depth * .65).toFixed(2) + 'px');
      section.style.setProperty('--edge-travel', (normalized * 22).toFixed(2) + 'px');
    });
  }
  window.addEventListener('scroll', queueUpdate, { passive: true });
  window.addEventListener('resize', queueUpdate, { passive: true });
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) queueUpdate();
  });
  queueUpdate();
})();
