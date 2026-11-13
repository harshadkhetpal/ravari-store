/*
 * RAVARI first-party analytics tracker.
 *  - Runs ONLY after the visitor accepts analytics (consent banner). Declining / withdrawing stops it and erases their data.
 *  - Pseudonymous visitor id + session id (random UUIDs). No name, email, phone, IP or form contents are ever read.
 *  - Never records keystrokes, input values, passwords, payment details or OTPs: clicks inside form fields are ignored.
 *  - Events are batched (flush every 4s / 20 events / page hide) to keep requests low.
 *  - Purchases are NOT tracked here: they are recorded by the server only after verified payment / order creation.
 */
const ENDPOINT = '/api/analytics/collect';
const KEY_CONSENT = 'ravari_consent';
const KEY_VID = 'rv_vid';
const KEY_SESS = 'rv_sess';
const SESSION_TIMEOUT = 30 * 60 * 1000;
const FLUSH_MS = 4000;
const HEARTBEAT_MS = 30000;
const URGENT = new Set(['add_to_cart', 'begin_checkout', 'payment_initiated', 'payment_failed', 'payment_dismissed', 'order_success_view', 'whatsapp_click', 'contact_submit']);
const NAMED_CLICKS = new Set(['logo_click', 'nav_click', 'category_click', 'product_card_click', 'product_image_click', 'gallery_nav', 'variant_select', 'quantity_change',
  'wishlist_add', 'wishlist_remove', 'search_result_click', 'filter_change', 'sort_change', 'coupon_apply', 'coupon_remove', 'whatsapp_click', 'footer_link_click', 'external_link_click', 'newsletter_subscribe']);

let queue = [];
let flushTimer = null, hbTimer = null;
let running = false;
let curPath = null, pageVisibleMs = 0, visSince = 0, maxScroll = 0, sentScroll = new Set(), scrollTick = false;

const uuid = () => (window.crypto && crypto.randomUUID ? crypto.randomUUID()
  : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => { const r = (Math.random() * 16) | 0; return (c === 'x' ? r : (r & 3) | 8).toString(16); }));
const lsGet = k => { try { return localStorage.getItem(k); } catch (_) { return null; } };
const lsSet = (k, v) => { try { localStorage.setItem(k, v); } catch (_) {} };
const lsDel = k => { try { localStorage.removeItem(k); } catch (_) {} };

export function getConsent() { try { return JSON.parse(lsGet(KEY_CONSENT) || 'null'); } catch (_) { return null; } }
function excluded() {
  try {
    if (window.self !== window.top) return true;                           // admin heatmap preview iframe etc.
    if (/[?&]an_off=1/.test(window.location.search)) return true;
    if (window.location.pathname.startsWith('/admin')) return true;        // never track the admin panel
    if (navigator.globalPrivacyControl === true) return true;               // honour Global Privacy Control
  } catch (_) {}
  return false;
}
export const isEnabled = () => { const c = getConsent(); return !!(c && c.analytics === true) && !excluded(); };

function visitorId() { let v = lsGet(KEY_VID); if (!v) { v = uuid(); lsSet(KEY_VID, v); } return v; }
function buildCtx() {
  const p = new URLSearchParams(window.location.search);
  let ref = document.referrer || '';
  try { if (ref && new URL(ref).hostname.replace(/^www\./, '') === window.location.hostname.replace(/^www\./, '')) ref = ''; } catch (_) { ref = ''; }
  return {
    ref, landing: window.location.pathname, vw: window.innerWidth,
    utm: { source: p.get('utm_source') || '', medium: p.get('utm_medium') || '', campaign: p.get('utm_campaign') || '', content: p.get('utm_content') || '', term: p.get('utm_term') || '' },
    gclid: !!p.get('gclid'),
  };
}
function session() {
  let s = null; try { s = JSON.parse(lsGet(KEY_SESS) || 'null'); } catch (_) {}
  const now = Date.now();
  const p = new URLSearchParams(window.location.search);
  const newCampaign = s && p.get('utm_source') && s.ctx && s.ctx.utm && s.ctx.utm.source !== p.get('utm_source');
  if (!s || !s.id || now - s.last > SESSION_TIMEOUT || newCampaign) s = { id: uuid(), last: now, ctx: buildCtx() };
  s.last = now; lsSet(KEY_SESS, JSON.stringify(s));
  return s;
}
export function getIds() { if (!isEnabled()) return null; return { vid: visitorId(), sid: session().id }; }

