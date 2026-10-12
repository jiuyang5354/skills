# Geist Cheatsheet

Copy-paste fragments. For the full token table and philosophy, see `design.md` (Light) / `design.dark.md` (Dark).

## Fonts

```html
<!-- Vercel-hosted (preferred) -->
<link rel="preconnect" href="https://vercel.com">
<link rel="stylesheet" href="https://vercel.com/font/sans/index.css">
<link rel="stylesheet" href="https://vercel.com/font/mono/index.css">

<!-- Google Fonts fallback -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link
  href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=Geist+Mono:wght@400;500;600&display=swap"
  rel="stylesheet">
```

```css
:root {
  --font-sans: "Geist", ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
  --font-mono: "Geist Mono", ui-monospace, "SF Mono", Menlo, Consolas, monospace;
}
body { font-family: var(--font-sans); }
code, pre { font-family: var(--font-mono); }
```

## CSS Variables — Light + Dark via `[data-theme]`

Drop this into your stylesheet root. Names match Geist tokens 1:1.

```css
:root,
[data-theme="light"] {
  /* Surfaces */
  --background-100: #ffffff;
  --background-200: #fafafa;

  /* Brand shortcuts */
  --primary: #171717;
  --secondary: #4d4d4d;
  --tertiary: #006bff;
  --neutral: #f2f2f2;

  /* Gray solid */
  --gray-100: #f2f2f2;
  --gray-200: #ebebeb;
  --gray-300: #e6e6e6;
  --gray-400: #eaeaea;
  --gray-500: #c9c9c9;
  --gray-600: #a8a8a8;
  --gray-700: #8f8f8f;
  --gray-800: #7d7d7d;
  --gray-900: #4d4d4d;
  --gray-1000: #171717;

  /* Gray alpha (translucent — borders, dividers, overlays, hover tints) */
  --gray-alpha-100: #0000000d;
  --gray-alpha-200: #00000015;
  --gray-alpha-300: #0000001a;
  --gray-alpha-400: #00000014;
  --gray-alpha-500: #00000036;
  --gray-alpha-600: #0000003d;
  --gray-alpha-700: #00000070;
  --gray-alpha-800: #00000082;
  --gray-alpha-900: #000000b3;
  --gray-alpha-1000: #000000e8;

  /* Blue (success, links, focus) */
  --blue-100: #f0f7ff;
  --blue-200: #e9f4ff;
  --blue-300: #dfefff;
  --blue-400: #cae7ff;
  --blue-500: #94ccff;
  --blue-600: #48aeff;
  --blue-700: #006bff;
  --blue-800: #0059ec;
  --blue-900: #005ff2;
  --blue-1000: #002359;

  /* Red (errors) */
  --red-700: #fc0035;
  --red-800: #ea001d;
  --red-900: #d8001b;

  /* Amber (warnings) */
  --amber-700: #ffae00;
  --amber-800: #ff9300;

  /* Green (positive — but accent role belongs to blue) */
  --green-700: #28a948;
  --green-800: #279141;

  /* Focus ring layers */
  --focus-ring-surface: var(--background-100);
  --focus-ring-color: var(--blue-700);
}

[data-theme="dark"] {
  --background-100: #000000;
  --background-200: #000000;

  --primary: #ededed;
  --secondary: #a0a0a0;
  --tertiary: #006efe;
  --neutral: #1a1a1a;

  --gray-100: #1a1a1a;
  --gray-200: #1f1f1f;
  --gray-300: #292929;
  --gray-400: #2e2e2e;
  --gray-500: #454545;
  --gray-600: #878787;
  --gray-700: #8f8f8f;
  --gray-800: #7d7d7d;
  --gray-900: #a0a0a0;
  --gray-1000: #ededed;

  --gray-alpha-100: #ffffff12;
  --gray-alpha-200: #ffffff17;
  --gray-alpha-300: #ffffff21;
  --gray-alpha-400: #ffffff24;
  --gray-alpha-500: #ffffff3d;
  --gray-alpha-600: #ffffff82;
  --gray-alpha-700: #ffffff8a;
  --gray-alpha-800: #ffffff78;
  --gray-alpha-900: #ffffff9c;
  --gray-alpha-1000: #ffffffeb;

  --blue-100: #06193a;
  --blue-200: #022248;
  --blue-300: #002f62;
  --blue-400: #003674;
  --blue-500: #00418b;
  --blue-600: #0090ff;
  --blue-700: #006efe;
  --blue-800: #005be7;
  --blue-900: #47a8ff;
  --blue-1000: #eaf6ff;

  --red-700: #f13242;
  --red-800: #e2162a;
  --red-900: #ff565f;

  --amber-700: #ffae00;
  --amber-800: #ff9300;

  --green-700: #00ac3a;
  --green-800: #009432;

  /* Focus ring switches the inner-layer surface to black; outer ring shifts to blue-900 */
  --focus-ring-surface: #000000;
  --focus-ring-color: var(--blue-900);
}

/* System preference fallback */
@media (prefers-color-scheme: dark) {
  :root:not([data-theme]) {
    /* Re-declare dark values here OR set data-theme="dark" on <html> via JS */
  }
}
```

