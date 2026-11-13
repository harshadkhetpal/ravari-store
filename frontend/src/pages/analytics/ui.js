import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';

/* ───────── Brand tokens (dark brown · black · champagne gold · ivory) ───────── */
export const C = {
  black: '#0D0B08', brown: '#2A1A12', brown2: '#3B261A', gold: '#C9A84C', champagne: '#E8D9A8', ivory: '#FBF8F1', line: '#E8E0CC',
  text: '#2A1A12', muted: '#8C7F6A', good: '#3F7D4E', bad: '#B3412F', warn: '#B7791F',
};
export const PALETTE = ['#C9A84C', '#2A1A12', '#8B5E3C', '#D9C48A', '#6B4A33', '#A8863A', '#4A3224', '#E8D9A8'];
export const fmtNum = n => (n == null || Number.isNaN(Number(n)) ? '—' : Number(n).toLocaleString('en-IN'));
export const fmtINR = n => (n == null ? '—' : '₹' + Math.round(Number(n)).toLocaleString('en-IN'));
export const fmtPct = n => (n == null ? '—' : `${n}%`);
export const fmtDur = s => { s = Math.round(Number(s) || 0); if (s < 60) return `${s}s`; const m = Math.floor(s / 60); return m < 60 ? `${m}m ${s % 60}s` : `${Math.floor(m / 60)}h ${m % 60}m`; };
export const fmtTime = iso => (iso ? new Date(iso).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour12: false }) : '');
export const fmtDateTime = iso => (iso ? new Date(iso).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', hour12: true, day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '');
const ISTDay = d => new Date(d.getTime() + 330 * 60000).toISOString().slice(0, 10);
export const todayIST = () => ISTDay(new Date());
export const daysAgoIST = n => ISTDay(new Date(Date.now() - n * 86400000));

const font = 'Jost, sans-serif', serif = 'Cormorant Garamond, serif';

/* ───────── data hook ───────── */
export function useApi(path, params, { poll = 0, onAuthError, enabled = true } = {}) {
  const [state, setState] = useState({ data: null, loading: true, error: null });
  const key = path + '?' + new URLSearchParams(Object.entries(params || {}).filter(([, v]) => v !== '' && v != null)).toString();
  const alive = useRef(true);
  const load = useCallback(async (silent) => {
    if (!enabled) return;
    if (!silent) setState(s => ({ ...s, loading: true, error: null }));
    try {
      const res = await fetch('/api/admin/ca/' + key, { headers: { Authorization: 'Bearer ' + (localStorage.getItem('adminToken') || '') } });
      if (res.status === 401 || res.status === 403) { if (onAuthError) onAuthError(); throw new Error('Session expired — please log in again'); }
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || 'Request failed');
      if (alive.current) setState({ data: j, loading: false, error: null });
    } catch (e) { if (alive.current) setState(s => ({ data: silent ? s.data : null, loading: false, error: e.message })); }
  }, [key, enabled, onAuthError]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { alive.current = true; load(false); let t; if (poll) t = setInterval(() => load(true), poll); return () => { alive.current = false; if (t) clearInterval(t); }; }, [load, poll]);
  return { ...state, reload: () => load(false) };
}
export function exportUrl(name, params, format, table) {
  const qs = new URLSearchParams({ ...Object.fromEntries(Object.entries(params || {}).filter(([, v]) => v !== '' && v != null)), format, ...(table ? { table } : {}) });
  return `/api/admin/ca/export/${name}?${qs.toString()}`;
}
export async function download(name, params, format, table) {
  const res = await fetch(exportUrl(name, params, format, table), { headers: { Authorization: 'Bearer ' + (localStorage.getItem('adminToken') || '') } });
  if (!res.ok) { alert('Export failed'); return; }
  const blob = await res.blob();
  const cd = res.headers.get('content-disposition') || '';
  const fname = (/filename="([^"]+)"/.exec(cd) || [])[1] || `ravari-${name}.${format}`;
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = fname; document.body.appendChild(a); a.click(); a.remove();
}

