# Ingredient story — 2 November 2026

The homepage now has a 520svh ingredient section after Wild Ground and before the closing collection. Actual DOM anchors are measured so the original hero and three scent stops keep their timing. Entry/exit opacity and all four ingredient weights derive from the same smoothed scroll state. Reversing scroll reverses the transitions. The original bottle compositor is hidden and stops repainting during the fully visible ingredient interval.

Four photoreal transparent ingredients were generated with the built-in image tool, inspected, saved in `assets/source/ingredient-*.png`, then encoded to 1200px WebP with full-quality alpha using `scripts/prepare-ingredients.mjs`. Delivery assets total 1,231,210 bytes. Exact generation prompts are in `prompts/ingredients.json`. These are generated botanical images, not live botanical geometry or a background video.

Validation:

- Production TypeScript/Vite build, content/SEO/delivered-asset checks and cinematic checks pass.
- Cinematic checks cover unchanged scent stops, distinct ingredient stops, continuous ingredient coverage without blank frames, and one static ingredient in reduced motion.
- Existing 120 bottle raster spacing/base/clipping checks pass.
- Browser reviewed at 1440×900 and 390×844; separate compact landscape styling supports 844×390.
- Active ingredient images load with real transparency and running independent CSS drift. In reduced motion, active image animation and transforms are `none`.
- Wild Ground's next button enters the ingredient story. Its own ingredient buttons scroll through the story, and the closing collection button restores all three bottles and the reservation flow.
- Ingredient scene uses `overflow: clip` so focus navigation cannot internally scroll the fixed stage and detach its backdrop.

Reusable browser harness: `qa/ingredients.html?width=390&height=844`, with `&reduced=1` for the static alternative. Copy the harness into `dist/qa` after a production build when testing via the preview server. The harness is not part of the public production routes.
