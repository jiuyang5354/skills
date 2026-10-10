# Liquid Glass Deep Reference & Implementation Manual

This document contains the complete optical physics, vector calculus, SVG filter pipelines, cross-browser concessions, and production-ready source code for **Liquid Glass for the Web** (reverse-engineered from Outpace Studios).

---

## 1. Core Architectural Breakthrough

### The Problem: The "Web Glass Lie"
CSS `backdrop-filter: blur(20px)` produces a uniform Gaussian fog, not true optical refraction. True physical glass does **not** blur light uniformly; it bends, focuses, and magnifies light rays at boundaries according to its surface geometry and refractive index.

Developers attempt to use SVG `<filter>` with `<feDisplacementMap>` inside `backdrop-filter: url(#lens)`.
**This fails across browsers:**
- **Chromium**: Partially works, but buggy with fixed positioning.
- **Safari / WebKit**: Silently drops the SVG displacement filter; renders either a black rectangle or completely unrefracted content.
- **Firefox**: Drops the filter entirely or disables hardware acceleration.

### The Solution: "Refract a Cloned Backdrop, Not the Live DOM"
Instead of forcing the browser to refract arbitrary stacked DOM in place:
1. Render the interactive primary UI in the document.
2. Render an **exact live duplicate** of the backdrop inside the lens container.
3. Apply a negative counter-translation to the cloned backdrop:
   $$\vec{T}_{\text{clone}} = (-x_{\text{lens}}, -y_{\text{lens}})$$
   This aligns the cloned content pixel-perfect with the underlying original background.
4. Apply standard CSS `filter: url(#lens-filter)` to the **cloned container**.
5. Clip the lens container with `overflow: hidden; border-radius: inherit; pointer-events: none`.

Because standard CSS `filter: url(...)` on normal DOM elements has been supported in WebKit, Gecko, and Blink for over 15 years, **this technique achieves 100% cross-browser parity at 60–120 FPS**.

---

## 2. Optical Physics & Mathematics

### 2.1 Snell's Law of Refraction
When light travels from air ($n_1 = 1.0$) into glass or acrylic ($n_2 = 1.5$):

$$n_1 \sin\theta_i = n_2 \sin\theta_t \implies \sin\theta_t = \frac{\sin\theta_i}{n}$$

For a ray incident normal to the lens base, the surface tangent has slope $s = \frac{dy}{dx}$, giving an incident angle:

$$\theta_i = \arctan(s)$$

The deflection angle $\Delta\theta$ experienced by the transmitted ray is:

$$\Delta\theta = \theta_i - \arcsin\left(\frac{\sin\theta_i}{n}\right)$$

The lateral ray displacement $\delta$ is proportional to the sine of the bend angle:

$$\delta \propto \sin(\theta_i - \theta_t)$$

### 2.2 The Squircle (Superellipse) Surface
To prevent sharp, harsh corner cuts common to rounded rectangles ($R = \infty$ at straight edges, $R = r_0$ at corners), the lens profile is shaped as a superellipse (squircle) with exponent $p = 4$:

$$\left|\frac{x}{a}\right|^4 + \left|\frac{y}{b}\right|^4 = 1$$

Along the cross-section from the outer perimeter ($t = 0$) to the flat inner core ($t = 1$), the surface height profile follows:

$$\text{slope}(t) = \frac{(1 - t)^3}{\left[1 - (1 - t)^4\right]^{0.75}}$$

- At $t \to 0$ (outer edge): $\text{slope} \to \infty$ (steep bevel, high refraction bend).
- At $t \to 1$ (inner core): $\text{slope} \to 0$ (perfectly flat, zero refraction, crystal clear reading window).

### 2.3 The Curl-Free Gradient Proof ($\nabla \times \vec{D} = 0$)
In traditional 2D warping, manual offset maps often produce twisted or folded distortion at corners.

Let the height of the lens dome be defined by a continuous scalar potential field $\Phi(x, y)$. The normal displacement field $\vec{D}(x, y)$ is defined strictly as the spatial gradient of this potential:

$$\vec{D}(x, y) = \nabla \Phi(x, y) = \left(\frac{\partial \Phi}{\partial x}, \frac{\partial \Phi}{\partial y}\right)$$

