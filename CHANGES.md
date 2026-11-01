> Ingredient chapter: added a five-viewport botanical story between Wild Ground and the closing collection. Four transparent photographic ingredients (bergamot peel, rose petal, black tea and fig leaf) move independently with scroll, gentle idle drift and pointer depth. Existing scent timing and bottle animation stay intact. Ingredient navigation, links back to each scent and the final collection, touch scrolling and static reduced-motion scenes are supported. Hidden bottle canvases stop repainting while the ingredient story fully covers them. Source PNGs are in `assets/source/ingredient-*.png`, delivery WebPs in `public/ingredients`, and built-in generation prompts in `prompts/ingredients.json`.
>
> Latest direction: keep the restored smooth continuous cap/bottle choreography and transparent wordmark, using clean landscape/portrait plates edited from the realistic generated Mediterranean scene. Baked-in bottles, their shadows and caustics are removed from the plate to avoid duplication. About remains separate.
>
> Added premium transparent photographs for all three flacons, registered cap-on/cap-off/cap layers, real-looking machined brass atomisers and spray apertures, thick glass reflections, liquid menisci, wood grain and stone bounce. Glass/label pixels below the collar are shared between states to prevent regeneration flicker. Actual bottle/cap alpha silhouettes now project coloured multiply shadows on the stone, with separate tight contact AO and a rising cap shadow. Reflections are photographic rather than live ray-traced geometry. Build, cinematic reversal/reduced-motion checks, content checks and 120 raster layout checks (now using the active home PNGs) pass.
>
> Added chapter-positioned soft reading light: left for First Light/Wild Ground, right for Velvet Hour, and below products on phones. It follows the existing scroll state so richer garden foliage does not obscure copy. Nine delivered WebP product layers total 1.33 MB; registered PNG masters remain available.
>
> Increased hero and fragrance heading weight to 550, supporting copy/ingredient labels to 500, and the transparent Morrow wordmark to 550 with deeper green ink and a subtle light edge. Typography remains responsive and uses the existing variable font.

> Current revision: restored the smooth continuous bottle animation from 86ee453 at the user's request. The hero wordmark has no background, border, shadow or backdrop filter. The still-film experiment and video handoff below are retained as historical/reference material, not the active home renderer.

# Morrow whole-scene film rebuild

Replaced the home cutout compositor with one fixed canvas drawing complete photographed scene frames. Removed the home procedural model renderer, photo-sprite layers, nozzle approximation, butterfly sprites, CSS blur and ledge parallax modules. About retains its separate existing story and assets.

Generated 18 landscape/portrait stills using the built-in image tool, based on original bottle photographs. Hero B/C are edits of A in each ratio; each scent B edits its A. Wild Ground was relit to dense green shade. Source master images and prompts are retained. Generated microtype can vary; final motion must pass the supplied label/shape checklist.

Added src/sequence.ts for clip counts, ranges, scene colours, text ink, loader/cache limits and mobile composition settings; FilmCanvas.tsx provides cover-fit drawing, DPR cap, rAF smoothing, reversible frame lookup, real initial asset progress, bounded image cache and nearby-frame chunk loading. MP4 extraction is available through npm run frames or scripts/extract-frames.sh (portable Node implementation used by both).

Restored text as DOM over local opaque-backed reading zones. Hero wordmark is clear of bottles; copy exits without lowering text contrast. Body text is 16px and labels 12px or larger. Mobile scent copy uses a dedicated reading area; final includes a native three-scent picker, correct selected price (default $140), one primary reservation button, notes, 50ml size and first-edition information. Bag and reservation logic are preserved. OG/Product URLs now use the real absolute production origin.

Build and clip/still budget checks pass. Twelve requested hero screenshots are in qa/film-<390|1440>-<0|10|20|35|50|65>.png. Audit and actual Lighthouse figures are in AUDIT.md. The initial fallback desktop media references total approximately 2.3MB (including repeated references); motion remains pending the ten user-generated clips in ASSETS_NEEDED.md. No 60fps device claim is made.
Scene grade values describe the baked photographic lighting, not a CSS filter. Text ink is selected from the same clip configuration and applied to the backed reading zones.
