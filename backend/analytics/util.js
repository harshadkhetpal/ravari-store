'use strict';
// Shared helpers: UA parsing, traffic-source classification, sanitisers, time helpers.

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const BOT_RE = /bot|crawl|spider|slurp|facebookexternalhit|headless|lighthouse|pingdom|uptime|monitor|preview|python-requests|curl\/|wget|go-http|java\//i;
const SENSITIVE_KEY_RE = /pass|pwd|token|otp|auth|secret|card|cvv|cvc|pan|aadhaar|account|iban|ifsc|upi|email|phone|mobile|address|name$/i;

const TZ_OFFSET_MIN = parseInt(process.env.ANALYTICS_TZ_OFFSET_MIN || '330', 10); // IST

function isUuid(s) { return typeof s === 'string' && UUID_RE.test(s); }
function isBot(ua) { return !ua || BOT_RE.test(ua); }

function clip(v, n) {
  if (v === undefined || v === null) return null;
  let s = String(v).replace(/[\u0000-\u001f\u007f]/g, ' ').trim();
  if (!s) return null;
  return s.length > n ? s.slice(0, n) : s;
}
function num(v, min, max) {
  if (v === undefined || v === null || v === '') return null;
  const x = Number(v);
  if (!Number.isFinite(x)) return null;
  if (min !== undefined && x < min) return min;
  if (max !== undefined && x > max) return max;
  return x;
}

// Redact things that must never be stored even if they slip into a label / search query.
function redact(s) {
  if (s == null) return s;
  return String(s)
    .replace(/[\w.+-]+@[\w-]+\.[\w.-]+/g, '[email]')
    .replace(/(?<!\d)(?:\d[ -]?){12,19}(?!\d)/g, '[number]') // card-like, incl. spaced/dashed
    .replace(/\b(otp|cvv|cvc|pin|password|passcode|code)\b\W{0,3}\d{3,8}\b/gi, '$1 [hidden]')
    .replace(/(?<!\d)(\+?91[\s-]?)?[6-9]\d{9}(?!\d)/g, '[phone]');
}

// Keep only path + non-sensitive query params.
function cleanUrl(u) {
  if (!u) return null;
  try {
    const url = new URL(String(u), 'https://ravari.in');
    const keep = new URLSearchParams();
    url.searchParams.forEach((v, k) => { if (!SENSITIVE_KEY_RE.test(k)) keep.append(k, v.slice(0, 80)); });
    const qs = keep.toString();
    return clip(url.pathname + (qs ? '?' + qs : ''), 500);
  } catch (_) { return null; }
}
function cleanPath(p) {
  if (!p || typeof p !== 'string' || p[0] !== '/') return null;
  return clip(p.split('?')[0].split('#')[0], 255);
}
function cleanMeta(m) {
  if (!m || typeof m !== 'object' || Array.isArray(m)) return null;
  const out = {};
  let i = 0;
  for (const k of Object.keys(m)) {
    if (i++ >= 12) break;
    if (SENSITIVE_KEY_RE.test(k)) continue;
    const v = m[k];
    if (v === null || ['string', 'number', 'boolean'].includes(typeof v)) out[String(k).slice(0, 30)] = typeof v === 'string' ? redact(v.slice(0, 100)) : v;
  }
  const s = JSON.stringify(out);
  return s === '{}' ? null : (s.length > 1000 ? null : s);
}