/* ---------- sending ---------- */
function flush(beacon) {
  if (flushTimer) { clearTimeout(flushTimer); flushTimer = null; }
  if (!queue.length || !isEnabled()) { if (!isEnabled()) queue = []; return; }
  const events = queue.splice(0, 50);
  const s = session();
  const body = JSON.stringify({ v: 1, vid: visitorId(), sid: s.id, consent: true, ctx: s.ctx, events });
  try {
    if (beacon && navigator.sendBeacon && navigator.sendBeacon(ENDPOINT, new Blob([body], { type: 'application/json' }))) { if (queue.length) flush(true); return; }
    fetch(ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body, keepalive: true, credentials: 'omit' })
      .then(r => { if (r.status >= 500) throw new Error('retry'); })
      .catch(() => { if (queue.length < 200) queue = events.concat(queue); });
  } catch (_) { if (queue.length < 200) queue = events.concat(queue); }
  if (queue.length) schedule(250);
}
function schedule(ms) { if (!flushTimer) flushTimer = setTimeout(() => flush(false), ms); }

/* Public: track('add_to_cart', { productId, name, category, value, qty, element, label, meta }) */
export function track(name, props) {
  if (!isEnabled()) return;
  props = props || {};
  const e = { id: uuid(), n: name, t: Date.now(), p: window.location.pathname, u: window.location.pathname + window.location.search };
  if (props.productId != null) e.pid = String(props.productId);
  if (props.sku) e.sku = props.sku;
  if (props.name) e.pn = props.name;
  if (props.category) e.cat = props.category;
  if (props.element) e.el = props.element;
  if (props.label) e.lb = String(props.label).replace(/(?<!\d)(?:\d[ -]?){12,19}(?!\d)/g, '[number]').replace(/\b(otp|cvv|cvc|pin|password|passcode|code)\b\W{0,3}\d{3,8}\b/gi, '$1 [hidden]').replace(/[\w.+-]+@[\w-]+\.[\w.-]+/g, '[email]');
  if (props.value != null) e.val = props.value;
  if (props.qty != null) e.q = props.qty;
  if (props.x != null) { e.x = props.x; e.y = props.y; e.vw = props.vw; }
  if (props.scroll != null) e.sc = props.scroll;
  if (props.duration != null) e.d = props.duration;
  if (props.meta) e.m = props.meta;
  queue.push(e);
  if (URGENT.has(name) || queue.length >= 20) schedule(300); else schedule(FLUSH_MS);
}

/* ---------- page views, time on page, scroll depth ---------- */
function docHeight() { const d = document.documentElement, b = document.body; return Math.max(d.scrollHeight, b ? b.scrollHeight : 0, d.offsetHeight); }
function onScroll() {
  if (scrollTick) return; scrollTick = true;
  requestAnimationFrame(() => {
    scrollTick = false;
    const h = docHeight(); if (!h) return;
    const pct = Math.min(100, Math.round(((window.scrollY + window.innerHeight) / h) * 100));
    if (pct > maxScroll) maxScroll = pct;
    [25, 50, 75, 100].forEach(m => { if (maxScroll >= (m === 100 ? 98 : m) && !sentScroll.has(m)) { sentScroll.add(m); track('scroll_depth', { scroll: m }); } });
  });
}
function visibleTotal() { return pageVisibleMs + (document.visibilityState === 'visible' && visSince ? Date.now() - visSince : 0); }
function emitExit() {
  if (curPath == null) return;
  const dur = Math.round(visibleTotal());
  const e = { id: uuid(), n: 'page_exit', t: Date.now(), p: curPath, d: dur, sc: maxScroll };
  queue.push(e);
  curPath = null;
}
export function pageView() {
  if (!isEnabled()) return;
  if (!running) start();
  emitExit();
  curPath = window.location.pathname; pageVisibleMs = 0; visSince = Date.now(); maxScroll = 0; sentScroll = new Set();
  track('page_view');
  setTimeout(onScroll, 600);
}