## P3 Wide-Gamut Upgrade

Browsers that support `color(display-p3 ...)` get richer accents; sRGB hex stays as fallback above.

```css
@supports (color: oklch(0 0 0)) {
  :root, [data-theme="light"] {
    --blue-700: oklch(57.61% 0.2508 258.23);
    --red-700: oklch(62.56% 0.2524 23.03);
    /* ...and the rest from design.md */
  }
  [data-theme="dark"] {
    --blue-700: oklch(57.61% 0.2321 258.23);
    --red-700: oklch(62.56% 0.2234 23.03);
    /* ...and the rest from design.dark.md */
  }
}
```

## Typography Tokens

```css
:root {
  /* Headings: tighten letter-spacing as size grows */
  --heading-72:  600 72px/72px var(--font-sans); /* letter-spacing: -4.32px */
  --heading-48:  600 48px/56px var(--font-sans); /* letter-spacing: -2.88px */
  --heading-32:  600 32px/40px var(--font-sans); /* letter-spacing: -1.28px */
  --heading-24:  600 24px/32px var(--font-sans); /* letter-spacing: -0.96px */
  --heading-20:  600 20px/26px var(--font-sans); /* letter-spacing: -0.4px */
  --heading-16:  600 16px/24px var(--font-sans); /* letter-spacing: -0.32px */
  --heading-14:  600 14px/20px var(--font-sans); /* letter-spacing: -0.28px */

  /* Labels: single-line scannable */
  --label-16:    400 16px/20px var(--font-sans);
  --label-14:    400 14px/20px var(--font-sans);
  --label-13:    400 13px/16px var(--font-sans);
  --label-12:    400 12px/16px var(--font-sans);

  /* Copy: multi-line body */
  --copy-18:     400 18px/28px var(--font-sans);
  --copy-16:     400 16px/24px var(--font-sans);
  --copy-14:     400 14px/20px var(--font-sans);
  --copy-13:     400 13px/18px var(--font-sans);

  /* Buttons */
  --button-16:   500 16px/20px var(--font-sans);
  --button-14:   500 14px/20px var(--font-sans);
  --button-12:   500 12px/16px var(--font-sans);
}

h1 { font: var(--heading-48); letter-spacing: -2.88px; }
h2 { font: var(--heading-32); letter-spacing: -1.28px; }
h3 { font: var(--heading-24); letter-spacing: -0.96px; }
p  { font: var(--copy-14); color: var(--gray-1000); }
small { font: var(--label-12); color: var(--gray-900); }
```

> `font:` shorthand can't carry `letter-spacing`. Set headings via the shorthand AND the `letter-spacing` property as shown above.

## Spacing Scale

```css
:root {
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-16: 64px;
  --space-24: 96px;
}
/* Three-step rhythm: 8 inside group, 16 between groups, 32–40 between sections.
   Cards: 24px padding (16 compact, 32 hero). */
```

## Radius

```css
:root {
  --radius-sm: 6px;    /* everyday surfaces, buttons, inputs */
  --radius-md: 12px;   /* menus, modals */
  --radius-lg: 16px;   /* fullscreen surfaces */
  --radius-full: 9999px; /* pills, avatars */
}
```

