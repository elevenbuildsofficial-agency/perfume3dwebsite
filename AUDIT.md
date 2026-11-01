# Morrow film audit

## Method and limits

Browser-rendered at exact 390×844 and 1440×900 iframe sizes using qa/film.html. Six scroll positions each: 0%, 10%, 20%, 35%, 50%, 65% of one hero viewport. Images are original screenshots under qa/film-<width>-<percentage>.png; combined review sheets are qa/film-audit-390.jpg and qa/film-audit-1440.jpg.

All visual realism in the home scene comes from complete generated photographs. The canvas only draws/resizes whole frames and dissolves them. Still dissolves show double exposure and small generated-image differences; they do not meet the continuous-motion definition of done. Exact bottle geometry/labels must be reviewed again on delivered MP4s.

| Hero progress | 390px finding | 1440px finding | Action/status |
| --- | --- | --- | --- |
| 0% | Initial red bottle touched left crop; wordmark readable | Complete group grounded on stone, strong label readability | Fixed portrait cover focal position; full scene moves as one image |
| 10% | Copy exits downward with full text contrast | Cap double exposure during temporary A/B dissolve | Removed opacity fade on reading panels; motion pending MP4 |
| 20% | Reading copy clear of bottles | Raised/closed cap exposures coexist in still dissolve | Accepted provisional dissolve, no cutout/sprite used |
| 35% | Lifted cap is within frame and below navigation | Lifted cap, real photographic atomizer and stone shadows | No observed scene clipping at requested size |
| 50% | Macro fills frame; no copy obscures product | Wide macro cross-dissolve shows double exposure | Temporary keyframe transition; no claim of actual camera dolly |
| 65% | Whole-frame scene dissolve; reading space is empty | Macro/First Light exposures overlap | Delayed First Light copy until 72%, after main dissolve |

Later mobile scenes: checked Wild Ground and final picker. Chapter tabs initially covered part of the cap; moved to a reserved bottom row and lifted the reading panel. Final photo and picker occupy separate areas. Caption/reading backgrounds use near-opaque limestone so real pixel texture cannot make text unreadable. Hero text slides rather than fading to low contrast. Focus outlines and native select remain keyboard reachable; inactive panels are inert.

Reduced motion uses static clip end frames; canvas/image failure retains the poster and the same DOM content. Physical mid-range-phone frame timing and failure injection were not measured, so 60fps and exhaustive failure handling are not certified.

## Lighthouse mobile

Lighthouse 12.8.2, headless Edge, default mobile emulation. Before: previous public production URL (?v=86ee453). After: local production preview at 127.0.0.1:4175, not Vite dev. Network/hosting contexts differ; these are lab comparisons, not field guarantees.

| Category | Before | After |
| --- | ---: | ---: |
| Performance | 44 | 84 |
| Accessibility | 100 | 100 |
| Best practices | 100 | 100 |
| SEO | 100 | 100 |

LCP: 6.5s before, 4.5s after. Raw reports (ignored local artifacts): qa/lighthouse-film-before.json and qa/lighthouse-film-production-after.json. A separate dev-server exploratory run is not used for this comparison. Lighthouse AA checks passed at initial render; manual reading panels were reviewed at requested scroll positions. Continuous pixel-by-pixel WCAG conformance at every conceivable viewport is not claimed.
The importer was also tested with a private short transcode of the existing orchard clip, not shipped as creative motion. The test verifies ffmpeg extraction, short-clip end padding, deduplication, manifest lookup and the size budget. A high-detail test correctly triggered the explicit budget rejection rather than silently publishing an oversized set.
