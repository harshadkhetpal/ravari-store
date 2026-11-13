import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  C, PALETTE, useApi, Card, Grid, Kpi, Empty, Loading, ErrorBox, Pill, Btn, Tabs, FilterBar, filterParams, DataTable, TrendChart, HBars, Donut, FunnelChart, ExportRow,
  fmtNum, fmtINR, fmtPct, fmtDur, fmtTime, fmtDateTime, todayIST, daysAgoIST,
} from './ui';

export const CA_NAV = [
  { key: 'ca_overview', label: 'Overview Dashboard', icon: '◈' },
  { key: 'ca_live', label: 'Live Visitors', icon: '●' },
  { key: 'ca_activity', label: 'Visitor Activity', icon: '≡' },
  { key: 'ca_journey', label: 'Customer Journey', icon: '⤳' },
  { key: 'ca_pages', label: 'Page Analytics', icon: '▤' },
  { key: 'ca_products', label: 'Product Analytics', icon: '◇' },
  { key: 'ca_clicks', label: 'Click Tracking', icon: '⌖' },
  { key: 'ca_cart', label: 'Cart & Checkout Analytics', icon: '⛁' },
  { key: 'ca_funnel', label: 'Conversion Funnel', icon: '▽' },
  { key: 'ca_sources', label: 'Traffic Sources', icon: '⇉' },
  { key: 'ca_campaigns', label: 'Campaign Performance', icon: '✦' },
  { key: 'ca_reports', label: 'Customer Behaviour Reports', icon: '☰' },
];

const font = 'Jost, sans-serif', serif = 'Cormorant Garamond, serif';
const defaultFilters = () => ({ preset: '7d', from: daysAgoIST(6), to: todayIST(), compare: false, cfrom: daysAgoIST(13), cto: daysAgoIST(7), product: '', category: '', source: '', device: '', campaign: '' });

function PageHead({ title, sub, right }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
      <div>
        <h2 style={{ fontFamily: serif, fontSize: '1.9rem', fontWeight: 500, color: C.brown, margin: 0 }}>{title}</h2>
        {sub && <p style={{ fontFamily: font, fontSize: '0.78rem', color: C.muted, margin: '0.3rem 0 0', maxWidth: 640 }}>{sub}</p>}
      </div>{right}
    </div>);
}
// Wrap loading/error/data states
function Body({ r, children }) {
  if (r.loading && !r.data) return <Loading />;
  if (r.error) return <ErrorBox error={r.error} retry={r.reload} />;
  if (!r.data) return null;
  return children(r.data);
}
function useFilters() {
  const [f, setF] = useState(defaultFilters);
  const params = useMemo(() => filterParams(f), [f]);
  return [f, setF, params];
}
const ShellFilters = ({ f, setF, options, show }) => <FilterBar f={f} setF={setF} options={options} show={show} />;
const tbl = (d, key) => d.tables[key];

