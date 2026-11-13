'use strict';
// RAVARI Customer Journey Analytics — backend module.
//   const analytics = require('./analytics')({ fastify, query, isReady, getProducts, fetchGatewayPayment });
const ingest = require('./ingest');
const reportsMod = require('./reports');
const hooksMod = require('./hooks');
const exporter = require('./export');
const auth = require('./auth');
const schema = require('./schema');
const U = require('./util');

const RETENTION_DAYS = parseInt(process.env.ANALYTICS_RETENTION_DAYS || '395', 10);

module.exports = function init(deps) {
  const { fastify, isReady, getProducts } = deps;
  let ready = false;
  const query = (s, p) => deps.query(s, p);

  // product catalogue cache (id -> {name, category, slug}) used to enrich events
  let catCache = { at: 0, map: new Map() };
  async function catalog() {
    if (Date.now() - catCache.at < 5 * 60 * 1000 && catCache.map.size) return catCache.map;
    try {
      const list = await getProducts();
      const m = new Map();
      (list || []).forEach(p => {
        const id = String(p._id || p.id); const rec = { id, name: p.name, category: p.category, slug: p.slug };
        m.set(id, rec); m.set(String(p.id), rec); if (p.slug) m.set('slug:' + p.slug, rec);
      });
      catCache = { at: Date.now(), map: m };
    } catch (_) {}
    return catCache.map;
  }

  const d = { query, catalog, fetchGatewayPayment: deps.fetchGatewayPayment };
  const ing = ingest.create(d);
  const rep = reportsMod.create(d);
  const hooks = hooksMod.create(d);

  async function initSchema() {
    for (const ddl of schema.DDL) await query(ddl);
    ready = true;
    console.log('[analytics] ✅ tables ready');
    runRetention().catch(() => {});
  }

  async function runRetention() {
    if (!ready || RETENTION_DAYS <= 0) return;
    const cutoff = U.toSql(new Date(Date.now() - RETENTION_DAYS * 86400000));
    await query('DELETE FROM an_events WHERE ts < ?', [cutoff]);
    await query('DELETE FROM an_sessions WHERE last_seen < ?', [cutoff]);
    await query('DELETE FROM an_visitors WHERE last_seen < ?', [cutoff]);
    // financial rows are kept, but the pseudonymous link is removed
    await query('UPDATE an_orders SET visitor_id=NULL, session_id=NULL WHERE created_at < ? AND (visitor_id IS NOT NULL OR session_id IS NOT NULL)', [cutoff]);
    await query('DELETE FROM an_payments WHERE verified_at < ?', [cutoff]);
  }
  setInterval(() => runRetention().catch(e => console.error('[analytics] retention:', e.message)), 24 * 3600 * 1000).unref();

  // Run hook wrappers: never let analytics break an order.
  const safe = fn => async (...a) => { if (!ready || !isReady()) return; try { return await fn(...a); } catch (e) { console.error('[analytics] hook error:', e.message); } };

  // ---------- public routes ----------
  fastify.post('/api/analytics/collect', { config: { rawBody: false } }, async (request, reply) => {
    if (!ready || !isReady()) { reply.code(202); return { ok: true, stored: 0, reason: 'unavailable' }; }
    try { return await ing.collect(request, reply); }
    catch (e) { console.error('[analytics] collect:', e.message); reply.code(202); return { ok: true, stored: 0 }; }
  });
  // Visitor right-to-erasure: deletes everything held under this pseudonymous id.
  fastify.post('/api/analytics/forget', async (request, reply) => {
    const vid = request.body && request.body.vid;
    if (!U.isUuid(vid) || !ready || !isReady()) { reply.code(400); return { error: 'bad_request' }; }
    await eraseVisitor(vid);
    return { ok: true };
  });
  async function eraseVisitor(vid) {
    await query('DELETE FROM an_events WHERE visitor_id=?', [vid]);
    await query('UPDATE an_orders SET visitor_id=NULL, session_id=NULL WHERE visitor_id=?', [vid]);
    await query('DELETE FROM an_sessions WHERE visitor_id=?', [vid]);
    await query('DELETE FROM an_visitors WHERE visitor_id=?', [vid]);
  }

  // ---------- admin routes (JWT + role) ----------
  const guard = (roles) => async (request, reply) => { if (!auth.require(request, reply, roles)) return reply; if (!ready || !isReady()) { reply.code(503).send({ error: 'Analytics database not ready' }); return reply; } };
  const readers = guard(['admin', 'analyst']);
  const REPORTS = {
    overview: f => rep.overview(f), live: () => rep.live(), activity: (f, q) => rep.activity(f, q), visitors: (f, q) => rep.visitors(f, q),
    journey: f => rep.journey(f), pages: f => rep.pages(f), products: f => rep.products(f), clicks: f => rep.clicks(f), funnel: f => rep.funnel(f),
    sources: f => rep.sources(f), campaigns: f => rep.campaigns(f), cart: f => rep.cart(f), behaviour: f => rep.behaviour(f), heatmap: (f, q) => rep.heatmap(f, q),
  };
  fastify.get('/api/admin/ca/filters', { preHandler: readers }, async () => rep.filterOptions());
  fastify.get('/api/admin/ca/report/:name', { preHandler: readers }, async (request, reply) => {
    const fn = REPORTS[request.params.name];
    if (!fn) { reply.code(404); return { error: 'Unknown report' }; }
    try { return await fn(rep.parseFilters(request.query), request.query); }
    catch (e) { console.error('[analytics] report', request.params.name, e.message); reply.code(500); return { error: 'Report failed' }; }
  });
  fastify.get('/api/admin/ca/export/:name', { preHandler: readers }, async (request, reply) => {
    const fn = REPORTS[request.params.name];
    if (!fn || ['live', 'journey'].includes(request.params.name)) { reply.code(404); return { error: 'Not exportable' }; }
    const q = { ...request.query, limit: 5000 };
    const data = await fn(rep.parseFilters(q), q);
    const tname = q.table && data.tables && data.tables[q.table] ? q.table : data.primary;
    const t = data.tables && data.tables[tname];
    if (!t) { reply.code(404); return { error: 'No table' }; }
    const fname = `ravari-${request.params.name}-${tname}-${q.from || U.localToday()}`.replace(/[^a-z0-9_.-]/gi, '_');
    if (q.format === 'xlsx') {
      reply.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet').header('Content-Disposition', `attachment; filename="${fname}.xlsx"`);
      return reply.send(exporter.xlsx(t.columns, t.rows, tname));
    }
    reply.header('Content-Type', 'text/csv; charset=utf-8').header('Content-Disposition', `attachment; filename="${fname}.csv"`);
    return reply.send(exporter.csv(t.columns, t.rows));
  });
  fastify.delete('/api/admin/ca/visitor/:vid', { preHandler: guard(['admin']) }, async (request, reply) => {
    if (!U.isUuid(request.params.vid)) { reply.code(400); return { error: 'bad id' }; }
    await eraseVisitor(request.params.vid); return { ok: true };
  });
  fastify.post('/api/admin/ca/retention/run', { preHandler: guard(['admin']) }, async () => { await runRetention(); return { ok: true, retention_days: RETENTION_DAYS }; });
  fastify.get('/api/admin/ca/policy', { preHandler: readers }, async () => ({ retention_days: RETENTION_DAYS, timezone_offset_min: U.TZ_OFFSET_MIN, role: 'see token' }));

  return {
    auth, initSchema, runRetention,
    hooks: { paymentVerified: safe(hooks.paymentVerified), orderPlaced: safe(hooks.orderPlaced), orderStatus: safe(hooks.orderStatus) },
  };
};