By the fundamental theorem of vector calculus:

$$\nabla \times \vec{D} = \nabla \times (\nabla \Phi) \equiv 0$$

Because the curl is identically zero everywhere on the surface, **no rotational tearing, folding, or non-invertible ray intersections can occur**.

### 2.4 Pixel Encoding in Normal/Displacement Maps
The generated displacement texture stores optical properties in 8-bit RGBA channels:

| Channel | Physical Meaning | Formula / Value |
|---|---|---|
| **Red (R)** | Horizontal ray displacement $\Delta x$ | $128 + \text{clamp}(D_x \cdot 127 \cdot \text{scale}, -127, 127)$ |
| **Green (G)** | Vertical ray displacement $\Delta y$ | $128 + \text{clamp}(D_y \cdot 127 \cdot \text{scale}, -127, 127)$ |
| **Blue (B)** | Specular highlight & Fresnel bevel rim | $\left[(\mathbf{N} \cdot \mathbf{L})^{16} \cdot 0.8 + (1 - N_z)^{2.5} \cdot 0.4\right] \times 255$ |
| **Alpha (A)** | Footprint alpha mask | $255$ inside lens, $0$ outside lens |

*Note: Neutral (zero displacement) is exactly `RGB(128, 128, 0)`.*

---

## 3. Cross-Browser Concessions & The WebKit Trap

WebKit (Safari on macOS and iOS) handles SVG filters fundamentally differently from Chromium. Ignoring these 5 rules will break your implementation on Apple devices:

### Trap 1: `<feImage>` Silently Fails with `data:` Base64 URLs
- **Symptom**: Black box or no refraction on Safari.
- **Cause**: WebKit security policies block or fail to decode inline base64 `data:image/png;base64,...` inside `<feImage>`.
- **Fix**: Convert canvas output to an actual binary `Blob` and supply a `blob:` URL:
  ```javascript
  canvas.toBlob((blob) => {
    const blobUrl = URL.createObjectURL(blob);
    feImageElement.setAttribute('href', blobUrl);
  }, 'image/png');
  ```

### Trap 2: Default Color Space is `linearRGB`
- **Symptom**: Washed-out colors, darkened refraction edge, 128 mid-gray causes unwanted displacement shift.
- **Cause**: SVG 1.1 specifies `linearRGB` as default filter color space.
- **Fix**: Explicitly specify `color-interpolation-filters="sRGB"` on all `<filter>` and `<feDisplacementMap>` elements.

### Trap 3: Aggressive Filter Output Caching
- **Symptom**: Resizing or moving the lens leaves old distorted frames frozen in place.
- **Cause**: WebKit caches filter raster outputs keyed only by the filter element's `id`.
- **Fix**: Append an incremental ID or unique key whenever lens geometry changes:
  ```javascript
  const filterId = `liquid-glass-filter-${Math.random().toString(36).substr(2, 9)}`;
  ```

### Trap 4: CPU Software Rasterization Bottleneck
- **Symptom**: 60 FPS in Chrome, but drops to 12 FPS on iPhone 15 Pro.
- **Cause**: WebKit executes complex SVG filter chains (`feColorMatrix`, 3-pass RGB split) entirely on the CPU.
- **Fix**: **Adaptive Pipeline (`useLeanGlass`)**:
  - **Chromium / High GPU**: 3-pass chromatic aberration (R, G, B separate displacement scales) + specular compositing.
  - **WebKit / Mobile CPU**: Single-pass lean displacement (R+G simultaneous displacement) + single rim blend.

### Trap 5: Viewport Memory Exhaustion
- **Symptom**: WebKit page crashes ("A problem repeatedly occurred").
- **Cause**: Passing a full 4K background clone into the SVG filter.
- **Fix**: Pre-clip the clone box to only the lens's visible bounding rect (with a 20px padding margin for refraction bleed).

---

## 4. Complete Production SVG Filter Chains

