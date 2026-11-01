> Active revision: smooth continuous bottle/cap animation with clean generated garden plates and complete registered photographic layers for all three products. No asset is missing for this active PNG implementation. Each `/public/bottles/{first-light,velvet-hour,wild-ground}-{capon,capoff,cap}.png` exists, including a detailed exposed brass atomiser. Sources are in `assets/source`; reproduce with `node scripts/prepare-bottle-layers.mjs`. `BOTTLE_SOURCE` in `src/bottleAssets.ts` remains a one-line fallback switch.
>
> Optional live-3D upgrades are absent: `/public/models/first-light.glb`, `/public/models/velvet-hour.glb`, `/public/models/wild-ground.glb` (nodes `body`, `cap`, optionally `nozzle`). The active implementation uses photographed/generated reflections; it does not simulate dynamic glass refraction. The video handoff below is historical and is not required by the active renderer.

# Missing motion assets

All 18 whole-scene PNG stills are supplied in public/source/frames (nine named shots × 16x9/9x16). Original product references are in public/source/refs. Frame prompts are in prompts/frames. Built-in image generation was used; no video model was called.

The player is intentionally in still-keyframe cross-dissolve mode. Continuous cap travel, exact camera motion and temporally consistent glass are NOT complete until these ten files are supplied:

- public/source/hero-captlift-16x9.mp4
- public/source/hero-captlift-9x16.mp4
- public/source/hero-pushin-16x9.mp4
- public/source/hero-pushin-9x16.mp4
- public/source/first-light-16x9.mp4
- public/source/first-light-9x16.mp4
- public/source/velvet-hour-16x9.mp4
- public/source/velvet-hour-9x16.mp4
- public/source/wild-ground-16x9.mp4
- public/source/wild-ground-9x16.mp4

Each prompts/video/<clip>.txt specifies exact first/last PNG filenames, duration, output name and rejection checklist. Generate with first/last-frame control; reject warped label text, changed silhouettes, cap intersections, smoky vapour, clipped cap/navigation framing or inconsistent exposure. Preserve a quiet upper navigation zone and bottom reading zone, especially in portrait.

After adding MP4s, run npm run frames, then npm run build. The importer writes public/frames/manifest.json and 0001.webp…0120.webp in each clip/desktop or clip/mobile directory. Existing complete sets are detected automatically by the player. The bare <clip>.mp4 name is also accepted for desktop; portrait needs the -9x16 name. No component change is required.

The extractor targets 1600px desktop / 800px mobile and starts WebP quality at 75. It retries compression to enforce a 2.9MB per-clip budget (five desktop sequences below 15MB total), and fails explicitly if that cannot be met. These quality/size constraints must be re-evaluated on the delivered motion.
Identical decoded frames are deduplicated. The manifest retains all logical frame positions and maps them to canonical WebP files, so repeated frames need not occupy duplicate files or downloads.
