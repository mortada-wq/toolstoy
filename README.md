# Toolstoy

B2B SaaS platform that transforms any e-commerce product into an animated AI character — a talking assistant that lives on any website as a two-line JavaScript embed.

## Phase 1 — Static Homepage ✓

Frontend-only. No backend, auth, or database.

## Phase 2 — Routing, Pages & Micro-Animations ✓

- React Router v6 (/, /features, /pricing, /signin, /signup)
- Scroll-triggered reveal animations (Intersection Observer)
- 4 new pages: Features, Pricing, Sign In, Sign Up
- Navbar links now navigate between pages
- Still NO backend, auth, or API calls

### Run locally

```bash
npm install
npm run dev
```

Open http://localhost:5173

### Build for production

```bash
npm run build
```

Output: `dist/`

### Deploy to AWS Amplify (via GitHub)

1. Push this repo to GitHub
2. In [Amplify Console](https://console.aws.amazon.com/amplify):
   - **Hosting** → Connect Git repository
   - Select your repo and branch
   - Build settings are read from `amplify.yml`:
     - Build: `npm run build`
     - Output: `dist/`
3. Amplify will build and deploy on every push

### Project structure

```
src/
├── assets/
│   └── Finaltoolstoy.svg
├── components/
│   ├── Navbar.tsx
│   ├── Hero.tsx
│   ├── Showcase.tsx
│   ├── ShowcaseCard.tsx
│   ├── DemoModal.tsx
│   ├── HowItWorks.tsx
│   ├── WorksAnywhere.tsx
│   ├── CTASection.tsx
│   ├── Footer.tsx
│   ├── ScrollReveal.tsx
│   └── FAQAccordion.tsx
├── pages/
│   ├── HomePage.tsx
│   ├── FeaturesPage.tsx
│   ├── PricingPage.tsx
│   ├── SignInPage.tsx
│   └── SignUpPage.tsx
├── App.tsx
├── main.tsx
└── index.css
```

### SPA routing (Amplify)

For direct URLs (e.g. toolstoy.app/features) to work, add a redirect in **Amplify Console → Hosting → Redirects**:

- **Source:** `</^[^.]+$|\.(?!(css|gif|ico|jpg|js|png|txt|svg|woff|woff2|ttf|map|json|webp)$)([^.]+$)/>`
- **Target:** `/index.html`
- **Type:** 200 (rewrite)

### Tech stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
