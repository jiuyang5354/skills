---
name: liquid-metal
description: High-end WebGL 2 liquid metal and molten mercury shader components for interactive UI buttons, cards, and icons. Features Cauchy spectral dispersion, laminar valley field ribbons, self-refracting folds, faceted metal ripple disturbances, viscous cursor dragging, and multi-pass bloom & post-processing. Use when asked for liquid metal buttons, molten mercury effects, metallic iridescent shaders, ThreeUI liquid metal, Apple-style metallic CTA buttons, or WebGL 2 dispersion shaders.
---

# Liquid Metal Shader for Web

Liquid Metal generates **physically-convincing molten mercury and iridescent fluid metal** for buttons, hero CTAs, and interactive elements. It discards noisy 2D texture turbulence in favor of **laminar valley-field curves**, **21-wavelength Cauchy spectral dispersion**, **self-refracting spatial folds**, and **multi-pass Gaussian bloom** running on raw WebGL 2 at 60–120 FPS.

---

## 1. Quick Start

### 1.1 React Drop-in (`LiquidMetalButton`)
```tsx
import { LiquidMetalButton } from "./resources/LiquidMetalButton";

export function HeroCTA() {
  return (
    <div style={{ width: 280, height: 64 }}>
      <LiquidMetalButton
        variant="pill"          // "pill" | "circle" | "play"
        rendering="colored"      // "colored" | "monotone"
        text="Get Started"
        onClick={() => console.log("Activated!")}
      />
    </div>
  );
}
```

### 1.2 Standalone Vanilla HTML
Embed `resources/liquid-metal-button.html` directly or as an `<iframe>` with `srcDoc`:
```html
<iframe
  src="resources/liquid-metal-button.html"
  style="width: 320px; height: 90px; border: 0; background: transparent;"
  sandbox="allow-scripts"
></iframe>
```

---

## 2. Core Architectural Pillars

### Pillar 1: Pure WebGL 2 Multi-Pass FBO Pipeline
No Three.js runtime overhead. A minimal raw WebGL 2 engine executing 5 passes:
1. **Pass 1 (`FRAG_SCENE`)**: Evaluates the laminar dispersive field $V$ + Cauchy dispersion loop ($N=21$) into full-res `T_core`.
2. **Pass 2 (`FRAG_RIM`)**: Evaluates razor-thin perimeter travelling highlights into `T_rim` (**bypasses blur completely** to preserve sub-pixel crispness).
3. **Pass 3 (`FRAG_BLUR`)**: Half-res box downsample + multi-iteration separable Gaussian blur to melt the metal.
4. **Pass 4 (`FRAG_BLUR`)**: Quarter-res bloom downsample + 4-octave glow blur.
5. **Pass 5 (`FRAG_COMP`)**: Compositor: post-blur contrast punch (`pow(metal, punch)`), label protection scrim, shadow occlusion, and HDR bloom blending.

### Pillar 2: Laminar Flow & Optical Math
- **Laminar Valley Field**: $V = (y - \text{valley}(x)) \times \text{density}(x)$ ensures parallel, flowing ribbon bands without turbulent noise artifacts.
- **Cauchy Spectral Dispersion**: 21 discrete wavelength samples skewed by $\text{pow}(1 - k, 1.5)$, creating natural warm-lower / cool-upper rainbow fringes.
- **Self-Refraction**: Offsets sampling along spatial gradients $\text{dFdx}(h_0), -\text{dFdy}(h_0)$, generating authentic metallic folds.
- **Faceted Cusp Ripples**: Hard sheet metal crease profiles $\exp(-|x|^{1.15})$ with 6-fold rotating facets on click/tap.
- **Viscous Pointer Well**: Warps the coordinate space under the pointer with speed-dependent inertia lag.

### Pillar 3: Iframe Isolation & GPU Safety
- **Context Isolation**: Encapsulates WebGL 2 state inside an `iframe srcDoc` to insulate against React re-render spikes and global CSS leaks.
- **`IntersectionObserver`**: Automatically suspends/unmounts rendering when scrolled off-screen (`rootMargin: "80px"`), preventing WebGL context starvation (browsers limit active contexts to 8–16).

---

## 3. Supported Component Variants

| Variant | Value | Description |
|---|---|---|
| **Pill (Default)** | `"pill"` | Elongated capsule CTA with custom icon, dynamic text label, and adaptive width |
| **Circle** | `"circle"` | Compact circular icon action button (e.g. `+`, Bookmark) |
| **Play Circle** | `"play"` | Hero circular play button with SVG play glyph, configurable stroke width & diameter |

---

## 4. Live Runtime Tuning (`window.__set`)