/* ───────────── 1 Overview ───────────── */
function Overview({ options, auth }) {
  const [f, setF, p] = useFilters();
  const r = useApi('report/overview', p, { onAuthError: auth, poll: 60000 });
  return (<div>
    <PageHead title="Overview Dashboard" sub="How customers are discovering, browsing and buying — from your own first-party tracking. Only visitors who accepted analytics are counted." />
    <ShellFilters f={f} setF={setF} options={options} />
    <Body r={r}>{d => { const k = d.kpis; return (<>
      <Grid min={170} style={{ marginBottom: '1.25rem' }}>
        <Kpi label="Visitors" value={fmtNum(k.visitors)} sub={`${fmtNum(k.new_visitors)} new · ${fmtNum(k.returning_visitors)} returning`} />
        <Kpi label="Sessions" value={fmtNum(k.sessions)} />
        <Kpi label="Page views" value={fmtNum(k.page_views)} />
        <Kpi label="Avg. session" value={fmtDur(k.avg_session_seconds)} />
        <Kpi label="Bounce rate" value={fmtPct(k.bounce_rate)} sub={`Engagement ${k.engagement_rate}%`} />
        <Kpi label="Add to cart" value={fmtNum(k.add_to_cart_events)} sub={`${fmtNum(k.cart_sessions)} sessions`} />
        <Kpi label="Checkout started" value={fmtNum(k.checkout_sessions)} sub="sessions" />
        <Kpi label="Orders" value={fmtNum(k.orders)} sub="verified only" tone="good" />
        <Kpi label="Revenue" value={fmtINR(k.revenue)} tone="good" />
        <Kpi label="Conversion" value={fmtPct(k.conversion_rate)} sub="purchasing sessions ÷ sessions" />
      </Grid>
      {k.amount_mismatches > 0 && <div style={{ marginBottom: '1rem' }}><Pill tone="warn">{k.amount_mismatches} order(s) where payment amount ≠ order total — review</Pill></div>}
      <Grid min={320} style={{ marginBottom: '1.25rem' }}>
        <Card title="Traffic trend"><TrendChart data={d.daily} series={[{ key: 'sessions', label: 'Sessions', color: C.gold }, { key: 'page_views', label: 'Page views', color: C.brown }]} /></Card>
        <Card title="Orders & revenue"><TrendChart data={d.daily} series={[{ key: 'orders', label: 'Orders', color: C.good }]} /></Card>
      </Grid>
      <Grid min={260}>
        <Card title="Traffic sources"><HBars rows={d.sources.map(s => ({ label: s.label, value: s.sessions }))} /></Card>
        <Card title="Top pages"><HBars rows={d.pages.map(s => ({ label: s.label, value: s.views }))} color={C.brown} /></Card>
        <Card title="Devices"><Donut rows={d.devices.map(s => ({ label: s.device, value: s.sessions }))} /></Card>
      </Grid></>); }}</Body>
  </div>);
}

/* ───────────── 2 Live ───────────── */
function Live({ auth }) {
  const r = useApi('report/live', {}, { poll: 5000, onAuthError: auth });
  return (<div>
    <PageHead title="Live Visitors" sub="Refreshes every 5 seconds. Visitors are shown as anonymous labels (RV####) — no real identities."
      right={<Pill tone="good">● Live</Pill>} />
    <Body r={r}>{d => { const k = d.kpis; return (<>
      <Grid min={150} style={{ marginBottom: '1.25rem' }}>
        <Kpi label="Active now" value={fmtNum(k.active_visitors)} sub={`${k.browsing_now} browsing`} tone="good" />
        <Kpi label="Sessions today" value={fmtNum(k.sessions_today)} />
        <Kpi label="New / returning" value={`${k.new_visitors} / ${k.returning_visitors}`} />
        <Kpi label="Page views today" value={fmtNum(k.page_views)} />
        <Kpi label="Avg. session" value={fmtDur(k.avg_session_seconds)} />
        <Kpi label="Bounce rate" value={fmtPct(k.bounce_rate)} />
        <Kpi label="Add to cart" value={fmtNum(k.add_to_cart)} />
        <Kpi label="Checkouts" value={fmtNum(k.checkouts)} />
        <Kpi label="Purchases" value={fmtNum(k.purchases)} tone="good" />
      </Grid>
      <Grid min={360}>
        <Card title={`Active visitors (last 5 min) · ${d.active.length}`} pad={false}>
          <div style={{ padding: '0.5rem 1rem 1rem' }}>
            <DataTable searchable={false} pageSize={12} rows={d.active.map(a => ({ ...a, idle: `${a.idle_seconds}s ago` }))}
              columns={[{ key: 'visitor', label: 'Visitor' }, { key: 'page', label: 'Current page' }, { key: 'stage', label: 'Stage' }, { key: 'source', label: 'Source' }, { key: 'device', label: 'Device' }, { key: 'idle', label: 'Last seen' }]}
              render={{ stage: v => <Pill tone={v === 'Purchased' ? 'good' : v === 'Browsing' ? undefined : 'gold'}>{v}</Pill> }} empty="Nobody on the site in the last 5 minutes." />
          </div>
        </Card>
        <Card title="Live activity feed" pad={false}>
          <div style={{ maxHeight: 470, overflowY: 'auto' }}>
            {!d.feed.length ? <Empty>No activity yet.</Empty> : d.feed.map(e => (
              <div key={e.id} style={{ display: 'flex', gap: '0.75rem', padding: '0.55rem 1rem', borderBottom: `1px solid ${C.line}`, fontFamily: font, fontSize: '0.74rem' }}>
                <span style={{ color: C.muted, minWidth: 62 }}>{fmtTime(e.ts)}</span>
                <span><strong style={{ color: C.brown }}>{e.visitor}</strong> <span style={{ color: C.text }}>{e.text}</span></span>
              </div>))}
          </div>
        </Card>
      </Grid></>); }}</Body>
  </div>);
}

