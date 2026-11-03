# Performance-only update

The live visual baseline is commit c45054e. The unfinished continuous-scene work is saved locally in the ignored qa/continuous-scroll-wip.local folder and is not part of this release.

## Changes

- Avoid duplicate inline styles, dataset writes, accessibility attributes and inert-state mutations. CSS serialization and route cleanup are handled explicitly.
- Reuse the exact full-resolution shadow canvas until its poses, caps, camera, parallax, viewport or loaded assets change.
- Cull only drawing regions outside the canvas, including conservative margins for shadows, reflections, cap motion and vapour. Do not paint zero-opacity vapour or zero-strength specular sweeps.
- Stop updating hidden ingredient/gallery/ritual chapters and skip unchanged gallery, ritual and form frames. Cache gallery dimensions on resize rather than reading layout after frame writes.

No CSS, image assets, markup, text, layout definitions, camera math, animation timing, pixel ratio, particle count, blur radius or effect quality was reduced. The visual baseline manifest checks the unchanged source files against the live commit. All motion values and drawing effects remain in place; only redundant or invisible work is skipped.

## Measurement

Local in-app Chromium at 1440 x 900, the same six-second scripted scroll and one-second warmup before/after. No builds or raster tests ran during the timed intervals. These are local rAF cadence measurements, not native Chrome/Edge application benchmarks or a guarantee for all hardware.

| Scene | Before FPS | After FPS | Before p95 | After p95 | Frames over 33.5ms before/after |
| --- | ---: | ---: | ---: | ---: | ---: |
| Hero cap lift and pullback | 24.1 | 39.8 | 66.5ms | 50ms | 80 / 18 |
| About journey | 60 | 60 | 16.8ms | 16.9ms | 0 / 0 |

Raw results: performance-results.json. The harness is qa/motion-performance.html and is copied to the local preview manually; it is not included in the production site.

## Verification

Production build; render-work/cache/serialization/cleanup tests; visual source hashes; reference-motion and reverse traversal; cinematic boundaries; 120 responsive bottle raster checks; content/media/SEO checks; all 27 scent outcomes. Browser checks cover the original hero, mobile gallery and final row, plus form/finder focus and navigation. Full-quality effects remain enabled throughout.
