'use strict';
const U = require('./util');

// Events a browser may send. Server-only events (purchase, order_cancelled) are NOT accepted from clients.
const CLIENT_EVENTS = new Set([
  'page_view', 'page_exit', 'scroll_depth', 'click', 'logo_click', 'nav_click', 'category_click', 'product_card_click',
  'product_view', 'product_image_click', 'gallery_nav', 'variant_select', 'quantity_change', 'add_to_cart',
  'remove_from_cart', 'wishlist_add', 'wishlist_remove', 'search', 'search_result_click', 'filter_change', 'sort_change',
  'coupon_apply', 'coupon_remove', 'coupon_fail', 'whatsapp_click', 'contact_submit', 'cart_view', 'begin_checkout',
  'shipping_step_complete', 'payment_method_select', 'payment_initiated', 'payment_failed', 'payment_dismissed',
  'order_success_view', 'external_link_click', 'footer_link_click', 'newsletter_subscribe', 'heartbeat',
]);
const MAX_EVENTS = 50;
const SESSION_HOURLY_CAP = 3000;

// ---- in-memory rate limiting (no dependency) ----
const ipHits = new Map();   // ip -> {n, reset}
const sessHits = new Map(); // sid -> {n, reset}
function hit(map, key, limit, windowMs, inc = 1) {
  const now = Date.now();
  let r = map.get(key);
  if (!r || r.reset < now) { r = { n: 0, reset: now + windowMs }; map.set(key, r); }
  r.n += inc;
  return r.n <= limit;
}
setInterval(() => {
  const now = Date.now();
  for (const m of [ipHits, sessHits]) for (const [k, v] of m) if (v.reset < now) m.delete(k);
}, 5 * 60 * 1000).unref();

function clientIp(request) {
  const xf = request.headers['x-forwarded-for'];
  return (xf ? String(xf).split(',')[0].trim() : request.ip) || 'unknown';
}

