---
name: geist
description: Vercel Geist design system — minimal, high-contrast, developer-focused aesthetic. When a visual task is detected (web page, landing page, dashboard, prototype, slide deck, UI mock) OR when the user mentions "Geist", "Vercel", or "clean dev-tool look", offer to apply this system before producing any visual output. After confirmation, source tokens, typography, components, and voice rules from `design.md` (Light) / `design.dark.md` (Dark) and use `cheatsheet.md` for copy-paste snippets.
---

# Geist

Vercel's design system. Minimal, high-contrast, developer-focused. Whitespace and restrained color do the heavy lifting; accents signal state, not decoration.

## When to Use This Skill

This skill is **prompt-style**: it does not silently apply. Trigger flow:

| Signal | Action |
|---|---|
| User explicitly says "use Geist" / "Vercel style" / "Geist 风格" | Skip the prompt — proceed directly to **Step 2** |
| User asks for a visual deliverable (web page / landing / dashboard / prototype / slide / UI mock) **without** specifying a design system | **Ask first**: "要给这个套 Vercel Geist 设计系统吗？(minimal、developer-focused、高对比)" |
| User asks for a visual deliverable **and** has already chosen a different system (Material, Apple HIG, custom brand) | Do not prompt. Skill stays dormant |
| User asks a question about Geist tokens / Vercel design philosophy | Answer from this skill's references; no prompt needed |

If the user declines, this skill steps aside silently — fall back to whatever design system was specified or to the user's `ui-ux-pro-max` + `web-design-engineer` recommendations.

## Step 1 — Confirm theme

Before generating output, ask which theme unless context already answers it:

- **Light** (default for product/marketing/dashboards) → use `design.md`
- **Dark** (default for developer tools, terminals, code-heavy demos) → use `design.dark.md`
- **Both** (if the artifact needs a theme switch) → use both, and apply the cheatsheet's CSS variable pattern

## Step 2 — Load the right reference

| Need | Open |
|---|---|
| Full token spec (colors, typography, spacing, components) for Light | [`design.md`](design.md) |
| Same for Dark | [`design.dark.md`](design.dark.md) |
| Quick lookup + ready-to-paste CSS variables, focus ring, button recipes, Tailwind config | [`cheatsheet.md`](cheatsheet.md) |

Always read the relevant `design.md` / `design.dark.md` **before writing the first line of code** — the YAML frontmatter is the source of truth for token names and values.

## Core Principles (must follow)

These are the non-negotiables that make output recognizably Geist rather than generic-clean:

1. **Color steps encode intent, not lightness**
   The 100–1000 scale is semantic: `100` default bg, `200` hover bg, `300` active bg, `400` default border, `500` hover border, `600` active border, `700` solid fill, `800` solid hover, `900` secondary text, `1000` primary text. Don't pick by visual lightness — pick by role.

2. **`gray-*` and `gray-alpha-*` are different jobs**
   Solid `gray-*` is for text and opaque fills. Translucent `gray-alpha-*` is for borders, dividers, overlays, hover tints. Don't substitute one for the other.

3. **`background-100` is the surface; `background-200` is for separation only**
   Never use `background-200` as a general fill. Cards, panels, popovers all sit on `background-100`.

4. **Accent semantics**
   `blue` = success, links, focus. `red` = errors. `amber` = warnings. `green`/`teal`/`purple`/`pink` available but used sparingly.

5. **Typography tokens, never hand-set type**
   Apply `heading-*` / `label-*` / `copy-*` / `button-*` tokens with their full `fontFamily / fontSize / fontWeight / lineHeight / letterSpacing` — don't hand-pick font sizes. Default body text is `copy-14` or `label-14`.

6. **Two fonts only: Geist Sans + Geist Mono**
   Geist Sans for UI and prose, Geist Mono for code and tabular figures. No third font.

7. **Spacing is a 4px scale with three-step rhythm**
   8px inside a group, 16px between groups, 32–40px between sections. Cards: 24px padding (16px compact, 32px hero).

8. **Tight radii, one family per view**
   6px everyday, 12px menus/modals, 16px fullscreen, 9999px pills/avatars. Don't mix rounded with sharp in one view.

