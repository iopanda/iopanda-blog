/** 主题切换：system → light → dark 循环，选择写入 localStorage。 */
(() => {
  'use strict';

  const root = document.documentElement;
  const storageKey = 'iopanda.theme';
  const order = ['system', 'light', 'dark'];
  const labels = { system: '跟随系统', light: '浅色', dark: '深色' };
  const colorScheme = window.matchMedia('(prefers-color-scheme: dark)');

  function currentPref() {
    const value = root.dataset.themePref;
    return value === 'light' || value === 'dark' ? value : 'system';
  }

  function apply(next) {
    const resolved = next === 'system' ? (colorScheme.matches ? 'dark' : 'light') : next;
    root.dataset.theme = resolved;
    root.dataset.themePref = next;

    document.querySelectorAll('[data-theme-toggle]').forEach((button) => {
      button.setAttribute('aria-label', `切换主题：当前${labels[next]}`);
      button.setAttribute('title', `主题：${labels[next]}（点击切换）`);
    });
  }

  colorScheme.addEventListener('change', () => {
    if (currentPref() === 'system') apply('system');
  });

  document.querySelectorAll('[data-theme-toggle]').forEach((button) => {
    button.addEventListener('click', () => {
      const index = order.indexOf(currentPref());
      const next = order[(index + 1) % order.length];
      try {
        localStorage.setItem(storageKey, next);
      } catch (_) {
        /* 忽略隐私模式下的写入失败 */
      }
      apply(next);
    });
  });

  apply(currentPref());
})();
