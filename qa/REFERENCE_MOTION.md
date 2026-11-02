# Video reference and implementation

Reference: `3d website reference video.mp4`, 26.96 seconds, 720 x 1280 at 30 fps. Inspected the full sequence as timestamped frames at 2 fps, including the following movements:

- 0–8s: products cycle on a curved path around a central composition; scale, vertical travel and orientation establish depth.
- 9–12s: a product remains the focal point while leaves and small photographic cards move at different rates around it.
- 13–15s and 20–21s: a horizontal, curved product gallery travels across the screen. Side cards turn toward the central card. Morrow maps this progression to vertical scrolling.
- 22–26s: the central product remains on stage while large ingredient labels and image cards pass around it.

Morrow keeps its photographic garden, bottle assets, copy, cap lift and final regrouping. The scent handoffs now use curved travel with depth/roll. Ingredients keep a central product visible, move botanical layers around it, and carry photographic memory cards through the scene. A new pinned Collection gallery between Ingredients and Daily Rituals follows the reference's horizontal depth progression. About gains orbiting photographic cards and curved product travel. No reference video images or branding are used as production assets.

The active products are photographic layers. The movement uses perspective, arcs and depth scaling; it does not add unseen back faces or claim volumetric 360-degree bottle geometry.

The original video is retained locally and excluded from this change's Git staging. Analysis sheets and frame captures are ignored QA artifacts. Reference extraction is reproducible with `node qa/inspect-reference.mjs`.

Verification: production build, cinematic continuity, reference-motion math, content/media checks and the existing 120 responsive bottle raster cases pass. Tested the 390px gallery's Wild Ground selector and its Explore button through to the correct scent chapter. Inspected the ingredient subject, floating photo cards and full gallery on mobile and desktop. Reduced motion uses still product compositions with zero yaw/roll/depth animation. The gallery-to-Day flow and existing final bottle return remain on the shared reversible timeline.
