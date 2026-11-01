# Morrow bottle assets

The current build uses the existing transparent photographic WebPs. It separates
the photographed wooden caps at registered cut lines and draws a small brass
atomiser behind them. This preserves the original product design, but the hidden
nozzle and cap underside are approximations, not recovered photography. The
two-dimensional lens move cannot reveal a new viewing angle through the glass.

## Exactly what is missing

For each product, provide **either** its GLB **or** all three registered PNGs.
None of these files exists in the current checkout:

| Product | Preferred GLB | Alternative PNG layers (all three) |
| --- | --- | --- |
| First Light | `public/models/first-light.glb` | `public/bottles/first-light-capon.png`, `public/bottles/first-light-capoff.png`, `public/bottles/first-light-cap.png` |
| Velvet Hour | `public/models/velvet-hour.glb` | `public/bottles/velvet-hour-capon.png`, `public/bottles/velvet-hour-capoff.png`, `public/bottles/velvet-hour-cap.png` |
| Wild Ground | `public/models/wild-ground.glb` | `public/bottles/wild-ground-capon.png`, `public/bottles/wild-ground-capoff.png`, `public/bottles/wild-ground-cap.png` |

GLBs need separate nodes named `body` and `cap`; `nozzle` is optional. Name
materials with `glass`, `liquid`, `brass`/`metal` and `wood` so the PBR adapter
can apply the corresponding transmission, absorption and roughness. Keep the
product upright and preserve its natural proportions. The GLB adapter renders
registered body and cap passes using an environment derived from the orchard
plate, with a warm sun and stone bounce. The photographic compositor owns the
shared contact/cast shadows and lens transition.

PNG layers must all have identical dimensions and registration: the cap-only PNG
retains its position on the full bottle canvas, and the cap-off PNG includes the
actual nozzle, collar, internal glass and liquid. Avoid baked floor shadows.
Use the current product canvas and cap positions as the registration reference
(`src/bottleAssets.ts`).

## Swap

`src/bottleAssets.ts`: `export const BOTTLE_SOURCE: 'auto' | 'photo' = 'auto';`

That single setting enables automatic selection: named GLB → complete PNG set →
original photograph. Add the files, then restart Vite or run `npm run build`.
No component or timeline change is necessary. Set the same line to `'photo'`
to pin the original photography. Invalid replacement assets fall back safely.

## Plate

`public/images/morrow-orchard.webp` is the existing clean, bottle-free plate.
The home scene uses that photograph directly, rather than the independently
moving video plate, so the stone and bottles share one coordinate system. Hills,
trees, stone and foreground foliage use separate depth transforms. The About
story retains its existing cinematic composition and copy.