The engine exposes live console hooks for interactive parameter tuning:
```javascript
// Tune field, rim, composite, or disturbance parameters on the fly
window.__set(
  { dens: 2.8, disp: 0.35, gain: 2.1 }, // P: Field tunables
  { speed: 0.09, hot: 1.0 },            // E: Rim tunables
  { soften: 0.22, punch: 1.6 },         // C: Composite & bloom
  { speed: 2.0, amp: 1.5 }              // R: Ripple & cursor disturbances
);

window.__press(true);                   // Trigger press state programmatically
window.__ripple(0, 0);                  // Spawn ripple at coordinates (x, y)

// Recolor the metal on the fly (drives uTintCore / uTintGlow in FRAG_COMP)
window.__tint([1.30, 0.88, 0.28],      // core tint — 24K gold
              [1.40, 0.90, 0.30]);     // glow tint
```

---

## 5. Color & Material Modification Recipes (魔改材质与调色指南)

The shader incorporates dynamic color grading in Pass 5 (`FRAG_COMP`) via `uTintCore`, `uTintGlow`, and parameter tuning. Use these production-ready recipes:

### 🟡 24K 熔融流金 (Molten Gold)
- **Visuals**: Dense, viscous molten 24K gold with amber specular highlights.
- **Shader Values**:
  - `uTintCore`: `vec3(1.30, 0.88, 0.28)`
  - `uTintGlow`: `vec3(1.40, 0.90, 0.30)`
  - Tunables: `soften: 0.32` (high melt), `punch: 1.65`, `disp: 0.22`, `glow: 2.40`

### 🌈 赛博极光溢油 (Cyber Acid Oil)
- **Visuals**: Iridescent thin-film interference, hyper chromatic fringe across ribbons.
- **Shader Values**:
  - `uTintCore`: `vec3(1.05, 1.05, 1.05)`
  - `uTintGlow`: `vec3(1.10, 0.95, 1.25)`
  - Tunables: `disp: 0.65` (maximum Cauchy skew), `refract: 0.32`, `dens: 2.80`, `glow: 2.80`

### ⚪ 冷晶钛铬 (Cryo Titanium)
- **Visuals**: Glacial ice-white specular, zero rainbow distortion, razor-chiseled hardness.
- **Shader Values**:
  - `uTintCore`: `vec3(0.92, 1.02, 1.18)`
  - `uTintGlow`: `vec3(0.85, 1.08, 1.35)`
  - Tunables: `disp: 0.05` (zero chromatic aberration), `punch: 2.20` (hard contrast), `soften: 0.12`

### 🟣 虚空紫曜 (Void Amethyst)
- **Visuals**: Deep obsidian core, dark matter plasma, electric ultraviolet corona.
- **Shader Values**:
  - `uTintCore`: `vec3(0.85, 0.40, 1.45)`
  - `uTintGlow`: `vec3(1.20, 0.35, 1.60)`
  - Tunables: `soften: 0.26`, `punch: 1.70`, `glow: 2.60`, `disp: 0.35`

### 🟢 超能电浆碧玺 (Plasma Emerald)
- **Visuals**: Sci-fi cybernetic energy core with vivid emerald-cyan refraction.
- **Shader Values**:
  - `uTintCore`: `vec3(0.35, 1.35, 0.75)`
  - `uTintGlow`: `vec3(0.30, 1.45, 0.85)`
  - Tunables: `soften: 0.24`, `punch: 1.75`, `glow: 2.70`, `disp: 0.18`

---

## 6. Strict Pre-Flight Checklist

Before shipping, verify these quality and safety criteria:

- [ ] **WebGL 2 Support**: Check `gl = canvas.getContext('webgl2')` with graceful DOM fallback.
- [ ] **DPR Capping**: Ensure `DPR = Math.min(window.devicePixelRatio || 1, 2)` to prevent 4K mobile GPU thermal throttling.
- [ ] **Label Scrim**: Verify center scrim (`veil`) sufficiently attenuates metallic reflections behind label text for WCAG contrast compliance.
- [ ] **Context Limits**: Do not render more than 4–6 active liquid metal buttons simultaneously on a single page without `IntersectionObserver` virtualization.
- [ ] **`prefers-reduced-motion`**: Tested and verified — animation clock pauses; frame loop renders only on manual hover/press.

---

## 7. Resources & Deep Reference

- **[REFERENCE.md](REFERENCE.md)**: Full mathematical derivations (Cauchy dispersion, laminar field formulas, FBO pipeline graph, complete parameter reference table).
- **[resources/liquid-metal-button.html](resources/liquid-metal-button.html)**: Canonical standalone WebGL 2 shader bundle.
- **[resources/LiquidMetalButton.tsx](resources/LiquidMetalButton.tsx)**: Production React bridge component with RPC postMessage.
