# RAVARI Customer Analytics — Test Report

Date: 2026-11-13 · Backend e2e on real MySQL 8.4: **72 passed, 0 failed**

Admin UI: all 12 screens rendered against the live API with seeded events — 12/12 passed (no console errors, no failed requests).
Storefront tracker: 3/3 passed — nothing sent before consent; events sent after consent with card/OTP/email text redacted; nothing sent after consent withdrawn.

## Backend checks

| # | Check | Result |
|---|---|---|
| 1 | Server boots and analytics tables are created | PASS |
| 2 | All 5 analytics tables exist | PASS |
| 3 | Analytics API rejects requests with no token (401) | PASS |
| 4 | Analytics API rejects the old static token / arbitrary bearer (401) | PASS |
| 5 | Existing /api/admin/orders no longer accepts any Authorization header (401) | PASS |
| 6 | Wrong admin password is rejected | PASS |
| 7 | Admin login returns a signed JWT | PASS |
| 8 | Existing admin orders endpoint works with the new token | PASS |
| 9 | Analyst role can read analytics | PASS |
| 10 | Analyst role cannot use store admin endpoints (401) | PASS |
| 11 | Analyst role cannot delete visitor data (403) | PASS |
| 12 | No consent => nothing stored | PASS |
| 13 | Bots are ignored | PASS |
| 14 | Invalid visitor id rejected (400) | PASS |
| 15 | Malformed body rejected (400) | PASS |
| 16 | Nothing was written by the rejected requests | PASS |
| 17 | Valid batch accepted | PASS |
| 18 | Client-sent "purchase" events are rejected (server-only) | PASS |
| 19 | Sensitive data (url token, password/otp meta, email, card number) is never stored | PASS |
| 20 | Search text is redacted rather than dropped | PASS |
| 21 | Re-sending the same batch is de-duplicated (0 stored) | PASS |
| 22 | Session classified as Instagram / paid_social / mobile | PASS |
| 23 | UTM parameters captured | PASS |
| 24 | Session counters correct (page views 5, cart adds 1, checkout 1) | PASS |
| 25 | Product category/slug/name filled from the catalogue | PASS |
| 26 | Bad Razorpay signature is rejected | PASS |
| 27 | Order with an UNVERIFIED payment id is NOT counted as a purchase | PASS |
| 28 | Valid Razorpay signature verifies | PASS |
| 29 | Verified online payment is recorded as a paid order | PASS |
| 30 | Order is attributed to the Instagram session | PASS |
| 31 | Exactly one purchase event written with order id, source and value | PASS |
| 32 | Re-using the same payment id cannot create a second purchase (duplicate protection) | PASS |
| 33 | Session flagged as converted only after verification | PASS |
| 34 | Visiting the order-confirmation page does not create a purchase | PASS |
| 35 | COD order recorded server-side with order id RAV<id> | PASS |
| 36 | Order without analytics consent is still counted as an order but unattributed | PASS |
| 37 | Returning visitor detected on a second session | PASS |
| 38 | Visitor numbers are stable and formatted RV#### | PASS |
| 39 | Cancelling an order updates analytics order status | PASS |
| 40 | Order-cancelled event recorded | PASS |
| 41 | Overview: 4 sessions, 3 visitors | PASS |
| 42 | Overview: 1 new + 1 returning visitor classification present | PASS |
| 43 | Overview: revenue excludes cancelled + unverified orders (only COD 4098 + COD 2099) | PASS |
| 44 | Funnel (exact): visitors 4, homepage 3, product 2, cart 2, checkout 2, payment 2, orders 2 | PASS |
| 45 | Funnel computes drop-off % | PASS |
| 46 | Sources: Instagram, Google Organic and Facebook all identified | PASS |
| 47 | Sources: Google organic order revenue = 4098; Instagram cancelled order excluded | PASS |
| 48 | Campaign report lists utm_campaign "diwali_totes" | PASS |
| 49 | Product report: product 14 purchased (2 units) and product 16 cancelled purchase excluded | PASS |
| 50 | Cart report: verified/unverified order counts (fake + replayed payment id = 2 unverified) | PASS |
| 51 | Live report: active visitors and feed | PASS |
| 52 | Live feed reads like a journey ("Entered homepage") | PASS |
| 53 | Journey: source -> pages in order ending at checkout with conversion info | PASS |
| 54 | Journey: time on page, product viewed + added, conversion status | PASS |
| 55 | Pages report returns pages with exit counts | PASS |
| 56 | Click report groups clicks by type and shows search terms | PASS |
| 57 | Heatmap returns click points and scroll data | PASS |
| 58 | Visitor search by RV number finds their sessions | PASS |
| 59 | Behaviour report returns device/new-vs-returning/landing/exit tables | PASS |
| 60 | Custom date range with no data returns empty, not an error | PASS |
| 61 | Filters (source + device) narrow the results | PASS |
| 62 | Funnel date-wise comparison returns both periods | PASS |
| 63 | CSV export works (BOM, header, rows) | PASS |
| 64 | Excel export returns a valid .xlsx | PASS |
| 65 | Export requires authentication (401) | PASS |
| 66 | Visitor can erase their own data (right to erasure) | PASS |
| 67 | Admin deletion removes events/sessions; order record kept but unlinked | PASS |
| 68 | Retention job deletes data older than the retention period (395 days) | PASS |
| 69 | Rate limiting kicks in under flood (429) | PASS |
| 70 | Existing /api/products still works | PASS |
| 71 | Existing /api/admin/dashboard still works | PASS |
| 72 | Existing /api/admin/analytics (old Analytics tab) still works | PASS |

## Not tested (be aware)

- Razorpay live API from the sandbox: the gateway-amount lookup falls back to the order total if unreachable.
- Real-browser run on ravari.in: do one live test order before announcing.
- GA4: placeholder tag `G-XXXXXXXXXX` in index.html is not a real property; GTM and Meta Pixel still load before consent.