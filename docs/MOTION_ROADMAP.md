# Toolstoy Motion & UX Roadmap (2026)

A guide for making the Soul Engine feel truly alive — intent-driven, spatial, and next-gen.

---

## Implemented ✅

| Feature | Location | Notes |
|--------|----------|------|
| **Pulse of Life** (fluid gradients) | `SoulEnginePulse` component | Multi-layer radial gradients that drift and pulse. Used in DemoModal CharacterPanel. |
| **Digital Alchemy** (building phase) | `DigitalAlchemy` component, CharacterStudio Step 5 | Fluid orb + SVG "data threads" converging to center. Progress steps with intent-based reveal. |
| **Playful cursor** | DemoModal | Dot cursor when hovering over chat/demo area (desktop only). |
| **Staggered message slide-up** | DemoModal ChatPanel | 120ms stagger mimics human typing rhythm. |
| **Spring micro-interactions** | Buttons, ShowcaseCards | `cubic-bezier(0.34, 1.56, 0.64, 1)` for Linear-style 2–3% scale. |

---

## Suggested Tools for Your Dev Team

### 1. **Framer Motion**
- **Use for:** Intent-based layout animations, physics-based springs, layout presets.
- **Why:** Handles springs/damping better than raw CSS. Great for "bloom" effects, tooltips that grow from hover targets, and modal/drawer transitions.
- **Add:** `npm install framer-motion`
- **Example:** Product detail hover → AI character "leans" toward it, or tooltip "blooms" with more info.

### 2. **GSAP (GreenSock)**
- **Use for:** Complex timelines, SVG morphing, character evolution sequences.
- **Why:** Gold standard for precise control. SVG morphing (e.g. 2D sketch → 3D avatar) is a GSAP strength.
- **Add:** `npm install gsap`
- **Example:** Character morphing from product sketch into animated avatar during "Digital Alchemy."

### 3. **Rive**
- **Use for:** High-performance, interactive character animations (expressions, gestures).
- **Why:** 2026 standard for runtimes under ~100kb. Perfect for Soul Engine character states (idle, listening, thinking, speaking).
- **Add:** `@rive-app/react-canvas` or `@rive-app/react`
- **Example:** Character reacts to hover (subtle lean), or animates lip-sync / expressions when "speaking."

### 4. **Three.js + WebGL**
- **Use for:** Full "Digital Alchemy" spectacle — product image → pixels → character.
- **Why:** WebGL shaders enable particle systems, reconstruction effects, and data-thread visuals at scale.
- **Example:** Product URL triggers a WebGL scene where the product image breaks into particles and weaves into the character's form in real-time.

---

## Phase 2 Ideas

| Idea | Complexity | Notes |
|------|------------|-------|
| **Magnetic cursor** | Medium | Chat icon moves slightly toward cursor on hover. Requires mouse-position tracking. |
| **Audio-reactive UI** | High | Voice input → border glow / typography pulse in sync with frequency. Web Audio API. |
| **Full WebGL reconstruction** | High | Product pixels → character. Three.js + custom shaders. |
| **Rive character states** | Medium | Replace static character with Rive animations (idle, thinking, speaking). |

---

## Technical Tips

- **GPU:** Animate only `transform` and `opacity`. Avoid `height`, `width`, `top`, `left`.
- **Duration:** 200–400ms for micro-interactions. Longer for entrances.
- **Easing:** Use `cubic-bezier(0.34, 1.56, 0.64, 1)` for playful spring; `cubic-bezier(0.22, 1, 0.36, 1)` for softer out.
