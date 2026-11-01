# Morrow — three perfume products

A local fragrance collection inspired by the photographic finish of [SYKÉA](https://www.scrolltide.co/templates/sykea). Three original designs replace the earlier simplified bottle: First Light, Velvet Hour, and Wild Ground.

The default presentation uses transparent photographic assets on one continuous canvas with depth ordering, scroll choreography, pointer parallax and idle movement. Each scent has a dedicated colour world. The Three.js procedural/GLB renderer is retained as an optional extension; it is not the default artwork.

The sharp natural background plays an eight-second silent MP4 loop, rendered locally from the original orchard, fig-branch and butterfly assets. It includes moving foliage and fluttering wings, with desktop and mobile versions. No Higgsfield generation credits were spent. Video uses muted autoplay, inline playback, looping, a matching poster and a still/CSS fallback. Reduced motion removes the video and ambient animation.

The final “Find your kind of Morrow” section shows all three bottles again. Hero and final typography respect viewport height as well as width, including wide 1920×720 windows.

## Run

Requires Node.js 22+. Run these commands in this folder:

    npm install
    npm run dev

For the production build:

    npm run build
    npm run preview

The static output is dist/. Fonts and product assets are served locally.

The About page is at /about/ and has its own generated HTML entry, title and description. Its continuous five-act story replaces the earlier horizontal slide layout. Scroll drives a glass-arch opening, an oversized bottle macro, an orchard reveal through foreground foliage, a dark glass/wood material study and an orbiting three-bottle finale. Product scale, position and roll, the expanding arch, foliage depth, lighting, captions and scene transitions share a smoothed timeline. It has direct chapter navigation, keyboard controls, cart pause and a reduced-motion stacked version. The product shopping list is removed from About.

The motion direction was studied from the public Scrolltide previews for [Vesper](https://www.scrolltide.co/templates/vesper), [VALMORA](https://www.scrolltide.co/templates/valmora), [Ora](https://www.scrolltide.co/templates/ora) and [SYKÉA](https://www.scrolltide.co/templates/sykea). The implementation and assets are original; no premium template source is used. About's compositions live in src/aboutMotion.ts, its story copy in content.about.film, and its visual layers in AboutJourney.

The persistent bag supports adding products, quantities, removal, subtotal updates and local storage across navigation/reloads. Its glass drawer includes a labelled local reservation preview. It does not process payments or send orders. The shared glass navigation keeps the bag available on both pages.

To re-render the background loop locally:

    npm run render:background

The renderer creates an 8-second, 24 fps H.264 loop at 1920×1080, a 1280×720 mobile version, and matching posters. Current files are about 1.12 MB and 0.34 MB. Originals and the render script are included; no external video service is required.

## Rebrand and change products

Edit src/content.ts. The products array owns names, prices, SKUs, copy, ingredients, palettes and image paths. Those same objects power product panels, navigation, the reservation selector and Product JSON-LD. The file also owns UI copy, fonts and scene settings.

Branding printed on the bottles is part of the generated photograph, so a new brand or bottle design needs new artwork as well as content changes. Full-resolution source PNGs are in assets/source/. Optimized transparent assets are in public/images/. Asset prompts and provenance are in assets/source/PROMPTS.md.

After replacing source assets, run:

    node scripts/prepare-product-assets.mjs

This trims transparent margins, adds consistent padding, encodes large/mobile WebP versions and exports a JPEG social card. It does not invent product detail. Optimized assets are included, so this step is optional for a normal install/build.

Adjust scene.photography for product heights, shared baselines, tilt, parallax and float. The hero, final and About finale use collectionLayout.ts to centre their visible silhouettes with equal edge gaps, fit them to the available width and align their bases. productGeometry.ts is generated from alpha silhouettes; prepare:assets regenerates it after artwork changes. Keep three products and five timeline stages to retain the current composition. Mobile/tablet stacking begins at 1000px in both content.ts and CSS. Outfit Variable is served from public/fonts with an early preload. For a different font, update src/fonts.css, the HTML preload URLs, font assets and content.font.

## Reservation preview

The header/final reservation dialog lets visitors select any product and preselects the currently viewed fragrance when available. Its actual price and SKU are used throughout the flow. Product Add to bag buttons use the separate persistent-cart flow. Native email validation, confirmation, loading/error handling, focus trapping, Escape/backdrop dismissal and focus return are included.

This is a clearly labelled concept preview. Submissions save locally and send no email, order or payment. The bag reservation saves its selected quantities, subtotal and email locally. Set reservation.endpoint to your own service to enable the individual-fragrance waitlist POST containing email and product (selected SKU). A successful 2xx response shows its live confirmation. The cart reservation remains local until a separate order service is implemented. Validate, rate-limit and deduplicate on your server; keep secrets off the client.

## Optional live 3D / GLB mode

Set scene.renderMode to procedural to use the retained Three.js renderer. Its rounded lathe body is content.product.profile; capProfile controls the lid. Lines use r (radius) and y (height); arcs use a centre, radius, start/end angles and sample count. Adjust the inner radius, fill, label, collar/cap heights and centre with silhouette changes. The shaders are in src/shaders.ts.

To use a GLB, place it at public/models/hero.glb and pass heroModelUrl={content.scene.modelUrl} to App from src/SiteApp.tsx. It is centred and normalized to a three-unit height. A missing model falls back to the procedural renderer; failed WebGL uses the photographic collection. Optional renderer resources are disposed on unmount. The default presentation requires no WebGL.

## Accessibility and QA

Native prefers-reduced-motion removes idle/pointer movement and disables Lenis. The query ?motion=reduce previews the branch explicitly. Inactive panels are inert and hidden from assistive technology. Persistent reservation controls remain reachable, focus is visible, and the native dialog traps focus.

Run npm run check:layout to independently rasterize the three bottle silhouettes and verify equal gaps, centring, baselines and clipping at phone, iPhone, Duo, tablet and desktop sizes, with both overlay and space-taking scrollbars.

The development-only viewport helper hosts the real page at exact dimensions:

    /qa/viewport.html?width=390&height=844
    /qa/viewport.html?width=1440&height=900

Append &page=about for About, &production=1 for the 4173 production preview, and &reduced=1 for reduced motion. The helper is excluded from production. See qa/VERIFICATION.md for measured checks and limits.

## Deploy to Vercel

Import this folder from Git, choose Vite, build with npm run build, and set output directory to dist. For a larger repository, set the root directory to 3d website. No environment variables or server runtime are needed for the local reservation preview.

Set seo.siteUrl to the real production origin for canonical URLs and absolute social/product image URLs. Connect the reservation service before using this as a live store. This project has not been deployed.
