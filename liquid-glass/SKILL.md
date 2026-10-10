---
name: liquid-glass
description: Universal physically-accurate optical glass refraction for web interfaces (Chromium, Safari, Firefox, iOS). Replaces flat CSS backdrop-filter blur with real Snell's Law refraction, curl-free squircle bevel displacement, chromatic aberration, and specular rim lighting. Use when asked to implement liquid glass, realistic refraction, Apple-style macOS/iOS glass lenses, feDisplacementMap optical effects, Outpace Studios glass, or high-end refractive navigation bars, magnifiers, and interactive cards.
---

# Liquid Glass for the Web

Liquid Glass creates **true physical optical refraction** on the web. It discards fake Gaussian backdrop blur (`backdrop-filter: blur()`) in favor of genuine Snell's Law light refraction through a curl-free squircle dome, supporting chromatic aberration and specular rim lighting across **all modern browsers at 60–120 FPS**.

---

## 1. The Core Architectural Contract

> **"Refract a Cloned Backdrop, Never the Live DOM."**

Standard CSS `backdrop-filter: url(#svg-filter)` is broken on Safari and Firefox. To achieve 100% universal cross-browser compatibility:

1. **Keep the Base DOM Interactive**: Render the real page elements normally in a container (`GlassScene`).
2. **Duplicate Backdrop inside the Lens**: Render a lightweight duplicate of the visual backdrop inside the lens viewport.
3. **Negative Counter-Translation (1:1)**:
   ```css
   /* As the lens moves to (lensX, lensY), the cloned backdrop shifts to (-lensX, -lensY) */
   transform: translate3d(-lensXpx, -lensYpx, 0);
   ```
4. **Apply Standard Element Filter**: Apply standard CSS `filter: url(#glass-filter)` to the **cloned container**, not `backdrop-filter`. Normal `filter: url()` has been universally accelerated across all browsers for over a decade.
5. **Clip & Layer**: Set the lens to `overflow: hidden; border-radius: inherit; pointer-events: none`. Interactive controls inside the lens sit in a higher z-index layer with `pointer-events: auto`.

---

## 2. Fast Implementation Protocol

### Step 1: Generate the Displacement & Normal Map
Use the bundled mathematical generator in `scripts/generate_glass_map.js`:
```javascript
import { generateGlassMap } from './scripts/generate_glass_map.js';

const map = generateGlassMap({
  width: 320,           // Lens pixel width
  height: 80,           // Lens pixel height
  radius: 24,           // Corner squircle radius
  bevelWidth: 18,       // Width of refracting rim (core remains crystal flat)
  refractiveIndex: 1.5, // Optical crown glass n=1.5
  dispScale: 1.0        // Deflection intensity
});

// MANDATORY FOR SAFARI: Convert canvas to binary Blob URL
const blob = await map.toBlob();
const blobUrl = URL.createObjectURL(blob);
```

### Step 2: Inject the Adaptive SVG Filter
Switch between **Multi-Pass** (Chromium GPU) and **Lean Single-Pass** (WebKit/Mobile):

```html
<svg width="0" height="0" style="position: absolute; pointer-events: none;">
  <defs>
    <filter id="liquid-glass-filter" x="-20%" y="-20%" width="140%" height="140%" color-interpolation-filters="sRGB">
      <feImage href="${blobUrl}" result="dispMap" />
      
      <!-- Unified Displacement Pass -->
      <feDisplacementMap in="SourceGraphic" in2="dispMap" scale="22"
                         xChannelSelector="R" yChannelSelector="G" result="refracted" />
      
      <!-- Specular Rim Highlight (extracted from Blue channel) -->
      <feColorMatrix in="dispMap" type="matrix"
                     values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 1 0 0" result="rimHighlight" />
      
      <feBlend in="rimHighlight" in2="refracted" mode="screen" />
    </filter>
  </defs>
</svg>
```

### Step 3: Wire the Scene & Lens Layout
```html
<div class="glass-scene" style="position: relative; overflow: hidden;">
  <!-- Primary Live Content -->
  <div class="glass-backdrop" id="backdrop">...</div>

  <!-- The Floating Lens -->
  <div class="glass-lens" style="position: absolute; overflow: hidden; width: 320px; height: 80px; border-radius: 24px; box-shadow: 0 12px 40px rgba(0,0,0,0.3), inset 0 0 0 1px rgba(255,255,255,0.25);">
    <!-- Filtered Refraction Container -->
    <div style="position: absolute; inset: 0; filter: url(#liquid-glass-filter); pointer-events: none;">
      <!-- Counter-translated Clone -->
      <div id="backdrop-clone" style="position: absolute; transform: translate3d(-x, -y, 0);">
        <!-- Backdrop DOM clone -->
      </div>
    </div>

    <!-- Interactive Foreground (Buttons, Links) -->
    <div style="position: relative; z-index: 10; pointer-events: auto;">
      <nav>...</nav>
    </div>
  </div>
</div>
```

