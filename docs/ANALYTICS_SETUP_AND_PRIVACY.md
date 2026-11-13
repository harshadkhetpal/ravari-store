# Customer Analytics — setup, privacy & retention

## Environment variables (Hostinger)
- `JWT_SECRET` — **required**, long random string. Admin login is now a signed token; everyone must log in again once after deploy.
- `ANALYST_EMAIL`, `ANALYST_PASSWORD` — optional read-only login (can view/export, cannot delete data).
- `ANALYTICS_RETENTION_DAYS` — default 395 days; older events are deleted automatically.
- `ANALYTICS_TZ_OFFSET_MIN` — default 330 (IST) for day boundaries.

## What is tracked (only after the visitor accepts the analytics banner)
Page views, product views, clicks, add/remove cart, wishlist, checkout steps, payment attempts, WhatsApp/contact clicks, scroll depth, search terms, source/UTM, device/browser. Visitors appear as RV#### — no names, emails or phones.
Never recorded: keystrokes, passwords, card data, OTPs, tokens, form contents. Emails, phone numbers, card-like and OTP-like numbers are masked in the browser and again on the server. Admin pages are not tracked. Browser "Global Privacy Control" is respected.

## Purchases
Counted only on the server after Razorpay signature verification (online) or when the server creates a COD order. Each order/payment ID is stored once, so duplicates and thank-you-page refreshes cannot inflate sales. COD counts as "order placed", not "paid".

## Rights & deletion
Withdrawing consent in the banner stops tracking and erases that visitor's data. Admins can delete a visitor on request. A retention job runs daily.

## Before going live
1. Set `JWT_SECRET`; change the default admin password (it is committed in the repo).
2. Have the draft `/privacy-policy` page reviewed for DPDP Act compliance.
3. Make one real test order and confirm it shows in Cart & Checkout and Overview.
4. Optional: gate GTM / Meta Pixel behind the consent banner; replace the GA4 placeholder ID.