/* ───────── layout atoms ───────── */
export const Card = ({ title, action, children, style, pad = true }) => (
  <div style={{ background: '#fff', border: `1px solid ${C.line}`, borderTop: `2px solid ${C.gold}`, ...style }}>
    {(title || action) && (
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', padding: '0.85rem 1.1rem', borderBottom: `1px solid ${C.line}`, flexWrap: 'wrap' }}>
        <span style={{ fontFamily: font, fontSize: '0.66rem', letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 600, color: C.brown }}>{title}</span>
        {action}
      </div>)}
    <div style={pad ? { padding: '1.1rem' } : undefined}>{children}</div>
  </div>
);
export const Grid = ({ min = 220, gap = '1rem', children, style }) => (
  <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fit, minmax(${min}px, 1fr))`, gap, ...style }}>{children}</div>
);
export const Kpi = ({ label, value, sub, tone }) => (
  <div style={{ background: C.ivory, border: `1px solid ${C.line}`, padding: '1rem 1.1rem' }}>
    <div style={{ fontFamily: font, fontSize: '0.58rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: C.muted }}>{label}</div>
    <div style={{ fontFamily: serif, fontSize: '1.9rem', fontWeight: 600, color: tone === 'bad' ? C.bad : tone === 'good' ? C.good : C.brown, lineHeight: 1.15, marginTop: '0.25rem' }}>{value}</div>
    {sub && <div style={{ fontFamily: font, fontSize: '0.65rem', color: C.muted, marginTop: '0.2rem' }}>{sub}</div>}
  </div>
);
export const Empty = ({ children }) => <div style={{ padding: '2rem', textAlign: 'center', fontFamily: font, fontSize: '0.8rem', color: C.muted }}>{children || 'No data for this period yet.'}</div>;
export const Loading = () => <div style={{ padding: '2rem', textAlign: 'center', fontFamily: font, fontSize: '0.75rem', color: C.muted }}>Loading…</div>;
export const ErrorBox = ({ error, retry }) => (
  <div style={{ padding: '1.25rem', border: `1px solid ${C.bad}`, background: '#FDF3F0', color: C.bad, fontFamily: font, fontSize: '0.8rem' }}>
    {error} {retry && <button onClick={retry} style={{ marginLeft: '0.75rem', border: `1px solid ${C.bad}`, background: 'none', color: C.bad, padding: '2px 10px', cursor: 'pointer' }}>Retry</button>}
  </div>
);
export const Pill = ({ children, tone }) => {
  const m = { good: ['#E3F1E6', C.good], bad: ['#FBE7E2', C.bad], warn: ['#FBF0D9', C.warn], gold: ['#F6EED2', '#7A5F12'] }[tone] || ['#EFEAE0', C.brown];
  return <span style={{ background: m[0], color: m[1], fontFamily: font, fontSize: '0.6rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '3px 9px', whiteSpace: 'nowrap' }}>{children}</span>;
};
export const Btn = ({ children, onClick, kind, disabled, style }) => (
  <button onClick={onClick} disabled={disabled} style={{
    fontFamily: font, fontSize: '0.64rem', letterSpacing: '0.12em', textTransform: 'uppercase', padding: '0.5rem 0.95rem', cursor: disabled ? 'not-allowed' : 'pointer',
    border: `1px solid ${kind === 'solid' ? C.brown : C.gold}`, background: kind === 'solid' ? C.brown : 'transparent', color: kind === 'solid' ? C.champagne : C.brown, opacity: disabled ? 0.5 : 1, ...style }}>{children}</button>
);
export const Tabs = ({ tabs, value, onChange }) => (
  <div style={{ display: 'flex', gap: '0.25rem', borderBottom: `1px solid ${C.line}`, marginBottom: '1.25rem', flexWrap: 'wrap' }}>
    {tabs.map(([k, l]) => (
      <button key={k} onClick={() => onChange(k)} style={{ fontFamily: font, fontSize: '0.68rem', letterSpacing: '0.14em', textTransform: 'uppercase', padding: '0.7rem 1.1rem', cursor: 'pointer', background: 'none', border: 'none',
        borderBottom: `2px solid ${value === k ? C.gold : 'transparent'}`, color: value === k ? C.brown : C.muted, fontWeight: value === k ? 600 : 400 }}>{l}</button>))}
  </div>
);

/* ───────── filters ───────── */
const inp = { fontFamily: font, fontSize: '0.75rem', padding: '0.45rem 0.6rem', border: `1px solid ${C.line}`, background: '#fff', color: C.text, outline: 'none', minWidth: 0 };
export function FilterBar({ f, setF, options, show = {} }) {
  const set = (k, v) => setF(prev => ({ ...prev, [k]: v }));
  const presets = [['today', 'Today'], ['yesterday', 'Yesterday'], ['7d', 'Last 7 days'], ['30d', 'Last 30 days'], ['custom', 'Custom']];
  return (
    <div style={{ background: C.ivory, border: `1px solid ${C.line}`, padding: '0.8rem 1rem', marginBottom: '1.25rem', display: 'flex', flexWrap: 'wrap', gap: '0.6rem', alignItems: 'center' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        {presets.map(([k, l]) => (
          <button key={k} onClick={() => set('preset', k)} style={{ fontFamily: font, fontSize: '0.64rem', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '0.5rem 0.8rem', cursor: 'pointer',
            border: `1px solid ${C.gold}`, marginLeft: -1, background: f.preset === k ? C.brown : '#fff', color: f.preset === k ? C.champagne : C.brown }}>{l}</button>))}
      </div>
      {f.preset === 'custom' && (<>
        <input type="date" value={f.from} max={todayIST()} onChange={e => set('from', e.target.value)} style={inp} />
        <span style={{ color: C.muted, fontSize: '0.75rem' }}>to</span>
        <input type="date" value={f.to} max={todayIST()} onChange={e => set('to', e.target.value)} style={inp} />
      </>)}
      {show.compare && (
        <label style={{ fontFamily: font, fontSize: '0.7rem', color: C.brown, display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
          <input type="checkbox" checked={!!f.compare} onChange={e => set('compare', e.target.checked)} /> Compare with
          {f.compare && (<><input type="date" value={f.cfrom} onChange={e => set('cfrom', e.target.value)} style={inp} /><input type="date" value={f.cto} onChange={e => set('cto', e.target.value)} style={inp} /></>)}
        </label>)}
      {options && show.product !== false && (
        <select value={f.product} onChange={e => set('product', e.target.value)} style={{ ...inp, maxWidth: 190 }}><option value="">All products</option>{options.products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select>)}
      {options && show.category !== false && (
        <select value={f.category} onChange={e => set('category', e.target.value)} style={inp}><option value="">All categories</option>{options.categories.map(c => <option key={c}>{c}</option>)}</select>)}
      {options && (
        <select value={f.source} onChange={e => set('source', e.target.value)} style={inp}><option value="">All sources</option>{options.sources.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}</select>)}
      {options && (
        <select value={f.device} onChange={e => set('device', e.target.value)} style={inp}><option value="">All devices</option>{options.devices.map(d => <option key={d}>{d}</option>)}</select>)}
      {options && show.campaign !== false && (
        <select value={f.campaign} onChange={e => set('campaign', e.target.value)} style={{ ...inp, maxWidth: 170 }}><option value="">All campaigns</option>{options.campaigns.map(c => <option key={c}>{c}</option>)}</select>)}
      <button onClick={() => setF(d => ({ ...d, product: '', category: '', source: '', device: '', campaign: '' }))} style={{ ...inp, cursor: 'pointer', color: C.muted }}>Reset</button>
    </div>
  );
}
export function filterParams(f) {
  const p = { preset: f.preset, product: f.product, category: f.category, source: f.source, device: f.device, campaign: f.campaign };
  if (f.preset === 'custom') { p.from = f.from; p.to = f.to; }
  if (f.compare && f.cfrom && f.cto) { p.cfrom = f.cfrom; p.cto = f.cto; }
  return p;
}

/* ───────── table ───────── */
export function DataTable({ columns, rows, exportName, exportParams, exportTable, onRowClick, searchable = true, pageSize = 25, render = {}, empty }) {
  const [q, setQ] = useState(''); const [sort, setSort] = useState(null); const [page, setPage] = useState(0);
  useEffect(() => { setPage(0); }, [rows, q]);
  const filtered = useMemo(() => {
    let r = rows || [];
    if (q) { const s = q.toLowerCase(); r = r.filter(x => columns.some(c => String(x[c.key] ?? '').toLowerCase().includes(s))); }
    if (sort) r = [...r].sort((a, b) => { const x = a[sort.key], y = b[sort.key]; const d = (typeof x === 'number' && typeof y === 'number') ? x - y : String(x ?? '').localeCompare(String(y ?? '')); return sort.dir === 'asc' ? d : -d; });
    return r;
  }, [rows, q, sort, columns]);
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const shown = filtered.slice(page * pageSize, page * pageSize + pageSize);
  return (
    <div>
      <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
        {searchable && <input placeholder="Search in table…" value={q} onChange={e => setQ(e.target.value)} style={{ ...inp, flex: '1 1 200px', maxWidth: 320 }} />}
        <span style={{ fontFamily: font, fontSize: '0.68rem', color: C.muted }}>{fmtNum(filtered.length)} rows</span>
        {exportName && (<span style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem' }}>
          <Btn onClick={() => download(exportName, exportParams, 'csv', exportTable)}>Export CSV</Btn>
          <Btn onClick={() => download(exportName, exportParams, 'xlsx', exportTable)}>Export Excel</Btn></span>)}
      </div>
      {!shown.length ? <Empty>{empty}</Empty> : (
        <div style={{ overflowX: 'auto', border: `1px solid ${C.line}` }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: font, fontSize: '0.76rem' }}>
            <thead><tr style={{ background: C.brown }}>
              {columns.map(c => (<th key={c.key} onClick={() => setSort(s => ({ key: c.key, dir: s && s.key === c.key && s.dir === 'desc' ? 'asc' : 'desc' }))}
                style={{ textAlign: 'left', padding: '0.65rem 0.8rem', fontSize: '0.6rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: C.champagne, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                {c.label}{sort && sort.key === c.key ? (sort.dir === 'asc' ? ' ▲' : ' ▼') : ''}</th>))}
            </tr></thead>
            <tbody>
              {shown.map((r, i) => (
                <tr key={i} onClick={onRowClick ? () => onRowClick(r) : undefined} style={{ borderTop: `1px solid ${C.line}`, background: i % 2 ? C.ivory : '#fff', cursor: onRowClick ? 'pointer' : 'default' }}>
                  {columns.map(c => (<td key={c.key} style={{ padding: '0.6rem 0.8rem', color: C.text, maxWidth: 320, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={String(r[c.key] ?? '')}>
                    {render[c.key] ? render[c.key](r[c.key], r) : (typeof r[c.key] === 'number' ? fmtNum(r[c.key]) : (r[c.key] ?? '—'))}</td>))}
                </tr>))}
            </tbody>
          </table>
        </div>)}
      {pages > 1 && (
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', alignItems: 'center', marginTop: '0.75rem', fontFamily: font, fontSize: '0.7rem', color: C.muted }}>
          <Btn disabled={page === 0} onClick={() => setPage(p => p - 1)}>Prev</Btn> Page {page + 1} / {pages} <Btn disabled={page >= pages - 1} onClick={() => setPage(p => p + 1)}>Next</Btn>
        </div>)}
    </div>
  );
}

/* ───────── charts (inline SVG, no dependency) ───────── */
export function TrendChart({ data, series, height = 220, fmt = fmtNum }) {
  const [hover, setHover] = useState(null);
  if (!data || !data.length) return <Empty />;
  const W = 640, H = height, pad = { l: 44, r: 12, t: 12, b: 26 };
  const max = Math.max(1, ...data.flatMap(d => series.map(s => Number(d[s.key]) || 0)));
  const x = i => pad.l + (data.length === 1 ? (W - pad.l - pad.r) / 2 : (i * (W - pad.l - pad.r)) / (data.length - 1));
  const y = v => pad.t + (1 - v / max) * (H - pad.t - pad.b);
  const ticks = [0, 0.25, 0.5, 0.75, 1].map(t => Math.round(max * t));
  const step = Math.ceil(data.length / 7);
  return (
    <div style={{ position: 'relative' }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block' }} onMouseLeave={() => setHover(null)}>
        {ticks.map((t, ti) => (<g key={ti}><line x1={pad.l} x2={W - pad.r} y1={y(t)} y2={y(t)} stroke={C.line} /><text x={pad.l - 6} y={y(t) + 3} fontSize="9" textAnchor="end" fill={C.muted}>{t >= 1000 ? Math.round(t / 100) / 10 + 'k' : t}</text></g>))}
        {series.map((s, si) => {
          const pts = data.map((d, i) => `${x(i)},${y(Number(d[s.key]) || 0)}`);
          return (<g key={s.key}>
            {si === 0 && <polygon points={`${x(0)},${y(0)} ${pts.join(' ')} ${x(data.length - 1)},${y(0)}`} fill={s.color} opacity="0.12" />}
            <polyline points={pts.join(' ')} fill="none" stroke={s.color} strokeWidth="2" />
            {data.length < 40 && data.map((d, i) => <circle key={i} cx={x(i)} cy={y(Number(d[s.key]) || 0)} r="2.5" fill={s.color} />)}
          </g>);
        })}
        {data.map((d, i) => (i % step === 0 || i === data.length - 1) && <text key={i} x={x(i)} y={H - 8} fontSize="9" textAnchor="middle" fill={C.muted}>{String(d.date).slice(5)}</text>)}
        {data.map((d, i) => <rect key={i} x={x(i) - 8} y={0} width="16" height={H} fill="transparent" onMouseEnter={() => setHover(i)} />)}
        {hover != null && <line x1={x(hover)} x2={x(hover)} y1={pad.t} y2={H - pad.b} stroke={C.gold} strokeDasharray="3 3" />}
      </svg>
      <div style={{ display: 'flex', gap: '1rem', fontFamily: font, fontSize: '0.68rem', color: C.muted, flexWrap: 'wrap', marginTop: 4 }}>
        {series.map(s => <span key={s.key}><span style={{ display: 'inline-block', width: 10, height: 10, background: s.color, marginRight: 5 }} />{s.label}</span>)}
        {hover != null && <span style={{ marginLeft: 'auto', color: C.brown }}><strong>{data[hover].date}</strong> · {series.map(s => `${s.label}: ${fmt(data[hover][s.key])}`).join(' · ')}</span>}
      </div>
    </div>
  );
}
export function HBars({ rows, fmt = fmtNum, color = C.gold, max }) {
  if (!rows || !rows.length) return <Empty />;
  const m = max || Math.max(1, ...rows.map(r => r.value));
  return (
    <div>{rows.map((r, i) => (
      <div key={i} style={{ marginBottom: '0.7rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: font, fontSize: '0.72rem', color: C.text, marginBottom: 3, gap: 8 }}>
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.label}</span><strong>{fmt(r.value)}</strong></div>
        <div style={{ background: '#F1ECDD', height: 8 }}><div style={{ width: `${Math.max(2, (r.value / m) * 100)}%`, height: '100%', background: r.color || color }} /></div>
      </div>))}</div>
  );
}
export function Donut({ rows, size = 150 }) {
  const total = rows.reduce((a, r) => a + r.value, 0);
  if (!total) return <Empty />;
  let acc = 0; const R = 54, r = 34, cx = 70, cy = 70;
  const arc = (a0, a1) => { const p = a => [cx + R * Math.sin(a), cy - R * Math.cos(a)], q = a => [cx + r * Math.sin(a), cy - r * Math.cos(a)]; const [x0, y0] = p(a0), [x1, y1] = p(a1), [x2, y2] = q(a1), [x3, y3] = q(a0); const L = a1 - a0 > Math.PI ? 1 : 0; return `M${x0},${y0} A${R},${R} 0 ${L} 1 ${x1},${y1} L${x2},${y2} A${r},${r} 0 ${L} 0 ${x3},${y3} Z`; };
  return (
    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
      <svg viewBox="0 0 140 140" width={size} height={size}>
        {rows.length === 1 ? <circle cx={cx} cy={cy} r={(R + r) / 2} fill="none" stroke={PALETTE[0]} strokeWidth={R - r} /> :
          rows.map((row, i) => { const a0 = (acc / total) * 2 * Math.PI; acc += row.value; const a1 = (acc / total) * 2 * Math.PI; return <path key={i} d={arc(a0, a1)} fill={PALETTE[i % PALETTE.length]} />; })}
      </svg>
      <div style={{ fontFamily: font, fontSize: '0.72rem', color: C.text }}>
        {rows.map((row, i) => <div key={i} style={{ marginBottom: 4 }}><span style={{ display: 'inline-block', width: 9, height: 9, background: PALETTE[i % PALETTE.length], marginRight: 6 }} />{row.label} — <strong>{fmtNum(row.value)}</strong> ({Math.round((row.value / total) * 100)}%)</div>)}
      </div>
    </div>
  );
}
export function FunnelChart({ stages, onStage }) {
  const top = Math.max(1, stages[0] ? stages[0].count : 1);
  return (
    <div>{stages.map((s, i) => (
      <div key={s.stage}>
        {i > 0 && (
          <div style={{ textAlign: 'center', fontFamily: font, fontSize: '0.68rem', color: s.drop_pct > 50 ? C.bad : C.muted, padding: '2px 0' }}>
            ↓ {s.drop_pct}% drop-off{s.entered_mid_funnel ? ` · +${s.entered_mid_funnel} joined mid-funnel` : ''}
          </div>)}
        <div onClick={onStage ? () => onStage(s) : undefined} style={{ margin: '0 auto', width: `${Math.max(14, (s.count / top) * 100)}%`, minWidth: 140, background: `linear-gradient(90deg, ${C.brown}, ${C.brown2})`, color: C.champagne, padding: '0.8rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', fontFamily: font, cursor: onStage ? 'pointer' : 'default', borderLeft: `4px solid ${C.gold}` }}>
          <span style={{ fontSize: '0.72rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{s.stage}</span>
          <span><strong style={{ fontFamily: serif, fontSize: '1.3rem' }}>{fmtNum(s.count)}</strong> <span style={{ fontSize: '0.65rem', opacity: 0.75 }}>({s.pct_of_first}%)</span></span>
        </div>
      </div>))}</div>
  );
}
export const ExportRow = ({ name, params, table }) => (
  <span style={{ display: 'flex', gap: '0.5rem' }}><Btn onClick={() => download(name, params, 'csv', table)}>CSV</Btn><Btn onClick={() => download(name, params, 'xlsx', table)}>Excel</Btn></span>
);