---

## 3. Strict Pre-Flight Checklist (The 5 WebKit Traps)

Before shipping, verify these 5 critical rules to prevent Safari / iOS failures:

- [ ] **1. `blob:` URL Only**: Never pass base64 `data:image/png;base64,...` into `<feImage>`. Safari silently ignores it. Always use `URL.createObjectURL(blob)`.
- [ ] **2. Force `sRGB`**: Always add `color-interpolation-filters="sRGB"` on `<filter>`. Without this, SVG defaults to `linearRGB`, causing muddy colors and dark refraction fringes.
- [ ] **3. Unique Filter IDs**: Safari caches SVG filter output textures by ID. When resizing or recreating a lens, append a unique ID or timestamp (`#glass-filter-${uid}`).
- [ ] **4. Adaptive Lean Mode**: On Safari/iOS (`useLeanGlass()`), use single-pass displacement instead of 3-pass RGB channel separation to prevent CPU software-rasterizer stutter.
- [ ] **5. Viewport Pre-Clipping**: Keep the cloned backdrop clipped to the lens bounding box to avoid iOS WebKit memory tile exhaustion.

---

## 4. Accessibility & Fallbacks

1. **`prefers-reduced-motion`**:
   Disable spring lag or inertia animations; snap lens coordinates instantly on hover/focus.
2. **`prefers-reduced-transparency`**:
   Bypass SVG refraction entirely; render a clean, high-contrast semi-opaque container:
   ```css
   @media (prefers-reduced-transparency: reduce) {
     .glass-lens {
       background: rgba(18, 24, 38, 0.95) !important;
       backdrop-filter: none !important;
       filter: none !important;
     }
   }
   ```

---

## 5. Optical Material & Style Modification Recipes (玻璃质感魔改指南)

Liquid Glass is not limited to standard clear glass. You can modify its physical media, surface finish, color tint, and chromatic dispersion:

### 💧 1. 清透水滴微透镜 (Pure Water Droplet)
- **Visuals**: Light, organic, minimal dispersion, soft fluid magnification.
- **Parameters**: `refractiveIndex: 1.33` (water), `dispScale: 10`, `bevelWidth: 10px`, identical RGB scale (disable chromatic fringe).

### 💎 2. 蓝宝石 / 钻石重晶透镜 (Heavy Sapphire / Diamond)
- **Visuals**: Dramatic optical bending, deep magnification, intense rainbow fringes.
- **Parameters**: `refractiveIndex: 1.85 ~ 2.42`, `dispScale: 36`, `bevelWidth: 32px`.
- **Dispersion Scaling**: Scale red to `scale * 1.18`, green to `scale * 1.0`, blue to `scale * 0.82`.

### 🌫️ 3. 哑光酸蚀毛玻璃 (Acid-Etched Frosted Glass)
- **Visuals**: Physical refraction paired with luxurious matte diffusion (Apple-style frosted glass).
- **SVG Filter Injection**: Add `<feGaussianBlur in="refracted" stdDeviation="2.5" result="frosted" />` before blending the specular rim highlight.

### 🍷 4. 烟熏暗晶 / 琥珀有色琉璃 (Smoked & Tinted Glass)
- **Visuals**: High-end sunglasses / smoked acrylic with tinted color absorption.
- **Implementation**: Inject an `<feColorMatrix>` color grade filter, or apply CSS tint overlay:
  ```css
  /* Amber Smoked Glass tint */
  background: rgba(245, 158, 11, 0.08);
  box-shadow: inset 0 0 0 1px rgba(251, 191, 36, 0.3);
  ```

---

## 6. Detailed References & Ready-to-Use Code

- **[REFERENCE.md](REFERENCE.md)**: Full Snell's law derivation, curl-free gradient proof ($\nabla \times \vec{D} = 0$), chromatic aberration math, full React components (`GlassScene.tsx`, `GlassLens.tsx`, `useLeanGlass.ts`), and standalone Vanilla JS/CSS demo.
- **[scripts/generate_glass_map.js](scripts/generate_glass_map.js)**: Standalone, zero-dependency script generating squircle normal displacement textures with specular rim highlights.
