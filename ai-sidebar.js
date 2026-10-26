/** AI 专栏侧栏的折叠 / 移动端抽屉交互。 */
(() => {
  'use strict';

  const layout = document.querySelector('[data-ai-layout]');
  const sidebar = document.querySelector('[data-ai-sidebar-open]');
  const collapse = document.querySelector('[data-ai-sidebar-collapse]');
  const overlay = document.querySelector('[data-ai-overlay]');
  const panel = document.getElementById('ai-sidebar');
  if (!layout || !sidebar || !panel) return;

  const COLLAPSE_KEY = 'iopanda.aiSidebar.collapsed';
  const mobileQuery = window.matchMedia('(max-width: 1100px)');

  function readCollapsed() {
    try {
      return localStorage.getItem(COLLAPSE_KEY) === '1';
    } catch (_) {
      return false;
    }
  }

  function setCollapsed(collapsed) {
    layout.setAttribute('data-sidebar-collapsed', collapsed ? 'true' : 'false');
    try {
      localStorage.setItem(COLLAPSE_KEY, collapsed ? '1' : '0');
    } catch (_) {
      /* ignore */
    }
  }

  function setDrawer(open) {
    layout.setAttribute('data-drawer-open', open ? 'true' : 'false');
    sidebar.setAttribute('aria-expanded', open ? 'true' : 'false');
    sidebar.setAttribute('aria-label', open ? '关闭专栏目录' : '打开专栏目录');
    if (overlay) overlay.hidden = !open;
    document.body.classList.toggle('is-drawer-open', open);
  }

  setCollapsed(readCollapsed());

  sidebar.addEventListener('click', () => {
    if (mobileQuery.matches) setDrawer(layout.getAttribute('data-drawer-open') !== 'true');
    else setCollapsed(false);
  });

  collapse?.addEventListener('click', () => {
    if (mobileQuery.matches) setDrawer(false);
    else {
      setCollapsed(true);
      sidebar.focus?.();
    }
  });

  overlay?.addEventListener('click', () => setDrawer(false));

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && layout.getAttribute('data-drawer-open') === 'true') {
      setDrawer(false);
      sidebar.focus();
    }
  });

  mobileQuery.addEventListener('change', (event) => {
    if (!event.matches) setDrawer(false);
  });
})();