function create(deps) {
  const { query, catalog } = deps;
  const vnumCache = new Map();

  async function visitorNumber(vid, now) {
    if (vnumCache.has(vid)) return { vnum: vnumCache.get(vid), isNew: false };
    const r = await query(
      'INSERT INTO an_visitors (visitor_id, first_seen, last_seen, sessions) VALUES (?,?,?,0) ON DUPLICATE KEY UPDATE last_seen=VALUES(last_seen)',
      [vid, now, now]);
    const isNew = r.affectedRows === 1;
    const rows = await query('SELECT id FROM an_visitors WHERE visitor_id=?', [vid]);
    const vnum = 1000 + rows[0].id;
    if (vnumCache.size > 5000) vnumCache.clear();
    vnumCache.set(vid, vnum);
    return { vnum, isNew };
  }

  async function ensureSession(sid, vid, ctx, ua, now) {
    const existing = await query('SELECT source, medium, campaign, device, browser, utm_content, utm_term FROM an_sessions WHERE session_id=?', [sid]);
    if (existing.length) return existing[0];
    const { vnum, isNew } = await visitorNumber(vid, now);
    const utm = (ctx && ctx.utm) || {};
    const cls = U.classifySource({
      referrer: ctx && ctx.ref, utm_source: utm.source, utm_medium: utm.medium, gclid: ctx && ctx.gclid,
      ownHosts: ['ravari.in'],
    });
    const dev = U.parseUA(ua, ctx && U.num(ctx.vw, 0, 10000));
    const row = {
      source: cls.source, medium: cls.medium, campaign: U.clip(utm.campaign, 120),
      device: dev.device, browser: dev.browser, utm_content: U.clip(utm.content, 120), utm_term: U.clip(utm.term, 120),
    };
    const r = await query(
      `INSERT IGNORE INTO an_sessions (session_id, visitor_id, vnum, started_at, last_seen, landing_page, exit_page, referrer, source, medium, campaign,
        utm_source, utm_medium, utm_campaign, utm_content, utm_term, device, browser, os, is_new)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [sid, vid, vnum, now, now, U.cleanPath(ctx && ctx.landing), U.cleanPath(ctx && ctx.landing),
        U.clip(ctx && ctx.ref && U.cleanUrl(ctx.ref) ? (() => { try { const u = new URL(ctx.ref); return u.origin + u.pathname; } catch (_) { return null; } })() : null, 500),
        cls.source, cls.medium, row.campaign, U.clip(utm.source, 120), U.clip(utm.medium, 120), U.clip(utm.campaign, 120),
        row.utm_content, row.utm_term, dev.device, dev.browser, dev.os, isNew ? 1 : 0]);
    if (r.affectedRows === 1) await query('UPDATE an_visitors SET sessions = sessions + 1 WHERE visitor_id=?', [vid]);
    return row;
  }

  async function enrichProduct(ev) {
    if (!ev.product_id && !ev.sku) return;
    const c = await catalog();
    const p = ev.product_id ? c.get(String(ev.product_id)) : c.get('slug:' + ev.sku);
    if (p) { // catalogue is the source of truth for names/categories (cart lines carry variant suffixes)
      ev.product_id = ev.product_id || p.id;
      ev.category = p.category || ev.category || null;
      ev.sku = p.slug || ev.sku || null;
      ev.product_name = p.name || ev.product_name || null;
    }
  }

  async function collect(request, reply) {
    const ua = request.headers['user-agent'] || '';
    const ip = clientIp(request);
    if (!hit(ipHits, ip, 120, 60 * 1000)) { reply.code(429); return { error: 'rate_limited' }; }
    const b = request.body;
    if (!b || typeof b !== 'object' || !Array.isArray(b.events)) { reply.code(400); return { error: 'bad_request' }; }
    // Consent is enforced client-side, and re-asserted here: no consent flag -> nothing is stored.
    if (b.consent !== true) { reply.code(202); return { ok: true, stored: 0, reason: 'no_consent' }; }
    if (U.isBot(ua)) { reply.code(202); return { ok: true, stored: 0, reason: 'bot' }; }
    if (!U.isUuid(b.vid) || !U.isUuid(b.sid)) { reply.code(400); return { error: 'bad_ids' }; }
    const evs = b.events.slice(0, MAX_EVENTS);
    if (!hit(sessHits, b.sid, SESSION_HOURLY_CAP, 3600 * 1000, evs.length)) { reply.code(429); return { error: 'session_cap' }; }

    const nowDate = new Date();
    const now = U.toSql(nowDate);
    const ctx = b.ctx && typeof b.ctx === 'object' ? b.ctx : {};
    const sess = await ensureSession(b.sid, b.vid, ctx, ua, now);

    const rows = [];
    let lastPath = null, heartbeat = false;
    for (const e of evs) {
      if (!e || typeof e !== 'object') continue;
      if (!CLIENT_EVENTS.has(e.n)) continue;
      const path = U.cleanPath(e.p);
      if (e.n === 'heartbeat') { heartbeat = true; if (path) lastPath = path; continue; }
      if (!U.isUuid(e.id)) continue;
      if (path) lastPath = path;
      let t = U.num(e.t, 0);
      const ts = (t && Math.abs(t - nowDate.getTime()) < 10 * 60 * 1000) ? new Date(t) : nowDate;
      const ev = {
        event_id: e.id, name: e.n, ts: U.toSql(ts), visitor_id: b.vid, session_id: b.sid,
        page_path: path, url: U.cleanUrl(e.u),
        referrer: null,
        product_id: U.clip(e.pid, 40), sku: U.clip(e.sku, 80), product_name: U.clip(e.pn, 255), category: U.clip(e.cat, 80),
        element: U.clip(U.redact(e.el), 160), label: U.clip(U.redact(e.lb), 255),
        value: U.num(e.val, 0, 10000000), qty: U.num(e.q, 0, 10000),
        order_ref: null,
        x_pct: U.num(e.x, 0, 100), y_px: e.y != null ? Math.round(U.num(e.y, 0, 200000) || 0) : null, vw: e.vw != null ? Math.round(U.num(e.vw, 0, 10000) || 0) : null,
        scroll_pct: e.sc != null ? Math.round(U.num(e.sc, 0, 100) || 0) : null,
        duration_ms: e.d != null ? Math.round(U.num(e.d, 0, 86400000) || 0) : null,
        device: sess.device, browser: sess.browser, source: sess.source, medium: sess.medium, campaign: sess.campaign,
        utm_content: sess.utm_content, utm_term: sess.utm_term, meta: U.cleanMeta(e.m),
      };
      await enrichProduct(ev);
      rows.push(ev);
    }

    // De-duplicate by event_id (retries / double sends)
    let fresh = rows;
    if (rows.length) {
      const existing = await query('SELECT event_id FROM an_events WHERE event_id IN (?)', [rows.map(r => r.event_id)]);
      const have = new Set(existing.map(r => r.event_id));
      const seen = new Set();
      fresh = rows.filter(r => { if (have.has(r.event_id) || seen.has(r.event_id)) return false; seen.add(r.event_id); return true; });
    }
    if (fresh.length) {
      const cols = ['event_id', 'name', 'ts', 'visitor_id', 'session_id', 'page_path', 'url', 'referrer', 'product_id', 'sku', 'product_name', 'category',
        'element', 'label', 'value', 'qty', 'order_ref', 'x_pct', 'y_px', 'vw', 'scroll_pct', 'duration_ms', 'device', 'browser', 'source', 'medium',
        'campaign', 'utm_content', 'utm_term', 'meta'];
      await query(`INSERT IGNORE INTO an_events (${cols.join(',')}) VALUES ?`, [fresh.map(r => cols.map(c => r[c]))]);
    }
    const pv = fresh.filter(r => r.name === 'page_view').length;
    const atc = fresh.filter(r => r.name === 'add_to_cart').length;
    const co = fresh.filter(r => r.name === 'begin_checkout').length;
    if (fresh.length || heartbeat) {
      await query(
        `UPDATE an_sessions SET last_seen=?, exit_page=COALESCE(?, exit_page), page_views=page_views+?, events=events+?, add_to_cart=add_to_cart+?, checkout=checkout+? WHERE session_id=?`,
        [now, lastPath, pv, fresh.length, atc, co, b.sid]);
      await query('UPDATE an_visitors SET last_seen=? WHERE visitor_id=?', [now, b.vid]);
    }
    reply.code(202);
    return { ok: true, stored: fresh.length };
  }
  return { collect };
}
module.exports = { create, CLIENT_EVENTS };
