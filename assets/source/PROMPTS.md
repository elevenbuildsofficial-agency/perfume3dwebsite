# Original asset design prompts

All selected source assets were created with the built-in image generation tool, not a CLI/API fallback. The direction references the material realism of Scrolltide's SYKÉA preview; no reference brand imagery is reused. Sharp performs alpha trimming, padding, resizing, encoding and social-card layout only.

## No. 01 — First Light

Use case: product-mockup. One centred, fully visible, upright photographic perfume cutout with genuine alpha. Original Morrow No. 01, 50 ml eau de parfum. Weighty sculptural flattened oval clear glass flacon with thick walls and a heavy rounded base, pale straw-gold perfume at about 75% fill, sculptural shoulders and short neck. Large rounded natural walnut stopper with intricate flowing grain, subtle engraved lowercase m, narrow antique brass collar. Understated dark olive printing directly on glass: Morrow, No. 01, Eau de parfum, 50 ml. Real refraction, dark amber/olive edge definition, minute manufacturing imperfections, realistic meniscus and sharp soft-window highlights. Premium daylight studio photograph, Hasselblad/85 mm lens, soft upper-left key, black flags, warm right bounce. No paper label, fake rim glow, plastic, props, scenery, UI or extra products.

Source: morrow-hero-photoreal.png. Published: /images/morrow-01.webp and morrow-01-small.webp.

## No. 02 — Velvet Hour

Use case: product-mockup. One fully visible premium photographic cutout, genuine transparent alpha, slight three-quarter angle. Distinct broad low rectangular jewel-like flacon with deeply rounded bevelled corners, faceted shoulders, thick smoky burgundy crystal, dark cherry-wine perfume and a substantial clear base. A dark polished walnut rounded cuboid stopper with real tight grain, softly chamfered edges and an engraved m; narrow antique brass collar. Fine warm ivory printing directly on glass: Morrow, No. 02, Velvet Hour, Eau de parfum, 50 ml. True glass refraction, bevelled edge highlights, visible wood pores and realistic liquid depth. Hasselblad/85 mm daylight product photograph with soft upper-left window, black flags and warm bounce. No sticker, plastic, cartoon, neon, excessive glow, props or background.

Source: morrow-velvet-hour.png. Published: /images/morrow-02.webp and morrow-02-small.webp.

## No. 03 — Wild Ground

Use case: product-mockup. One fully visible centred photographic perfume cutout, genuine transparent alpha. A distinct slender rounded/faceted apothecary flacon, gently tapered olive-green glass, substantial clear crystal base, sculptural shoulders, golden-olive liquid at 75% fill. Warm natural light oak cylindrical stopper with rounded bevel, visible end-grain rings and pores, subtle engraved m and an aged brass collar. Fine ivory-gold printing directly on glass: Morrow, No. 03, Wild Ground, Eau de parfum, 50 ml. Authentic thick glass, meniscus, edge refractions, minute imperfections and carefully shaped soft-window highlights. Hasselblad/85 mm daylight studio photograph, upper-left key and warm bounce. No opaque cosmetic bottle, paper label, plastic, toy finish, scenery, props or UI.

Source: morrow-wild-ground.png. Published: /images/morrow-03.webp and morrow-03-small.webp.

## Orchard environment

Use case: photorealistic-natural. Wide landscape 16:9 background only. A real sunlit Mediterranean fig orchard viewed from a pale weathered limestone terrace, shallow depth of field and authentic morning light. Fig and olive leaves at the upper corners and margins; calm luminous ivory, sage and pale gold across the centre, with space for bottles and dark type. Soft natural bokeh, gentle irregular dappled sunlight and organic leaf shadows, tactile limestone in the lower third. Real campaign photography rather than an abstract gradient. No products, people, text, logos, flowers, pedestals, UI or fantasy glow. Intended for subtle parallax and moving leaf-shadow animation in the website.

Source: morrow-orchard.png. Published: /images/morrow-orchard.webp and morrow-orchard-small.webp.

## Sharp orchard revision

The user requested a sharp environment without background blur. Generate a 16:9 real Mediterranean fig/olive orchard from a pale limestone terrace, deep focus at f/11 with a 35 mm landscape lens. Crisp veined foreground leaves, distinct orchard trees, cypress and hills, detailed stone, clear late-morning daylight and believable dappled shadows. Open centre for products and text. No optical blur, bokeh, haze, soft-focus filter, products, people, UI, labels or fantasy glow.

Current source: morrow-orchard-sharp.png. It replaces the soft-focus environment in the published WebP files; the earlier source is retained for provenance.

## Animated fig branch

Generate one real fig branch on genuine transparent alpha, entering diagonally from upper-left with five to seven palmate leaves, thin brown twig, airy gaps, sharp natural leaf veins and texture, olive/fresh-green variation and subtle imperfections. Pin-sharp daylight macro photography. No fruit, insects, scenery, vase, soil, hands, text, plastic CGI or blur. Designed to sway naturally from the branch root in the webpage.

Source: morrow-fig-branch.png. Published: /images/morrow-fig-branch.webp.

## Flying butterfly

Generate one photoreal painted lady butterfly, precisely top-down with horizontal spread wings and vertical centred body, head at top. Warm orange, cream and black markings, realistic veins, dark borders, antennae and body, natural daylight macro detail, symmetrical balanced composition with transparent alpha. No motion blur, illustration, plant, scenery, shadow, text or additional insects. The wing halves are animated separately in CSS while the whole butterfly follows a flight path.

Source: morrow-butterfly.png. Published: /images/morrow-butterfly.webp.

## Local background video

scripts/render-background-loop.mjs composites the sharp orchard, fig branches and butterfly wings with periodic motion using Canvas and FFmpeg. It produces an eight-second 24 fps H.264 loop at 1920×1080 and 1280×720, plus matching posters. The motion and video encoding are authored locally from the original assets; no Higgsfield video was generated and no Higgsfield credits were spent.
