# Toolstoy Design System

Premium minimalist AI chat character creation app at toolstoy.app.

---

## Core Colors (6)

| Token | Hex | Use |
|-------|-----|-----|
| **Charcoal Slate** | `#2E3340` | Primary background, body text on light surfaces |
| **Secondary BG** | `#252A36` | Card backgrounds, elevated surfaces |
| **Overlay** | `#1E2330` | Input backgrounds, modals, dropdowns |
| **Teal** | `#70E6D2` | Secondary actions, links, highlights, brand accent |
| **Orange** | `#FF7A2F` | Primary actions (CTA buttons), focus states |
| **Warm Cream** | `#FDF0E0` | Primary text on dark, button text on orange |

Supporting: **Steel Blue** `#8FA3B5` (borders, muted UI), **Slate Text** `#C8D0DC` (secondary text), **Coral** `#F4957A` (accent).

---

## Typography

**Font:** Plus Jakarta Sans, fallback Inter.

| Scale | Size | Use |
|-------|------|-----|
| xs | 11px | Labels, captions |
| sm | 13px | Secondary text |
| base | 15px | Body, buttons |
| md | 17px | Subheadings |
| lg | 20px | Section titles |
| xl | 24px | Page titles |
| 2xl | 30px | Hero text |
| 3xl | 38px | Display |
| display | 48px | Marketing hero |

**Weights:** 400 (regular), 500 (medium), 600 (semibold), 700 (bold).

---

## Spacing System

Base unit: **8px**. All spacing must be multiples of 8.

| Scale | Value |
|-------|-------|
| 1 | 4px |
| 2 | 8px |
| 3 | 12px |
| 4 | 16px |
| 5 | 20px |
| 6 | 24px |
| 8 | 32px |
| 10 | 40px |
| 12 | 48px |
| 16 | 64px |

---

## Component Specs

### Button
- **Primary:** Background `#FF7A2F`, text `#FDF0E0`, border-radius `9999px`, padding `12px 24px`, font-weight 600, font-size 15px.
- **Secondary:** Transparent background, border `1.5px solid rgba(112,230,210,0.40)`, text `#70E6D2`, border-radius `9999px`.
- All buttons pill-shaped.

### Card
- Background `#252A36`, border `1.5px solid rgba(143,163,181,0.15)`, border-radius `16px`, padding `24px`.

### Input
- Background `#1E2330`, border `1.5px solid rgba(143,163,181,0.25)`, border-radius `12px`, padding `12px 16px`.
- Focus: border `1.5px solid rgba(112,230,210,0.60)`.

### Avatar
- Border-radius `9999px` (circle).
- Minimum size 32px for icons, 40px for chat heads.

### Badge
- Border-radius `9999px`, padding `4px 12px`, font-size 13px, font-weight 500.

---

## Animation

| Duration | Value | Use |
|----------|-------|-----|
| fast | 150ms | Micro-interactions |
| normal | 250ms | Hover, toggle |
| slow | 400ms | Page transitions |
| enter | 350ms | Modal/drawer enter |

**Easing:** `cubic-bezier(0.4,0,0.2,1)` (default), `cubic-bezier(0.34,1.56,0.64,1)` (spring).

---

## Logo

**Logo file locations:** `/public/logos/`

- logo-darkmode.svg → default, use on #2E3340 backgrounds
- logo-teal.svg → teal brand moments
- logo-lightmode.svg → light/cream backgrounds
- logov.svg → icon only, use for favicon and app icon

**Logo rules:**
- Never recolor the SVGs manually
- Minimum wordmark width: 120px
- Minimum icon width: 32px
- Clear space on all sides = height of lowercase "o" in wordmark
- Never stretch, rotate, or add shadows to the logo

---

## Screen Architecture

### Home / Chat
- Primary background `#2E3340`.
- Chat bubbles on secondary `#252A36`.
- Input bar on overlay `#1E2330`.

### Character Creation
- Stepper or wizard on cards.
- Primary CTA (orange) for "Generate" / "Next".
- Secondary (teal) for "Back" / "Skip".

### Character Profile
- Card layout for character details.
- Avatar prominent, 9999px radius.

---

## What This Is Not

- **No heavy shadows** — Max 8% opacity except teal/orange glows.
- **No gradients in UI** — Gradients exist only in logo SVGs.
- **No pure white** — Use Warm Cream `#FDF0E0`.
- **No pure black** — Use Charcoal Slate `#2E3340`.
- **Orange is action-only** — Never decorative. Use for CTAs and focus, not backgrounds or accents.
