import fs from 'node:fs/promises';
import ts from 'typescript';

const source = await fs.readFile(new URL('../src/content.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext } }).outputText;
const { content, worlds } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`);
const rgb = hex => [1, 3, 5].map(index => parseInt(hex.slice(index, index + 2), 16));
const luminance = color => color.map(value => value / 255).map(value => value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4).reduce((sum, value, index) => sum + value * [.2126, .7152, .0722][index], 0);
const ratio = (a, b) => (Math.max(a, b) + .05) / (Math.min(a, b) + .05);
let failures = 0;
for (let i = 0; i < worlds.length; i++) {
  const bg = rgb(worlds[i].bg); const ink = rgb(worlds[i].ink);
  const contrast = ratio(luminance(bg), luminance(ink));
  const secondaryInk = ink.map((value, channel) => value * .9 + bg[channel] * .1);
  const secondaryContrast = ratio(luminance(bg), luminance(secondaryInk));
  console.log(`World ${i}: text ${contrast.toFixed(2)}:1; secondary ${secondaryContrast.toFixed(2)}:1`);
  if (contrast < 4.5 || secondaryContrast < 4.5) failures++;
}
const html = await fs.readFile(new URL('../dist/index.html', import.meta.url), 'utf8');
for (const required of ['<title>', 'name="description"', 'property="og:title"', 'application/ld+json', ...content.products.map(product => product.sku)]) {
  if (!html.includes(required)) { console.error(`Missing SEO output: ${required}`); failures++; }
}
for (const product of content.products) {
  for (const asset of [product.image, product.imageSmall]) {
    try { await fs.access(new URL(`../public${asset}`, import.meta.url)); }
    catch { console.error(`Missing product asset: ${asset}`); failures++; }
  }
}
const aboutHtml = await fs.readFile(new URL('../dist/about/index.html', import.meta.url), 'utf8');
for (const required of [content.about.seoTitle, content.about.seoDescription]) {
  if (!aboutHtml.includes(required)) { console.error(`Missing About metadata: ${required}`); failures++; }
}
for (const asset of ['/videos/morrow-orchard-loop.mp4', '/videos/morrow-orchard-loop-mobile.mp4', '/images/morrow-loop-poster.webp', '/images/morrow-loop-poster-small.webp', ...['citrus-peel','rose-petal','tea-leaf','fig-leaf'].map(id=>`/ingredients/${id}.webp`)]) {
  try { await fs.access(new URL(`../dist${asset}`, import.meta.url)); }
  catch { console.error(`Missing built background asset: ${asset}`); failures++; }
}
if (worlds.length !== content.scene.positions.length) { console.error('Timeline/world counts differ.'); failures++; }
console.log(failures ? `${failures} checks failed` : 'Content contrast, timeline, media and home/About SEO checks passed.');
process.exitCode = failures ? 1 : 0;
