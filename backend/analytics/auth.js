'use strict';
// Signed admin tokens (JWT) + role checks for the analytics module.
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

function secret() {
  if (process.env.JWT_SECRET) return process.env.JWT_SECRET;
  // Stable fallback so restarts/deploys don't log the admin out. Set JWT_SECRET in production.
  return crypto.createHash('sha256')
    .update('ravari-admin|' + (process.env.ADMIN_PASSWORD || '') + '|' + (process.env.DB_PASSWORD || '') + '|' + (process.env.ADMIN_EMAIL || ''))
    .digest('hex');
}
function sign(email, role) { return jwt.sign({ email, role }, secret(), { expiresIn: '12h' }); }
function verify(request) {
  const h = request.headers && request.headers.authorization;
  if (!h || !/^Bearer\s+/i.test(h)) return null;
  try {
    const p = jwt.verify(h.replace(/^Bearer\s+/i, ''), secret());
    return p && (p.role === 'admin' || p.role === 'analyst') ? p : null;
  } catch (_) { return null; }
}
// roles: 'admin' = everything; 'analyst' = read-only analytics
function require_(request, reply, roles) {
  const p = verify(request);
  if (!p || !roles.includes(p.role)) { reply.code(p ? 403 : 401).send({ error: p ? 'Forbidden' : 'Unauthorized' }); return null; }
  return p;
}
module.exports = { sign, verify, require: require_ };
