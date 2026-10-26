/**
 * AI 专栏关系图：手写的力导向布局 + Canvas 渲染，没有任何第三方依赖。
 *
 * 数据来自构建期生成的 /ai-graph.json：
 *   nodes: [{ id, n, t, c, s, sub, href, deg }]
 *   edges: [[sourceIndex, targetIndex], ...]
 *
 * 布局用简化 Barnes-Hut 四叉树做斥力、边做弹簧、中心引力收束。
 */
(() => {
  'use strict';

  const page = document.querySelector('[data-graph-page]');
  if (!page) return;

  const stage = page.querySelector('[data-graph-stage]');
  const canvas = page.querySelector('[data-graph-canvas]');
  const ctx = canvas ? canvas.getContext('2d') : null;
  if (!stage || !canvas || !ctx) return;

  const loading = page.querySelector('[data-graph-loading]');
  const tooltip = page.querySelector('[data-graph-tooltip]');
  const tooltipN = page.querySelector('[data-graph-tooltip-n]');
  const tooltipTitle = page.querySelector('[data-graph-tooltip-title]');
  const tooltipMeta = page.querySelector('[data-graph-tooltip-meta]');
  const statusEl = page.querySelector('[data-graph-status]');
  const chapterList = page.querySelector('[data-graph-chapters]');
  const searchEl = page.querySelector('[data-graph-search]');
  const resetEl = page.querySelector('[data-graph-reset]');
  const showAllEl = page.querySelector('[data-graph-showall]');

  const DATA_SRC = canvas.getAttribute('data-src') || '/ai-graph.json';
  const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const MOBILE = window.matchMedia('(max-width: 720px)').matches;

  // 力导向参数：550 个节点以内，这套参数能在一两秒内稳定下来。
  const THETA2 = 0.85 * 0.85;
  const CHARGE = 2600;
  const SOFTEN = 900;
  const SPRING = 0.032;
  const REST_LENGTH = 46;
  const GRAVITY = 0.0028;
  const DAMPING = 0.84;
  const ALPHA_DECAY = 0.985;
  const ALPHA_MIN = 0.004;
  const MAX_SPEED = 9;
  const TAU = Math.PI * 2;

  const state = {
    chapters: [],
    nodes: [],
    edges: [],
    neighborSets: [],
    stats: null,
    active: new Set(),
    mobileDefault: null,
    hovered: -1,
    matches: new Set(),
    matchCursor: -1,
    chapterButtons: new Map(),
    colors: null,
    width: 0,
    height: 0,
    dpr: 1,
    cam: { x: 0, y: 0, k: 1 },
    tween: null,
    dirty: true,
    alpha: 1,
    /** 用户手动缩放后，窗口 resize 不再自动重 fit。 */
    userAdjusted: false,
    sx: null,
    sy: null,
    visible: null,
    hit: null,
    frameId: 0,
  };

  let searchTimer = 0;

  function clamp(value, min, max) {
    return value < min ? min : value > max ? max : value;
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  /** 稳定的字符串散列，用来给初始布局加一点确定性抖动。 */
  function hashString(value) {
    let hash = 2166136261;
    for (let index = 0; index < value.length; index += 1) {
      hash ^= value.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
  }

  function chapterColor(chapter) {
    return (state.colors && state.colors.nodes[chapter]) || '#a24b1e';
  }

  function chapterTitle(chapter) {
    const found = state.chapters.find((item) => item.n === chapter);
    return found ? found.title : `第 ${chapter} 章`;
  }

  function isVisible(node) {
    return state.active.has(node.c);
  }

  /* ---------- 颜色 ---------- */

  function readColors() {
    const styles = getComputedStyle(page);
    const pick = (name, fallback) => styles.getPropertyValue(name).trim() || fallback;

    state.colors = {
      nodes: {
        1: pick('--graph-c1', '#c2410c'),
        2: pick('--graph-c2', '#1d4ed8'),
        3: pick('--graph-c3', '#047857'),
        4: pick('--graph-c4', '#6d28d9'),
        5: pick('--graph-c5', '#be185d'),
      },
      edge: pick('--graph-edge', 'rgba(90, 80, 62, 0.26)'),
      edgeStrong: pick('--graph-edge-strong', 'rgba(120, 70, 30, 0.72)'),
      label: pick('--graph-label', '#1b1d1f'),
      labelDim: pick('--graph-label-dim', '#5e625e'),
      halo: pick('--graph-halo', 'rgba(246, 243, 235, 0.92)'),
      accent: pick('--graph-accent', '#a24b1e'),
    };

    state.chapterButtons.forEach((button, chapter) => {
      const dot = button.querySelector('.graph-chapter-dot');
      if (dot) dot.style.background = chapterColor(chapter);
    });
  }

  /* ---------- 帧调度 ---------- */

  function scheduleFrame() {
    if (!state.frameId) state.frameId = requestAnimationFrame(frame);
  }

  function requestDraw() {
    state.dirty = true;
    scheduleFrame();
  }

  function frame(now) {
    state.frameId = 0;
    let busy = false;

    if (state.tween) {
      const tween = state.tween;
      const progress = clamp((now - tween.start) / tween.duration, 0, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      state.cam.x = lerp(tween.from.x, tween.to.x, eased);
      state.cam.y = lerp(tween.from.y, tween.to.y, eased);
      state.cam.k = lerp(tween.from.k, tween.to.k, eased);
      if (progress >= 1) state.tween = null;
      else busy = true;
      state.dirty = true;
    }

    if (state.alpha > ALPHA_MIN) {
      step();
      state.dirty = true;
      busy = true;
    }

    if (state.dirty) {
      draw();
      state.dirty = false;
    }

    if (busy) scheduleFrame();
  }

  /* ---------- 尺寸 ---------- */

  function resize() {
    const rect = stage.getBoundingClientRect();
    const width = Math.max(1, Math.round(rect.width));
    const height = Math.max(1, Math.round(rect.height));
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    if (width === state.width && height === state.height && dpr === state.dpr) return;

    state.width = width;
    state.height = height;
    state.dpr = dpr;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    requestDraw();
  }

  /* ---------- 相机 ---------- */

  function setCamera(x, y, k, animate) {
    if (!animate || REDUCED) {
      state.cam.x = x;
      state.cam.y = y;
      state.cam.k = k;
      state.tween = null;
      requestDraw();
      return;
    }

    state.tween = {
      from: { x: state.cam.x, y: state.cam.y, k: state.cam.k },
      to: { x, y, k },
      start: performance.now(),
      duration: 420,
    };
    scheduleFrame();
  }

  function fitView(animate) {
    const visible = state.nodes.filter(isVisible);
    if (visible.length === 0) {
      setCamera(0, 0, 1, animate);
      return;
    }

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    for (const node of visible) {
      const radius = node.r + 2;
      if (node.x - radius < minX) minX = node.x - radius;
      if (node.y - radius < minY) minY = node.y - radius;
      if (node.x + radius > maxX) maxX = node.x + radius;
      if (node.y + radius > maxY) maxY = node.y + radius;
    }

    const spanX = Math.max(maxX - minX, 120);
    const spanY = Math.max(maxY - minY, 120);
    // 四周各留 8% 边距后缩放到包围盒，并居中显示。
    const paddingX = state.width * 0.08;
    const paddingY = state.height * 0.08;
    const k = clamp(
      Math.min(
        (state.width - paddingX * 2) / spanX,
        (state.height - paddingY * 2) / spanY
      ),
      0.14,
      2.4
    );

    setCamera((minX + maxX) / 2, (minY + maxY) / 2, k, animate);
  }

  function focusNode(node, animate) {
    if (!node) return;
    state.userAdjusted = true;
    const k = Math.max(state.cam.k, MOBILE ? 1.2 : 1.5);
    setCamera(node.x, node.y, clamp(k, 0.14, 4), animate);
  }

  function screenToWorld(x, y) {
    return {
      x: (x - state.width / 2) / state.cam.k + state.cam.x,
      y: (y - state.height / 2) / state.cam.k + state.cam.y,
    };
  }

  /* ---------- 初始布局 ---------- */

  function layoutInitial() {
    const chapterOrder = state.chapters.map((chapter) => chapter.n);
    const groups = new Map();

    for (const node of state.nodes) {
      const bucket = groups.get(node.c) || [];
      bucket.push(node);
      groups.set(node.c, bucket);
    }

    chapterOrder.forEach((chapter, chapterIndex) => {
      const nodes = groups.get(chapter) || [];
      const angle = (chapterIndex / Math.max(1, chapterOrder.length)) * TAU - Math.PI / 2;
      const centerX = Math.cos(angle) * 290;
      const centerY = Math.sin(angle) * 250;

      nodes.forEach((node, index) => {
        const jitter = hashString(node.id) / 0xffffffff;
        const radius = 11.5 * Math.sqrt(index + 1) + jitter * 7;
        const theta = index * 2.399963229728653 + jitter * 0.9;
        node.x = centerX + Math.cos(theta) * radius;
        node.y = centerY + Math.sin(theta) * radius;
        node.vx = 0;
        node.vy = 0;
        node.fx = 0;
        node.fy = 0;
      });
    });
  }

  /* ---------- Barnes-Hut 四叉树 ---------- */

  function createCell(x, y, size, depth) {
    return {
      x0: x,
      y0: y,
      x1: x + size,
      y1: y + size,
      size,
      depth,
      mass: 0,
      cx: 0,
      cy: 0,
      point: null,
      children: null,
    };
  }

  function quadIndex(cell, point) {
    const midX = (cell.x0 + cell.x1) / 2;
    const midY = (cell.y0 + cell.y1) / 2;
    return (point.x < midX ? 0 : 1) + (point.y < midY ? 0 : 2);
  }

  function insertPoint(cell, point, depth) {
    if (cell.mass === 0) {
      cell.point = point;
      cell.mass = 1;
      cell.cx = point.x;
      cell.cy = point.y;
      return;
    }

    if (depth >= 18) {
      const mass = cell.mass + 1;
      cell.cx = (cell.cx * cell.mass + point.x) / mass;
      cell.cy = (cell.cy * cell.mass + point.y) / mass;
      cell.mass = mass;
      cell.point = null;
      return;
    }

    if (!cell.children) {
      const half = cell.size / 2;
      cell.children = [
        createCell(cell.x0, cell.y0, half, depth + 1),
        createCell(cell.x0 + half, cell.y0, half, depth + 1),
        createCell(cell.x0, cell.y0 + half, half, depth + 1),
        createCell(cell.x0 + half, cell.y0 + half, half, depth + 1),
      ];
      const old = cell.point;
      cell.point = null;
      insertPoint(cell.children[quadIndex(cell, old)], old, depth + 1);
    }

    insertPoint(cell.children[quadIndex(cell, point)], point, depth + 1);

    const mass = cell.mass + 1;
    cell.cx = (cell.cx * cell.mass + point.x) / mass;
    cell.cy = (cell.cy * cell.mass + point.y) / mass;
    cell.mass = mass;
  }

  function buildTree(nodes) {
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    for (const node of nodes) {
      if (node.x < minX) minX = node.x;
      if (node.y < minY) minY = node.y;
      if (node.x > maxX) maxX = node.x;
      if (node.y > maxY) maxY = node.y;
    }

    const size = Math.max(maxX - minX, maxY - minY, 10) + 2;
    const root = createCell(minX - 1, minY - 1, size, 0);

    for (const node of nodes) insertPoint(root, node, 0);
    return root;
  }

  function applyRepulsion(node, cell) {
    if (!cell || cell.mass === 0) return;
    if (cell.point === node) return;

    const dx = node.x - cell.cx;
    const dy = node.y - cell.cy;
    const distance2 = dx * dx + dy * dy + 0.01;

    if (cell.children === null || cell.size * cell.size < THETA2 * distance2) {
      const distance = Math.sqrt(distance2);
      const force = (CHARGE * cell.mass) / (distance2 + SOFTEN);
      node.fx += (dx / distance) * force;
      node.fy += (dy / distance) * force;
      return;
    }

    for (let index = 0; index < 4; index += 1) {
      applyRepulsion(node, cell.children[index]);
    }
  }

  /* ---------- 模拟 ---------- */

  function step() {
    const nodes = state.nodes;
    if (nodes.length === 0) {
      state.alpha = 0;
      return;
    }

    const tree = buildTree(nodes);

    for (const node of nodes) {
      node.fx = 0;
      node.fy = 0;
    }

    for (const node of nodes) applyRepulsion(node, tree);

    const edges = state.edges;
    for (let index = 0; index < edges.length; index += 1) {
      const source = nodes[edges[index][0]];
      const target = nodes[edges[index][1]];
      const dx = target.x - source.x;
      const dy = target.y - source.y;
      const distance = Math.sqrt(dx * dx + dy * dy) || 0.001;
      const force = (distance - REST_LENGTH) * SPRING;
      const ux = dx / distance;
      const uy = dy / distance;

      source.fx += ux * force * 0.5;
      source.fy += uy * force * 0.5;
      target.fx -= ux * force * 0.5;
      target.fy -= uy * force * 0.5;
    }

    const alpha = state.alpha;
    const dragging = state.dragging ? state.dragging.index : -1;

    for (let index = 0; index < nodes.length; index += 1) {
      const node = nodes[index];
      node.fx -= node.x * GRAVITY;
      node.fy -= node.y * GRAVITY;

      if (index === dragging) {
        node.vx = 0;
        node.vy = 0;
        continue;
      }

      node.vx = (node.vx + node.fx * alpha) * DAMPING;
      node.vy = (node.vy + node.fy * alpha) * DAMPING;

      const speed = Math.sqrt(node.vx * node.vx + node.vy * node.vy);
      if (speed > MAX_SPEED) {
        node.vx = (node.vx / speed) * MAX_SPEED;
        node.vy = (node.vy / speed) * MAX_SPEED;
      }

      node.x += node.vx;
      node.y += node.vy;
    }

    state.alpha = Math.max(0, state.alpha * ALPHA_DECAY - 0.00005);
  }

  /* ---------- 绘制 ---------- */

  function truncate(text, length) {
    if (text.length <= length) return text;
    return `${text.slice(0, length - 1)}…`;
  }

  function draw() {
    ctx.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);
    ctx.clearRect(0, 0, state.width, state.height);

    const nodes = state.nodes;
    if (nodes.length === 0) return;

    const cam = state.cam;
    const width = state.width;
    const height = state.height;
    const halfWidth = width / 2;
    const halfHeight = height / 2;

    if (!state.sx || state.sx.length !== nodes.length) {
      state.sx = new Float32Array(nodes.length);
      state.sy = new Float32Array(nodes.length);
      state.visible = new Uint8Array(nodes.length);
    }

    const sx = state.sx;
    const sy = state.sy;
    const visible = state.visible;

    for (let index = 0; index < nodes.length; index += 1) {
      const node = nodes[index];
      sx[index] = (node.x - cam.x) * cam.k + halfWidth;
      sy[index] = (node.y - cam.y) * cam.k + halfHeight;
      visible[index] = state.active.has(node.c) ? 1 : 0;
    }

    const hovered = state.hovered;
    const focusSet = hovered >= 0 && visible[hovered] ? state.neighborSets[hovered] : null;
    const searching = state.matches.size > 0;

    // 边：普通边和强调边各合并成一条路径，减少 canvas 状态切换。
    const base = [];
    const strong = [];

    for (const [source, target] of state.edges) {
      if (!visible[source] || !visible[target]) continue;

      let highlighted = false;
      if (focusSet) highlighted = source === hovered || target === hovered;
      else if (searching) highlighted = state.matches.has(source) && state.matches.has(target);

      if (highlighted) strong.push(source, target);
      else base.push(source, target);
    }

    ctx.lineCap = 'round';

    if (base.length > 0) {
      ctx.globalAlpha = focusSet || searching ? 0.16 : 1;
      ctx.strokeStyle = state.colors.edge;
      ctx.lineWidth = 0.7;
      ctx.beginPath();
      for (let index = 0; index < base.length; index += 2) {
        const source = base[index];
        const target = base[index + 1];
        ctx.moveTo(sx[source], sy[source]);
        ctx.lineTo(sx[target], sy[target]);
      }
      ctx.stroke();
    }

    if (strong.length > 0) {
      ctx.globalAlpha = 0.92;
      ctx.strokeStyle = state.colors.edgeStrong;
      ctx.lineWidth = 1.35;
      ctx.beginPath();
      for (let index = 0; index < strong.length; index += 2) {
        const source = strong[index];
        const target = strong[index + 1];
        ctx.moveTo(sx[source], sy[source]);
        ctx.lineTo(sx[target], sy[target]);
      }
      ctx.stroke();
    }

    // 节点
    const labels = [];

    for (let index = 0; index < nodes.length; index += 1) {
      if (!visible[index]) continue;

      const node = nodes[index];
      const x = sx[index];
      const y = sy[index];

      if (x < -20 || y < -20 || x > width + 20 || y > height + 20) continue;

      const radius = Math.max(1.3, node.r * cam.k);
      let alpha = 1;
      let ring = false;

      if (focusSet) {
        if (!focusSet.has(index)) alpha = 0.12;
        else if (index === hovered) ring = true;
      } else if (searching) {
        if (!state.matches.has(index)) alpha = 0.22;
        else {
          ring = true;
          labels.push(index);
        }
      }

      if (focusSet && focusSet.has(index)) labels.push(index);

      ctx.globalAlpha = alpha;
      ctx.fillStyle = chapterColor(node.c);
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, TAU);
      ctx.fill();

      if (ring) {
        ctx.globalAlpha = Math.min(1, alpha + 0.05);
        ctx.strokeStyle = state.colors.accent;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.arc(x, y, radius + 3.2, 0, TAU);
        ctx.stroke();
      }
    }

    // 标题：只给悬停邻居 / 搜索结果画，避免 510 个标签糊成一片。
    if (labels.length > 0) {
      labels.sort((a, b) => {
        if (a === hovered) return -1;
        if (b === hovered) return 1;
        return nodes[b].deg - nodes[a].deg;
      });

      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.font =
        '600 11px ui-sans-serif, system-ui, -apple-system, "Noto Sans SC", "PingFang SC", sans-serif';

      const limit = Math.min(labels.length, 36);
      for (let index = 0; index < limit; index += 1) {
        const nodeIndex = labels[index];
        const node = nodes[nodeIndex];
        const x = sx[nodeIndex] + Math.max(1.3, node.r * cam.k) + 5;
        const y = sy[nodeIndex] + 1;

        if (x < -80 || x > width + 80 || y < -20 || y > height + 20) continue;

        const text = truncate(node.t, nodeIndex === hovered ? 30 : 22);
        ctx.globalAlpha = 1;
        ctx.lineWidth = 3;
        ctx.strokeStyle = state.colors.halo;
        ctx.strokeText(text, x, y);
        ctx.fillStyle = nodeIndex === hovered ? state.colors.label : state.colors.labelDim;
        ctx.fillText(text, x, y);
      }
    }

    ctx.globalAlpha = 1;
  }

  /* ---------- 命中测试与提示 ---------- */

  function hitTest(x, y) {
    const nodes = state.nodes;
    const cam = state.cam;
    const halfWidth = state.width / 2;
    const halfHeight = state.height / 2;
    let best = -1;
    let bestDistance = Infinity;

    for (let index = 0; index < nodes.length; index += 1) {
      const node = nodes[index];
      if (!state.active.has(node.c)) continue;

      const nx = (node.x - cam.x) * cam.k + halfWidth;
      const ny = (node.y - cam.y) * cam.k + halfHeight;
      const dx = nx - x;
      const dy = ny - y;
      const distance = dx * dx + dy * dy;
      const threshold = Math.max(9, node.r * cam.k + 6);

      if (distance <= threshold * threshold && distance < bestDistance) {
        best = index;
        bestDistance = distance;
      }
    }

    return best;
  }

  function hideTooltip() {
    if (tooltip) tooltip.hidden = true;
  }

  function updateTooltip(index, pointerX, pointerY) {
    if (!tooltip || !tooltipN || !tooltipTitle || !tooltipMeta) return;
    const node = state.nodes[index];
    if (!node) return;

    tooltipN.textContent = node.n;
    tooltipTitle.textContent = node.t;
    tooltipMeta.textContent = `${node.deg} 条连接 · ${chapterTitle(node.c)} · 点击打开`;

    tooltip.hidden = false;
    const box = tooltip.getBoundingClientRect();
    let x = pointerX + 16;
    let y = pointerY + 16;

    if (x + box.width > state.width - 8) x = pointerX - box.width - 14;
    if (y + box.height > state.height - 8) y = pointerY - box.height - 14;

    x = Math.max(8, x);
    y = Math.max(8, y);
    tooltip.style.transform = `translate(${Math.round(x)}px, ${Math.round(y)}px)`;
  }

  function clearHover() {
    if (state.hovered === -1) return;
    state.hovered = -1;
    hideTooltip();
    requestDraw();
  }

  /* ---------- 交互 ---------- */

  function localPoint(event) {
    const rect = canvas.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  }

  function onPointerDown(event) {
    if (event.pointerType === 'mouse' && event.button !== 0) return;

    const point = localPoint(event);
    const index = hitTest(point.x, point.y);
    canvas.setPointerCapture(event.pointerId);

    if (index >= 0) {
      const node = state.nodes[index];
      const world = screenToWorld(point.x, point.y);
      state.dragging = {
        index,
        pointerId: event.pointerId,
        startX: point.x,
        startY: point.y,
        offsetX: node.x - world.x,
        offsetY: node.y - world.y,
        moved: false,
      };
      state.hovered = index;
      updateTooltip(index, point.x, point.y);
      state.alpha = Math.max(state.alpha, 0.12);
      canvas.style.cursor = 'grabbing';
    } else {
      state.panning = {
        pointerId: event.pointerId,
        lastX: point.x,
        lastY: point.y,
      };
      state.tween = null;
      canvas.style.cursor = 'grabbing';
      clearHover();
    }

    requestDraw();
  }

  function onPointerMove(event) {
    const point = localPoint(event);

    if (state.dragging && state.dragging.pointerId === event.pointerId) {
      const dragging = state.dragging;
      const node = state.nodes[dragging.index];
      const world = screenToWorld(point.x, point.y);

      node.x = world.x + dragging.offsetX;
      node.y = world.y + dragging.offsetY;
      node.vx = 0;
      node.vy = 0;

      const dx = point.x - dragging.startX;
      const dy = point.y - dragging.startY;
      if (dx * dx + dy * dy > 25) dragging.moved = true;

      state.alpha = Math.max(state.alpha, 0.16);
      updateTooltip(dragging.index, point.x, point.y);
      requestDraw();
      return;
    }

    if (state.panning && state.panning.pointerId === event.pointerId) {
      const panning = state.panning;
      state.cam.x -= (point.x - panning.lastX) / state.cam.k;
      state.cam.y -= (point.y - panning.lastY) / state.cam.k;
      panning.lastX = point.x;
      panning.lastY = point.y;
      state.tween = null;
      requestDraw();
      return;
    }

    const index = hitTest(point.x, point.y);

    if (index !== state.hovered) {
      state.hovered = index;
      if (index >= 0) {
        updateTooltip(index, point.x, point.y);
        canvas.style.cursor = 'pointer';
      } else {
        hideTooltip();
        canvas.style.cursor = 'grab';
      }
      requestDraw();
    } else if (index >= 0) {
      updateTooltip(index, point.x, point.y);
    }
  }

  function onPointerUp(event) {
    if (state.dragging && state.dragging.pointerId === event.pointerId) {
      const dragging = state.dragging;
      state.dragging = null;
      const node = state.nodes[dragging.index];

      if (!dragging.moved && node) {
        if (event.metaKey || event.ctrlKey) {
          window.open(node.href, '_blank', 'noopener');
        } else {
          window.location.assign(node.href);
        }
        return;
      }

      state.alpha = Math.max(state.alpha, 0.22);
      requestDraw();
    }

    if (state.panning && state.panning.pointerId === event.pointerId) {
      state.panning = null;
      requestDraw();
    }

    canvas.style.cursor = state.hovered >= 0 ? 'pointer' : 'grab';
  }

  function onPointerCancel(event) {
    if (state.dragging && state.dragging.pointerId === event.pointerId) {
      state.dragging = null;
      state.alpha = Math.max(state.alpha, 0.16);
    }
    if (state.panning && state.panning.pointerId === event.pointerId) state.panning = null;
    canvas.style.cursor = 'grab';
    requestDraw();
  }

  function onWheel(event) {
    event.preventDefault();

    const point = localPoint(event);
    const world = screenToWorld(point.x, point.y);
    const delta = event.deltaMode === 1 ? event.deltaY * 16 : event.deltaY;
    const nextScale = clamp(state.cam.k * Math.exp(-delta * 0.0015), 0.14, 5);

    state.userAdjusted = true;
    state.cam.k = nextScale;
    state.cam.x = world.x - (point.x - state.width / 2) / nextScale;
    state.cam.y = world.y - (point.y - state.height / 2) / nextScale;
    state.tween = null;
    requestDraw();
  }

  /* ---------- 筛选、搜索与状态 ---------- */

  function buildChapterButtons() {
    if (!chapterList) return;
    chapterList.textContent = '';
    state.chapterButtons.clear();

    for (const chapter of state.chapters) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'graph-chapter';
      button.dataset.chapter = String(chapter.n);
      button.title = `${chapter.title} · ${chapter.count} 篇`;
      button.setAttribute('aria-pressed', state.active.has(chapter.n) ? 'true' : 'false');

      const dot = document.createElement('span');
      dot.className = 'graph-chapter-dot';
      dot.setAttribute('aria-hidden', 'true');
      dot.style.background = chapterColor(chapter.n);

      const label = document.createElement('span');
      label.className = 'graph-chapter-label';
      label.textContent = chapter.title;

      const count = document.createElement('span');
      count.className = 'graph-chapter-count';
      count.textContent = String(chapter.count);

      button.append(dot, label, count);
      button.addEventListener('click', () => toggleChapter(chapter.n));
      chapterList.append(button);
      state.chapterButtons.set(chapter.n, button);
    }
  }

  function toggleChapter(chapter) {
    if (state.active.has(chapter)) {
      if (state.active.size === 1) return;
      state.active.delete(chapter);
    } else {
      state.active.add(chapter);
    }

    syncFilters();
    state.userAdjusted = false;
    fitView(true);
  }

  function syncFilters() {
    state.chapterButtons.forEach((button, chapter) => {
      button.setAttribute('aria-pressed', state.active.has(chapter) ? 'true' : 'false');
    });

    const all = state.chapters.length > 0 && state.active.size === state.chapters.length;
    if (showAllEl) showAllEl.checked = all;

    if (state.hovered >= 0 && !isVisible(state.nodes[state.hovered])) {
      state.hovered = -1;
      hideTooltip();
    }

    applySearch(searchEl ? searchEl.value : '', false);
    updateStatus();
    requestDraw();
  }

  function applySearch(value, focus) {
    const query = String(value || '').trim().toLowerCase();
    state.matches = new Set();
    state.matchCursor = -1;

    if (query) {
      state.nodes.forEach((node, index) => {
        if (!isVisible(node)) return;
        const haystack = `${node.t} ${node.n} ${node.id}`.toLowerCase();
        if (haystack.includes(query)) state.matches.add(index);
      });
    }

    if (focus && state.matches.size > 0) {
      const first = state.matches.values().next().value;
      focusNode(state.nodes[first], true);
    }

    updateStatus();
    requestDraw();
  }

  function updateStatus() {
    if (!statusEl) return;

    const stats = state.stats;
    if (!stats) {
      statusEl.textContent = '';
      return;
    }

    const visible = state.nodes.reduce(
      (count, node) => count + (state.active.has(node.c) ? 1 : 0),
      0
    );

    const parts = [`显示 ${visible} / ${stats.nodes} 篇`];
    if (state.matches.size > 0) {
      parts.push(`匹配 ${state.matches.size} 篇${state.matches.size > 1 ? '（Enter 切换）' : ''}`);
    }
    parts.push(`${stats.edges} 条边`);
    parts.push(`${stats.orphans} 个孤立节点`);
    statusEl.textContent = parts.join(' · ');
  }

  function resetView() {
    const allChapters = state.chapters.map((chapter) => chapter.n);
    state.active = new Set(MOBILE ? [state.mobileDefault] : allChapters);
    if (showAllEl) showAllEl.checked = !MOBILE;
    if (searchEl) searchEl.value = '';
    state.matches = new Set();
    state.matchCursor = -1;
    state.hovered = -1;
    hideTooltip();
    syncFilters();
    state.userAdjusted = false;
    fitView(true);
  }

  /* ---------- 数据初始化 ---------- */

  function showError(error) {
    if (loading) loading.hidden = true;
    const box = document.createElement('p');
    box.className = 'graph-error';
    box.textContent = `关系图加载失败：${error && error.message ? error.message : '未知错误'}。`;
    const link = document.createElement('a');
    link.href = '/ai/';
    link.textContent = '返回 AI 专栏文章列表 →';
    box.append(' ', link);
    stage.append(box);
    if (statusEl) statusEl.textContent = '';
  }

  function init(data) {
    state.chapters = Array.isArray(data.chapters) ? data.chapters : [];
    state.stats = data.stats || {
      nodes: data.nodes.length,
      edges: data.edges.length,
      orphans: 0,
    };

    state.nodes = data.nodes.map((node, index) => ({
      ...node,
      index,
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      fx: 0,
      fy: 0,
      r: 2.8 + Math.min(7, Math.sqrt(node.deg || 0) * 1.15),
    }));

    state.edges = data.edges;
    state.neighborSets = state.nodes.map(() => new Set());

    for (const [source, target] of state.edges) {
      state.neighborSets[source].add(target);
      state.neighborSets[target].add(source);
    }

    state.neighborSets.forEach((set, index) => set.add(index));

    state.mobileDefault = state.chapters.length > 0 ? state.chapters[0].n : null;
    state.active = new Set(MOBILE ? [state.mobileDefault] : state.chapters.map((item) => item.n));

    layoutInitial();
    readColors();
    buildChapterButtons();

    if (showAllEl) showAllEl.checked = !MOBILE;
    state.alpha = 1;

    // 先静默跑几十步，首帧不会是一团完全散开的初始螺旋。
    const preRun = REDUCED ? 240 : 40;
    for (let index = 0; index < preRun; index += 1) step();
    if (REDUCED) state.alpha = 0;

    resize();
    fitView(false);
    updateStatus();
    if (loading) loading.hidden = true;
    requestDraw();
  }

  async function load() {
    try {
      const response = await fetch(DATA_SRC, { headers: { Accept: 'application/json' } });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      init(data);
    } catch (error) {
      showError(error);
    }
  }

  /* ---------- 事件绑定 ---------- */

  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerup', onPointerUp);
  canvas.addEventListener('pointercancel', onPointerCancel);
  canvas.addEventListener('pointerleave', () => {
    if (!state.dragging && !state.panning) clearHover();
  });
  canvas.addEventListener('wheel', onWheel, { passive: false });

  if (resetEl) {
    resetEl.addEventListener('click', resetView);
  }

  if (showAllEl) {
    showAllEl.addEventListener('change', () => {
      const allChapters = state.chapters.map((chapter) => chapter.n);
      state.active = new Set(showAllEl.checked ? allChapters : [state.mobileDefault]);
      syncFilters();
      state.userAdjusted = false;
      fitView(true);
    });
  }

  if (searchEl) {
    searchEl.addEventListener('input', () => {
      window.clearTimeout(searchTimer);
      searchTimer = window.setTimeout(() => applySearch(searchEl.value, true), 140);
    });

    searchEl.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        searchEl.value = '';
        applySearch('', false);
        return;
      }

      if (event.key === 'Enter' && state.matches.size > 0) {
        event.preventDefault();
        const matches = [...state.matches];
        state.matchCursor = (state.matchCursor + 1) % matches.length;
        focusNode(state.nodes[matches[state.matchCursor]], true);
        updateStatus();
      }
    });
  }

  // 尺寸变化后重算画布；用户没有手动缩放时回到 fit 状态。
  let resizeFrame = 0;
  function onResize() {
    window.cancelAnimationFrame(resizeFrame);
    resizeFrame = window.requestAnimationFrame(() => {
      resize();
      if (!state.userAdjusted) fitView(false);
      requestDraw();
    });
  }

  if (typeof ResizeObserver === 'function') {
    new ResizeObserver(onResize).observe(stage);
  } else {
    window.addEventListener('resize', onResize);
  }
  window.addEventListener('orientationchange', onResize);

  new MutationObserver(() => {
    readColors();
    requestDraw();
  }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  resize();
  load();
})();
