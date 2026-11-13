'use strict';
const U = require('./util');
const { DEAD } = require('./hooks');

const OFF = U.TZ_OFFSET_MIN;
const N = v => (v == null ? 0 : Number(v));
const pct = (a, b) => (b > 0 ? Math.round((a / b) * 1000) / 10 : 0);
const DEAD_SQL = DEAD.map(s => `'${s}'`).join(',');
const PURCHASE_OK = `(e.name='purchase' AND (o.status IS NULL OR o.status NOT IN (${DEAD_SQL})))`;
const CLICK_NAMES = ['click', 'logo_click', 'nav_click', 'category_click', 'product_card_click', 'product_image_click', 'gallery_nav', 'variant_select',
  'quantity_change', 'add_to_cart', 'remove_from_cart', 'wishlist_add', 'wishlist_remove', 'search_result_click', 'filter_change', 'sort_change',
  'coupon_apply', 'coupon_remove', 'whatsapp_click', 'contact_submit', 'begin_checkout', 'payment_method_select', 'external_link_click',
  'footer_link_click', 'newsletter_subscribe'];
const CLICK_GROUPS = {
  logo_click: 'Logo', nav_click: 'Navigation', category_click: 'Category', product_card_click: 'Product card', product_image_click: 'Product image',
  gallery_nav: 'Image gallery', variant_select: 'Variant', quantity_change: 'Quantity', add_to_cart: 'Add to cart', remove_from_cart: 'Remove from cart',
  wishlist_add: 'Wishlist', wishlist_remove: 'Wishlist', search_result_click: 'Search result', filter_change: 'Filter / sort', sort_change: 'Filter / sort',
  coupon_apply: 'Coupon', coupon_remove: 'Coupon', whatsapp_click: 'WhatsApp', contact_submit: 'Contact form', begin_checkout: 'Checkout',
  payment_method_select: 'Payment method', external_link_click: 'External link', footer_link_click: 'Footer link', newsletter_subscribe: 'Newsletter', click: 'Other click',
};

// ---------- filters ----------
function parseFilters(q) {
  q = q || {};
  let from, to; // IST calendar days, inclusive
  const today = U.localToday();
  switch (q.preset) {
    case 'yesterday': from = to = U.addDays(today, -1); break;
    case '7d': from = U.addDays(today, -6); to = today; break;
    case '30d': from = U.addDays(today, -29); to = today; break;
    case 'custom': from = /^\d{4}-\d{2}-\d{2}$/.test(q.from || '') ? q.from : today; to = /^\d{4}-\d{2}-\d{2}$/.test(q.to || '') ? q.to : from; break;
    default: from = to = today; // 'today'
  }
  if (from > to) [from, to] = [to, from];
  const f = {
    fromDay: from, toDay: to,
    start: U.toSql(U.localDayStartUtc(from)), end: U.toSql(U.localDayStartUtc(U.addDays(to, 1))),
    product: q.product || null, category: q.category || null, source: q.source || null, device: q.device || null, campaign: q.campaign || null,
    visitor: q.visitor || null, session: q.session || null, event: q.event || null,
  };
  if (q.cfrom && q.cto && /^\d{4}-\d{2}-\d{2}$/.test(q.cfrom) && /^\d{4}-\d{2}-\d{2}$/.test(q.cto)) {
    f.cmp = { fromDay: q.cfrom, toDay: q.cto, start: U.toSql(U.localDayStartUtc(q.cfrom)), end: U.toSql(U.localDayStartUtc(U.addDays(q.cto, 1))) };
  }
  return f;
}
// events (alias e)
function evWhere(f, range) {
  const r = range || f; const w = ['e.ts >= ?', 'e.ts < ?']; const p = [r.start, r.end];
  if (f.product) { w.push('e.product_id = ?'); p.push(f.product); }
  if (f.category) { w.push('e.category = ?'); p.push(f.category); }
  if (f.source) { w.push('e.source = ?'); p.push(f.source); }
  if (f.device) { w.push('e.device = ?'); p.push(f.device); }
  if (f.campaign) { w.push('e.campaign = ?'); p.push(f.campaign); }
  return { sql: w.join(' AND '), p };
}
// sessions (alias s)
function sessWhere(f, range) {
  const r = range || f; const w = ['s.started_at >= ?', 's.started_at < ?']; const p = [r.start, r.end];
  if (f.source) { w.push('s.source = ?'); p.push(f.source); }
  if (f.device) { w.push('s.device = ?'); p.push(f.device); }
  if (f.campaign) { w.push('s.campaign = ?'); p.push(f.campaign); }
  if (f.product) { w.push('EXISTS (SELECT 1 FROM an_events x WHERE x.session_id = s.session_id AND x.product_id = ?)'); p.push(f.product); }
  if (f.category) { w.push('EXISTS (SELECT 1 FROM an_events x WHERE x.session_id = s.session_id AND x.category = ?)'); p.push(f.category); }
  return { sql: w.join(' AND '), p };
}
const dayExpr = (col) => `DATE(DATE_ADD(${col}, INTERVAL ${OFF} MINUTE))`;
const vLabel = n => 'RV' + n;
const SOURCE_LABELS = U.SOURCE_LABELS;
const srcLabel = s => SOURCE_LABELS[s] || (s ? s.replace(/_/g, ' ') : 'Unknown');

