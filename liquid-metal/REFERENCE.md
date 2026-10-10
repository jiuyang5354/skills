# Liquid Metal Shader Deep Reference & Mathematical Manual

This manual provides the complete optical physics, WebGL 2 multi-pass pipeline architecture, mathematical formulations, and tuning parameters for the **Liquid Metal / Molten Mercury** shader component (reverse-engineered from `@designcodeio/threeui`).

---

## 1. Mathematical Optics & Field Formulations

### 1.1 The Laminar Valley Field ($V$)
Conventional procedural metals rely on 2D Simplex/Perlin noise, which inevitably yields turbulent, muddy, or blotchy patterns. To create **laminar, parallel ribbon-like fluid motion**, the scalar potential field $V$ is constructed as a family of vertical translates of a single 1D valley curve, scaled by a non-uniform density function:

$$V(x, y, t) = \Big(y - \text{valley}(x, t)\Big) \cdot \text{density}(x, t) + \text{wobble}(x, y, t) - \text{lift}$$

Where:
- **Valley Curve $\text{valley}(x, t)$**:
  $$\text{valley}(x, t) = \text{wig}(x \cdot \omega_{\text{val}}, t, \text{seed}_0) \cdot A_{\text{val}}$$
  $\text{wig}$ is a multi-octave 1D smooth drift function combining low-frequency harmonics ($0.60 \sin + 0.27 \sin + 0.13 \sin$).
- **Density Function $\text{density}(x, t)$**:
  $$\text{density}(x, t) = \rho_0 \cdot \exp\Big(\kappa \cdot \text{wig}(x \cdot \omega_{\rho} + 9.0, t, 2.7)\Big)$$
  Because density varies exponentially along $x$, ribbons crowd into razor-thin rainbow fringes at one end and open into wide silky washes at the other.
- **Level Sets (Iso-lines)**: All level sets $V = C$ satisfy:
  $$y = \text{valley}(x, t) + \frac{C}{\text{density}(x, t)}$$
  Ensuring strictly parallel, laminar ribbons across the entire surface.

---

