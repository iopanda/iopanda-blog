/**
 * AI 专栏侧栏树：首屏只带 5 个章标题和当前路径，其余节点从 /ai-tree.json
 * 按需拉取、展开时才插入。展开状态存在 localStorage。
 */
(() => {
  'use strict';

  const tree = document.querySelector('[data-ai-tree]');
  if (!tree) return;

  const OPEN_KEY = 'iopanda.aiTree.open';
  const SCROLL_KEY = 'iopanda.aiTree.scroll';
  const scroller = tree.closest('.ai-sidebar') || tree;
  const active = {
    chapter: tree.dataset.activeChapter || '',
    section: tree.dataset.activeSection || '',
    subsection: tree.dataset.activeSubsection || '',
    article: tree.dataset.activeArticle || '',
  };

  let saved = {};
  try {
    saved = JSON.parse(localStorage.getItem(OPEN_KEY) || '{}') || {};
  } catch (_) {
    saved = {};
  }

  let data = null;

  function persist() {
    try {
      localStorage.setItem(OPEN_KEY, JSON.stringify(saved));
    } catch (_) {
      /* localStorage 不可用时仅保留当前会话状态 */
    }
  }

  function dirOf(href) {
    const parts = String(href || '').split('/').filter(Boolean);
    return parts[parts.length - 1] || '';
  }

  function linkOf(item) {
    return item.querySelector(':scope > .tree-row > .tree-link');
  }

  function dirOfItem(item) {
    const anchor = linkOf(item);
    return anchor ? dirOf(anchor.getAttribute('href')) : '';
  }

  function titleOf(item) {
    const title = item.querySelector(':scope > .tree-row > .tree-link > .tree-title');
    return title ? title.textContent : '';
  }

  function span(className, text) {
    const element = document.createElement('span');
    element.className = className;
    element.textContent = text;
    return element;
  }

  function makeLink(className, href, number, title, current) {
    const anchor = document.createElement('a');
    anchor.className = 'tree-link ' + className;
    anchor.href = href;
    if (current) anchor.setAttribute('aria-current', 'page');
    anchor.append(span('tree-number', number), span('tree-title', title));
    return anchor;
  }

  function makeToggle(key, title, open) {
    const button = document.createElement('button');
    button.className = 'tree-toggle';
    button.setAttribute('aria-expanded', open ? 'true' : 'false');
    button.setAttribute('aria-label', `${open ? '收起' : '展开'} ${title}`);
    return button;
  }

  function makeRow(toggle, anchor) {
    const row = document.createElement('div');
    row.className = 'tree-row';
    if (toggle) {
      row.append(toggle);
    } else {
      const spacer = span('tree-spacer', '');
      spacer.setAttribute('aria-hidden', 'true');
      row.append(spacer);
    }
    row.append(anchor);
    return row;
  }

  function openState(key, current) {
    return current || (key in saved ? saved[key] === true : false);
  }

  function apply(item, open) {
    const toggle = item.querySelector(':scope > .tree-row > .tree-toggle');
    const children = item.querySelector(':scope > .tree-children');
    if (!toggle || !children) return;

    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    toggle.setAttribute('aria-label', `${open ? '收起' : '展开'} ${titleOf(item)}`);
    children.hidden = !open;
    item.classList.toggle('is-open', open);
  }

  function articleItem(article, direct) {
    const current = article.h === active.article;
    const item = document.createElement('li');
    item.className = 'tree-item tree-item--article' + (direct ? ' tree-item--direct' : '');
    if (current) item.classList.add('is-current-path');
    item.append(makeRow(null, makeLink('tree-link--article', article.h, article.n, article.t, current)));
    return item;
  }

  function subsectionItem(chapterDir, sectionDir, subsection) {
    const key = `subsection:${chapterDir}/${sectionDir}/${subsection.n}`;
    const current =
      chapterDir === active.chapter &&
      sectionDir === active.section &&
      subsection.n === active.subsection;
    const open = openState(key, current);
    const item = document.createElement('li');
    item.className = 'tree-item tree-item--subsection' + (current ? ' is-current-path' : '');
    item.dataset.nodeKey = key;
    item.__kind = 'subsection';
    item.__subsection = subsection;

    const children = document.createElement('ul');
    children.className = 'tree-children tree-children--articles';

    item.append(
      makeRow(
        makeToggle(key, subsection.t, open),
        makeLink(
          'tree-link--subsection',
          subsection.h,
          subsection.n,
          subsection.t,
          current && !active.article
        )
      ),
      children
    );

    if (open) {
      fillSubsection(item, subsection);
      item.dataset.filled = 'true';
    }
    apply(item, open);
    return item;
  }

  function sectionItem(chapterDir, section) {
    const key = `section:${chapterDir}/${section.n}`;
    const current = chapterDir === active.chapter && section.n === active.section;
    const open = openState(key, current);
    const item = document.createElement('li');
    item.className = 'tree-item tree-item--section' + (current ? ' is-current-path' : '');
    item.dataset.nodeKey = key;
    item.__kind = 'section';
    item.__chapterDir = chapterDir;
    item.__section = section;

    const children = document.createElement('ul');
    children.className = 'tree-children';

    item.append(
      makeRow(
        makeToggle(key, section.t, open),
        makeLink(
          'tree-link--section',
          section.h,
          section.n,
          section.t,
          current && !active.subsection && !active.article
        )
      ),
      children
    );

    if (open) {
      fillSection(item, chapterDir, section);
      item.dataset.filled = 'true';
    }
    apply(item, open);
    return item;
  }

  function fillSubsection(item, subsection) {
    const children = item.querySelector(':scope > .tree-children');
    children.textContent = '';
    for (const article of subsection.a || []) children.append(articleItem(article, false));
    item.dataset.filled = 'true';
  }

  function fillSection(item, chapterDir, section) {
    const children = item.querySelector(':scope > .tree-children');
    children.textContent = '';

    for (const subsection of section.s || []) {
      children.append(subsectionItem(chapterDir, section.n, subsection));
    }
    for (const article of section.a || []) children.append(articleItem(article, true));
    item.dataset.filled = 'true';
  }

  function fillChapter(item, chapter) {
    const chapterDir = dirOf(chapter.h);
    const children = item.querySelector(':scope > .tree-children');
    children.textContent = '';
    for (const section of chapter.s || []) children.append(sectionItem(chapterDir, section));
    item.dataset.filled = 'true';
  }

  function ensureChildren(item) {
    if (!data || item.dataset.filled === 'true') return;

    if (item.classList.contains('tree-item--chapter')) {
      const chapterDir = dirOfItem(item);
      const chapter = (data.c || []).find((entry) => dirOf(entry.h) === chapterDir);
      if (chapter) fillChapter(item, chapter);
      return;
    }

    if (item.__kind === 'section') {
      fillSection(item, item.__chapterDir, item.__section);
    } else if (item.__kind === 'subsection') {
      fillSubsection(item, item.__subsection);
    }
  }

  tree.addEventListener('click', (event) => {
    const toggle = event.target.closest ? event.target.closest('.tree-toggle') : null;
    if (!toggle || !tree.contains(toggle)) return;
    const item = toggle.closest('.tree-item');
    if (!item) return;

    ensureChildren(item);
    const open = toggle.getAttribute('aria-expanded') !== 'true';
    apply(item, open);

    const key = item.dataset.nodeKey;
    if (key) {
      saved[key] = open;
      persist();
    }
  });

  // 恢复上次的滚动位置。
  let scrollTop = 0;
  try {
    scrollTop = Number(localStorage.getItem(SCROLL_KEY) || 0) || 0;
  } catch (_) {
    scrollTop = 0;
  }
  function restoreScroll() {
    if (scrollTop <= 0) return;
    requestAnimationFrame(() => {
      scroller.scrollTop = scrollTop;
    });
  }

  let scrollTimer;
  scroller.addEventListener(
    'scroll',
    () => {
      window.clearTimeout(scrollTimer);
      scrollTimer = window.setTimeout(() => {
        try {
          localStorage.setItem(SCROLL_KEY, String(scroller.scrollTop));
        } catch (_) {
          /* ignore */
        }
      }, 150);
    },
    { passive: true }
  );

  // 首帧后拉取整棵树：只填充当前路径 / 上次展开的章，其余按需插入。
  fetch('/ai-tree.json', { headers: { Accept: 'application/json' } })
    .then((response) => {
      if (!response.ok) throw new Error('HTTP ' + response.status);
      return response.json();
    })
    .then((json) => {
      data = json && Array.isArray(json.c) ? json : null;
      if (!data) return;

      tree.querySelectorAll('.tree-root > .tree-item--chapter').forEach((item) => {
        const key = item.dataset.nodeKey;
        const current = dirOfItem(item) === active.chapter;
        if (!current && saved[key] !== true) return;
        ensureChildren(item);
        apply(item, true);
      });
    })
    .catch(() => {
      /* 拉取失败时保留服务端渲染的当前路径，侧栏仍可导航 */
    })
    .finally(restoreScroll);
})();
