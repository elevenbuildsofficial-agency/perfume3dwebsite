# Pages and daily rituals verification

Collection-return/type revision: About headings use weight 550 with supporting copy at 500; home, ingredient, lifestyle, Contact and Finder headings use 600 where previously lighter. Mobile material-story text was checked at 390px with no overlap. The outdoor photo uses clean desktop/portrait plates plus the existing live Wild Ground sprite. That same sprite remains opaque as it moves back into its exact final slot; First Light and Velvet Hour follow staggered depth paths into their own slots. Shadows scale and travel with the products. Source-to-final poses, all three decreasing scales, forward/reverse traversal and the existing 120 responsive raster checks pass.

Built-in image generation removed only the baked outdoor bottle and its light/shadow from the existing photographs. Masters: `assets/source/day-outside-clean.png`, `assets/source/day-outside-clean-portrait.png`; delivery: `public/images/day-outside-clean.webp`, `public/images/day-outside-clean-mobile.webp`; exact prompt and input/output mapping: `prompts/collection-return.json`. Originals are preserved. Verification captures: `return-mobile-outside.png`, `return-mobile-half.png`, `return-mobile-row.png`, `about-bold-mobile.png`.

Hero handoff revision: the active renderer now uses one camera/bottle from the lifted atomiser into First Light. The former 30% switch remains a close-up; the camera settles at 72%, with text fully in at 76%. Checked 390 x 844 and 1440 x 900 compositions, matching forward/reverse state at 30%, no camera jump at the renderer boundary, and static reduced motion. Build, cinematic continuity and content checks pass. Captures: `handoff-mobile-30.png`, `handoff-mobile-55.png`, `handoff-mobile-76.png`.

Verified in the production build using the in-app Chromium browser, with desktop and a 390 x 844 iframe viewport. These are browser viewport checks, not physical iPhone hardware measurements.

- Mobile home wordmark: measured top 177.234375px at scroll 0 and scroll 40px; transform remained `none`. The anchor uses `svh`, avoiding browser toolbar height shifts.
- Mobile menu: modal opens with five route links, keyboard navigation reaches Contact, and document overflow is restored after navigation.
- Finder: completed Bright & open / Citrus & petals / A fresh beginning; result is First Light with its correct notes and $140 price. Add to bag updates the shared bag and displays the correct toast. Pure matching checks cover all 27 combinations, incomplete answers and ties.
- Contact: native required/email validation, synthetic test inputs, keyboard and pointer submission; final shared focus handling also verified by completing the form at 390px. The saved state explicitly says no email was sent. Focus restoration keeps inputs at the settled camera position instead of allowing native focus to scroll backward into a clipped scene. No email service or real address is connected.
- Daily rituals: reviewed morning and evening desktop scenes and morning mobile composition. Separate portrait source photographs keep products clear of headings and details. Final motion uses full-frame scene blends and restrained camera drift; leaf/petal cutouts and text wipes were removed following user feedback. Hidden stages have zero opacity so their descendants cannot remain painted over the ending. Confirmed the three-bottle collection returns cleanly.
- Production build and cinematic, content/SEO/media, scent matching checks pass. Existing 120 bottle raster layout cases passed during this revision.

Generated images use the built-in image tool. Six lossless masters are in `assets/source/day-*.png`, WebP delivery assets in `public/images/day-*.webp`, and exact landscape/portrait prompts in `prompts/day-scenes.json` and `prompts/day-portraits.json`. No Higgsfield credits were spent.

Saved screenshots (ignored by Git): `day-desktop-final.png`, `day-desktop-evening.png`, `day-mobile-morning.png`, plus final mobile page proof captures.
