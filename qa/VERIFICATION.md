# Verification — 1 November 2026 (Asia/Karachi)

The verified version is the three-product photographic collection, locally rendered orchard video loop, persistent bag and cinematic About page. The earlier single shader bottle is not the default presentation.

## Build and data

- npm run build: passed TypeScript and Vite production compilation, no build warnings.
- npm run check:content: passed all five palette keyframes, product/background asset existence, timeline count and generated home/About metadata checks.
- Normal-text keyframe contrast: 9.32:1 to 10.96:1. Secondary text: 7.14:1 or better. Photo overlays keep text zones calm.
- All three product SKUs and individual prices are generated into Product structured data.
- Local fonts, product WebP images in two sizes, natural background images, JPEG social card and robots.txt are included.

## Mobile Lighthouse

Measured against the production preview at http://127.0.0.1:4173/ with Lighthouse 12.8.2 and headless Microsoft Edge, using the default mobile simulated network/CPU profile:

| Category | Score |
| --- | --- |
| Performance | 85 |
| Accessibility | 100 |
| Best practices | 100 |
| SEO | 100 |

First contentful paint: 1.8 s. Largest contentful paint: 4.2 s. Total blocking time: 50 ms. These are local lab measurements, not a guarantee for every deployment or device. Raw report: lighthouse-mobile.json.

## Browser checks

- Desktop at an exact 1440×900 viewport: three distinct products, natural environment, readable copy, no horizontal overflow, one h1.
- Wide/short desktop at 1920×720: hero typography and bottle caps remain separated, and the final scene shows all three products with readable copy and controls.
- Mobile at an exact 390×844 viewport: three-product hero, product-detail composition, prices, descriptions, navigation and final CTA remain readable.
- Compact mobile at 360×650: Wild Ground's product, copy, ingredient list and reserve control remain separated and reachable.
- Tablet stacking was adjusted after a 761px check found the earlier composition crowded. Stacking now extends through 1000px.
- Four inactive panels are inert; one active panel remains available to assistive technology.
- Velvet Hour's reserve control preselects Velvet Hour at $160. Switching the native selector to Wild Ground updates the name and price to $150.
- Valid local form submission displays the explicit on-device-only confirmation for the selected product. The success heading receives focus. Escape closes the dialog and returns focus to the original reserve control.
- Invalid email submission was rejected by native validation.
- Native background video verified playing, muted, looping and eight seconds long. Desktop/mobile H.264 files and matching posters are included. Moving leaves and butterflies are rendered from original assets locally; no Higgsfield credits were used.
- The explicit reduced-motion branch removes the video, reports no CSS ambient animations, disables Lenis and applies chapter changes immediately. Native media-query handling is present; the OS preference itself was not changed during testing.
- Bag: adding First Light and Velvet Hour gives $300; increasing First Light to two gives $440; removing Velvet Hour gives $280. Quantities survive reload and navigation to About. Local email reservation displays the on-device-only confirmation and focuses its heading. Removing the test product displays the empty bag state.
- Direct /about/ navigation serves a dedicated HTML entry and page title. The shopping list headed “Three ways to feel like you” is absent.
- About's earlier horizontal three-panel layout has been replaced by a five-act pinned film: Origins / Feeling / Nature / Form / You. Camera-scale bottle motion, foreground foliage, the expanding glass arch, dark material lighting and the three-product reunion share one smoothed scroll timeline. Current browser checks are recorded below.
- About/bag collection links return to the First Light product scene. Fresh production console checks showed no application errors.

Both the browser viewport override and exact-size iframe helper were used for responsive checks. The helper is development-only and is excluded from dist/.

## Scope limits

- Reservation is a labelled local concept preview until a real endpoint is configured; no order or email is sent.
- Default bottle visuals are original photographic assets with layered scroll/parallax animation. They are not editable live 3D meshes. The optional Three.js/GLB renderer remains available in source.
- No production deployment or live waitlist service was requested.

## About cinematic revision

Public Scrolltide listings and autoplay previews reviewed: Vesper, VALMORA, Ora and SYKÉA. Motion is implemented locally with original assets. No generation or subscription purchase was made.

The previous mobile Lighthouse numbers above describe the home-page build before this About revision; they are not a fresh About performance measurement.

- Production TypeScript/Vite build and content/media/SEO checks pass after the revision.
- Normal story checked at 1280×720, 1440×900, 390×844 and 360×650. Mobile close-ups are masked above the copy; secondary annotations are simplified on small screens. No horizontal document overflow was observed.
- Native wheel input advances the continuous scene parameter (observed 1.767 between Feeling and Nature), rather than switching only at chapter buttons. Enter on the Form chapter button opens the dark material scene.
- Final chapter shows all three bottles and a clear collection link at both mobile sizes. The link opens home at First Light. The product shopping list is absent.
- Bag opens from the pinned stage; Escape restores focus and resumes the same scene (observed scene 4). Home/About navigation cleans up and recreates the scroll controllers.
- Explicit reduced motion exposes all five sections, removes video and CSS animations, and has zero horizontal overflow. The OS preference itself was not changed.
- About photographs remain layered 2D assets; scale, roll, masking and foreground parallax create the camera movement. No live 3D model or frame-sequence source from Scrolltide is used.
