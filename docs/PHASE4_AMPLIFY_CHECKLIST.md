# Phase 4 — Amplify Checklist

Use this checklist to verify the Amplify side is configured correctly. Run `ampx sandbox --once` (or `ampx sandbox`) with valid AWS credentials before checking.

---

## Auth (Cognito)

- [ ] User Pool created with email login
- [ ] Attributes: email (required), name/fullname (required), custom:store_url (optional)
- [ ] Password policy: min 8 chars, uppercase, number, symbol
- [ ] Email verification enabled
- [ ] `amplify_outputs.json` exists and contains `auth.user_pool_id`, `auth.user_pool_client_id`
- [ ] Sign up sends verification code to email
- [ ] Sign in returns JWT
- [ ] Protected routes redirect to /signin when not authenticated

---

## Data / API

- [ ] Amplify Functions defined under `amplify/functions/`
- [ ] HTTP API created with routes for /api/merchants, /api/personas, etc.
- [ ] Cognito User Pool authorizer attached to protected routes
- [ ] API outputs added to `amplify_outputs.json` (custom.API)
- [ ] Frontend configured with `Amplify.configure()` including REST API

---

## Functions

- [x] api-merchants: GET /api/merchants/me, PUT /api/merchants/me (implemented)
- [ ] api-personas: CRUD + submit, status
- [ ] api-knowledge: generate, approve, CRUD
- [ ] api-widget: GET /load, POST /chat (public, no auth)
- [ ] api-scraper: POST /extract
- [ ] api-admin: overview, merchants, alerts, jobs, retry

---

## Database (RDS — when provisioned)

- [ ] RDS PostgreSQL instance (db.t3.micro)
- [ ] Connection string in Secrets Manager
- [ ] Tables: merchants, personas, knowledge_base, generation_jobs, conversations, messages, knowledge_gaps
- [ ] Migrations run successfully

---

## Hosting

- [ ] Amplify Hosting connected to GitHub
- [ ] Build: `npm run build`
- [ ] Output: `dist/`
- [ ] SPA redirect configured: `</^[^.]+$|\.(?!(css|gif|ico|jpg|js|png|txt|svg|woff|woff2|ttf|map|json|webp)$)([^.]+$)/>` → `/index.html` (200)

---

## Icons (no emojis)

- [x] All UI uses outline/rounded SVG icons (CheckIcon, ChevronRightIcon, CharacterStudio icons)
- [x] No emoji characters in buttons, labels, or status text
