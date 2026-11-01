# Morrow — three perfumes, three instincts

The original single procedural hero brief was superseded by the user's explicit requests for photographic realism inspired by https://www.scrolltide.co/templates/sykea and three different perfume products. The deliverable is local source in D:\Eleven builds\3d website. No publication has been requested.

## Product design

| Product | Bottle | Scent | Price |
| --- | --- | --- | --- |
| First Light / No. 01 | Clear sculptural oval glass, golden perfume, organic walnut stopper | Bergamot, neroli, cedarwood | $140 |
| Velvet Hour / No. 02 | Broad bevelled burgundy crystal, dark walnut rounded block | Rose, black tea, amber | $160 |
| Wild Ground / No. 03 | Slender olive apothecary glass, natural oak stopper | Fig leaf, vetiver, cedarwood | $150 |

All use understated printing directly on the glass. Original imagery comes from the built-in image generation tool; full-resolution sources and design prompts are retained. Sharp only prepares transparency/padding/encoding and social-card layout. The simplified shader bottle is no longer the default artwork.

## Colour and type

Outfit Variable is locally served, with large light sentence-case typography, negative tracking, thin rules and restrained controls.

| World | Background | Ink |
| --- | --- | --- |
| Collection / final | Limestone #F0EDE3 | Deep olive #29372D |
| First Light | Sunlit stone #F2E8D4 | Warm bark #3A2D20 |
| Velvet Hour | Dusk blush #E9DDE0 | Dark rosewood #36252D |
| Wild Ground | Soft sage #E2E8DA | Forest ink #243E2D |

Keyframes pass WCAG AA. Palette interpolation includes a contrast guard during dark/light ink transitions.

The user subsequently requested a sharp, natural animated background. An eight-second silent H.264 loop is rendered locally from the original deep-focus orchard, fig branch and butterfly assets. Desktop/mobile videos have matching posters, muted inline autoplay and looping, visibility pause and a CSS/still fallback. No Higgsfield credits were used. Readability veils keep copy zones calm without a global background blur. Reduced motion removes video and ambient movement.

## Timeline

| Scroll | Copy | Composition |
| --- | --- | --- |
| 0% | Three scents. One instinct. | All three bottles, No. 01 forward |
| 25% | First Light | No. 01 right, copy/reservation left |
| 50% | Velvet Hour | No. 02 left, copy/reservation right |
| 75% | Wild Ground | No. 03 right, copy/reservation left |
| 100% | Find your kind of Morrow. | All three bottles return, collection selection CTA |

Screens up to 1000px keep products above copy. A compact layout supports 360×650. Continuous scroll interpolates position, size, tilt and opacity on one fixed photographic canvas. Pointer parallax and gentle float add depth. Reduced motion disables idle/pointer motion and applies scroll state immediately. The default stage needs no WebGL. The optional Three.js procedural/GLB renderer is retained for future live models.

## Component tree and content

SiteApp owns home/About routing and the persistent cart. Home App → Header, HeroPanel, ProductPanel × 3, FinalPanel, StoryChrome, PhotographicScene, ReservationDialog with product selection. Optional lazy Scene remains available. Shared Header and CartDrawer use restrained translucent glass surfaces.

About has a dedicated /about/ HTML entry and a continuous five-act cinematic stage across 680 viewport heights. Origins opens with a tilted golden bottle inside an expanding glass arch; Feeling travels into an oversized cap/glass macro; Nature brings an orchard aperture and foreground branch sweep; Form changes to a dark studio material study with wine-glass photography, orbit guides and a travelling reflection; You brings all three bottles together and links to the collection. Direct chapter navigation, smooth wheel motion, pointer depth, paused cart state and static reduced-motion chapters are supported. The product shopping list remains removed.

Public Scrolltide library previews studied: Vesper's retained subject/docking, VALMORA's camera-led reveal, Ora's continuous detail sequence and SYKÉA's pinned collection stage. These inform pacing and continuity rather than a copied layout or assets.

src/content.ts owns products, prices, SKUs, image paths, palettes, UI copy, navigation, accessibility labels, fonts and scene settings. useStory owns Lenis/ScrollTrigger, interpolation and inert states. Canvas reads mutable state without per-frame React updates. Product reservation buttons preselect the matching product, and all submissions use the selected SKU and price.

The bag supports SKU validation, quantities from one to nine, removal, subtotals and localStorage persistence across navigation and reloads. Its reservation form saves only on the device. Morrow is an illustrative concept; no payment, order or email is fabricated. The separate individual-fragrance reservation supports an optional endpoint.

## Verification

Build/typecheck and content/structured-data checks; browser checks at 1440×900 and 390×844 plus compact mobile and tablet; verify product scenes, selections, local confirmation, keyboard focus/dismissal, reduced motion, contrast and horizontal overflow. Run mobile Lighthouse against the production output and record measured results in qa/VERIFICATION.md.