## Elevation

```css
/* Light theme */
--shadow-card:    0 2px 2px rgba(0, 0, 0, 0.04);
--shadow-popover: 0 1px 1px rgba(0, 0, 0, 0.02), 0 4px 8px -4px rgba(0, 0, 0, 0.04), 0 16px 24px -8px rgba(0, 0, 0, 0.06);
--shadow-modal:   0 1px 1px rgba(0, 0, 0, 0.02), 0 8px 16px -4px rgba(0, 0, 0, 0.04), 0 24px 32px -8px rgba(0, 0, 0, 0.06);

/* Dark theme — bump the card alpha; popover/modal stay similar */
[data-theme="dark"] {
  --shadow-card: 0 1px 2px rgba(0, 0, 0, 0.16);
}
```

## Focus Ring (the most-distinctive Geist detail)

Two-layer ring. Inner layer matches the surface to create a 2px gap; outer layer is the blue ring. Apply on `:focus-visible`, never plain `:focus` (would fire on mouse click).

```css
.btn:focus-visible,
input:focus-visible,
a:focus-visible,
[role="button"]:focus-visible {
  outline: none;
  box-shadow:
    0 0 0 2px var(--focus-ring-surface),
    0 0 0 4px var(--focus-ring-color);
}
```

## Buttons

```css
.btn {
  display: inline-flex; align-items: center; justify-content: center;
  height: 40px;
  padding: 0 10px;
  font: var(--button-14);
  border-radius: var(--radius-sm);
  border: 1px solid transparent;
  cursor: pointer;
  transition: background-color 150ms cubic-bezier(0.175, 0.885, 0.32, 1.1),
              border-color 150ms cubic-bezier(0.175, 0.885, 0.32, 1.1);
}
.btn:disabled {
  background: var(--gray-100);
  color: var(--gray-700);
  cursor: not-allowed;
}

/* Primary — single most important action per view */
.btn-primary {
  background: var(--gray-1000);
  color: var(--background-100);
}
.btn-primary:hover    { background: var(--gray-900); }
.btn-primary:active   { background: var(--gray-800); }

/* Secondary — outlined */
.btn-secondary {
  background: var(--background-100);
  color: var(--gray-1000);
  border-color: var(--gray-alpha-400);
}
.btn-secondary:hover  { background: var(--gray-alpha-100); border-color: var(--gray-alpha-500); }
.btn-secondary:active { background: var(--gray-alpha-200); border-color: var(--gray-alpha-600); }

/* Tertiary — low emphasis */
.btn-tertiary {
  background: transparent;
  color: var(--gray-1000);
}
.btn-tertiary:hover   { background: var(--gray-alpha-100); }
.btn-tertiary:active  { background: var(--gray-alpha-200); }

/* Error — destructive */
.btn-error {
  background: var(--red-800);
  color: #ffffff;
}
.btn-error:hover      { background: var(--red-900); }

/* Sizes */
.btn-small { height: 32px; padding: 0 6px; }
.btn-large { height: 48px; padding: 0 14px; font: var(--button-16); }
```

## Input

```css
.input {
  display: block;
  width: 100%;
  height: 40px;
  padding: 0 12px;
  font: var(--label-14);
  color: var(--gray-1000);
  background: var(--background-100);
  border: 1px solid var(--gray-alpha-400);
  border-radius: var(--radius-sm);
  transition: border-color 150ms cubic-bezier(0.175, 0.885, 0.32, 1.1);
}
.input:hover  { border-color: var(--gray-alpha-500); }
.input:focus-visible {
  outline: none;
  border-color: var(--blue-700);
  box-shadow:
    0 0 0 2px var(--focus-ring-surface),
    0 0 0 4px var(--focus-ring-color);
}
.input::placeholder { color: var(--gray-700); }
.input-small { height: 32px; }
.input-large { height: 48px; font: var(--label-16); }
```

## Motion Constants