/* ---------- click capture (delegated, no values read) ---------- */
function cleanText(s, n) { return (s || '').replace(/\s+/g, ' ').trim().slice(0, n || 40); }
function labelOf(el) {
  if (!el) return '';
  const t = cleanText(el.getAttribute && (el.getAttribute('aria-label') || el.getAttribute('title')), 40);
  if (t) return t;
  const img = el.querySelector && el.querySelector('img[alt]');
  const txt = cleanText(el.textContent, 40);
  return txt || (img ? cleanText(img.getAttribute('alt'), 40) : '');
}
function onClick(e) {
  if (!isEnabled()) return;
  const t = e.target; if (!(t instanceof Element)) return;
  if (t.closest('input,textarea,select,[contenteditable="true"],[data-no-track]')) return;   // never touch form fields
  const dEl = t.closest('[data-track]');
  const a = t.closest('a[href]');
  const btn = t.closest('button,[role="button"]');
  const el = dEl || a || btn || t;
  const docW = document.documentElement.scrollWidth || window.innerWidth;
  const geo = { x: Math.round((e.pageX / docW) * 1000) / 10, y: Math.round(e.pageY), vw: window.innerWidth };
  let name = 'click', element = '', label = '', extra = {};

  if (dEl) {
    const v = dEl.getAttribute('data-track');
    if (NAMED_CLICKS.has(v)) { name = v; element = dEl.getAttribute('data-track-id') || v; }
    else { element = dEl.getAttribute('data-track-id') || v; }
    label = labelOf(dEl);
  } else if (a) {
    const href = a.getAttribute('href') || '';
    let host = ''; try { host = new URL(href, window.location.origin).hostname; } catch (_) {}
    label = labelOf(a);
    if (/wa\.me|whatsapp\.com/i.test(href)) { name = 'whatsapp_click'; element = 'whatsapp'; }
    else if (host && host !== window.location.hostname) { name = 'external_link_click'; element = host.replace(/^www\./, ''); extra.marketplace = /amazon|amzn|flipkart/i.test(host); }
    else if (a.closest('footer')) { name = 'footer_link_click'; element = 'footer:' + (label || href); }
    else if (a.querySelector('.ravari-logo-icon') || a.querySelector('.ravari-wordmark') || a.closest('.ravari-wordmark')) { name = 'logo_click'; element = 'logo'; }
    else if (/^\/products\/[^/?#]+/.test(href)) {
      const slug = href.split('/products/')[1].split(/[?#]/)[0];
      const fromSearch = window.location.pathname === '/products' && window.__rvLastSearch;
      name = fromSearch ? 'search_result_click' : 'product_card_click'; element = 'product-card'; extra.sku = slug; label = label || slug;
    } else if (/^\/products\?category=/.test(href)) { name = 'category_click'; element = 'category:' + decodeURIComponent(href.split('category=')[1] || ''); }
    else if (a.closest('.hdr-nav, .hdr-nav-bar, .hdr-top')) { name = 'nav_click'; element = 'nav:' + (label || href); }
    else { element = 'link:' + (label || href); }
  } else if (btn) {
    label = labelOf(btn); element = 'button:' + (label || (btn.className || '').toString().split(' ')[0] || 'unnamed');
  } else {
    element = t.tagName.toLowerCase() + (t.className && typeof t.className === 'string' ? '.' + t.className.split(' ')[0] : '');
  }
  track(name, { element, label, sku: extra.sku, x: geo.x, y: geo.y, vw: geo.vw, meta: extra.marketplace ? { marketplace: true } : undefined });
}

/* ---------- lifecycle ---------- */
function onVis() {
  if (document.visibilityState === 'hidden') { if (visSince) { pageVisibleMs += Date.now() - visSince; visSince = 0; } flush(true); }
  else { visSince = Date.now(); }
}
function onPageHide() { emitExit(); flush(true); }
function heartbeat() { if (document.visibilityState !== 'visible' || !isEnabled()) return; queue.push({ n: 'heartbeat', p: window.location.pathname }); flush(false); }

export function start() {
  if (running || !isEnabled()) return;
  running = true;
  document.addEventListener('click', onClick, true);
  window.addEventListener('scroll', onScroll, { passive: true });
  document.addEventListener('visibilitychange', onVis);
  window.addEventListener('pagehide', onPageHide);
  hbTimer = setInterval(heartbeat, HEARTBEAT_MS);
}
export function stop() {
  running = false;
  document.removeEventListener('click', onClick, true);
  window.removeEventListener('scroll', onScroll);
  document.removeEventListener('visibilitychange', onVis);
  window.removeEventListener('pagehide', onPageHide);
  if (hbTimer) clearInterval(hbTimer);
  queue = []; curPath = null;
}
/* Accept / decline / withdraw. Withdrawing also erases everything stored under this visitor id. */
export function setConsent(analytics) {
  const prevVid = lsGet(KEY_VID);
  lsSet(KEY_CONSENT, JSON.stringify({ analytics: !!analytics, ts: Date.now(), v: 1 }));
  if (analytics) { start(); pageView(); }
  else {
    stop();
    if (prevVid) { try { fetch('/api/analytics/forget', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ vid: prevVid }), keepalive: true }); } catch (_) {} }
    lsDel(KEY_VID); lsDel(KEY_SESS);
  }
  try { window.dispatchEvent(new Event('ravari-consent')); } catch (_) {}
}
export function initTracker() { if (isEnabled()) start(); }
