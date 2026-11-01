# Verification — 1 November 2026 (Asia/Karachi)

## Grounded bottles and cap-lift revision

The current home story uses the clean orchard photograph directly. Its hills,
olive trees, stone foreground and canopy are separate depth layers. The stone,
product bases and multiply-blended shadows share the same pointer transform.
Bottle breathing scales about the contact point. The About story, copy, chapter
names, prices and bag flow are retained.

- TypeScript/Vite production build passed; content/SEO/media checks passed.
- 120 raster layout cases passed, including 390px, iPhone, Duo, tablet,
  landscape and desktop: centred groups, equal visible gaps, common baselines
  and no clipped bottles.
- `npm run check:cinematic` verifies the 3/12/16/30% beat boundaries, hero text
  clearance, unchanged scent anchors, reverse traversal and reduced motion.
- Browser checked at 1440×900 and 390×844. The three-bottle group fits with clear
  outer margins; the hero title sits below the bottles. The centre cap rises
  above its nozzle; side bottles soften as focus moves to First Light. The neck
  close-up dissolves into its chapter by 30% of one viewport of scroll.
- A development-only fixture (`qa/cinematic.html`, excluded from the build)
  exercised exact 12%, 30%, Velvet Hour, Wild Ground, final-group and reverse
  positions. The actual canvas reported lift 1 at approximately .12 viewport,
  dissolve 1 at .30, and lift 0 again after returning to zero.
- Mobile First Light, Velvet Hour, Wild Ground and the final three-bottle scene
  were visually inspected. Copy, prices, ingredient lists and controls remain
  separated from the products. No horizontal overflow was observed.
- The explicit reduced-motion branch was visually checked: all three bottles
  are cap-off, with no visible cap movement, particles or vapour; computed
  ambient animation names were all `none`. The OS preference was not changed.
- Direct About navigation still loads its existing five named movements.
- Desktop/mobile proof images are saved locally as
  `qa/grounded-hero-desktop.png` and `qa/grounded-hero-mobile.png` (ignored).
- No named GLBs or registered cap-layer PNG sets are supplied. The live path
  therefore uses the original photos, a separated photographed cap and an
  approximate atomiser. Real hidden geometry and a new viewing angle cannot
  be recovered from these images. Exact missing files and the one-line source
  selector are in `ASSETS_NEEDED.md`. GLB/PNG adapters compile, but could not be
  visually verified against replacement assets that do not exist.

The earlier lab measurements below describe the preceding video-background
build; they have not been rerun for this revision.

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

## Responsive collection alignment

The home hero, final scene, loading fallback and About finale now share a silhouette-based layout. It accounts for transparent padding, each bottle's different width and its rotation. The complete visible row is centred, adjacent gaps are equal, bases align and the row scales down together when width is limited. Grouped idle movement remains in phase; pointer movement no longer changes the gaps at the settled collection scenes.

npm run check:layout independently rasterizes the actual large/mobile WebP files at 20 viewport sizes, with and without a scrollbar gutter, across the three grouped scenes. Checks require centred bounds and equal gaps/baselines within two rendered pixels, positive gaps and no clipping. The matrix includes 375×667, 390×844, 393×852, 430×932, phone landscape, Surface Duo 540×720 / 720×540 and 1114×720, tablets, 1440×900 and 1920px desktop widths. These are viewport simulations, not physical-device Safari or hinge-hardware tests.

All 120 raster checks passed. Fresh browser views checked the home finale at 390×844 and 540×720, the desktop hero/finale at 1440×900, and the About finale. The About desktop caption has additional separation below the aligned bottles. The production build and content checks passed; no production console errors were observed.
