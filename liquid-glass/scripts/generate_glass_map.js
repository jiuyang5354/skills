/**
 * Universal Liquid Glass Displacement & Normal Map Generator
 * Based on Outpace Studios' physically-accurate curl-free squircle refraction optics.
 * 
 * Works in both Browser (HTMLCanvasElement) and Node.js environments.
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.LiquidGlassMapGenerator = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /**
   * Evaluates Snell's Law refraction deflection for a given surface slope and refractive index.
   * @param {number} slope - Local surface slope (dy/dx or gradient magnitude)
   * @param {number} n - Refractive index of glass (default: 1.5)
   * @returns {number} Deflection magnitude in range [0, 1]
   */
  function snellDeflection(slope, n = 1.5) {
    const thetaI = Math.atan(slope);
    const sinThetaT = Math.sin(thetaI) / n;
    if (Math.abs(sinThetaT) >= 1) return 1.0; // Total internal reflection
    const thetaT = Math.asin(sinThetaT);
    return Math.sin(thetaI - thetaT);
  }

  /**
   * Squircle (Superellipse p=4) Signed Distance Field and Gradient
   * Guarantees smooth, curl-free continuous corner normals.
   */
  function squircleSDF(px, py, halfW, halfH, radius) {
    // Distance from center
    const dx = Math.max(0, Math.abs(px) - (halfW - radius));
    const dy = Math.max(0, Math.abs(py) - (halfH - radius));

    if (dx === 0 && dy === 0) {
      // Inside flat core
      return { dist: -Math.min(halfW - Math.abs(px), halfH - Math.abs(py)), nx: 0, ny: 0 };
    }

    // Normalized to radius for p=4 superellipse
    const qx = dx / radius;
    const qy = dy / radius;
    const p = 4.0;
    const pNorm = Math.pow(Math.pow(qx, p) + Math.pow(qy, p), 1.0 / p);
    const dist = (pNorm - 1.0) * radius;

    // Analytic gradient of superellipse norm
    const eps = 1e-6;
    const gradFactor = pNorm > eps ? Math.pow(pNorm, 1.0 - p) : 0;
    let gx = Math.pow(Math.max(0, qx), p - 1) * gradFactor * Math.sign(px);
    let gy = Math.pow(Math.max(0, qy), p - 1) * gradFactor * Math.sign(py);

    const gradLen = Math.hypot(gx, gy) || 1.0;
    return {
      dist: dist,
      nx: gx / gradLen,
      ny: gy / gradLen
    };
  }

  /**
   * Generates displacement texture data in RGBA format:
   * - Red: Horizontal displacement (128 = 0 deflection, 0 = left, 255 = right)
   * - Green: Vertical displacement (128 = 0 deflection, 0 = up, 255 = down)
   * - Blue: Specular rim highlight & Fresnel mask (0 = matte, 255 = highlight)
   * - Alpha: Lens footprint mask (255 = inside, 0 = outside)
   * 
   * @param {Object} options Configuration parameters
   * @returns {Object} { width, height, data: Uint8ClampedArray, toCanvas, toDataURL, toBlob }
   */
  function generateGlassMap(options = {}) {
    const {
      width = 300,
      height = 80,
      radius = 24,
      bevelWidth = 18,
      refractiveIndex = 1.5,
      dispScale = 1.0,
      lightDirection = [-0.5, -0.7, 0.7] // Top-left specular rim source
    } = options;

    const halfW = width / 2;
    const halfH = height / 2;
    const data = new Uint8ClampedArray(width * height * 4);

    // Normalize light vector
    const lightLen = Math.hypot(...lightDirection) || 1;
    const [lx, ly, lz] = lightDirection.map(v => v / lightLen);

    for (let y = 0; y < height; y++) {
      const py = y - halfH;
      for (let x = 0; x < width; x++) {
        const px = x - halfW;
        const idx = (y * width + x) * 4;

        const sdf = squircleSDF(px, py, halfW, halfH, radius);

        // Check if inside lens
        if (sdf.dist > 0) {
          // Outside lens
          data[idx] = 128;
          data[idx + 1] = 128;
          data[idx + 2] = 0;
          data[idx + 3] = 0;
          continue;
        }

        // Inside lens: distance from outer edge: edgeDist in [0, bevelWidth]
        const edgeDist = -sdf.dist;

        if (edgeDist >= bevelWidth) {
          // Flat central optical sweet-spot (Zero refraction deflection)
          data[idx] = 128;
          data[idx + 1] = 128;
          data[idx + 2] = 0;
          data[idx + 3] = 255;
        } else {
          // Curved bevel zone
          // t: 0 at outer perimeter, 1 at flat core boundary
          const t = Math.max(0, Math.min(1, edgeDist / bevelWidth));
          
          // Outpace squircle bevel slope profile
          // Steepening towards the outer edge, flattening smoothly towards core
          const invT = 1.0 - t;
          const denom = Math.pow(Math.max(1e-5, 1.0 - Math.pow(invT, 4)), 0.75);
          const slope = (Math.pow(invT, 3) / denom) * 2.5;

          // Snell refraction deflection
          const deflection = snellDeflection(slope, refractiveIndex) * dispScale;

          // Displacement vector directed outward towards normal
          const dx = sdf.nx * deflection;
          const dy = sdf.ny * deflection;

          // Encode displacement into R & G (128 is center/neutral)
          data[idx] = Math.round(128 + Math.max(-127, Math.min(127, dx * 127)));
          data[idx + 1] = Math.round(128 + Math.max(-127, Math.min(127, dy * 127)));

          // Calculate surface 3D normal for Specular Rim Lighting
          const nz = 1.0 / Math.hypot(dx * 2, dy * 2, 1.0);
          const normX = -dx * nz * 2;
          const normY = -dy * nz * 2;
          const normZ = nz;

          // Dot product for diffuse/specular rim
          const dot = Math.max(0, normX * lx + normY * ly + normZ * lz);
          const fresnel = Math.pow(1.0 - normZ, 2.5);
          const specular = Math.pow(dot, 16) * 0.8 + fresnel * 0.4;

          data[idx + 2] = Math.round(Math.min(255, specular * 255));
          data[idx + 3] = 255; // Opaque inside lens
        }
      }
    }

    return {
      width,
      height,
      data,
      /**
       * Renders map to an HTML Canvas
       * @param {HTMLCanvasElement} [existingCanvas]
       * @returns {HTMLCanvasElement}
       */
      toCanvas(existingCanvas) {
        if (typeof document === 'undefined') {
          throw new Error('toCanvas requires a DOM environment');
        }
        const canvas = existingCanvas || document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        const imgData = ctx.createImageData(width, height);
        imgData.data.set(data);
        ctx.putImageData(imgData, 0, 0);
        return canvas;
      },
      /**
       * Returns a Blob for WebKit/Safari compatible feImage
       * @returns {Promise<Blob>}
       */
      toBlob() {
        return new Promise((resolve, reject) => {
          const canvas = this.toCanvas();
          canvas.toBlob(blob => {
            if (blob) resolve(blob);
            else reject(new Error('Failed to create Blob from canvas'));
          }, 'image/png');
        });
      },
      /**
       * Returns Data URL (Chromium / Firefox only; do NOT pass to Safari feImage)
       * @returns {string}
       */
      toDataURL() {
        const canvas = this.toCanvas();
        return canvas.toDataURL('image/png');
      }
    };
  }

  return {
    snellDeflection,
    squircleSDF,
    generateGlassMap
  };
}));