// ---- User agent ----
function parseUA(ua, vw) {
  ua = ua || '';
  let device = 'desktop';
  if (/ipad|tablet|(android(?!.*mobile))/i.test(ua)) device = 'tablet';
  else if (/mobi|iphone|ipod|android.*mobile|windows phone/i.test(ua)) device = 'mobile';
  else if (vw && vw < 640) device = 'mobile';
  let browser = 'Other';
  if (/edg\//i.test(ua)) browser = 'Edge';
  else if (/opr\/|opera/i.test(ua)) browser = 'Opera';
  else if (/samsungbrowser/i.test(ua)) browser = 'Samsung Internet';
  else if (/fban|fbav|instagram/i.test(ua)) browser = /instagram/i.test(ua) ? 'Instagram in-app' : 'Facebook in-app';
  else if (/chrome|crios/i.test(ua)) browser = 'Chrome';
  else if (/firefox|fxios/i.test(ua)) browser = 'Firefox';
  else if (/safari/i.test(ua)) browser = 'Safari';
  let os = 'Other';
  if (/android/i.test(ua)) os = 'Android';
  else if (/iphone|ipad|ipod/i.test(ua)) os = 'iOS';
  else if (/windows/i.test(ua)) os = 'Windows';
  else if (/mac os x|macintosh/i.test(ua)) os = 'macOS';
  else if (/linux/i.test(ua)) os = 'Linux';
  return { device, browser, os };
}

// ---- Traffic source ----
const SOURCE_LABELS = {
  instagram: 'Instagram', facebook: 'Facebook', google_organic: 'Google Organic', google_ads: 'Google Ads',
  youtube: 'YouTube', pinterest: 'Pinterest', whatsapp: 'WhatsApp', direct: 'Direct', referral: 'Referral Website',
  amazon: 'Amazon', flipkart: 'Flipkart', organic_other: 'Other Search', email: 'Email', unattributed: 'Unattributed',
};
function normUtmSource(s) {
  s = (s || '').toLowerCase().trim();
  if (!s) return '';
  if (/^(ig|instagram|insta)/.test(s)) return 'instagram';
  if (/^(fb|facebook|meta)/.test(s)) return 'facebook';
  if (/^(yt|youtube)/.test(s)) return 'youtube';
  if (/pinterest/.test(s)) return 'pinterest';
  if (/whatsapp|^wa$/.test(s)) return 'whatsapp';
  if (/amazon/.test(s)) return 'amazon';
  if (/flipkart/.test(s)) return 'flipkart';
  if (/^google/.test(s)) return 'google';
  if (/mail|newsletter/.test(s)) return 'email';
  return s.replace(/[^a-z0-9_.-]/g, '').slice(0, 40) || '';
}
function classifySource({ referrer, utm_source, utm_medium, gclid, ownHosts }) {
  const medium = (utm_medium || '').toLowerCase();
  const paid = /^(cpc|ppc|paid|paidsearch|paid_social|display)$/.test(medium);
  const us = normUtmSource(utm_source);
  if (gclid) return { source: 'google_ads', medium: 'paid' };
  if (us) {
    if (us === 'google') return paid ? { source: 'google_ads', medium: 'paid' } : { source: 'google_organic', medium: medium || 'organic' };
    return { source: us, medium: medium || (paid ? 'paid' : 'campaign') };
  }
  let host = '';
  try { host = new URL(referrer).hostname.toLowerCase().replace(/^www\./, ''); } catch (_) {}
  if (!host) return { source: 'direct', medium: 'none' };
  if ((ownHosts || ['ravari.in']).some(h => host === h || host.endsWith('.' + h))) return { source: 'direct', medium: 'none' };
  if (/(^|\.)google\./.test(host)) return { source: 'google_organic', medium: 'organic' };
  if (/instagram\.com$/.test(host)) return { source: 'instagram', medium: 'social' };
  if (/(facebook\.com|fb\.com|fb\.me)$/.test(host)) return { source: 'facebook', medium: 'social' };
  if (/(youtube\.com|youtu\.be)$/.test(host)) return { source: 'youtube', medium: 'social' };
  if (/(pinterest\.|pin\.it)/.test(host)) return { source: 'pinterest', medium: 'social' };
  if (/(whatsapp\.com|wa\.me)$/.test(host)) return { source: 'whatsapp', medium: 'messaging' };
  if (/(^|\.)amazon\./.test(host) || /amzn\./.test(host)) return { source: 'amazon', medium: 'marketplace' };
  if (/flipkart\.com$/.test(host)) return { source: 'flipkart', medium: 'marketplace' };
  if (/(bing\.com|duckduckgo\.com|yahoo\.com|ecosia\.org|yandex\.)/.test(host)) return { source: 'organic_other', medium: 'organic' };
  return { source: 'referral', medium: 'referral' };
}

// ---- Time ----
const pad = (n, w = 2) => String(n).padStart(w, '0');
function toSql(d) { // JS Date -> 'YYYY-MM-DD HH:mm:ss.SSS' in UTC
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}.${pad(d.getUTCMilliseconds(), 3)}`;
}
function fromSql(s) { // 'YYYY-MM-DD HH:mm:ss(.fff)' (UTC) -> Date
  if (!s) return null;
  return new Date(String(s).replace(' ', 'T') + (String(s).includes('.') ? '' : '.000') + 'Z');
}
// IST calendar day string 'YYYY-MM-DD' -> UTC Date at start of that local day
function localDayStartUtc(ymd) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(ymd || '');
  if (!m) return null;
  return new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]) - TZ_OFFSET_MIN * 60000);
}
function localToday() {
  const d = new Date(Date.now() + TZ_OFFSET_MIN * 60000);
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
}
function addDays(ymd, n) {
  const d = localDayStartUtc(ymd);
  d.setUTCDate(d.getUTCDate() + n);
  const l = new Date(d.getTime() + TZ_OFFSET_MIN * 60000);
  return `${l.getUTCFullYear()}-${pad(l.getUTCMonth() + 1)}-${pad(l.getUTCDate())}`;
}

module.exports = {
  UUID_RE, TZ_OFFSET_MIN, SOURCE_LABELS, isUuid, isBot, clip, num, redact, cleanUrl, cleanPath, cleanMeta,
  parseUA, classifySource, toSql, fromSql, localDayStartUtc, localToday, addDays,
};
