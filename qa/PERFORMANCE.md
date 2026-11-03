# Restored choreography with render optimizations

The visual and motion baseline is now commit `4961d7a`, immediately before the rejected full-screen slide changes in `c45054e`. The user requested this rollback after reviewing the deployed transitions. The unfinished continuous-scene redesign remains in the ignored `qa/continuous-scroll-wip.local` folder and is not included.

## Restored behavior

- Original full-frame photographic handoffs across Home, rituals, About, Contact and the scent finder; removed the later opaque screen-plane slides.
- Original bottle paths, opacity, cap behavior, hero haze and collection return; removed the later forced full-opacity travel and extra bottle entrances.
- All pre-slide CSS, copy, assets, markup, camera and timing functions match the original Git source. Authored DOM animation expressions are also fingerprinted against that source, independently of the duplicate-write helpers.

## Retained optimizations

- Suppress duplicate style, dataset, accessibility and inert-state writes, including CSS serialization and route cleanup handling.
- Reuse full-resolution shadow pixels until pose, cap, camera, parallax, viewport or loaded assets change.
- Cull only offscreen drawing regions, with conservative bounds for reflections, cast shadows, cap motion and vapour.
- Skip hidden or unchanged chapter updates and cache gallery dimensions on resize. Image quality, pixel ratio, particles, blur radii and glass effects remain intact.

## Measurements

`performance-results.json` contains historical measurements of the earlier `c45054e` / `44d9bd7` performance pass. Those numbers do not measure this restored choreography. The six-second local Chromium harness remains available in `qa/motion-performance.html` and is excluded from production builds.

## Verification

Production build; render cache/serialization/cleanup checks; pre-slide source hashes and authored animation expressions; reference paths and reverse traversal; cinematic boundaries; 120 responsive bottle raster cases; content/media/SEO checks; all 27 scent outcomes. Browser verification covers the reported ritual transitions, the original collection return and About on desktop and mobile.