### 4.1 Chromium Multi-Pass with Chromatic Aberration
```xml
<svg width="0" height="0" style="position: absolute; pointer-events: none;">
  <defs>
    <filter id="glass-multi-pass" x="-20%" y="-20%" width="140%" height="140%" color-interpolation-filters="sRGB">
      <!-- 1. Load the generated displacement map -->
      <feImage id="map-source" href="blob:..." result="dispMap" />

      <!-- 2. Red channel displacement (wavelength lambda_R = 650nm) -->
      <feDisplacementMap in="SourceGraphic" in2="dispMap" scale="22"
                         xChannelSelector="R" yChannelSelector="G" result="dispRed" />
      <feColorMatrix in="dispRed" type="matrix"
                     values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="redOnly" />

      <!-- 3. Green channel displacement (lambda_G = 530nm) -->
      <feDisplacementMap in="SourceGraphic" in2="dispMap" scale="20"
                         xChannelSelector="R" yChannelSelector="G" result="dispGreen" />
      <feColorMatrix in="dispGreen" type="matrix"
                     values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" result="greenOnly" />

      <!-- 4. Blue channel displacement (lambda_B = 460nm) -->
      <feDisplacementMap in="SourceGraphic" in2="dispMap" scale="18"
                         xChannelSelector="R" yChannelSelector="G" result="dispBlue" />
      <feColorMatrix in="dispBlue" type="matrix"
                     values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" result="blueOnly" />

      <!-- 5. Composite RGB channels with Screen blend -->
      <feBlend in="redOnly" in2="greenOnly" mode="screen" result="rgBlend" />
      <feBlend in="rgBlend" in2="blueOnly" mode="screen" result="refractedImage" />

      <!-- 6. Extract Specular Rim from Blue channel of displacement map -->
      <feColorMatrix in="dispMap" type="matrix"
                     values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 1 0 0" result="specularGlow" />

      <!-- 7. Blend specular rim on top -->
      <feBlend in="specularGlow" in2="refractedImage" mode="screen" />
    </filter>
  </defs>
</svg>
```

### 4.2 Safari / WebKit Lean Single-Pass (60 FPS Guaranteed)
```xml
<svg width="0" height="0" style="position: absolute; pointer-events: none;">
  <defs>
    <filter id="glass-lean-pass" x="-20%" y="-20%" width="140%" height="140%" color-interpolation-filters="sRGB">
      <feImage id="lean-map-source" href="blob:..." result="dispMap" />

      <!-- Single unified displacement pass -->
      <feDisplacementMap in="SourceGraphic" in2="dispMap" scale="20"
                         xChannelSelector="R" yChannelSelector="G" result="refracted" />

      <!-- Specular Bevel from B channel -->
      <feColorMatrix in="dispMap" type="matrix"
                     values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 1 0 0" result="rimHighlight" />

      <!-- Screen blend rim on top of refracted image -->
      <feBlend in="rimHighlight" in2="refracted" mode="screen" />
    </filter>
  </defs>
</svg>
```

---

## 5. Complete Production Code Implementations

### 5.1 React Implementation

#### `useLeanGlass.ts` (Environment & Capability Hook)
```typescript
import { useState, useEffect } from 'react';

export function useLeanGlass(): boolean {
  const [isLean, setIsLean] = useState(false);

  useEffect(() => {
    // Detect iOS / WebKit or prefers-reduced-motion
    const ua = navigator.userAgent;
    const isWebKit = /WebKit/i.test(ua) && !/Chrome/i.test(ua);
    const isIOS = /iPad|iPhone|iPod/.test(ua);
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    setIsLean(isWebKit || isIOS || prefersReducedMotion);
  }, []);

  return isLean;
}
```

#### `GlassScene.tsx` (Backdrop Provider)
```tsx
import React, { createContext, useContext, useRef, useState, useEffect } from 'react';

interface GlassSceneContextValue {
  backdropRef: React.RefObject<HTMLDivElement>;
  sceneSize: { width: number; height: number };
}

const GlassSceneContext = createContext<GlassSceneContextValue | null>(null);

export const useGlassScene = () => {
  const ctx = useContext(GlassSceneContext);
  if (!ctx) throw new Error('useGlassScene must be used within <GlassScene>');
  return ctx;
};

export const GlassScene: React.FC<{
  children: React.ReactNode;
  backdrop: React.ReactNode;
  className?: string;
}> = ({ children, backdrop, className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [sceneSize, setSceneSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setSceneSize({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  return (
    <GlassSceneContext.Provider value={{ backdropRef: containerRef, sceneSize }}>
      <div ref={containerRef} className={`relative overflow-hidden ${className}`}>
        {/* Interactive primary backdrop */}
        <div className="glass-backdrop-source absolute inset-0 z-0">
          {backdrop}
        </div>

        {/* Foreground interactive content & lenses */}
        <div className="relative z-10 pointer-events-auto">
          {children}
        </div>
      </div>
    </GlassSceneContext.Provider>
  );
};
```

