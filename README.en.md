[中文](README.md) | **English**

# Liquid Design Agent Skills

Skills for AI coding agents such as Antigravity, Claude Code, Cursor, and Codex. The repository contains liquid glass refraction and WebGL 2 liquid metal definitions, rendering references, material recipes, and reusable examples.

## Included skills

**liquid-glass:** a refractive lens implementation and reference based on Snell's law and a curl-free displacement field. Covers chromatic aberration, rim highlights, material parameters, and SVG displacement compatibility issues on Safari and mobile.

**liquid-metal:** native WebGL 2 without a Three.js dependency, with a five-pass rendering pipeline for flowing fields, 21-point Cauchy dispersion, viscosity, Gaussian glow, and color grading. Includes pill, circular play-button, and full-screen forms, plus interactive shockwaves.

```text
liquid-glass/
  SKILL.md
  REFERENCE.md
  scripts/generate_glass_map.js
liquid-metal/
  SKILL.md
  REFERENCE.md
  resources/LiquidMetalButton.tsx
  resources/liquid-metal-button.html
```

## Install for an agent

Add the repository to the project's agent skills directory:

```sh
git submodule add https://github.com/jiuyang5354/skills.git .agents/skills/liquid-design
```

Or clone it directly:

```sh
git clone https://github.com/jiuyang5354/skills.git .agents/skills/liquid-design
```

For Claude Code, use the project's `.claude/skills/` directory.

## Example requests

- “Use liquid-glass to make a frosted lens card with refraction and chromatic dispersion.”
- “Apply the Sapphire recipe to a magnifying lens on a dark dashboard.”
- “Create a sticky glass navigation bar that bends the text passing behind its edges.”
- “Use liquid-metal for a pricing CTA that flows faster on hover and emits a shockwave on click.”
- “Make a 24K-gold circular play button with adjustable stroke and diameter.”
- “Integrate the React liquid-metal component into a Next.js login interface using the acid-green recipe.”

## React / Next.js usage

Copy `liquid-metal/resources/LiquidMetalButton.tsx` into your project:

```tsx
import { LiquidMetalButton } from "@/components/LiquidMetalButton";

export default function App() {
  return (
    <div style={{ display: "flex", gap: 32, padding: 32, background: "#09090b" }}>
      <LiquidMetalButton
        variant="pill"
        rendering="colored"
        text="Unlock VIP"
        onClick={() => console.log("clicked")}
      />
      <LiquidMetalButton
        variant="play"
        rendering="colored"
        diameter={88}
        strokeWidth={3.0}
        text="Play"
      />
    </div>
  );
}
```

## Liquid glass recipes

| Recipe | scale | aberration | blur | rimLight | Use |
| --- | --- | --- | --- | --- | --- |
| Clear water | 64 | 4px | 0px | rgba(255,255,255,0.7) | Minimal modern cards |
| Sapphire | 80 | 8px | 2px | rgba(180,220,255,0.9) | Immersive dark interfaces |
| Acid frost | 48 | 12px | 16px | rgba(217,255,0,0.8) | Art and experimental sites |
| Smoked amber | 56 | 5px | 4px | rgba(255,210,140,0.6) | Warm luxury materials |
| Cyber teal | 96 | 10px | 1px | rgba(0,255,200,0.9) | Games, HUDs, instruments |

## Liquid metal recipes

| Recipe | uTintCore | uTintGlow | valley | Use |
| --- | --- | --- | --- | --- |
| 24K gold | [1.0, 0.78, 0.18] | [1.0, 0.92, 0.55] | 1.4 | Premium products and payment |
| Cyber acid | [0.65, 1.0, 0.05] | [0.85, 1.0, 0.40] | 1.1 | Experimental and hacker visuals |
| Cold titanium | [0.70, 0.82, 0.95] | [0.90, 0.95, 1.00] | 1.6 | Minimal industrial interfaces |
| Amethyst | [0.68, 0.22, 0.95] | [0.92, 0.55, 1.00] | 1.3 | Violet and mystical materials |
| Plasma emerald | [0.10, 0.88, 0.55] | [0.45, 1.00, 0.80] | 1.2 | Green technology and health |

## Attribution

`liquid-metal/resources/` derives from the MIT-licensed **ThreeUI Community** edition, Copyright (c) 2026 Meng To / DesignCode: https://github.com/MengTo/threeui . No paid Pro code is included. Local additions, including the play variant, tinting, and off-screen pausing, are also MIT. See [liquid-metal/NOTICE.md](liquid-metal/NOTICE.md).

`liquid-glass` contains original skill definitions, derivations, and scripts informed by the public demonstration at glass.outpacestudios.com, with the inspiration credited. Its SKILL.md, REFERENCE.md, and scripts are MIT-licensed original repository content.

## License

[MIT](LICENSE).