function pageLabel(path, nameHint) {
  if (!path) return 'Unknown page';
  if (path === '/') return 'Homepage';
  if (path === '/products') return 'Shop / Category';
  if (path.startsWith('/products/')) return 'Product: ' + (nameHint || path.slice(10));
  if (path === '/cart') return 'Cart';
  if (path === '/checkout') return 'Checkout';
  if (path.startsWith('/order-confirmation')) return 'Order Confirmation (page)';
  const t = path.replace(/^\//, '').replace(/[-_/]/g, ' ');
  return t.replace(/\b\w/g, c => c.toUpperCase());
}
function describe(e, first) {
  const el = e.label || e.element || '';
  const pn = e.product_name || '';
  switch (e.name) {
    case 'page_view': return (first ? 'Entered ' : 'Viewed ') + pageLabel(e.page_path);
    case 'page_exit': return `Left ${pageLabel(e.page_path)}${e.duration_ms ? ' after ' + Math.round(e.duration_ms / 1000) + 's' : ''}`;
    case 'scroll_depth': return `Scrolled ${e.scroll_pct}% of ${pageLabel(e.page_path)}`;
    case 'logo_click': return 'Clicked the logo';
    case 'nav_click': return 'Clicked menu: ' + (el || 'link');
    case 'category_click': return 'Clicked category ' + (el || '');
    case 'product_card_click': return 'Clicked product ' + (pn || el);
    case 'product_view': return 'Opened product ' + (pn || e.product_id || '');
    case 'product_image_click': return 'Clicked product image' + (pn ? ' — ' + pn : '');
    case 'gallery_nav': return 'Browsed product images' + (e.label ? ' (' + e.label + ')' : '');
    case 'variant_select': return 'Selected option ' + (el || '');
    case 'quantity_change': return 'Changed quantity' + (e.qty != null ? ' to ' + e.qty : '');
    case 'add_to_cart': return 'Added to cart: ' + (pn || e.product_id || '') + (e.qty > 1 ? ' ×' + e.qty : '');
    case 'remove_from_cart': return 'Removed from cart: ' + (pn || e.product_id || '');
    case 'wishlist_add': return 'Added to wishlist: ' + (pn || e.product_id || '');
    case 'wishlist_remove': return 'Removed from wishlist: ' + (pn || e.product_id || '');
    case 'search': return 'Searched “' + (e.label || '') + '”';
    case 'search_result_click': return 'Clicked search result ' + (pn || '');
    case 'filter_change': return 'Applied filter ' + (el || '');
    case 'sort_change': return 'Changed sort ' + (el || '');
    case 'coupon_apply': return 'Applied coupon ' + (el || '');
    case 'coupon_remove': return 'Removed coupon';
    case 'coupon_fail': return 'Coupon rejected ' + (el || '');
    case 'whatsapp_click': return 'Clicked WhatsApp';
    case 'contact_submit': return 'Submitted the contact form';
    case 'cart_view': return 'Opened cart';
    case 'begin_checkout': return 'Opened checkout' + (pn ? ' (' + pn + ')' : '');
    case 'shipping_step_complete': return 'Completed delivery details';
    case 'payment_method_select': return 'Selected payment: ' + (el || '');
    case 'payment_initiated': return 'Started payment (' + (el || '') + ')';
    case 'payment_failed': return 'Payment failed';
    case 'payment_dismissed': return 'Closed payment window';
    case 'order_success_view': return 'Viewed order confirmation page';
    case 'external_link_click': return 'Clicked external link ' + (el || '');
    case 'footer_link_click': return 'Clicked footer link ' + (el || '');
    case 'newsletter_subscribe': return 'Subscribed to newsletter';
    case 'purchase': return `Purchase verified: ${pn || ''} (order ${e.order_ref})`;
    case 'order_cancelled': return `Order ${e.order_ref} ${e.element || 'cancelled'}`;
    case 'click': return 'Clicked ' + (el || 'page');
    default: return e.name;
  }
}
const EV_COLS = `e.id, e.name, DATE_FORMAT(e.ts,'%Y-%m-%d %H:%i:%s') ts, e.session_id, e.visitor_id, e.page_path, e.product_id, e.product_name, e.category,
  e.element, e.label, e.value, e.qty, e.order_ref, e.scroll_pct, e.duration_ms, e.source, e.device`;
const tsIso = s => (s ? s.replace(' ', 'T') + 'Z' : null);

function create(deps) {
  const { query } = deps;
  const q1 = async (sql, p) => (await query(sql, p))[0] || {};

  // ---------- overview ----------
  async function overview(f) {
    const sw = sessWhere(f);
    const k = await q1(`SELECT COUNT(*) sessions, COUNT(DISTINCT s.visitor_id) visitors, COALESCE(SUM(s.page_views),0) page_views,
      COUNT(DISTINCT CASE WHEN s.is_new=1 THEN s.visitor_id END) new_visitors, COUNT(DISTINCT CASE WHEN s.is_new=0 THEN s.visitor_id END) returning_visitors,
      COALESCE(AVG(TIMESTAMPDIFF(SECOND,s.started_at,s.last_seen)),0) avg_duration,
      SUM(CASE WHEN s.page_views<=1 AND TIMESTAMPDIFF(SECOND,s.started_at,s.last_seen)<10 THEN 1 ELSE 0 END) bounces,
      SUM(s.add_to_cart>0) cart_sessions, SUM(s.checkout>0) checkout_sessions, SUM(s.purchased) purchase_sessions
      FROM an_sessions s WHERE ${sw.sql}`, sw.p);
    const ev = evWhere(f);
    const e = await q1(`SELECT SUM(e.name='add_to_cart') add_to_cart_events, COUNT(DISTINCT CASE WHEN e.name='begin_checkout' THEN e.session_id END) checkout_starts
      FROM an_events e WHERE ${ev.sql}`, ev.p);
    const ow = ['o.created_at >= ?', 'o.created_at < ?', `o.status NOT IN ('unverified',${DEAD_SQL})`]; const op = [f.start, f.end];
    let join = '';
    if (f.source || f.device || f.campaign) {
      join = 'JOIN an_sessions s ON s.session_id=o.session_id';
      if (f.source) { ow.push('s.source=?'); op.push(f.source); } if (f.device) { ow.push('s.device=?'); op.push(f.device); } if (f.campaign) { ow.push('s.campaign=?'); op.push(f.campaign); }
    }
    const o = await q1(`SELECT COUNT(*) orders, COALESCE(SUM(o.amount),0) revenue, SUM(o.amount_match=0) mismatches FROM an_orders o ${join} WHERE ${ow.join(' AND ')}`, op);
    const daily = await query(`SELECT ${dayExpr('s.started_at')} d, COUNT(*) sessions, SUM(s.page_views) page_views FROM an_sessions s WHERE ${sw.sql} GROUP BY d ORDER BY d`, sw.p);
    const dOrders = await query(`SELECT ${dayExpr('o.created_at')} d, COUNT(*) orders, SUM(o.amount) revenue FROM an_orders o ${join} WHERE ${ow.join(' AND ')} GROUP BY d`, op);
    const dm = new Map();
    const dstr = d => (d instanceof Date ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}` : String(d).slice(0, 10));
    daily.forEach(r => dm.set(dstr(r.d), { date: dstr(r.d), sessions: N(r.sessions), page_views: N(r.page_views), orders: 0, revenue: 0 }));
    dOrders.forEach(r => { const key = dstr(r.d); const x = dm.get(key) || { date: key, sessions: 0, page_views: 0, orders: 0, revenue: 0 }; x.orders = N(r.orders); x.revenue = N(r.revenue); dm.set(key, x); });
    const sources = await query(`SELECT s.source, COUNT(*) sessions FROM an_sessions s WHERE ${sw.sql} GROUP BY s.source ORDER BY sessions DESC LIMIT 8`, sw.p);
    const pages = await query(`SELECT e.page_path, COUNT(*) views FROM an_events e WHERE ${ev.sql} AND e.name='page_view' GROUP BY e.page_path ORDER BY views DESC LIMIT 8`, ev.p);
    const devices = await query(`SELECT s.device, COUNT(*) sessions FROM an_sessions s WHERE ${sw.sql} GROUP BY s.device ORDER BY sessions DESC`, sw.p);
    const sessions = N(k.sessions);
    return {
      kpis: {
        visitors: N(k.visitors), sessions, page_views: N(k.page_views), new_visitors: N(k.new_visitors), returning_visitors: N(k.returning_visitors),
        avg_session_seconds: Math.round(N(k.avg_duration)), bounce_rate: pct(N(k.bounces), sessions), engagement_rate: sessions ? Math.round((100 - pct(N(k.bounces), sessions)) * 10) / 10 : 0,
        add_to_cart_events: N(e.add_to_cart_events), cart_sessions: N(k.cart_sessions), checkout_sessions: N(k.checkout_sessions), purchase_sessions: N(k.purchase_sessions),
        orders: N(o.orders), revenue: N(o.revenue), amount_mismatches: N(o.mismatches), conversion_rate: pct(N(k.purchase_sessions), sessions),
      },
      daily: [...dm.values()].sort((a, b) => a.date.localeCompare(b.date)),
      sources: sources.map(r => ({ source: r.source, label: srcLabel(r.source), sessions: N(r.sessions) })),
      pages: pages.map(r => ({ path: r.page_path, label: pageLabel(r.page_path), views: N(r.views) })),
      devices: devices.map(r => ({ device: r.device, sessions: N(r.sessions) })),
    };
  }

  // ---------- live ----------
  async function live() {
    const act = await query(`SELECT s.session_id, s.vnum, s.source, s.device, s.is_new, s.exit_page, s.add_to_cart, s.checkout, s.purchased, s.page_views,
      DATE_FORMAT(s.started_at,'%Y-%m-%d %H:%i:%s') started_at, DATE_FORMAT(s.last_seen,'%Y-%m-%d %H:%i:%s') last_seen,
      TIMESTAMPDIFF(SECOND, s.last_seen, UTC_TIMESTAMP(3)) idle
      FROM an_sessions s WHERE s.last_seen >= DATE_SUB(UTC_TIMESTAMP(3), INTERVAL 5 MINUTE) ORDER BY s.last_seen DESC LIMIT 100`);
    const today = U.toSql(U.localDayStartUtc(U.localToday()));
    const t = await q1(`SELECT COUNT(*) sessions, COALESCE(SUM(page_views),0) page_views, COUNT(DISTINCT CASE WHEN is_new=1 THEN visitor_id END) new_visitors,
      COUNT(DISTINCT CASE WHEN is_new=0 THEN visitor_id END) returning_visitors, COALESCE(AVG(TIMESTAMPDIFF(SECOND,started_at,last_seen)),0) avg_dur,
      SUM(CASE WHEN page_views<=1 AND TIMESTAMPDIFF(SECOND,started_at,last_seen)<10 THEN 1 ELSE 0 END) bounces
      FROM an_sessions WHERE started_at >= ?`, [today]);
    const c = await q1(`SELECT SUM(name='add_to_cart') atc, COUNT(DISTINCT CASE WHEN name='begin_checkout' THEN session_id END) checkouts,
      COUNT(DISTINCT CASE WHEN name='purchase' THEN order_ref END) purchases FROM an_events WHERE ts >= ?`, [today]);
    const feed = await query(`SELECT ${EV_COLS}, (e.name='page_view' AND NOT EXISTS (SELECT 1 FROM an_events p WHERE p.session_id=e.session_id AND p.name='page_view' AND p.id<e.id)) is_first, s.vnum FROM an_events e LEFT JOIN an_sessions s ON s.session_id=e.session_id
      WHERE e.ts >= DATE_SUB(UTC_TIMESTAMP(3), INTERVAL 6 HOUR) AND e.name NOT IN ('page_exit','scroll_depth') ORDER BY e.id DESC LIMIT 80`);
    return {
      now: new Date().toISOString(),
      kpis: {
        active_visitors: act.length, browsing_now: act.filter(a => N(a.idle) <= 90).length,
        new_visitors: N(t.new_visitors), returning_visitors: N(t.returning_visitors), page_views: N(t.page_views), avg_session_seconds: Math.round(N(t.avg_dur)),
        bounce_rate: pct(N(t.bounces), N(t.sessions)), add_to_cart: N(c.atc), checkouts: N(c.checkouts), purchases: N(c.purchases), sessions_today: N(t.sessions),
      },
      active: act.map(a => ({ session_id: a.session_id, visitor: vLabel(a.vnum), source: srcLabel(a.source), device: a.device, is_new: !!a.is_new, page: pageLabel(a.exit_page), path: a.exit_page,
        page_views: N(a.page_views), stage: a.purchased ? 'Purchased' : a.checkout ? 'Checkout' : a.add_to_cart ? 'In cart' : 'Browsing', idle_seconds: N(a.idle), started_at: tsIso(a.started_at) })),
      feed: feed.map(e => ({ id: e.id, ts: tsIso(e.ts), visitor: e.vnum ? vLabel(e.vnum) : 'Order system', session_id: e.session_id, text: describe(e, !!N(e.is_first)), name: e.name })),
    };
  }

  // ---------- visitor activity (events) ----------
  async function activity(f, qs) {
    const ev = evWhere(f); let sql = ev.sql; const p = [...ev.p];
    if (f.session) { sql += ' AND e.session_id = ?'; p.push(f.session); }
    if (f.visitor) { sql += ' AND e.visitor_id = ?'; p.push(f.visitor); }
    if (f.event) { sql += ' AND e.name = ?'; p.push(f.event); }
    const limit = Math.min(500, parseInt(qs.limit, 10) || 100), offset = Math.max(0, parseInt(qs.offset, 10) || 0);
    const total = N((await q1(`SELECT COUNT(*) c FROM an_events e WHERE ${sql}`, p)).c);
    const rows = await query(`SELECT ${EV_COLS}, (e.name='page_view' AND NOT EXISTS (SELECT 1 FROM an_events p WHERE p.session_id=e.session_id AND p.name='page_view' AND p.id<e.id)) is_first, s.vnum FROM an_events e LEFT JOIN an_sessions s ON s.session_id=e.session_id WHERE ${sql} ORDER BY e.id DESC LIMIT ${limit} OFFSET ${offset}`, p);
    const out = rows.map(e => ({ time: tsIso(e.ts), visitor: e.vnum ? vLabel(e.vnum) : '—', session_id: e.session_id, event: e.name, description: describe(e, !!N(e.is_first)), page: e.page_path, product: e.product_name, element: e.element, value: e.value != null ? N(e.value) : null, source: srcLabel(e.source), device: e.device }));
    return { total, tables: { events: { columns: [{ key: 'time', label: 'Time (UTC)' }, { key: 'visitor', label: 'Visitor' }, { key: 'event', label: 'Event' }, { key: 'description', label: 'Description' }, { key: 'page', label: 'Page' }, { key: 'product', label: 'Product' }, { key: 'element', label: 'Element' }, { key: 'value', label: 'Value' }, { key: 'source', label: 'Source' }, { key: 'device', label: 'Device' }], rows: out } }, primary: 'events' };
  }

  // ---------- visitors / sessions list ----------
  async function visitors(f, qs) {
    const sw = sessWhere(f); let sql = sw.sql; const p = [...sw.p];
    const search = (qs.search || '').trim();
    if (/^rv\d+$/i.test(search)) { sql += ' AND s.vnum = ?'; p.push(parseInt(search.slice(2), 10)); }
    else if (search) { sql += ' AND (s.session_id LIKE ? OR s.landing_page LIKE ?)'; p.push(search + '%', '%' + search + '%'); }
    if (f.session) { sql += ' AND s.session_id=?'; p.push(f.session); }
    if (f.visitor) { sql += ' AND s.visitor_id=?'; p.push(f.visitor); }
    const limit = Math.min(500, parseInt(qs.limit, 10) || 100), offset = Math.max(0, parseInt(qs.offset, 10) || 0);
    const total = N((await q1(`SELECT COUNT(*) c FROM an_sessions s WHERE ${sql}`, p)).c);
    const rows = await query(`SELECT s.session_id, s.visitor_id, s.vnum, s.source, s.campaign, s.device, s.browser, s.is_new, s.landing_page, s.exit_page, s.page_views, s.events,
      s.add_to_cart, s.checkout, s.purchased, DATE_FORMAT(s.started_at,'%Y-%m-%d %H:%i:%s') started_at, TIMESTAMPDIFF(SECOND,s.started_at,s.last_seen) dur
      FROM an_sessions s WHERE ${sql} ORDER BY s.started_at DESC LIMIT ${limit} OFFSET ${offset}`, p);
    const out = rows.map(s => ({ session_id: s.session_id, visitor_id: s.visitor_id, visitor: vLabel(s.vnum), started: tsIso(s.started_at), source: srcLabel(s.source), campaign: s.campaign || '', device: s.device, browser: s.browser,
      type: s.is_new ? 'New' : 'Returning', landing: s.landing_page, exit: s.exit_page, page_views: s.page_views, events: s.events, duration_s: N(s.dur),
      stage: s.purchased ? 'Purchased' : s.checkout ? 'Checkout' : s.add_to_cart ? 'Added to cart' : 'Browsed', converted: s.purchased ? 'Yes' : 'No' }));
    return { total, tables: { sessions: { columns: [{ key: 'started', label: 'Started (UTC)' }, { key: 'visitor', label: 'Visitor' }, { key: 'type', label: 'Type' }, { key: 'source', label: 'Source' }, { key: 'campaign', label: 'Campaign' }, { key: 'device', label: 'Device' }, { key: 'browser', label: 'Browser' }, { key: 'landing', label: 'Landing page' }, { key: 'exit', label: 'Exit page' }, { key: 'page_views', label: 'Page views' }, { key: 'duration_s', label: 'Duration (s)' }, { key: 'stage', label: 'Furthest stage' }, { key: 'converted', label: 'Converted' }], rows: out } }, primary: 'sessions', sessions: out };
  }

  // ---------- journey ----------
  async function journey(f) {
    let sid = f.session;
    if (!sid && f.visitor) { const r = await q1('SELECT session_id FROM an_sessions WHERE visitor_id=? ORDER BY started_at DESC LIMIT 1', [f.visitor]); sid = r.session_id; }
    if (!sid) return { error: 'Pick a session' };
    const s = await q1(`SELECT s.*, DATE_FORMAT(s.started_at,'%Y-%m-%d %H:%i:%s') st, DATE_FORMAT(s.last_seen,'%Y-%m-%d %H:%i:%s') ls FROM an_sessions s WHERE s.session_id=?`, [sid]);
    if (!s.session_id) return { error: 'Session not found' };
    const evs = await query(`SELECT ${EV_COLS} FROM an_events e WHERE e.session_id=? ORDER BY e.ts ASC, e.id ASC LIMIT 2000`, [sid]);
    const nodes = []; let cur = null; const products = new Map(); const clicks = []; const timeline = [];
    let first = true;
    for (const e of evs) {
      const text = describe(e, first && e.name === 'page_view');
      if (e.name === 'page_view') first = false;
      timeline.push({ ts: tsIso(e.ts), name: e.name, text });
      if (e.name === 'page_view') { cur = { path: e.page_path, label: pageLabel(e.page_path), ts: tsIso(e.ts), dwell_s: null, scroll: null, actions: [] }; nodes.push(cur); continue; }
      if (e.name === 'page_exit') { const n = [...nodes].reverse().find(x => x.path === e.page_path); if (n) n.dwell_s = Math.round(N(e.duration_ms) / 1000); continue; }
      if (e.name === 'scroll_depth') { const n = [...nodes].reverse().find(x => x.path === e.page_path); if (n) n.scroll = Math.max(n.scroll || 0, N(e.scroll_pct)); continue; }
      if (e.product_id && ['product_view', 'add_to_cart', 'product_card_click', 'wishlist_add', 'purchase'].includes(e.name)) {
        const pr = products.get(e.product_id) || { id: e.product_id, name: e.product_name, viewed: false, added: false, bought: false };
        if (e.name === 'product_view') pr.viewed = true; if (e.name === 'add_to_cart') pr.added = true; if (e.name === 'purchase') pr.bought = true;
        products.set(e.product_id, pr);
        if (e.name === 'product_view' && cur && cur.path && cur.path.startsWith('/products/')) cur.label = 'Product: ' + (e.product_name || cur.path.slice(10));
      }
      if (CLICK_NAMES.includes(e.name)) clicks.push({ ts: tsIso(e.ts), text });
      (cur || (cur = { path: null, label: 'Before first page view', ts: tsIso(e.ts), dwell_s: null, scroll: null, actions: [] }, nodes.push(cur))).actions.push({ ts: tsIso(e.ts), name: e.name, text });
    }
    const orders = await query('SELECT order_ref, amount, payment_method, status FROM an_orders WHERE session_id=?', [sid]);
    const stages = [{ type: 'source', label: srcLabel(s.source) + (s.campaign ? ' · ' + s.campaign : '') }, ...nodes.map(n => ({ type: 'page', ...n }))];
    return {
      session: { session_id: s.session_id, visitor_id: s.visitor_id, visitor: vLabel(s.vnum), started: tsIso(s.st), last_seen: tsIso(s.ls), source: srcLabel(s.source), medium: s.medium, campaign: s.campaign, device: s.device, browser: s.browser, os: s.os,
        type: s.is_new ? 'New visitor' : 'Returning visitor', landing: s.landing_page, exit_page: s.exit_page, page_views: s.page_views, duration_s: Math.max(0, Math.round((U.fromSql(s.ls) - U.fromSql(s.st)) / 1000)) },
      conversion: orders.length ? { status: 'Converted', orders: orders.map(o => ({ ref: o.order_ref, amount: N(o.amount), method: o.payment_method, status: o.status })) } : { status: s.checkout ? 'Abandoned at checkout' : s.add_to_cart ? 'Abandoned cart' : 'No cart activity' },
      stages, products: [...products.values()], clicks, timeline,
    };
  }

  // ---------- pages ----------
  async function pages(f) {
    const ev = evWhere(f);
    const rows = await query(`SELECT e.page_path, SUM(e.name='page_view') views, COUNT(DISTINCT CASE WHEN e.name='page_view' THEN e.visitor_id END) uniq,
      AVG(CASE WHEN e.name='page_exit' AND e.duration_ms>0 THEN e.duration_ms END) avg_ms, AVG(CASE WHEN e.name='scroll_depth' THEN e.scroll_pct END) avg_scroll,
      SUM(e.name='click') clicks FROM an_events e WHERE ${ev.sql} AND e.page_path IS NOT NULL GROUP BY e.page_path HAVING views > 0 ORDER BY views DESC LIMIT 300`, ev.p);
    const sw = sessWhere(f);
    const ent = await query(`SELECT s.landing_page p, COUNT(*) c FROM an_sessions s WHERE ${sw.sql} GROUP BY s.landing_page`, sw.p);
    const ext = await query(`SELECT s.exit_page p, COUNT(*) c FROM an_sessions s WHERE ${sw.sql} GROUP BY s.exit_page`, sw.p);
    const em = new Map(ent.map(r => [r.p, N(r.c)])), xm = new Map(ext.map(r => [r.p, N(r.c)]));
    const out = rows.map(r => ({ page: r.page_path, label: pageLabel(r.page_path), views: N(r.views), unique_visitors: N(r.uniq), avg_time_s: Math.round(N(r.avg_ms) / 1000), avg_scroll_pct: Math.round(N(r.avg_scroll)),
      entrances: em.get(r.page_path) || 0, exits: xm.get(r.page_path) || 0, exit_rate: pct(xm.get(r.page_path) || 0, N(r.views)) }));
    return { tables: { pages: { columns: [{ key: 'page', label: 'Page' }, { key: 'label', label: 'Name' }, { key: 'views', label: 'Views' }, { key: 'unique_visitors', label: 'Unique visitors' }, { key: 'avg_time_s', label: 'Avg time (s)' }, { key: 'avg_scroll_pct', label: 'Avg scroll %' }, { key: 'entrances', label: 'Entrances' }, { key: 'exits', label: 'Exits' }, { key: 'exit_rate', label: 'Exit rate %' }], rows: out } }, primary: 'pages' };
  }

  // ---------- products ----------
  async function products(f) {
    const ev = evWhere(f);
    const rows = await query(`SELECT e.product_id, MAX(e.product_name) name, MAX(e.category) category,
      SUM(e.name='product_view') views, COUNT(DISTINCT CASE WHEN e.name='product_view' THEN e.visitor_id END) uniq_visitors,
      SUM(e.name='product_card_click') clicks, SUM(e.name IN ('product_image_click','gallery_nav')) gallery,
      SUM(e.name='add_to_cart') atc, COUNT(DISTINCT CASE WHEN e.name='add_to_cart' THEN e.session_id END) atc_sessions,
      SUM(e.name='wishlist_add') wishlist,
      COUNT(DISTINCT CASE WHEN e.name='begin_checkout' THEN e.session_id END) checkouts,
      COUNT(DISTINCT CASE WHEN ${PURCHASE_OK} THEN e.order_ref END) purchases,
      COALESCE(SUM(CASE WHEN ${PURCHASE_OK} THEN e.qty END),0) units,
      COALESCE(SUM(CASE WHEN ${PURCHASE_OK} THEN e.value END),0) revenue,
      COUNT(DISTINCT CASE WHEN ${PURCHASE_OK} THEN e.session_id END) purchase_sessions
      FROM an_events e LEFT JOIN an_orders o ON o.order_ref=e.order_ref
      WHERE ${ev.sql} AND e.product_id IS NOT NULL GROUP BY e.product_id LIMIT 500`, ev.p);
    const list = rows.map(r => {
      const views = N(r.views), uv = N(r.uniq_visitors), purchases = N(r.purchases);
      return { product_id: r.product_id, name: r.name || ('Product ' + r.product_id), category: r.category || '', views, unique_visitors: uv, clicks: N(r.clicks), gallery: N(r.gallery), add_to_cart: N(r.atc),
        wishlist: N(r.wishlist), checkouts: N(r.checkouts), purchases, units: N(r.units), revenue: N(r.revenue), conversion_rate: pct(purchases, uv || views),
        cart_abandonment: N(r.atc_sessions) ? Math.max(0, Math.round((1 - N(r.purchase_sessions) / N(r.atc_sessions)) * 1000) / 10) : null };
    });
    const top = (key, n = 10) => [...list].sort((a, b) => b[key] - a[key]).filter(x => x[key] > 0).slice(0, n);
    const cols = [{ key: 'name', label: 'Product' }, { key: 'category', label: 'Category' }, { key: 'views', label: 'Views' }, { key: 'unique_visitors', label: 'Unique visitors' }, { key: 'clicks', label: 'Card clicks' }, { key: 'gallery', label: 'Gallery interactions' }, { key: 'add_to_cart', label: 'Add to cart' }, { key: 'wishlist', label: 'Wishlist' }, { key: 'checkouts', label: 'Checkout initiations' }, { key: 'purchases', label: 'Purchases' }, { key: 'units', label: 'Units sold' }, { key: 'conversion_rate', label: 'Conversion %' }, { key: 'revenue', label: 'Revenue (₹)' }, { key: 'cart_abandonment', label: 'Cart abandonment %' }];
    return { rankings: { most_viewed: top('views'), most_clicked: top('clicks'), most_added: top('add_to_cart'), most_purchased: top('purchases'),
      high_views_low_purchases: list.filter(x => x.views >= 5 && x.conversion_rate < 2).sort((a, b) => b.views - a.views).slice(0, 10) },
      tables: { products: { columns: cols, rows: list.sort((a, b) => b.views - a.views) } }, primary: 'products' };
  }

  // ---------- clicks ----------
  async function clicks(f) {
    const ev = evWhere(f); const ph = CLICK_NAMES.map(() => '?').join(',');
    const rows = await query(`SELECT e.name, e.element, MAX(e.label) label, COUNT(*) clicks, COUNT(DISTINCT e.session_id) sessions FROM an_events e
      WHERE ${ev.sql} AND e.name IN (${ph}) GROUP BY e.name, e.element ORDER BY clicks DESC LIMIT 500`, [...ev.p, ...CLICK_NAMES]);
    const detail = rows.map(r => ({ group: CLICK_GROUPS[r.name] || r.name, event: r.name, element: r.element || '', label: r.label || '', clicks: N(r.clicks), sessions: N(r.sessions) }));
    const groups = {}; detail.forEach(d => { groups[d.group] = (groups[d.group] || 0) + d.clicks; });
    const searches = await query(`SELECT e.label term, COUNT(*) c FROM an_events e WHERE ${ev.sql} AND e.name='search' AND e.label IS NOT NULL GROUP BY e.label ORDER BY c DESC LIMIT 30`, ev.p);
    return { groups: Object.entries(groups).map(([group, clicks]) => ({ group, clicks })).sort((a, b) => b.clicks - a.clicks),
      searches: searches.map(r => ({ term: r.term, count: N(r.c) })),
      tables: { clicks: { columns: [{ key: 'group', label: 'Type' }, { key: 'element', label: 'Element' }, { key: 'label', label: 'Label' }, { key: 'clicks', label: 'Clicks' }, { key: 'sessions', label: 'Sessions' }], rows: detail } }, primary: 'clicks' };
  }

  // ---------- funnel ----------
  const STAGES = [
    ['Website visitors', "e.name='page_view'"], ['Homepage visitors', "e.name='page_view' AND e.page_path='/'"], ['Product viewers', "e.name='product_view'"],
    ['Added to cart', "e.name='add_to_cart'"], ['Checkout started', "e.name='begin_checkout'"], ['Payment initiated', "e.name='payment_initiated'"], ['Successful orders', "e.name='purchase'"],
  ];
  async function funnelFor(f, range) {
    const ev = evWhere(f, range);
    const sel = STAGES.map(([, c], i) => `MAX(CASE WHEN ${c} THEN 1 ELSE 0 END) s${i}`).join(',');
    const flags = await query(`SELECT e.session_id, ${sel} FROM an_events e WHERE ${ev.sql} AND e.session_id IS NOT NULL GROUP BY e.session_id`, ev.p);
    const exact = STAGES.map(() => 0), cum = STAGES.map(() => 0);
    for (const r of flags) {
      let maxIdx = -1; STAGES.forEach((_, i) => { if (N(r['s' + i])) { exact[i]++; if (i > maxIdx && i !== 1) maxIdx = i; } });
      for (let i = 0; i <= maxIdx; i++) if (i !== 1) cum[i]++;
      if (N(r.s1)) cum[1]++;
    }
    const build = arr => STAGES.map(([label], i) => ({ stage: label, count: arr[i], pct_of_first: pct(arr[i], arr[0]), drop_pct: i === 0 ? 0 : (arr[i - 1] ? Math.max(0, Math.round((1 - arr[i] / arr[i - 1]) * 1000) / 10) : 0), entered_mid_funnel: i > 0 && arr[i] > arr[i - 1] ? arr[i] - arr[i - 1] : 0 }));
    return { exact: build(exact), cumulative: build(cum) };
  }
  async function funnel(f) {
    const main = await funnelFor(f);
    const cmp = f.cmp ? await funnelFor(f, f.cmp) : null;
    const noConsent = N((await q1(`SELECT COUNT(*) c FROM an_orders WHERE created_at >= ? AND created_at < ? AND session_id IS NULL AND status IN ('paid','cod_placed')`, [f.start, f.end])).c);
    const rows = main.cumulative.map((s, i) => ({ stage: s.stage, sessions: s.count, drop_pct: s.drop_pct, exact_sessions: main.exact[i].count, ...(cmp ? { compare_sessions: cmp.cumulative[i].count, compare_drop_pct: cmp.cumulative[i].drop_pct } : {}) }));
    const columns = [{ key: 'stage', label: 'Stage' }, { key: 'sessions', label: 'Sessions (reached stage or beyond)' }, { key: 'drop_pct', label: 'Drop-off %' }, { key: 'exact_sessions', label: 'Sessions (exact)' }, ...(cmp ? [{ key: 'compare_sessions', label: 'Compare: sessions' }, { key: 'compare_drop_pct', label: 'Compare: drop-off %' }] : [])];
    return { main, compare: cmp, orders_without_analytics_consent: noConsent, tables: { funnel: { columns, rows } }, primary: 'funnel' };
  }

  // ---------- sources & campaigns ----------
  async function groupedByAcquisition(f, keyCols, keyLabelFn, extraSelectKeys) {
    const sw = sessWhere(f); const ev = evWhere(f);
    const sessRows = await query(`SELECT ${keyCols.map(c => 's.' + c).join(',')}, COUNT(DISTINCT s.visitor_id) visitors, COUNT(*) sessions FROM an_sessions s WHERE ${sw.sql} GROUP BY ${keyCols.map(c => 's.' + c).join(',')}`, sw.p);
    const evRows = await query(`SELECT ${keyCols.map(c => 'e.' + c).join(',')}, SUM(e.name='product_view') product_views, SUM(e.name IN ('whatsapp_click','contact_submit')) enquiries,
      COUNT(DISTINCT CASE WHEN e.name='add_to_cart' THEN e.session_id END) atc_sessions, SUM(e.name='add_to_cart') atc_events,
      COUNT(DISTINCT CASE WHEN ${PURCHASE_OK} THEN e.order_ref END) purchases
      FROM an_events e LEFT JOIN an_orders o ON o.order_ref=e.order_ref WHERE ${ev.sql} GROUP BY ${keyCols.map(c => 'e.' + c).join(',')}`, ev.p);
    const ow = ['o.created_at >= ?', 'o.created_at < ?', `o.status IN ('paid','cod_placed')`]; const op = [f.start, f.end];
    const ordRows = await query(`SELECT ${keyCols.map(c => 's.' + c).join(',')}, COUNT(*) orders, COALESCE(SUM(o.amount),0) revenue FROM an_orders o LEFT JOIN an_sessions s ON s.session_id=o.session_id WHERE ${ow.join(' AND ')} GROUP BY ${keyCols.map(c => 's.' + c).join(',')}`, op);
    const key = r => keyCols.map(c => r[c] == null ? '' : r[c]).join('|');
    const m = new Map();
    const get = r => { const k = key(r); if (!m.has(k)) { const o = { visitors: 0, sessions: 0, product_views: 0, enquiries: 0, atc_sessions: 0, atc_events: 0, orders: 0, revenue: 0 }; keyCols.forEach(c => { o[c] = r[c] == null ? '' : r[c]; }); m.set(k, o); } return m.get(k); };
    sessRows.forEach(r => { const o = get(r); o.visitors = N(r.visitors); o.sessions = N(r.sessions); });
    evRows.forEach(r => { const o = get(r); o.product_views = N(r.product_views); o.enquiries = N(r.enquiries); o.atc_sessions = N(r.atc_sessions); o.atc_events = N(r.atc_events); });
    ordRows.forEach(r => { const o = get(r); o.orders = N(r.orders); o.revenue = N(r.revenue); });
    return [...m.values()].filter(o => o.sessions || o.orders).map(o => ({ ...keyLabelFn(o), ...o, conversion_rate: pct(o.orders, o.sessions) })).sort((a, b) => b.sessions - a.sessions);
  }
  async function sources(f) {
    const rows = await groupedByAcquisition(f, ['source'], o => ({ label: o.source ? srcLabel(o.source) : 'Unattributed (no analytics consent)' }));
    const cols = [{ key: 'label', label: 'Source' }, { key: 'visitors', label: 'Visitors' }, { key: 'sessions', label: 'Sessions' }, { key: 'product_views', label: 'Product views' }, { key: 'enquiries', label: 'Enquiries' }, { key: 'atc_events', label: 'Add-to-cart events' }, { key: 'orders', label: 'Orders' }, { key: 'conversion_rate', label: 'Conversion %' }, { key: 'revenue', label: 'Revenue (₹)' }];
    const best = k => rows.filter(r => r[k] > 0).sort((a, b) => b[k] - a[k])[0];
    return { highlights: { most_visitors: best('visitors') && best('visitors').label, most_product_views: best('product_views') && best('product_views').label, most_enquiries: best('enquiries') && best('enquiries').label, most_add_to_cart: best('atc_events') && best('atc_events').label, most_purchases: best('orders') && best('orders').label, highest_revenue: best('revenue') && best('revenue').label }, tables: { sources: { columns: cols, rows } }, primary: 'sources' };
  }
  async function campaigns(f) {
    const rows = await groupedByAcquisition(f, ['source', 'medium', 'campaign', 'utm_content', 'utm_term'], o => ({ label: o.campaign || '(no campaign)', source_label: o.source ? srcLabel(o.source) : 'Unattributed' }));
    const cols = [{ key: 'label', label: 'utm_campaign' }, { key: 'source_label', label: 'Source' }, { key: 'medium', label: 'Medium' }, { key: 'utm_content', label: 'Content' }, { key: 'utm_term', label: 'Term' }, { key: 'sessions', label: 'Sessions' }, { key: 'product_views', label: 'Product views' }, { key: 'atc_events', label: 'Add-to-cart events' }, { key: 'orders', label: 'Orders' }, { key: 'conversion_rate', label: 'Conversion %' }, { key: 'revenue', label: 'Revenue (₹)' }];
    return { tables: { campaigns: { columns: cols, rows: rows.filter(r => r.campaign || r.medium === 'paid' || r.medium === 'campaign') } }, primary: 'campaigns', all: rows };
  }

  // ---------- cart & checkout ----------
  async function cart(f) {
    const ev = evWhere(f);
    const c = await q1(`SELECT COUNT(DISTINCT CASE WHEN e.name='cart_view' THEN e.session_id END) cart_views, SUM(e.name='add_to_cart') adds, COUNT(DISTINCT CASE WHEN e.name='add_to_cart' THEN e.session_id END) add_sessions,
      SUM(e.name='remove_from_cart') removes, SUM(e.name='quantity_change') qty_changes, COALESCE(SUM(CASE WHEN e.name='add_to_cart' THEN e.value END),0) added_value,
      COUNT(DISTINCT CASE WHEN e.name='begin_checkout' THEN e.session_id END) checkout_sessions, COUNT(DISTINCT CASE WHEN e.name='shipping_step_complete' THEN e.session_id END) shipping_done,
      COUNT(DISTINCT CASE WHEN e.name='payment_initiated' THEN e.session_id END) payment_started, SUM(e.name='payment_failed') payment_failed, SUM(e.name='payment_dismissed') payment_dismissed,
      COUNT(DISTINCT CASE WHEN e.name='order_success_view' THEN e.session_id END) confirmation_views FROM an_events e WHERE ${ev.sql}`, ev.p);
    const pm = await query(`SELECT e.element method, COUNT(*) c FROM an_events e WHERE ${ev.sql} AND e.name='payment_method_select' GROUP BY e.element`, ev.p);
    const ow = await query(`SELECT o.status, o.payment_method, COUNT(*) c, COALESCE(SUM(o.amount),0) amt FROM an_orders o WHERE o.created_at >= ? AND o.created_at < ? GROUP BY o.status, o.payment_method`, [f.start, f.end]);
    const sw = sessWhere(f);
    const aband = await query(`SELECT s.session_id, s.vnum, s.source, s.device, s.checkout, DATE_FORMAT(s.last_seen,'%Y-%m-%d %H:%i:%s') last_seen,
      (SELECT COALESCE(SUM(x.value),0) FROM an_events x WHERE x.session_id=s.session_id AND x.name='add_to_cart') cart_value,
      (SELECT GROUP_CONCAT(DISTINCT x.product_name SEPARATOR ', ') FROM an_events x WHERE x.session_id=s.session_id AND x.name='add_to_cart') items
      FROM an_sessions s WHERE ${sw.sql} AND s.add_to_cart>0 AND s.purchased=0 ORDER BY s.last_seen DESC LIMIT 100`, sw.p);
    const orders = ow.filter(r => ['paid', 'cod_placed'].includes(r.status));
    const successOrders = orders.reduce((a, r) => a + N(r.c), 0);
    const cancelled = ow.filter(r => DEAD.includes(r.status)).reduce((a, r) => a + N(r.c), 0);
    const unverified = ow.filter(r => r.status === 'unverified').reduce((a, r) => a + N(r.c), 0);
    const aRows = aband.map(a => ({ visitor: vLabel(a.vnum), session_id: a.session_id, source: srcLabel(a.source), device: a.device, stage: a.checkout ? 'Reached checkout' : 'Left in cart', cart_value: N(a.cart_value), items: (a.items || '').slice(0, 160), last_seen: tsIso(a.last_seen) }));
    return {
      steps: { cart_views: N(c.cart_views), add_to_cart_events: N(c.adds), add_to_cart_sessions: N(c.add_sessions), removed: N(c.removes), quantity_changes: N(c.qty_changes), avg_cart_add_value: N(c.adds) ? Math.round(N(c.added_value) / N(c.adds)) : 0,
        checkout_sessions: N(c.checkout_sessions), shipping_completed: N(c.shipping_done), payment_initiated: N(c.payment_started), payment_failed: N(c.payment_failed), payment_dismissed: N(c.payment_dismissed),
        confirmation_page_views: N(c.confirmation_views), verified_orders: successOrders, cancelled_or_returned: cancelled, unverified_orders: unverified,
        cart_abandonment_rate: N(c.add_sessions) ? Math.max(0, pct(N(c.add_sessions) - Math.min(N(c.add_sessions), successOrders), N(c.add_sessions))) : 0,
        checkout_abandonment_rate: N(c.checkout_sessions) ? Math.max(0, pct(N(c.checkout_sessions) - Math.min(N(c.checkout_sessions), successOrders), N(c.checkout_sessions))) : 0 },
      payment_methods: pm.map(r => ({ method: r.method || '?', count: N(r.c) })),
      order_status: ow.map(r => ({ status: r.status, method: r.payment_method, count: N(r.c), amount: N(r.amt) })),
      tables: { abandoned_carts: { columns: [{ key: 'last_seen', label: 'Last seen (UTC)' }, { key: 'visitor', label: 'Visitor' }, { key: 'source', label: 'Source' }, { key: 'device', label: 'Device' }, { key: 'stage', label: 'Stage' }, { key: 'cart_value', label: 'Cart value (₹)' }, { key: 'items', label: 'Items' }], rows: aRows } }, primary: 'abandoned_carts',
    };
  }

  // ---------- behaviour reports ----------
  async function behaviour(f) {
    const sw = sessWhere(f); const ev = evWhere(f);
    const hourly = await query(`SELECT HOUR(DATE_ADD(s.started_at, INTERVAL ${OFF} MINUTE)) h, COUNT(*) c FROM an_sessions s WHERE ${sw.sql} GROUP BY h ORDER BY h`, sw.p);
    const nr = await query(`SELECT IF(s.is_new=1,'New','Returning') type, COUNT(*) sessions, SUM(s.purchased) purchases, AVG(TIMESTAMPDIFF(SECOND,s.started_at,s.last_seen)) dur FROM an_sessions s WHERE ${sw.sql} GROUP BY s.is_new`, sw.p);
    const dev = await query(`SELECT s.device, COUNT(*) sessions, SUM(s.add_to_cart>0) carts, SUM(s.purchased) purchases FROM an_sessions s WHERE ${sw.sql} GROUP BY s.device`, sw.p);
    const land = await query(`SELECT s.landing_page p, COUNT(*) sessions, SUM(s.page_views<=1) single FROM an_sessions s WHERE ${sw.sql} GROUP BY s.landing_page ORDER BY sessions DESC LIMIT 15`, sw.p);
    const exits = await query(`SELECT s.exit_page p, COUNT(*) c FROM an_sessions s WHERE ${sw.sql} AND s.purchased=0 GROUP BY s.exit_page ORDER BY c DESC LIMIT 15`, sw.p);
    const search = await query(`SELECT e.label term, COUNT(*) c FROM an_events e WHERE ${ev.sql} AND e.name='search' AND e.label IS NOT NULL GROUP BY e.label ORDER BY c DESC LIMIT 20`, ev.p);
    const ttp = await q1(`SELECT AVG(TIMESTAMPDIFF(MINUTE,s.started_at,s.last_seen)) mins FROM an_sessions s WHERE ${sw.sql} AND s.purchased=1`, sw.p);
    const T = (name, columns, rows) => ({ columns, rows });
    return {
      avg_minutes_to_purchase: Math.round(N(ttp.mins) * 10) / 10,
      tables: {
        hourly: T('hourly', [{ key: 'hour', label: 'Hour (IST)' }, { key: 'sessions', label: 'Sessions' }], hourly.map(r => ({ hour: String(N(r.h)).padStart(2, '0') + ':00', sessions: N(r.c) }))),
        new_vs_returning: T('nr', [{ key: 'type', label: 'Visitor type' }, { key: 'sessions', label: 'Sessions' }, { key: 'purchases', label: 'Purchases' }, { key: 'conversion', label: 'Conversion %' }, { key: 'avg_duration_s', label: 'Avg duration (s)' }], nr.map(r => ({ type: r.type, sessions: N(r.sessions), purchases: N(r.purchases), conversion: pct(N(r.purchases), N(r.sessions)), avg_duration_s: Math.round(N(r.dur)) }))),
        devices: T('dev', [{ key: 'device', label: 'Device' }, { key: 'sessions', label: 'Sessions' }, { key: 'carts', label: 'Added to cart' }, { key: 'purchases', label: 'Purchases' }, { key: 'conversion', label: 'Conversion %' }], dev.map(r => ({ device: r.device, sessions: N(r.sessions), carts: N(r.carts), purchases: N(r.purchases), conversion: pct(N(r.purchases), N(r.sessions)) }))),
        landing_pages: T('land', [{ key: 'page', label: 'Landing page' }, { key: 'sessions', label: 'Sessions' }, { key: 'single_page_rate', label: 'Single-page visits %' }], land.map(r => ({ page: r.p, sessions: N(r.sessions), single_page_rate: pct(N(r.single), N(r.sessions)) }))),
        exit_pages: T('exit', [{ key: 'page', label: 'Exit page (non-buyers)' }, { key: 'sessions', label: 'Sessions' }], exits.map(r => ({ page: r.p, sessions: N(r.c) }))),
        searches: T('search', [{ key: 'term', label: 'Search term' }, { key: 'count', label: 'Searches' }], search.map(r => ({ term: r.term, count: N(r.c) }))),
      }, primary: 'landing_pages',
    };
  }

  // ---------- heatmap ----------
  async function heatmap(f, qs) {
    const page = qs.page || '/';
    const bucket = qs.bucket || 'desktop';
    const vwSql = bucket === 'mobile' ? 'e.vw < 640' : bucket === 'tablet' ? 'e.vw >= 640 AND e.vw < 1024' : 'e.vw >= 1024';
    const pageSql = page.endsWith('*') ? 'e.page_path LIKE ?' : 'e.page_path = ?';
    const pageP = page.endsWith('*') ? page.slice(0, -1).replace(/[%_]/g, '') + '%' : page;
    const ev = evWhere(f);
    const pts = await query(`SELECT ROUND(e.x_pct/2)*2 xb, FLOOR(e.y_px/40)*40 yb, COUNT(*) c FROM an_events e
      WHERE ${ev.sql} AND ${pageSql} AND ${vwSql} AND e.x_pct IS NOT NULL AND e.y_px IS NOT NULL GROUP BY xb, yb ORDER BY c DESC LIMIT 2000`, [...ev.p, pageP]);
    const els = await query(`SELECT e.element, MAX(e.label) label, e.name, COUNT(*) c FROM an_events e WHERE ${ev.sql} AND ${pageSql} AND ${vwSql} AND e.x_pct IS NOT NULL AND e.element IS NOT NULL GROUP BY e.element, e.name ORDER BY c DESC LIMIT 25`, [...ev.p, pageP]);
    const sc = await q1(`SELECT SUM(e.name='page_view') views, SUM(e.name='scroll_depth' AND e.scroll_pct>=25) s25, SUM(e.name='scroll_depth' AND e.scroll_pct>=50) s50, SUM(e.name='scroll_depth' AND e.scroll_pct>=75) s75, SUM(e.name='scroll_depth' AND e.scroll_pct>=100) s100
      FROM an_events e WHERE ${ev.sql} AND ${pageSql}`, [...ev.p, pageP]);
    const pagesList = await query(`SELECT e.page_path p, COUNT(*) c FROM an_events e WHERE ${ev.sql} AND e.x_pct IS NOT NULL GROUP BY e.page_path ORDER BY c DESC LIMIT 40`, ev.p);
    const v = N(sc.views);
    return {
      page, bucket, total_clicks: pts.reduce((a, r) => a + N(r.c), 0), points: pts.map(r => ({ x: N(r.xb), y: N(r.yb), c: N(r.c) })),
      top_elements: els.map(r => ({ element: r.element, label: r.label || '', type: r.name, clicks: N(r.c) })),
      scroll: { views: v, reach_25: pct(N(sc.s25), v), reach_50: pct(N(sc.s50), v), reach_75: pct(N(sc.s75), v), reach_100: pct(N(sc.s100), v) },
      pages: pagesList.map(r => ({ page: r.p, clicks: N(r.c) })),
      tables: { elements: { columns: [{ key: 'element', label: 'Element' }, { key: 'label', label: 'Label' }, { key: 'type', label: 'Event' }, { key: 'clicks', label: 'Clicks' }], rows: els.map(r => ({ element: r.element, label: r.label || '', type: r.name, clicks: N(r.c) })) } }, primary: 'elements',
    };
  }

  async function filterOptions() {
    const sources = await query('SELECT DISTINCT source FROM an_sessions WHERE source IS NOT NULL ORDER BY source');
    const campaigns = await query("SELECT DISTINCT campaign FROM an_sessions WHERE campaign IS NOT NULL AND campaign<>'' ORDER BY campaign LIMIT 200");
    const cats = await query("SELECT DISTINCT category FROM an_events WHERE category IS NOT NULL ORDER BY category");
    const prods = await query("SELECT product_id, MAX(product_name) name FROM an_events WHERE product_id IS NOT NULL GROUP BY product_id ORDER BY name LIMIT 500");
    return { sources: sources.map(r => ({ value: r.source, label: srcLabel(r.source) })), campaigns: campaigns.map(r => r.campaign), categories: cats.map(r => r.category), products: prods.map(r => ({ id: r.product_id, name: r.name })), devices: ['desktop', 'mobile', 'tablet'] };
  }

  return { parseFilters, overview, live, activity, visitors, journey, pages, products, clicks, funnel, sources, campaigns, cart, behaviour, heatmap, filterOptions };
}
module.exports = { create, parseFilters };