9. **Motion is restraint**
   `0ms` is often correct. When motion helps, use `cubic-bezier(0.175, 0.885, 0.32, 1.1)`: ~150ms state, ~200ms popovers, ~300ms overlays. Honor `prefers-reduced-motion`.

10. **Two-layer focus ring on every interactive element**
    `box-shadow: 0 0 0 2px <surface>, 0 0 0 4px <blue-700-or-blue-900>`. Light theme: `#ffffff` then `#006bff`. Dark theme: `#000000` then `#47a8ff`. See cheatsheet for the snippet.

11. **Voice and copy are part of the design**
    Title Case for labels/buttons/titles; sentence case for body/helper/toasts. Action buttons name a verb + noun (`Deploy Project`, not `Confirm`). Errors say what happened plus what to do. Toasts drop the period and avoid `successfully`. Use curly quotes, the ellipsis character, numerals.

12. **Wide-gamut for P3 displays**
    Each accent ships a `*-p3` `oklch()` value. For modern targets, emit both `--blue-700: #006bff` and `--blue-700-p3: oklch(...)` and let `@supports (color: oklch(0 0 0)) { ... }` take over.

## Don'ts (these break the look)

- ❌ Don't signal state with color alone — pair with icon or text label.
- ❌ Don't use `background-200` as a fill — it's for subtle separation only.
- ❌ Don't swap `gray-*` for `background-*` — separate scales.
- ❌ Don't mix rounded and sharp corners, or more than two font weights, in one view.
- ❌ Don't drop the focus outline without a visible replacement.
- ❌ Don't stack purple-pink-blue gradients, decorative emoji, or fake "data slop" — Geist is restrained, not maximalist. (See `web-design-engineer` Avoid AI-Style Clichés.)

## Component Recipes

The full `components` block is in `design.md` / `design.dark.md`. Quick rules:

- **Primary button**: `gray-1000` fill + `background-100` text. Single most important action per view.
- **Secondary button**: `background-100` fill + `gray-alpha-400` border + `gray-1000` text.
- **Tertiary button**: transparent fill + `gray-1000` text. Tints with `gray-alpha` on hover.
- **Error button**: `red-800` fill + white text. Destructive actions only.
- **Sizes**: medium 40px (default), small 32px, large 48px (steps up to `button-16` type).
- **States**: `100` → `200` (hover) → `300` (active) for fills; `400` → `500` → `600` for borders. Disabled = `gray-100` fill + `gray-700` text + `not-allowed` cursor.
- **Input**: `background-100` fill, translucent border, 6px radius, same three sizes.

Copy-paste CSS for these is in `cheatsheet.md`.

## Output Contract

When this skill is active and producing visual output, the result must:

- [ ] Use Geist token names (not raw hex literals) via CSS variables, Tailwind config, or the equivalent in the target framework.
- [ ] Apply typography tokens for every text element (no hand-set `font-size` / `line-height`).
- [ ] Show a visible focus ring on every interactive element at `:focus-visible` — two-layer pattern.
- [ ] Hold WCAG AA contrast (4.5:1 body, 3:1 large text and UI).
- [ ] Geist Sans + Geist Mono only (loaded via `https://vercel.com/font/sans` / `https://vercel.com/font/mono` or `https://fonts.googleapis.com/css2?family=Geist:wght@400..700&family=Geist+Mono:wght@400..600&display=swap`).
- [ ] Spacing on the 4px grid; one radius family per view.
- [ ] Voice rules applied to button labels, errors, toasts, empty states.

If a checklist item is impossible (e.g., the target framework can't reach the focus ring), call it out explicitly rather than silently dropping it.

## Coordination With Other Skills

- **`ui-ux-pro-max`** — Geist replaces its product/style/color/typography selection. Still useful for accessibility, touch target, and chart guidance.
- **`web-design-engineer`** — Compatible. Geist provides the design tokens; `web-design-engineer` provides the build workflow (declare-system → v0 → full build → checklist). Skip its "design system declaration" step (Geist is the declaration) and go straight to v0.
- **`design-an-interface`** — Orthogonal. If exploring layout variants, Geist constrains the visual language while variants explore composition.
