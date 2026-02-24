# Phase 11: Optional Advanced Features — Implementation Plan

## Overview

Phase 11 adds three **optional** advanced features to the Emotional States Prompts Module. All are marked optional and can be implemented independently.

---

## Current State

| Feature | Status | Notes |
|---------|--------|------|
| **Prompt Variables** | Partially done | Phase 2.3 implemented `{character_name}`, `{emotion}`, `{timestamp}`, `{user_id}` in service layer |
| **A/B Testing** | Not started | Full new feature |
| **Prompt Templates** | Overlap exists | Master prompt templates exist for character generation; Phase 11 = reusable templates for **emotional prompts** |

---

## 11.1 Prompt Variables Support (Optional)

**Goal:** Extend and harden the existing variable substitution.

### What's Already Done
- `EmotionalPromptsService` / `getResolvedPrompt()` substitutes variables
- Variables: `{character_name}`, `{emotion}`, `{timestamp}`, `{user_id}`

### Remaining Tasks

| Task | Description | Effort |
|------|-------------|--------|
| 11.1.1 | **Variable validation** — Validate variables in prompt text before save; warn on unknown `{xxx}` | 1–2 days |
| 11.1.2 | **UI variable reference** — Show variable reference guide in EmotionalPromptsManager (e.g. tooltip or sidebar) | 0.5 day |
| 11.1.3 | **Unit tests** — Add tests for edge cases (empty vars, invalid vars, special chars) | 0.5 day |

### Recommendation
**Low priority.** Core behavior exists. Add validation + UI reference when touching the emotional prompts UI.

---

## 11.2 A/B Testing Framework (Optional)

**Goal:** Let admins run A/B tests on prompt variations and pick winners.

### Data Model

```
ab_tests
├── id (uuid)
├── name (varchar)
├── character_id (uuid, nullable — null = global)
├── emotion (varchar)
├── variant_a_prompt (text)
├── variant_b_prompt (text)
├── status (draft | running | completed)
├── created_at, updated_at
└── created_by (admin user id)

ab_test_ratings
├── id (uuid)
├── ab_test_id (uuid)
├── variant (a | b)
├── rating (1–5 or thumbs up/down)
├── rater_id (admin user id)
├── notes (text, optional)
└── created_at
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/ab-tests` | List A/B tests (filter by status, character) |
| POST | `/api/admin/ab-tests` | Create A/B test |
| GET | `/api/admin/ab-tests/:id` | Get A/B test with ratings |
| PUT | `/api/admin/ab-tests/:id` | Update A/B test |
| POST | `/api/admin/ab-tests/:id/ratings` | Submit rating (variant A or B) |
| POST | `/api/admin/ab-tests/:id/complete` | Mark complete, optionally promote winner |

### UI Flow

1. **Create A/B test** — Select character + emotion, enter variant A and B prompts
2. **Run test** — Generate preview videos for both variants; admins rate each
3. **Collect ratings** — Admin UI shows both videos side-by-side with rating controls
4. **Analyze** — Show aggregate ratings, winner, confidence
5. **Promote winner** — Button to copy winning prompt to character/emotion

### Tasks

| Task | Description | Effort |
|------|-------------|--------|
| 11.2.1 | Create `ab_tests` and `ab_test_ratings` tables + migration | 1 day |
| 11.2.2 | Implement A/B test CRUD service | 1 day |
| 11.2.3 | Implement API endpoints | 1 day |
| 11.2.4 | Build admin UI: create test, rate variants, view results | 2–3 days |
| 11.2.5 | Implement "promote winner" to emotional prompt | 0.5 day |
| 11.2.6 | Integration tests | 1 day |

**Total estimate:** 6–7 days

### Recommendation
**Medium priority.** Useful for optimizing prompts; implement after core emotional prompts usage is stable.

---

## 11.3 Prompt Templates (Optional)

**Goal:** Reusable prompt structures for emotional prompts (different from master character-generation templates).

### Distinction

| Type | Purpose | Where Used |
|------|---------|------------|
| **Master prompt templates** (existing) | Character image generation | Soul Engine, Bedrock |
| **Emotional prompt templates** (Phase 11) | Reusable structures for emotional state prompts | Emotional Prompts Module |

### Data Model

```
emotional_prompt_templates
├── id (uuid)
├── name (varchar) — e.g. "Friendly Greeting", "Empathetic Response"
├── description (text)
├── template_text (text) — with placeholders {character_name}, {emotion}, etc.
├── applicable_emotions (jsonb) — ["idle", "greeting", "happy"] or null = all
├── version (int)
├── created_at, updated_at
└── created_by

template_applications (optional — for propagation)
├── template_id (uuid)
├── character_id (uuid)
├── emotion (varchar)
└── applied_at
```

### Features

1. **Create template** — Name, description, template text with variables
2. **Apply to character/emotion** — Use template as base for a character's emotional prompt
3. **Propagation** — When template changes, optionally update all applied instances
4. **Versioning** — Track template versions like emotional prompts

### Tasks

| Task | Description | Effort |
|------|-------------|--------|
| 11.3.1 | Create `emotional_prompt_templates` table + migration | 0.5 day |
| 11.3.2 | Implement template CRUD service | 1 day |
| 11.3.3 | Implement "apply template" — create/update emotional prompt from template | 1 day |
| 11.3.4 | Add template selector to EmotionalPromptsManager UI | 1 day |
| 11.3.5 | Implement propagation (optional) — update applied prompts when template changes | 1–2 days |
| 11.3.6 | Template versioning | 0.5 day |
| 11.3.7 | Integration tests | 1 day |

**Total estimate:** 6–7 days

### Recommendation
**Medium priority.** Helpful when many characters share similar prompt structures. Can start with apply-only (no propagation) to reduce scope.

---

## Implementation Order

### Option A: Quick Wins First
1. **11.1** — Prompt variables validation + UI (1–2 days)
2. **11.3** — Templates without propagation (4–5 days)
3. **11.2** — A/B testing (6–7 days)

### Option B: Highest Impact First
1. **11.2** — A/B testing (enables data-driven prompt optimization)
2. **11.3** — Templates (reduces duplication)
3. **11.1** — Variables polish

### Option C: Minimal Phase 11
- Only **11.1** (variables validation + UI reference)
- Defer 11.2 and 11.3 to a later phase

---

## Dependencies

- **Phase 10** must be complete (Emotional Prompts Module, Staging, Export/Import)
- **PromptTemplateManager** exists for master templates — do not confuse with emotional prompt templates
- Emotional Prompts API and UI must be stable before adding A/B or templates

---

## Success Criteria

- [ ] 11.1: Variables validated on save; UI shows variable reference
- [ ] 11.2: Admins can create A/B tests, rate variants, promote winner
- [ ] 11.3: Admins can create templates and apply them to character/emotion pairs

---

*Last updated: 2026-02-24*