```css
:root {
  --ease-geist: cubic-bezier(0.175, 0.885, 0.32, 1.1);
  --duration-state:    150ms;
  --duration-popover:  200ms;
  --duration-overlay:  300ms;
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

## Tailwind Config (v3)

Drop into `tailwind.config.js`. Token names mirror Geist 1:1 so utility classes read as `bg-background-100`, `text-gray-1000`, `border-gray-alpha-400`.

```js
const geistGray = {
  100:'#f2f2f2', 200:'#ebebeb', 300:'#e6e6e6', 400:'#eaeaea', 500:'#c9c9c9',
  600:'#a8a8a8', 700:'#8f8f8f', 800:'#7d7d7d', 900:'#4d4d4d', 1000:'#171717',
};
const geistGrayAlpha = {
  100:'#0000000d', 200:'#00000015', 300:'#0000001a', 400:'#00000014', 500:'#00000036',
  600:'#0000003d', 700:'#00000070', 800:'#00000082', 900:'#000000b3', 1000:'#000000e8',
};
const geistBlue = {
  100:'#f0f7ff', 200:'#e9f4ff', 300:'#dfefff', 400:'#cae7ff', 500:'#94ccff',
  600:'#48aeff', 700:'#006bff', 800:'#0059ec', 900:'#005ff2', 1000:'#002359',
};

module.exports = {
  theme: {
    extend: {
      colors: {
        'background-100': '#ffffff',
        'background-200': '#fafafa',
        gray: geistGray,
        'gray-alpha': geistGrayAlpha,
        blue: geistBlue,
        // ...mirror red / amber / green / teal / purple / pink from design.md
      },
      borderRadius: { sm: '6px', md: '12px', lg: '16px' },
      spacing: {
        1:'4px', 2:'8px', 3:'12px', 4:'16px',
        6:'24px', 8:'32px', 10:'40px', 16:'64px', 24:'96px',
      },
      fontFamily: {
        sans: ['Geist', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['Geist Mono', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        card: '0 2px 2px rgba(0, 0, 0, 0.04)',
        popover:
          '0 1px 1px rgba(0,0,0,.02), 0 4px 8px -4px rgba(0,0,0,.04), 0 16px 24px -8px rgba(0,0,0,.06)',
        modal:
          '0 1px 1px rgba(0,0,0,.02), 0 8px 16px -4px rgba(0,0,0,.04), 0 24px 32px -8px rgba(0,0,0,.06)',
      },
      transitionTimingFunction: { geist: 'cubic-bezier(0.175, 0.885, 0.32, 1.1)' },
      transitionDuration: { state: '150ms', popover: '200ms', overlay: '300ms' },
    },
  },
};
```

## Voice Cheatsheet

| Slot | Pattern | Example |
|---|---|---|
| Button label | Title Case, verb + noun | `Deploy Project`, `Delete Member` (not `Confirm`) |
| Body / helper text | sentence case | "Push to your Git repository to create one." |
| Error | what happened + what to do | `Build failed. Bundle exceeds 50 MB. Reduce it or raise the limit.` |
| Toast | name the thing, no period, no `successfully` | `Project deleted` (not `Successfully deleted the project.`) |
| Empty state | point to first action | `No deployments yet. Push to your Git repository to create one.` |
| In-progress | present participle + ellipsis | `Deploying…`, `Saving…` (use `…` U+2026, not `...`) |
| Numbers | numerals, not words | `3 projects` (not `three projects`) |
| Quotes | curly | `“We deploy on Friday.”` not `"We deploy on Friday."` |

## Pre-flight Checklist

Before delivering Geist output:

- [ ] Token names used everywhere — no raw hex literals
- [ ] Geist Sans + Geist Mono loaded; no third font
- [ ] Typography tokens applied (no hand-set `font-size`)
- [ ] Two-layer focus ring on every interactive element at `:focus-visible`
- [ ] WCAG AA contrast (4.5:1 body, 3:1 UI/large text)
- [ ] One radius family per view (don't mix 6 / 12 / sharp)
- [ ] Spacing on the 4px grid; three-step rhythm honored
- [ ] State doesn't rely on color alone — paired with icon or text
- [ ] `background-200` only used for separation, never as a fill
- [ ] `prefers-reduced-motion` respected
- [ ] Voice rules applied to buttons, errors, toasts, empty states