/* ───────────── 3 Activity ───────────── */
function Activity({ options, auth, openSession }) {
  const [f, setF, p] = useFilters();
  const [ev, setEv] = useState('');
  const params = { ...p, event: ev, limit: 500 };
  const r = useApi('report/activity', params, { onAuthError: auth, poll: 30000 });
  return (<div>
    <PageHead title="Visitor Activity" sub="Every tracked interaction, newest first. No keystrokes, passwords, card or OTP data is ever recorded." />
    <ShellFilters f={f} setF={setF} options={options} />
    <div style={{ marginBottom: '1rem' }}><select value={ev} onChange={e => setEv(e.target.value)} style={{ fontFamily: font, fontSize: '0.75rem', padding: '0.45rem', border: `1px solid ${C.line}` }}>
      <option value="">All events</option>{['page_view', 'product_view', 'product_card_click', 'add_to_cart', 'remove_from_cart', 'wishlist_add', 'begin_checkout', 'payment_initiated', 'purchase', 'whatsapp_click', 'contact_submit', 'search'].map(x => <option key={x}>{x}</option>)}</select></div>
    <Body r={r}>{d => <Card title={`${fmtNum(d.total)} events`}><DataTable columns={tbl(d, 'events').columns} rows={tbl(d, 'events').rows} exportName="activity" exportParams={params}
      render={{ time: v => fmtDateTime(v), event: v => <Pill tone="gold">{v}</Pill> }} /></Card>}</Body>
  </div>);
}