### 1.2 Cauchy Spectral Dispersion ($N = 21$)
Physical dispersion in optical metals and glass is non-linear across the visible spectrum (Cauchy's equation): shorter blue wavelengths ($\lambda \approx 400\text{nm}$) refract and bend far more sharply than longer red wavelengths ($\lambda \approx 700\text{nm}$).

Rather than a simple 3-tap RGB offset, the shader samples $N = 21$ discrete spectral bands:
```glsl
const int N = 21;
float mid = 1.0 - pow(0.5, skew);
vec3 col = vec3(0.0), wsum = vec3(0.0);

for(int i = 0; i < N; i++) {
  float k = float(i) / float(N - 1);
  vec3 w = spec(k);
  
  // Non-linear wavelength skew: pow(1.0 - k, skew)
  float offset = ((1.0 - pow(1.0 - k, skew)) - mid) * disp;
  col  += w * tone(V + offset);
  wsum += w;
}
col /= wsum;
```

#### Spectral Weighting Function $\text{spec}(k)$:
$$\text{spec}(k) = \text{clamp}\Big(1.5 - |4k - (3, 2, 1)|, 0, 1\Big)$$
Maps normalized wavelength $k \in [0, 1]$ into a continuous, energy-conserving RGB spectrum where $k=0$ is pure deep red, $k=0.5$ is pure green, and $k=1.0$ is violet-cyan.

#### Tone Plateau Function $\text{tone}(v)$:
$$\text{tone}(v) = \text{smoothstep}\Big(0.5 - W - e, 0.5 - W, \text{fract}(v)\Big) \cdot \Big[1 - \text{smoothstep}\Big(0.5 + W, 0.5 + W + e, \text{fract}(v)\Big)\Big]$$
A rectangular plateau with smooth edges evaluated once per unit period of $V$. Because lower wavelengths enter the plateau earlier than higher wavelengths, the lower edge fringes warm (red turns on first) while the upper edge fringes cool (red turns off first).

---

### 1.3 Self-Refraction via Screen-Space Derivatives
To make the metal appear folded and gathered into physical crests, the lookup coordinate is displaced along the spatial gradient of the field itself:

$$\vec{g}_p = \left(\frac{\partial h_0}{\partial x}, -\frac{\partial h_0}{\partial y}\right) \cdot S = \Big(\text{dFdx}(h_0), -\text{dFdy}(h_0)\Big) \cdot S$$

$$\vec{q}_{\text{refracted}} = \vec{q} - \vec{g}_p \cdot \frac{\text{refract}}{\max(\rho_0, 0.001)}$$

$$\vec{g}_d = \frac{\vec{g}_p}{\|\vec{g}_p\| + 10^{-5}}$$

Fine micro-filaments are then injected along the tangent $(\vec{g}_d^\perp)$:
$$V \mathrel{+}= A_{\text{fine}} \cdot \text{fbm}\Big(\vec{q} \cdot \vec{g}_d \cdot \omega, \vec{q} \cdot \vec{g}_d^\perp \cdot 0.04\omega\Big)$$

---

### 1.4 Faceted Cusp Ripples (Sheet Metal Creases)
When clicked or tapped, the surface emits disturbances that read as **stamped sheet metal creases** rather than soft water waves:

$$\text{facet}(\theta) = 1 + \alpha_{\text{facet}} \cdot \cos\Big(m \cdot \theta + 2.1 \cdot \text{age} + 2.4 \cdot i\Big)$$

$$x = \frac{\|\vec{r}_p\| - \text{age} \cdot v_{\text{rip}} \cdot \text{facet}(\theta)}{w_{\text{rip}}}$$

$$\text{crest}(x, \text{age}) = \exp\Big(-\big(|x| + 10^{-4}\big)^{\beta_{\text{sharp}}}\Big) \cdot \exp\Big(-\text{age} \cdot \gamma_{\text{decay}}\Big)$$

- **$\beta_{\text{sharp}} \approx 1.15$**: Produces a non-differentiable cusp peak (a hard crease) instead of a Gaussian hump ($\beta = 2.0$).
- **$m = 6.0$ lobes**: 6-fold angular symmetry modulated by time, creating rotating metallic hexagonal facets.

---

### 1.5 Viscous Pointer Well Warping
When the mouse or pointer glides across the button, moving metal requires viscous dragging:
$$\vec{W}(\vec{p}) = \frac{\vec{p} - \vec{p}_{\text{trail}}}{\|\vec{p} - \vec{p}_{\text{trail}}\| + 10^{-5}} \cdot \exp\left(-\frac{\|\vec{p} - \vec{p}_{\text{trail}}\|^2}{r_{\text{ptr}}^2}\right) \cdot z \cdot \big(A_{\text{base}} + A_{\text{speed}} \cdot v_{\text{norm}}\big)$$
- Pointer coordinates $\vec{p}_{\text{trail}}$ track actual cursor with lag factor $0.0016^{\Delta t}$;
- Space $\vec{q} = \vec{p} + \vec{W}(\vec{p})$ is distorted prior to field evaluation, creating fluid lensing and stretching.

---

## 2. WebGL 2 Multi-Pass Render Pipeline

```
  ┌─────────────────────────────────────────────────────────────┐
  │ Pass 1: Scene (Full Res)                                     │
  │ Dispersive Metal (21 wavelengths) + Ripple + Pointer Warp   │
  └──────────────────────────────┬──────────────────────────────┘
                                 │ T_core (RGBA16F)
  ┌──────────────────────────────▼──────────────────────────────┐
  │ Pass 2: Razor Rim (Full Res)                                │
  │ Travelling 3-Lobe Arc Highlight + Transverse Chromatic Aberr│
  └──────────────────────────────┬──────────────────────────────┘
                                 │ T_rim (RGBA16F) - BYPASSES BLUR!
  ┌──────────────────────────────▼──────────────────────────────┐
  │ Pass 3: Half-Res Downsample & Molten Blur                   │
  │ 4-tap box downsample → Multi-iteration Separable Gaussian   │
  └──────────────────────────────┬──────────────────────────────┘
                                 │ T_s1 (Half Res)
  ┌──────────────────────────────▼──────────────────────────────┐
  │ Pass 4: Bloom Downsample & Multi-Scale Glow                 │
  │ 1/DOWN downsample → 4 Gaussian radii (1.0, 2.3, 5.2, 9.0)   │
  └──────────────────────────────┬──────────────────────────────┘
                                 │ T_a (Quarter Res)
  ┌──────────────────────────────▼──────────────────────────────┐
  │ Pass 5: Final Composite                                      │
  │ pow(metal, punch) + Scrim Veil + Shadow Occlusion + Rim     │
  └─────────────────────────────────────────────────────────────┘
```

### Key Texture Formats
- **`EXT_color_buffer_half_float`**: Uses `gl.RGBA16F` with `gl.HALF_FLOAT` for linear HDR light accumulation without banding.
- **Fallback**: Automatically falls back to standard `gl.RGBA8` with `gl.UNSIGNED_BYTE` if half-float buffers are unsupported.

---

## 3. Tunables & Configuration Parameter Reference

All parameters can be tuned in real time via the runtime console hook:
```javascript
window.__set(P, E, C, R);
```

### 3.1 Field Parameters (`P` — 21 Uniforms)
| Key | Default | Type | Description |
|---|---|---|---|
| `valFreq` | `0.50` | `float` | X-frequency of the valley wave curve |
| `valAmp` | `0.55` | `float` | Valley vertical depth in button heights |
| `dens` | `2.40` | `float` | Base ribbon density (bands per button height) |
| `densVar` | `2.20` | `float` | Exponential swing of density along x |
| `densFreq` | `0.32` | `float` | X-frequency of the density variation |
| `wobAmp` | `0.12` | `float` | 2D FBM organic wobble amplitude |
| `wobFreq` | `1.60` | `float` | Frequency of organic 2D wobble |
| `lift` | `0.05` | `float` | Vertical phase offset of ribbon family |
| `refract` | `0.18` | `float` | Self-refraction scale (folds iso-lines) |
| `edge` | `0.04` | `float` | Plateau edge transition softness |
| `width` | `0.46` | `float` | Plateau width (fraction of band period) |
| `disp` | `0.30` | `float` | Spectral dispersion width |
| `skew` | `1.50` | `float` | Cauchy dispersion skew (>1 expands blue) |
| `fineAmp` | `0.0` | `float` | Filament micro-texture amplitude |
| `fineFreq` | `9.0` | `float` | Filament frequency across iso-lines |
| `gamma` | `1.00` | `float` | Color tone gamma correction |
| `gain` | `1.90` | `float` | Overall metallic luminescence gain |
| `octGain` | `0.32` | `float` | FBM octave gain (low = big smooth ribbons) |
| `litLo` | `-0.26`| `float` | Distance below valley where light starts |
| `litHi` | `0.10` | `float` | Distance below valley where light is 100% |
| `dim` | `0.44` | `float` | Scrim attenuation factor under label text |

### 3.2 Rim Parameters (`E` — 8 Uniforms)
| Key | Default | Type | Description |
|---|---|---|---|
| `base` | `0.20` | `float` | Floor baseline brightness of the outline |
| `hot` | `0.82` | `float` | Brightness of travelling light lobes |
| `chromA` | `0.42` | `float` | Transverse chromatic offset (device px) |
| `chromS` | `0.030`| `float` | Longitudinal chromatic offset (laps) |
| `speed` | `0.070`| `float` | Rotation speed of highlights (laps/sec) |
| `top` | `0.35` | `float` | Top-edge illumination bias |
| `press` | `0.85` | `float` | Rim brightness boost while pressed |
| `ripple` | `1.60` | `float` | Flare multiplier when ripple crosses edge |

### 3.3 Composite & Bloom Parameters (`C`)
| Key | Default | Type | Description |
|---|---|---|---|
| `glow` | `1.95` | `float` | Outer Bloom gain |
| `glowR` | `1.30` | `float` | Bloom radius scale multiplier |
| `glowIn` | `0.30` | `float` | Fraction of bloom bleeding back into pill |
| `occl` | `0.62` | `float` | Drop shadow bloom occlusion intensity |
| `soften`| `0.24` | `float` | Molten blur sigma in button heights |
| `punch` | `1.50` | `float` | Post-blur contrast power curve exponent |

### 3.4 Disturbance Parameters (`R`)
| Key | Default | Type | Description |
|---|---|---|---|
| `speed` | `1.85` | `float` | Ripple wave expansion speed |
| `width` | `0.20` | `float` | Ripple annular thickness |
| `decay` | `1.35` | `float` | Ripple exponential time decay rate |
| `amp` | `1.35` | `float` | Ripple field displacement amplitude |
| `facet` | `0.18` | `float` | Depth of wavefront angular modulation |
| `lobes` | `6.0` | `float` | Number of ripple hexagonal facets |
| `sharp` | `1.15` | `float` | Wavefront cusp sharpness (1 = crease) |
| `emit` | `0.45` | `float` | Self-illumination carried by ripple crest |
| `ptrRad` | `0.55` | `float` | Radius of cursor well |
| `ptrAmp` | `0.32` | `float` | Drag distance when cursor is stationary |
| `ptrFast`| `0.40` | `float` | Extra drag at maximum cursor speed |
| `ptrRim` | `0.80` | `float` | Rim highlight boost nearest to cursor |
| `ptrLag` | `0.0016`| `float` | Cursor trailing inertia factor |
| `ptrVref`| `4.5` | `float` | Reference speed for full dynamic drag |

---

## 4. Dynamic Color Grading Architecture (GLSL Pass 5)

To recolor the liquid metal into custom luxury finishes (24K Gold, Cyber Acid, Cryo Titanium, Void Amethyst, Plasma Emerald), Pass 5 (`FRAG_COMP`) introduces two vector uniforms:
- `uniform vec3 uTintCore;` — Multiplier for the core metallic reflection after contrast power curve.
- `uniform vec3 uTintGlow;` — Multiplier for the ambient Bloom and travelling rim light.

### GLSL Implementation:
```glsl
// Pass 5 Composite fragment shader:
vec3 metal = pow(max(m.rgb / max(m.a, 1e-3), 0.0), vec3(uPunch));
metal *= uTintCore; // Apply primary material tone

vec3 glow = texture(uGlow, uv).rgb * uTintGlow;
vec3 core = metal * pill * mix(1.0, uDim, veil) + texture(uRim, uv).rgb;

// Ripple crest self-illumination tinted to match metal
core += vec3(rip * rip) * uRipK2.w * pill * mix(1.0, 0.42, veil) * uTintCore;

vec3 rgb = core + glow * uGlowGain * mix(1.0, uGlowIn, pill) * (1.0 - occl * (1.0 - pill));
```

### Full Preset Matrix:
| Preset | `uTintCore` | `uTintGlow` | `P.disp` | `C.soften` | `C.punch` | `C.glow` |
|---|---|---|---|---|---|---|
| **24K Gold** | `vec3(1.30, 0.88, 0.28)` | `vec3(1.40, 0.90, 0.30)` | `0.22` | `0.32` | `1.65` | `2.40` |
| **Cyber Acid** | `vec3(1.05, 1.05, 1.05)` | `vec3(1.10, 0.95, 1.25)` | `0.65` | `0.22` | `1.50` | `2.80` |
| **Cryo Titanium** | `vec3(0.92, 1.02, 1.18)` | `vec3(0.85, 1.08, 1.35)` | `0.05` | `0.12` | `2.20` | `1.80` |
| **Void Amethyst** | `vec3(0.85, 0.40, 1.45)` | `vec3(1.20, 0.35, 1.60)` | `0.35` | `0.26` | `1.70` | `2.60` |
| **Plasma Emerald**| `vec3(0.35, 1.35, 0.75)` | `vec3(0.30, 1.45, 0.85)` | `0.18` | `0.24` | `1.75` | `2.70` |

---

## 5. Mobile & Low-Power Optimization Guide

When deploying to battery-sensitive or low-tier mobile devices:
1. **Reduce Dispersion Samples**:
   In `FRAG_SCENE`, reduce `const int N = 21;` to `const int N = 11;` or `N = 9;`. This cuts fragment shader arithmetic by 50% with almost no perceived difference on high-DPI screens.
2. **Cap DPR to 1.5 or 2.0**:
   ```javascript
   DPR = Math.min(window.devicePixelRatio || 1, 1.5);
   ```
3. **Skip Redraw on Stationary Rest**:
   The engine includes built-in signature checking:
   ```javascript
   const sig = (calm.matches && !ripLive && ptrAmt < 0.002) ? `${hover}|${press}|${W}|${H}` : null;
   if(sig !== null && sig === drawn) { requestAnimationFrame(frame); return; }
   ```
