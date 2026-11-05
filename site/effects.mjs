// Decorative effects stay separate from search, reading and visit statistics.
const root = document.documentElement;
const canvas = document.querySelector('#particle-field');
const toggle = document.querySelector('#motion-toggle');
const results = document.querySelector('#results');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
const storageKey = 'llm-interview-warehouse:motion';
let paused = false;
try { paused = localStorage.getItem(storageKey) === 'off'; } catch { /* Optional preference. */ }

let context;
try { context = canvas.getContext('2d', {alpha: true}); } catch { /* Reading works without canvas. */ }
let width = 0, height = 0, particles = [], palette = [];
let animationFrame = 0, previousTime = 0, paintTime = 0, cardFrame = 0;
let activeCard = null, lastPointer = null;
const pointer = {x: 0, y: 0, active: false};
const enabled = () => !paused && !reducedMotion.matches;
const compact = () => width < 760 || !finePointer.matches;

function resetCard() {
  cancelAnimationFrame(cardFrame);
  cardFrame = 0;
  if (activeCard) {
    for (const name of ['--pointer-x', '--pointer-y', '--tilt-x', '--tilt-y']) activeCard.style.removeProperty(name);
    activeCard.classList.remove('is-pointed');
  }
  activeCard = null;
  lastPointer = null;
}

function readPalette() {
  const style = getComputedStyle(root);
  palette = ['--cyan', '--blue', '--violet', '--pink'].map(name => style.getPropertyValue(name).trim());
}

function resize() {
  if (!context || !enabled()) return;
  width = innerWidth;
  height = innerHeight;
  const scale = Math.min(devicePixelRatio || 1, compact() ? 1.5 : 2);
  canvas.width = Math.round(width * scale);
  canvas.height = Math.round(height * scale);
  context.setTransform(scale, 0, 0, scale, 0, 0);
  const count = Math.min(compact() ? 24 : 64, Math.max(14, Math.floor(width * height / 19000)));
  particles = Array.from({length: count}, (_, index) => ({
    x: Math.random() * width, y: Math.random() * height,
    vx: (Math.random() - .5) * 9, vy: (Math.random() - .5) * 9,
    radius: .9 + Math.random() * 1.2, phase: Math.random() * Math.PI * 2,
    color: palette[index % palette.length],
  }));
  resetCard();
}

function draw(time, elapsed) {
  context.clearRect(0, 0, width, height);
  const reach = compact() ? 105 : 145;
  const light = root.dataset.theme === 'light';
  for (const point of particles) {
    point.x += point.vx * elapsed;
    point.y += point.vy * elapsed;
    if (point.x < -12) point.x = width + 12;
    if (point.x > width + 12) point.x = -12;
    if (point.y < -12) point.y = height + 12;
    if (point.y > height + 12) point.y = -12;
  }
  context.lineWidth = .65;
  for (let i = 0; i < particles.length; i++) {
    const point = particles[i];
    for (let j = i + 1; j < particles.length; j++) {
      const other = particles[j];
      const distance = Math.hypot(point.x - other.x, point.y - other.y);
      if (distance >= reach) continue;
      context.globalAlpha = (1 - distance / reach) * (light ? .2 : .3);
      context.strokeStyle = point.color;
      context.beginPath();
      context.moveTo(point.x, point.y);
      context.lineTo(other.x, other.y);
      context.stroke();
    }
    const distance = pointer.active ? Math.hypot(point.x - pointer.x, point.y - pointer.y) : Infinity;
    if (distance < 160) {
      context.globalAlpha = (1 - distance / 160) * .35;
      context.strokeStyle = point.color;
      context.beginPath();
      context.moveTo(point.x, point.y);
      context.lineTo(pointer.x, pointer.y);
      context.stroke();
    }
    const brightness = .5 + .2 * Math.sin(time / 2200 + point.phase);
    context.globalAlpha = light ? brightness * .6 : brightness;
    context.fillStyle = point.color;
    context.beginPath();
    context.arc(point.x, point.y, point.radius, 0, Math.PI * 2);
    context.fill();
    if (point.radius > 1.7) {
      context.globalAlpha *= .12;
      context.beginPath();
      context.arc(point.x, point.y, point.radius * 3.5, 0, Math.PI * 2);
      context.fill();
    }
  }
  context.globalAlpha = 1;
}