/* ───────────── 4 Journey ───────────── */
function Journey({ options, auth, initialSession }) {
  const [f, setF, p] = useFilters();
  const [sid, setSid] = useState(initialSession || '');
  const [search, setSearch] = useState('');
  const list = useApi('report/visitors', { ...p, search, limit: 200 }, { onAuthError: auth });
  const one = useApi('report/journey', { session: sid }, { onAuthError: auth, enabled: !!sid });
  useEffect(() => { if (initialSession) setSid(initialSession); }, [initialSession]);
  return (<div>
    <PageHead title="Customer Journey" sub="Pick a session to see the visitor's path: source → pages → products → cart → checkout → outcome. Visitors are pseudonymous (RV####)." />
    {!sid ? (<>
      <ShellFilters f={f} setF={setF} options={options} />
      <input placeholder="Find visitor (RV12) or landing page…" value={search} onChange={e => setSearch(e.target.value)} style={{ fontFamily: font, fontSize: '0.78rem', padding: '0.5rem 0.7rem', border: `1px solid ${C.line}`, width: '100%', maxWidth: 360, marginBottom: '1rem' }} />
      <Body r={list}>{d => <Card title={`${fmtNum(d.total)} sessions`}><DataTable columns={tbl(d, 'sessions').columns} rows={tbl(d, 'sessions').rows} onRowClick={row => setSid(row.session_id)} exportName="visitors" exportParams={p}
        render={{ started: v => fmtDateTime(v), converted: v => <Pill tone={v === 'Yes' ? 'good' : undefined}>{v}</Pill>, stage: v => <Pill tone="gold">{v}</Pill> }} /></Card>}</Body>
    </>) : (<>
      <div style={{ marginBottom: '1rem' }}><Btn onClick={() => setSid('')}>← All sessions</Btn></div>
      <Body r={one}>{d => d.error ? <ErrorBox error={d.error} /> : (<>
        <Grid min={170} style={{ marginBottom: '1.25rem' }}>
          <Kpi label="Visitor" value={d.session.visitor} sub={d.session.type} />
          <Kpi label="Source" value={d.session.source} sub={d.session.campaign || d.session.medium} />
          <Kpi label="Device" value={d.session.device} sub={`${d.session.browser} · ${d.session.os}`} />
          <Kpi label="Session length" value={fmtDur(d.session.duration_s)} sub={`${d.session.page_views} page views`} />
          <Kpi label="Outcome" value={d.conversion.status} tone={d.conversion.status === 'Converted' ? 'good' : d.conversion.status.startsWith('Abandoned') ? 'bad' : undefined} />
        </Grid>
        <Card title="Path" style={{ marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'stretch', gap: '0.4rem' }}>
            {d.stages.map((s, i) => (<React.Fragment key={i}>
              {i > 0 && <span style={{ alignSelf: 'center', color: C.gold, fontSize: '1.1rem' }}>→</span>}
              <div style={{ background: s.type === 'source' ? C.brown : C.ivory, color: s.type === 'source' ? C.champagne : C.text, border: `1px solid ${C.line}`, borderLeft: `3px solid ${C.gold}`, padding: '0.55rem 0.8rem', fontFamily: font, fontSize: '0.74rem', minWidth: 110 }}>
                <div style={{ fontWeight: 600 }}>{s.label}</div>
                {s.type === 'page' && <div style={{ fontSize: '0.62rem', color: C.muted, marginTop: 2 }}>{s.dwell_s != null ? fmtDur(s.dwell_s) : '—'}{s.scroll ? ` · scroll ${s.scroll}%` : ''}{s.actions.length ? ` · ${s.actions.length} actions` : ''}</div>}
              </div></React.Fragment>))}
          </div>
          {d.conversion.orders && <div style={{ marginTop: '0.9rem', fontFamily: font, fontSize: '0.75rem' }}>{d.conversion.orders.map(o => <Pill key={o.ref} tone="good">{`Order ${o.ref} · ${fmtINR(o.amount)} · ${o.method} · ${o.status}`}</Pill>)}</div>}
        </Card>
        <Grid min={320}>
          <Card title="Timeline" pad={false}><div style={{ maxHeight: 420, overflowY: 'auto' }}>{d.timeline.map((t, i) => (
            <div key={i} style={{ display: 'flex', gap: '0.75rem', padding: '0.5rem 1rem', borderBottom: `1px solid ${C.line}`, fontFamily: font, fontSize: '0.74rem' }}><span style={{ color: C.muted, minWidth: 62 }}>{fmtTime(t.ts)}</span><span>{t.text}</span></div>))}</div></Card>
          <Card title="Products touched">{!d.products.length ? <Empty>No products viewed.</Empty> : d.products.map(pr => (
            <div key={pr.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.45rem 0', borderBottom: `1px solid ${C.line}`, fontFamily: font, fontSize: '0.76rem', gap: 8 }}>
              <span>{pr.name}</span><span>{pr.viewed && <Pill>viewed</Pill>} {pr.added && <Pill tone="gold">cart</Pill>} {pr.bought && <Pill tone="good">bought</Pill>}</span></div>))}</Card>
        </Grid></>)}</Body>
    </>)}
  </div>);
}

/* ───────────── 5 Pages ───────────── */
function Pages({ options, auth }) {
  const [f, setF, p] = useFilters();
  const r = useApi('report/pages', p, { onAuthError: auth });
  return (<div>
    <PageHead title="Page Analytics" sub="Which pages hold attention, where visitors enter and where they leave." />
    <ShellFilters f={f} setF={setF} options={options} />
    <Body r={r}>{d => { const rows = tbl(d, 'pages').rows; return (<>
      <Grid min={320} style={{ marginBottom: '1.25rem' }}>
        <Card title="Most viewed"><HBars rows={[...rows].sort((a, b) => b.views - a.views).slice(0, 8).map(x => ({ label: x.label, value: x.views }))} /></Card>
        <Card title="Highest exit rate (≥5 views)"><HBars fmt={v => v + '%'} color={C.bad} rows={rows.filter(x => x.views >= 5).sort((a, b) => b.exit_rate - a.exit_rate).slice(0, 8).map(x => ({ label: x.label, value: x.exit_rate }))} max={100} /></Card>
      </Grid>
      <Card title="All pages"><DataTable columns={tbl(d, 'pages').columns} rows={rows} exportName="pages" exportParams={p} /></Card></>); }}</Body>
  </div>);
}

/* ───────────── 6 Products ───────────── */
function Products({ options, auth }) {
  const [f, setF, p] = useFilters();
  const r = useApi('report/products', p, { onAuthError: auth });
  const [tab, setTab] = useState('most_viewed');
  const tabs = [['most_viewed', 'Most viewed', 'views'], ['most_clicked', 'Most clicked', 'clicks'], ['most_added', 'Most added to cart', 'add_to_cart'], ['most_purchased', 'Most purchased', 'purchases'], ['high_views_low_purchases', 'High views · low sales', 'views']];
  return (<div>
    <PageHead title="Product Analytics" sub="What customers look at, add and actually buy. Purchases count only after verified payment." />
    <ShellFilters f={f} setF={setF} options={options} />
    <Body r={r}>{d => { const cur = tabs.find(t => t[0] === tab); return (<>
      <Tabs tabs={tabs.map(t => [t[0], t[1]])} value={tab} onChange={setTab} />
      <Card title={cur[1]} style={{ marginBottom: '1.25rem' }}>
        {tab === 'high_views_low_purchases' && <p style={{ fontFamily: font, fontSize: '0.74rem', color: C.muted, marginTop: 0 }}>Products with attention but weak conversion — check price, photos, description and stock.</p>}
        <HBars rows={d.rankings[tab].map(x => ({ label: x.name, value: x[cur[2]] }))} />
      </Card>
      <Card title="All products"><DataTable columns={tbl(d, 'products').columns} rows={tbl(d, 'products').rows} exportName="products" exportParams={p}
        render={{ revenue: v => fmtINR(v), conversion_rate: v => v + '%' }} /></Card></>); }}</Body>
  </div>);
}

/* ───────────── 7 Clicks (+ heatmap) ───────────── */
function Clicks({ options, auth }) {
  const [f, setF, p] = useFilters();
  const [tab, setTab] = useState('clicks');
  return (<div>
    <PageHead title="Click Tracking" sub="What visitors click on — plus an optional heatmap and scroll depth per page." />
    <ShellFilters f={f} setF={setF} options={options} />
    <Tabs tabs={[['clicks', 'Clicks'], ['heatmap', 'Heatmap & scroll']]} value={tab} onChange={setTab} />
    {tab === 'clicks' ? <ClickTable p={p} auth={auth} /> : <Heatmap p={p} auth={auth} />}
  </div>);
}
function ClickTable({ p, auth }) {
  const r = useApi('report/clicks', p, { onAuthError: auth });
  return <Body r={r}>{d => (<>
    <Grid min={320} style={{ marginBottom: '1.25rem' }}>
      <Card title="Clicks by type"><HBars rows={d.groups.map(g => ({ label: g.group, value: g.clicks }))} /></Card>
      {d.searches && <Card title="Top on-site searches"><HBars color={C.brown} rows={d.searches.map(s => ({ label: s.term, value: s.count }))} /></Card>}
    </Grid>
    <Card title="Clicked elements"><DataTable columns={tbl(d, 'clicks').columns} rows={tbl(d, 'clicks').rows} exportName="clicks" exportParams={p} /></Card></>)}</Body>;
}
function Heatmap({ p, auth }) {
  const [page, setPage] = useState('/'); const [bucket, setBucket] = useState('desktop');
  const r = useApi('report/heatmap', { ...p, page, bucket }, { onAuthError: auth });
  const sel = { fontFamily: font, fontSize: '0.75rem', padding: '0.45rem', border: `1px solid ${C.line}` };
  return (<>
    <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
      <select value={page} onChange={e => setPage(e.target.value)} style={sel}>{[...new Set(['/', ...(r.data ? r.data.pages.map(x => x.page) : [])])].map(x => <option key={x}>{x}</option>)}</select>
      <select value={bucket} onChange={e => setBucket(e.target.value)} style={sel}><option>desktop</option><option>tablet</option><option>mobile</option></select>
    </div>
    <Body r={r}>{d => { const max = Math.max(1, ...d.points.map(x => x.c)); const H = Math.max(600, ...d.points.map(x => x.y + 60)); return (
      <Grid min={340}>
        <Card title={`Click map · ${fmtNum(d.total_clicks)} clicks`}>
          {!d.points.length ? <Empty>No click positions recorded for this page / device yet.</Empty> : (
            <div style={{ position: 'relative', width: '100%', maxWidth: 520, margin: '0 auto', border: `1px solid ${C.line}`, background: C.ivory }}>
              <svg viewBox={`0 0 100 ${H / 8}`} style={{ width: '100%', display: 'block' }}>
                {d.points.map((pt, i) => <circle key={i} cx={pt.x} cy={pt.y / 8 + 2.5} r={1.4 + 2.2 * (pt.c / max)} fill={C.bad} opacity={0.18 + 0.6 * (pt.c / max)} />)}
              </svg>
            </div>)}
          <p style={{ fontFamily: font, fontSize: '0.66rem', color: C.muted }}>X = position across the page width, Y = distance from page top. Positions only — no page content is captured.</p>
        </Card>
        <div style={{ display: 'grid', gap: '1rem', alignContent: 'start' }}>
          <Card title="Scroll depth">
            <HBars fmt={v => v + '%'} max={100} rows={[{ label: 'Reached 25%', value: d.scroll.reach_25 }, { label: 'Reached 50%', value: d.scroll.reach_50 }, { label: 'Reached 75%', value: d.scroll.reach_75 }, { label: 'Reached 100%', value: d.scroll.reach_100 }]} />
            <div style={{ fontFamily: font, fontSize: '0.68rem', color: C.muted }}>{fmtNum(d.scroll.views)} page views</div>
          </Card>
          <Card title="Top clicked elements"><DataTable searchable={false} pageSize={8} columns={tbl(d, 'elements').columns} rows={tbl(d, 'elements').rows} exportName="heatmap" exportParams={{ ...p, page, bucket }} /></Card>
        </div>
      </Grid>); }}</Body></>);
}

/* ───────────── 8 Cart & checkout ───────────── */
function Cart({ options, auth }) {
  const [f, setF, p] = useFilters();
  const r = useApi('report/cart', p, { onAuthError: auth });
  return (<div>
    <PageHead title="Cart & Checkout Analytics" sub="Where shoppers stall between cart and payment. Verified orders come from the server after payment confirmation — never from the thank-you page." />
    <ShellFilters f={f} setF={setF} options={options} />
    <Body r={r}>{d => { const s = d.steps; return (<>
      <Grid min={165} style={{ marginBottom: '1.25rem' }}>
        <Kpi label="Cart views" value={fmtNum(s.cart_views)} />
        <Kpi label="Add to cart" value={fmtNum(s.add_to_cart_events)} sub={`${s.add_to_cart_sessions} sessions · avg ${fmtINR(s.avg_cart_add_value)}`} />
        <Kpi label="Removed" value={fmtNum(s.removed)} sub={`${s.quantity_changes} qty changes`} />
        <Kpi label="Checkout started" value={fmtNum(s.checkout_sessions)} />
        <Kpi label="Shipping completed" value={fmtNum(s.shipping_completed)} />
        <Kpi label="Payment initiated" value={fmtNum(s.payment_initiated)} />
        <Kpi label="Payment failed / dismissed" value={`${s.payment_failed} / ${s.payment_dismissed}`} tone={s.payment_failed ? 'bad' : undefined} />
        <Kpi label="Verified orders" value={fmtNum(s.verified_orders)} tone="good" sub={`${s.cancelled_or_returned} cancelled · ${s.unverified_orders} unverified`} />
        <Kpi label="Cart abandonment" value={fmtPct(s.cart_abandonment_rate)} tone="bad" />
        <Kpi label="Checkout abandonment" value={fmtPct(s.checkout_abandonment_rate)} tone="bad" />
      </Grid>
      <Grid min={300} style={{ marginBottom: '1.25rem' }}>
        <Card title="Payment methods selected"><Donut rows={d.payment_methods.map(m => ({ label: m.method, value: m.count }))} /></Card>
        <Card title="Order status"><DataTable searchable={false} columns={[{ key: 'status', label: 'Status' }, { key: 'method', label: 'Method' }, { key: 'count', label: 'Orders' }, { key: 'amount', label: 'Amount' }]} rows={d.order_status} render={{ amount: v => fmtINR(v) }} /></Card>
      </Grid>
      <Card title="Abandoned carts — follow-up list"><DataTable columns={tbl(d, 'abandoned_carts').columns} rows={tbl(d, 'abandoned_carts').rows} exportName="cart" exportParams={p}
        render={{ last_seen: v => fmtDateTime(v), cart_value: v => fmtINR(v) }} /></Card></>); }}</Body>
  </div>);
}

/* ───────────── 9 Funnel ───────────── */
function Funnel({ options, auth }) {
  const [f, setF, p] = useFilters();
  const [mode, setMode] = useState('cumulative');
  const r = useApi('report/funnel', p, { onAuthError: auth });
  return (<div>
    <PageHead title="Conversion Funnel" sub="Seven stages from visit to verified order, with drop-off at every step." />
    <ShellFilters f={f} setF={setF} options={options} show={{ compare: true }} />
    <Body r={r}>{d => (<>
      <Tabs tabs={[['cumulative', 'Reached stage or beyond'], ['exact', 'Exact stage events']]} value={mode} onChange={setMode} />
      <Grid min={340} style={{ marginBottom: '1.25rem' }}>
        <Card title="Selected period"><FunnelChart stages={d.main[mode]} /></Card>
        {d.compare && <Card title="Comparison period"><FunnelChart stages={d.compare[mode]} /></Card>}
      </Grid>
      {d.orders_without_analytics_consent > 0 && <p style={{ fontFamily: font, fontSize: '0.74rem', color: C.muted }}>{d.orders_without_analytics_consent} verified order(s) came from visitors who declined analytics, so they appear in revenue but not in the funnel.</p>}
      <Card title="Funnel table"><DataTable searchable={false} columns={tbl(d, 'funnel').columns} rows={tbl(d, 'funnel').rows} exportName="funnel" exportParams={p} /></Card></>)}</Body>
  </div>);
}

/* ───────────── 10 Sources ───────────── */
function Sources({ options, auth }) {
  const [f, setF, p] = useFilters();
  const r = useApi('report/sources', p, { onAuthError: auth });
  const H = { most_visitors: 'Most visitors', most_product_views: 'Most product views', most_enquiries: 'Most enquiries', most_add_to_cart: 'Most add-to-cart', most_purchases: 'Most purchases', highest_revenue: 'Highest revenue' };
  return (<div>
    <PageHead title="Traffic Sources" sub="Where visitors come from — Instagram, WhatsApp, Google, direct and more — read from UTM tags and referrers." />
    <ShellFilters f={f} setF={setF} options={options} show={{ product: false, category: false }} />
    <Body r={r}>{d => (<>
      <Grid min={200} style={{ marginBottom: '1.25rem' }}>{Object.entries(H).map(([k, l]) => <Kpi key={k} label={l} value={d.highlights[k] || '—'} />)}</Grid>
      <Card title="Source performance"><DataTable columns={tbl(d, 'sources').columns} rows={tbl(d, 'sources').rows} exportName="sources" exportParams={p} render={{ revenue: v => fmtINR(v), conversion_rate: v => v + '%' }} /></Card></>)}</Body>
  </div>);
}

/* ───────────── 11 Campaigns ───────────── */
function Campaigns({ options, auth }) {
  const [f, setF, p] = useFilters();
  const r = useApi('report/campaigns', p, { onAuthError: auth });
  return (<div>
    <PageHead title="Campaign Performance" sub="Tag every link you share with UTM parameters (utm_source, utm_medium, utm_campaign) so results show up here." />
    <ShellFilters f={f} setF={setF} options={options} show={{ product: false, category: false }} />
    <Body r={r}>{d => (<>
      <Card title="Campaign scoreboard">{!tbl(d, 'campaigns').rows.length ? <Empty>No tagged campaign traffic in this period. Add ?utm_source=instagram&utm_medium=social&utm_campaign=your-name to links.</Empty>
        : <DataTable columns={tbl(d, 'campaigns').columns} rows={tbl(d, 'campaigns').rows} exportName="campaigns" exportParams={p} render={{ revenue: v => fmtINR(v), conversion_rate: v => v + '%' }} />}</Card></>)}</Body>
  </div>);
}

/* ───────────── 12 Behaviour reports ───────────── */
function Reports({ options, auth }) {
  const [f, setF, p] = useFilters();
  const r = useApi('report/behaviour', p, { onAuthError: auth });
  const [t, setT] = useState('hourly');
  const names = { hourly: 'Busiest hours', new_vs_returning: 'New vs returning', devices: 'Devices', landing_pages: 'Landing pages', exit_pages: 'Exit pages', searches: 'Search terms' };
  return (<div>
    <PageHead title="Customer Behaviour Reports" sub="Patterns in when, how and from what device customers shop. Every table can be exported." />
    <ShellFilters f={f} setF={setF} options={options} />
    <Body r={r}>{d => (<>
      <Grid min={200} style={{ marginBottom: '1.25rem' }}><Kpi label="Avg. time to purchase" value={d.avg_minutes_to_purchase ? `${d.avg_minutes_to_purchase} min` : '—'} sub="first visit event → last activity of purchasing sessions" /></Grid>
      <Tabs tabs={Object.entries(names)} value={t} onChange={setT} />
      {t === 'hourly' && <Card title="Sessions by hour (IST)" style={{ marginBottom: '1rem' }}><HBars rows={tbl(d, 'hourly').rows.map(x => ({ label: x.hour, value: x.sessions }))} /></Card>}
      <Card title={names[t]}><DataTable columns={tbl(d, t).columns} rows={tbl(d, t).rows} exportName="behaviour" exportParams={p} exportTable={t} /></Card></>)}</Body>
  </div>);
}

/* ───────────── router ───────────── */
export default function AnalyticsModule({ active, onAuthError }) {
  const filt = useApi('filters', {}, { onAuthError });
  const options = filt.data;
  const [jumpSession, setJumpSession] = useState('');
  const common = { options, auth: onAuthError };
  const view = {
    ca_overview: <Overview {...common} />, ca_live: <Live auth={onAuthError} />, ca_activity: <Activity {...common} openSession={setJumpSession} />,
    ca_journey: <Journey {...common} initialSession={jumpSession} />, ca_pages: <Pages {...common} />, ca_products: <Products {...common} />, ca_clicks: <Clicks {...common} />,
    ca_cart: <Cart {...common} />, ca_funnel: <Funnel {...common} />, ca_sources: <Sources {...common} />, ca_campaigns: <Campaigns {...common} />, ca_reports: <Reports {...common} />,
  }[active];
  return <div style={{ fontFamily: font }}>{view || null}</div>;
}