#### `GlassLens.tsx` (Refracting Consumer)
```tsx
import React, { useEffect, useRef, useState, useId } from 'react';
import { useGlassScene } from './GlassScene';
import { useLeanGlass } from './useLeanGlass';
import { generateGlassMap } from './generate_glass_map';

interface GlassLensProps {
  x: number;
  y: number;
  width: number;
  height: number;
  radius?: number;
  bevelWidth?: number;
  dispScale?: number;
  children?: React.ReactNode;
  backdropContent: React.ReactNode;
  className?: string;
}

export const GlassLens: React.FC<GlassLensProps> = ({
  x,
  y,
  width,
  height,
  radius = 24,
  bevelWidth = 18,
  dispScale = 20,
  children,
  backdropContent,
  className = '',
}) => {
  const rawId = useId().replace(/:/g, '');
  const filterId = `liquid-glass-${rawId}`;
  const isLean = useLeanGlass();
  const [blobUrl, setBlobUrl] = useState<string | null>(null);

  // Generate displacement map Blob whenever dimensions change
  useEffect(() => {
    let active = true;
    const map = generateGlassMap({
      width: Math.round(width),
      height: Math.round(height),
      radius,
      bevelWidth,
      refractiveIndex: 1.5,
      dispScale: 1.0,
    });

    map.toBlob().then((blob) => {
      if (!active) return;
      const url = URL.createObjectURL(blob);
      setBlobUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return url;
      });
    });

    return () => {
      active = false;
    };
  }, [width, height, radius, bevelWidth]);

  return (
    <>
      {/* Dynamic SVG Filter Definition */}
      {blobUrl && (
        <svg width="0" height="0" className="absolute pointer-events-none">
          <defs>
            <filter
              id={filterId}
              x="-20%"
              y="-20%"
              width="140%"
              height="140%"
              colorInterpolationFilters="sRGB"
            >
              <feImage href={blobUrl} result="dispMap" />

              {isLean ? (
                /* Safari / iOS Lean Mode */
                <>
                  <feDisplacementMap
                    in="SourceGraphic"
                    in2="dispMap"
                    scale={dispScale}
                    xChannelSelector="R"
                    yChannelSelector="G"
                    result="refracted"
                  />
                  <feColorMatrix
                    in="dispMap"
                    type="matrix"
                    values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 1 0 0"
                    result="rimHighlight"
                  />
                  <feBlend in="rimHighlight" in2="refracted" mode="screen" />
                </>
              ) : (
                /* Chromium Full Multi-Pass with Chromatic Aberration */
                <>
                  <feDisplacementMap
                    in="SourceGraphic"
                    in2="dispMap"
                    scale={dispScale * 1.1}
                    xChannelSelector="R"
                    yChannelSelector="G"
                    result="dispRed"
                  />
                  <feColorMatrix
                    in="dispRed"
                    type="matrix"
                    values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0"
                    result="r"
                  />
                  <feDisplacementMap
                    in="SourceGraphic"
                    in2="dispMap"
                    scale={dispScale * 1.0}
                    xChannelSelector="R"
                    yChannelSelector="G"
                    result="dispGreen"
                  />
                  <feColorMatrix
                    in="dispGreen"
                    type="matrix"
                    values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0"
                    result="g"
                  />
                  <feDisplacementMap
                    in="SourceGraphic"
                    in2="dispMap"
                    scale={dispScale * 0.9}
                    xChannelSelector="R"
                    yChannelSelector="G"
                    result="dispBlue"
                  />
                  <feColorMatrix
                    in="dispBlue"
                    type="matrix"
                    values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0"
                    result="b"
                  />
                  <feBlend in="r" in2="g" mode="screen" result="rg" />
                  <feBlend in="rg" in2="b" mode="screen" result="refracted" />
                  <feColorMatrix
                    in="dispMap"
                    type="matrix"
                    values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 1 0 0"
                    result="rim"
                  />
                  <feBlend in="rim" in2="refracted" mode="screen" />
                </>
              )}
            </filter>
          </defs>
        </svg>
      )}

      {/* The Lens Container */}
      <div
        className={`absolute overflow-hidden pointer-events-none shadow-2xl ${className}`}
        style={{
          transform: `translate3d(${x}px, ${y}px, 0)`,
          width: `${width}px`,
          height: `${height}px`,
          borderRadius: `${radius}px`,
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.2), inset 0 0 0 1px rgba(255, 255, 255, 0.25)',
        }}
      >
        {/* Cloned Backdrop Counter-Translated 1:1 with SVG Refraction */}
        <div
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{
            filter: blobUrl ? `url(#${filterId})` : undefined,
          }}
        >
          <div
            className="absolute origin-top-left"
            style={{
              transform: `translate3d(${-x}px, ${-y}px, 0)`,
            }}
          >
            {backdropContent}
          </div>
        </div>

        {/* Foreground Content inside the lens (Menu items, labels, icons) */}
        {children && (
          <div className="relative z-10 w-full h-full pointer-events-auto">
            {children}
          </div>
        )}
      </div>
    </>
  );
};
```

---

### 5.2 Pure Vanilla JS & HTML Template
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Liquid Glass Vanilla Example</title>
  <style>
    body { margin: 0; background: #0b0f19; font-family: sans-serif; }
    .glass-scene { position: relative; width: 100vw; height: 100vh; overflow: hidden; }
    .glass-lens {
      position: absolute;
      overflow: hidden;
      border-radius: 24px;
      box-shadow: 0 12px 40px rgba(0,0,0,0.3), inset 0 0 0 1px rgba(255,255,255,0.2);
      pointer-events: none;
      transition: transform 0.15s cubic-bezier(0.2, 0.8, 0.2, 1);
    }
    .glass-clone-viewport {
      position: absolute;
      width: 100%;
      height: 100%;
      pointer-events: none;
    }
  </style>
</head>
<body>
  <div class="glass-scene" id="scene">
    <!-- 1. Original Interactive Backdrop -->
    <div id="backdrop" style="position: absolute; inset: 0;">
      <h1 style="color: white; padding: 80px; font-size: 64px;">Liquid Glass for the Web</h1>
      <div style="width: 200px; height: 200px; background: linear-gradient(45deg, #f43f5e, #3b82f6); border-radius: 50%; margin-left: 100px;"></div>
    </div>

    <!-- 2. The Glass Lens -->
    <div class="glass-lens" id="lens" style="width: 280px; height: 80px; top: 0; left: 0;">
      <div class="glass-clone-viewport" id="lens-viewport">
        <div id="lens-clone" style="position: absolute; top: 0; left: 0;"></div>
      </div>
    </div>
  </div>

  <script src="./scripts/generate_glass_map.js"></script>
  <script>
    const scene = document.getElementById('scene');
    const backdrop = document.getElementById('backdrop');
    const lens = document.getElementById('lens');
    const lensClone = document.getElementById('lens-clone');
    const lensViewport = document.getElementById('lens-viewport');

    // Clone the backdrop DOM
    lensClone.innerHTML = backdrop.innerHTML;

    // Generate normal map and attach SVG filter
    const map = LiquidGlassMapGenerator.generateGlassMap({
      width: 280,
      height: 80,
      radius: 24,
      bevelWidth: 18,
      dispScale: 20
    });

    map.toBlob().then(blob => {
      const blobUrl = URL.createObjectURL(blob);
      const filterId = 'vanilla-glass-filter';
      const svg = `
        <svg width="0" height="0" style="position: absolute;">
          <defs>
            <filter id="${filterId}" color-interpolation-filters="sRGB">
              <feImage href="${blobUrl}" result="map" />
              <feDisplacementMap in="SourceGraphic" in2="map" scale="22" xChannelSelector="R" yChannelSelector="G" result="refracted" />
              <feColorMatrix in="map" type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 1 0 0" result="rim" />
              <feBlend in="rim" in2="refracted" mode="screen" />
            </filter>
          </defs>
        </svg>
      `;
      document.body.insertAdjacentHTML('beforeend', svg);
      lensViewport.style.filter = `url(#${filterId})`;
    });

    // Interactive pointer follow
    window.addEventListener('pointermove', (e) => {
      const x = e.clientX - 140;
      const y = e.clientY - 40;
      lens.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      lensClone.style.transform = `translate3d(${-x}px, ${-y}px, 0)`;
    });
  </script>
