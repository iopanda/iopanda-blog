/** 文章阅读进度条 + 本页目录高亮。 */
(() => {
  'use strict';

  const bar = document.querySelector('[data-reading-progress-bar]');
  if (bar) {
    const update = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      const ratio = max > 0 ? doc.scrollTop / max : 0;
      bar.style.width = `${Math.min(100, Math.max(0, ratio * 100))}%`;
    };
    document.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
  }

  const toc = document.querySelector('[data-ai-toc]');
  if (!toc) return;
  const links = Array.from(toc.querySelectorAll('a[href^="#"]'));
  const entries = links
    .map((link) => {
      const id = decodeURIComponent((link.getAttribute('href') || '').slice(1));
      const heading = document.getElementById(id);
      return heading ? { link, heading } : null;
    })
    .filter(Boolean);
  if (entries.length === 0) return;

  const updateToc = () => {
    let active = entries[0];
    for (const entry of entries) {
      if (entry.heading.getBoundingClientRect().top <= 140) active = entry;
      else break;
    }
    for (const entry of entries) {
      const on = entry === active;
      entry.link.classList.toggle('is-active', on);
      if (on) entry.link.setAttribute('aria-current', 'location');
      else entry.link.removeAttribute('aria-current');
    }
  };

  document.addEventListener('scroll', updateToc, { passive: true });
  window.addEventListener('resize', updateToc);
  updateToc();
})();
