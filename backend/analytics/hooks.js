'use strict';
// Server-side purchase tracking. A purchase is recorded ONLY from trusted server code:
//  - Razorpay: after signature verification AND a matching, unused verified payment id.
//  - COD: after the order row is created by the server.
// Never from a thank-you page visit. Order refs and payment ids are UNIQUE => no duplicates.
const crypto = require('crypto');
const U = require('./util');

const DEAD = ['cancelled', 'returned', 'refunded'];
function detUuid(seed) { // deterministic uuid so a re-run can never double-insert
  const h = crypto.createHash('sha1').update(seed).digest('hex');
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20, 32)}`;
}

function create(deps) {
  const { query, catalog, fetchGatewayPayment } = deps;

  // The browser calls /orders right after /verify, so the verified-payment row MUST exist before /verify replies.
  // The slower Razorpay lookup (authoritative amount/status) runs in the background; orderPlaced waits for it.
  const gatewayPending = new Map();
  async function paymentVerified({ paymentId, rzpOrderId }) {
    if (!paymentId) return;
    await query('INSERT IGNORE INTO an_payments (payment_id, rzp_order_id, verified_at) VALUES (?,?,?)',
      [String(paymentId).slice(0, 80), String(rzpOrderId || '').slice(0, 80), U.toSql(new Date())]);
    const job = (async () => {
      try {
        const gp = fetchGatewayPayment ? await fetchGatewayPayment(paymentId) : null;
        if (gp) await query('UPDATE an_payments SET gateway_amount=?, gateway_status=? WHERE payment_id=?', [gp.amount, String(gp.status || '').slice(0, 30), paymentId]);
      } catch (e) { console.error('[analytics] gateway fetch failed:', e.message); }
      finally { setTimeout(() => gatewayPending.delete(paymentId), 60000).unref(); }
    })();
    gatewayPending.set(paymentId, job);
  }

  async function orderPlaced({ orderId, method, txnId, total, items, ids }) {
    const ref = `RAV${orderId}`;
    const orderTotal = Number(total) || 0;
    let status, amount = orderTotal, amountMatch = null, txn = null;

    if (method === 'cod') {
      status = 'cod_placed';
    } else {
      txn = txnId ? String(txnId).slice(0, 80) : null;
      if (txn && gatewayPending.has(txn)) await gatewayPending.get(txn);
      const pay = txn ? (await query('SELECT * FROM an_payments WHERE payment_id=?', [txn]))[0] : null;
      let ok = !!pay;
      if (ok) {
        const claimed = await query('UPDATE an_payments SET consumed_by=? WHERE payment_id=? AND consumed_by IS NULL', [ref, txn]);
        ok = claimed.affectedRows === 1;
      }
      if (ok && pay.gateway_status && !['captured', 'authorized'].includes(pay.gateway_status)) ok = false;
      if (ok && pay.gateway_amount != null) {
        amount = Number(pay.gateway_amount);
        amountMatch = Math.abs(amount - orderTotal) < 1 ? 1 : 0;
      }
      status = ok ? 'paid' : 'unverified';
      if (!ok) txn = null; // keep txn UNIQUE slot free for the genuine order
    }

    const now = U.toSql(new Date());
    let sess = null;
    if (ids && U.isUuid(ids.sid) && U.isUuid(ids.vid)) {
      sess = (await query('SELECT * FROM an_sessions WHERE session_id=? AND visitor_id=?', [ids.sid, ids.vid]))[0] || null;
    }
    const ins = await query(
      `INSERT IGNORE INTO an_orders (order_ref, txn_id, amount, order_total, amount_match, payment_method, status, visitor_id, session_id, items, created_at, updated_at)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
      [ref, txn, amount, orderTotal, amountMatch, method === 'cod' ? 'cod' : 'razorpay', status, sess ? sess.visitor_id : null, sess ? sess.session_id : null,
        JSON.stringify((items || []).slice(0, 50)), now, now]);
    if (ins.affectedRows === 0) return { duplicate: true };
    if (status === 'unverified') { console.warn(`[analytics] order ${ref} has no verified payment — not counted as a purchase`); return { counted: false }; }

    const c = await catalog();
    const rows = (items || []).slice(0, 50).map((it, i) => {
      const pid = it.productId != null ? String(it.productId).slice(0, 40) : null;
      const p = pid ? c.get(pid) : null;
      const qty = Math.max(1, parseInt(it.quantity, 10) || 1);
      return [detUuid(`purchase|${ref}|${i}`), 'purchase', now, sess ? sess.visitor_id : null, sess ? sess.session_id : null, '/checkout',
        pid, p ? p.slug : null, U.clip(it.name, 255) || (p && p.name) || null, p ? p.category : null, U.clip(method, 20), (Number(it.price) || 0) * qty, qty, ref,
        sess ? sess.device : null, sess ? sess.browser : null, sess ? sess.source : 'unattributed', sess ? sess.medium : null,
        sess ? sess.campaign : null, sess ? sess.utm_content : null, sess ? sess.utm_term : null];
    });
    if (rows.length) {
      await query(`INSERT IGNORE INTO an_events (event_id,name,ts,visitor_id,session_id,page_path,product_id,sku,product_name,category,element,value,qty,order_ref,
        device,browser,source,medium,campaign,utm_content,utm_term) VALUES ?`, [rows]);
    }
    if (sess) await query('UPDATE an_sessions SET purchased=1, last_seen=? WHERE session_id=?', [now, sess.session_id]);
    return { counted: true, ref, amount, amountMatch };
  }

  async function orderStatus(orderId, status) {
    const ref = `RAV${orderId}`;
    const r = await query('UPDATE an_orders SET status=?, updated_at=? WHERE order_ref=?', [status, U.toSql(new Date()), ref]);
    if (r.affectedRows && DEAD.includes(status)) {
      const o = (await query('SELECT visitor_id, session_id FROM an_orders WHERE order_ref=?', [ref]))[0] || {};
      await query('INSERT IGNORE INTO an_events (event_id,name,ts,visitor_id,session_id,order_ref,element,source) VALUES (?,?,?,?,?,?,?,?)',
        [detUuid(`status|${ref}|${status}`), 'order_cancelled', U.toSql(new Date()), o.visitor_id || null, o.session_id || null, ref, status, 'unattributed']);
    }
  }
  return { paymentVerified, orderPlaced, orderStatus, DEAD };
}
module.exports = { create, DEAD };
