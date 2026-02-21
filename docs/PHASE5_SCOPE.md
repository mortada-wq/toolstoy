# Phase 5 — Billing, Polish, Scale & Launch

Domain: toolstoy.app

## Implemented

1. Billing page + plan limits (UI)
2. Account settings (profile, password, delete)
3. Character edit page (Details, Knowledge, Widget tabs)
4. Public character profile (/c/:slug)
5. First login onboarding flow (/welcome)
6. Installation guide pages (/docs/install/*)
7. Terms and Privacy pages
8. Performance: lazy loading, code splitting (initial bundle ~496KB)

## Pending

- Configure VITE_BILLING_PROVIDER and VITE_STRIPE_CHECKOUT_URL in hosting
- API Gateway rate limiting (configure in AWS Console if needed)
- Run docs/LAUNCH_CHECKLIST.md before go-live

## New Routes

- /dashboard/billing
- /dashboard/settings
- /dashboard/characters/:id/edit
- /c/:slug
- /docs/install, /docs/install/:platform
- /terms, /privacy
- /welcome

## Design Language

White navbar. Inter font. #FFFFFF, #F5F5F5, #1A1A1A, #6B7280, #E5E7EB.
8px radius. 1px #E5E7EB borders. No new colors. No emojis.