function tick(time) {
  animationFrame = 0;
  if (!enabled() || document.hidden) return;
  const interval = compact() ? 1000 / 24 : 1000 / 30;
  if (time - paintTime >= interval) {
    const elapsed = previousTime ? Math.min((time - previousTime) / 1000, .08) : 0;
    draw(time, elapsed);
    previousTime = time;
    paintTime = time;
  }
  animationFrame = requestAnimationFrame(tick);
}

function syncAnimation() {
  cancelAnimationFrame(animationFrame);
  animationFrame = 0;
  previousTime = paintTime = 0;
  pointer.active = false;
  resetCard();
  if (context && enabled() && !document.hidden) animationFrame = requestAnimationFrame(tick);
}

function applyPreference() {
  const on = enabled();
  root.dataset.motion = on ? 'on' : 'off';
  canvas.hidden = !on || !context;
  toggle.hidden = false;
  toggle.disabled = reducedMotion.matches;
  toggle.setAttribute('aria-label', reducedMotion.matches ? '已按系统设置暂停动效' : on ? '暂停动效' : '开启动效');
  toggle.title = toggle.getAttribute('aria-label');
  if (on) { readPalette(); resize(); }
  syncAnimation();
}

toggle.addEventListener('click', () => {
  paused = !paused;
  try { localStorage.setItem(storageKey, paused ? 'off' : 'on'); } catch { /* Works for this visit. */ }
  applyPreference();
});
reducedMotion.addEventListener('change', applyPreference);
finePointer.addEventListener('change', () => { resize(); syncAnimation(); });
document.addEventListener('visibilitychange', syncAnimation);
addEventListener('pagehide', () => { cancelAnimationFrame(animationFrame); resetCard(); });
addEventListener('pageshow', syncAnimation);
addEventListener('resize', resize, {passive: true});
addEventListener('scroll', resetCard, {passive: true});
addEventListener('blur', () => { pointer.active = false; resetCard(); });
addEventListener('pointermove', event => {
  pointer.active = enabled() && finePointer.matches && event.pointerType === 'mouse';
  pointer.x = event.clientX;
  pointer.y = event.clientY;
}, {passive: true});
document.addEventListener('pointerleave', () => { pointer.active = false; resetCard(); });
new MutationObserver(() => {
  readPalette();
  particles.forEach((point, index) => { point.color = palette[index % palette.length]; });
}).observe(root, {attributes: true, attributeFilter: ['data-theme']});

results.addEventListener('pointermove', event => {
  if (!enabled() || !finePointer.matches || event.pointerType !== 'mouse') return;
  const card = event.target.closest('.record-card');
  if (card !== activeCard) { resetCard(); activeCard = card; }
  if (!card) return;
  lastPointer = {x: event.clientX, y: event.clientY};
  if (cardFrame) return;
  cardFrame = requestAnimationFrame(() => {
    cardFrame = 0;
    if (!activeCard?.isConnected || !lastPointer) { resetCard(); return; }
    const bounds = activeCard.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (lastPointer.x - bounds.left) / bounds.width));
    const y = Math.max(0, Math.min(1, (lastPointer.y - bounds.top) / bounds.height));
    activeCard.style.setProperty('--pointer-x', (x * 100).toFixed(1) + '%');
    activeCard.style.setProperty('--pointer-y', (y * 100).toFixed(1) + '%');
    activeCard.style.setProperty('--tilt-x', ((.5 - y) * 2).toFixed(2) + 'deg');
    activeCard.style.setProperty('--tilt-y', ((x - .5) * 2).toFixed(2) + 'deg');
    activeCard.classList.add('is-pointed');
  });
}, {passive: true});
results.addEventListener('pointerout', event => {
  if (activeCard && !(event.relatedTarget instanceof Node && activeCard.contains(event.relatedTarget))) resetCard();
}, {passive: true});
new MutationObserver(resetCard).observe(results, {childList: true});

applyPreference();