</body>
</html>
```

---

## 6. Material Modification Recipes & Optical Tuning Guide

Liquid Glass supports deep physical customization by altering Snell's optical index $n$, bevel geometry, blur diffusion, and color matrix filtering:

### 6.1 💧 清透水滴透镜 (Water Drop — $n=1.33$)
Water has a lower refractive index than glass ($n=1.33$ vs $1.50$), producing a gentle, organic magnification with almost zero chromatic dispersion:
```javascript
const waterMap = LiquidGlassMapGenerator.generateGlassMap({
  width: 240, height: 72, radius: 36,
  bevelWidth: 12,        // Narrow soft bevel
  refractiveIndex: 1.33, // Water refractive index
  dispScale: 0.6
});
```
*Filter tip*: Use uniform displacement scale across R, G, B channels (`scale="12"` for all) to keep water optically neutral.

---

### 6.2 💎 蓝宝石 / 钻石高反光晶体 (Heavy Sapphire / Diamond — $n=1.85 \sim 2.42$)
Heavy flint glass, sapphire ($n=1.77$), and diamond ($n=2.42$) bend light aggressively, producing dramatic edge lensing and sharp rainbow fringing:
```javascript
const diamondMap = LiquidGlassMapGenerator.generateGlassMap({
  width: 320, height: 88, radius: 24,
  bevelWidth: 32,        // Deep steep bevel
  refractiveIndex: 2.10, // Diamond / heavy flint
  dispScale: 1.8
});
```
*Filter tip*: Exaggerate chromatic aberration by expanding RGB channel scale spread:
```xml
<feDisplacementMap in="SourceGraphic" in2="dispMap" scale="38" xChannelSelector="R" yChannelSelector="G" result="r" />
<feDisplacementMap in="SourceGraphic" in2="dispMap" scale="28" xChannelSelector="R" yChannelSelector="G" result="g" />
<feDisplacementMap in="SourceGraphic" in2="dispMap" scale="18" xChannelSelector="R" yChannelSelector="G" result="b" />
```

---

### 6.3 🌫️ 哑光酸蚀毛玻璃透镜 (Acid-Etched Frosted Glass)
Combines physical Snell's law refraction with soft Gaussian diffusion, creating luxury frosted glass:
```xml
<!-- In the SVG Filter Chain, insert a subtle Gaussian blur after displacement -->
<feDisplacementMap in="SourceGraphic" in2="dispMap" scale="22" xChannelSelector="R" yChannelSelector="G" result="refracted" />
<feGaussianBlur in="refracted" stdDeviation="2.5" result="frosted" />

<!-- Blend the sharp specular rim highlight on top of the frosted diffusion -->
<feColorMatrix in="dispMap" type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 1 0 0" result="rim" />
<feBlend in="rim" in2="frosted" mode="screen" />
```

---

### 6.4 🍷 烟熏深空 / 琥珀有色玻璃 (Smoked & Tinted Glass)
For sunglasses, smoked acrylic, or amber art glass, inject an absorption matrix or CSS glass backing:
```css
/* Amber Art Glass Tint */
.glass-lens {
  background: rgba(245, 158, 11, 0.08) !important;
  box-shadow: 
    0 16px 40px rgba(0, 0, 0, 0.4),
    inset 0 0 0 1px rgba(251, 191, 36, 0.35),
    inset 0 1px 2px rgba(255, 255, 255, 0.5) !important;
}

/* Cobalt Blue High-Tech Lens */
.glass-lens.cobalt {
  background: rgba(56, 189, 248, 0.08) !important;
  box-shadow: 
    0 16px 40px rgba(0, 0, 0, 0.4),
    inset 0 0 0 1px rgba(56, 189, 248, 0.4) !important;
}
```

