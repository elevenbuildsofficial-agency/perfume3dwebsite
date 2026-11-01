import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import ts from 'typescript';
import { prepareProductGeometry } from './product-geometry.mjs';

const root = process.cwd();
await fs.mkdir(path.join(root, 'public/images'), { recursive: true });
for (const [number, source] of [
  ['01', 'morrow-hero-photoreal.png'],
  ['02', 'morrow-velvet-hour.png'],
  ['03', 'morrow-wild-ground.png'],
]) {
  const input = path.join(root, 'assets/source', source);
  try { await fs.access(input); } catch { continue; }
  // Alpha trim, consistent transparent padding and encoding only; visual design
  // and product detail come entirely from the generated source photographs.
  const trimmed = await sharp(input).trim({ threshold: 12 }).toBuffer();
  const object = await sharp(trimmed).resize({ width: 900, height: 1200, fit: 'inside' }).toBuffer();
  await sharp(object).extend({ top: 45, bottom: 45, left: 45, right: 45, background: { r: 0, g: 0, b: 0, alpha: 0 } }).webp({ quality: 90, alphaQuality: 100, effort: 6 }).toFile(path.join(root, 'public/images', `morrow-${number}.webp`));
  await sharp(path.join(root, 'public/images', `morrow-${number}.webp`)).resize({ height: 720 }).webp({ quality: 87, alphaQuality: 100, effort: 6 }).toFile(path.join(root, 'public/images', `morrow-${number}-small.webp`));
  const metadata = await sharp(path.join(root, 'public/images', `morrow-${number}.webp`)).metadata();
  const info = await fs.stat(path.join(root, 'public/images', `morrow-${number}.webp`));
  console.log(`No. ${number}: ${metadata.width}×${metadata.height}, ${Math.round(info.size / 1024)} KB`);
}

const source = await fs.readFile(path.join(root, 'src/content.ts'), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext } }).outputText;
const { content } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`);
const orchardSource = path.join(root, 'assets/source/morrow-orchard-sharp.png');
try {
  await fs.access(orchardSource);
  await sharp(orchardSource).resize({ width: 1920, withoutEnlargement: true }).webp({ quality: 83, effort: 6 }).toFile(path.join(root, 'public/images/morrow-orchard.webp'));
  await sharp(orchardSource).resize({ width: 1000, withoutEnlargement: true }).webp({ quality: 80, effort: 6 }).toFile(path.join(root, 'public/images/morrow-orchard-small.webp'));
} catch (error) { if (error.code !== 'ENOENT') throw error; }
for (const [source, output, width] of [
  ['morrow-fig-branch.png', 'morrow-fig-branch.webp', 900],
  ['morrow-butterfly.png', 'morrow-butterfly.webp', 256],
]) {
  const input = path.join(root, 'assets/source', source);
  try {
    await fs.access(input);
    const pipeline = sharp(input);
    const resized = source.includes('butterfly')
      ? pipeline.resize({ width, height: width, fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      : pipeline.resize({ width, withoutEnlargement: true });
    await resized.webp({ quality: 88, alphaQuality: 100, effort: 6 }).toFile(path.join(root, 'public/images', output));
  } catch (error) { if (error.code !== 'ENOENT') throw error; }
}
const escape = text => text.replace(/&/g, '&amp;').replace(/</g, '&lt;');
const card = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"><rect width="1200" height="630" fill="${content.hero.palette.bg}"/><text x="600" y="390" text-anchor="middle" fill="${content.hero.palette.ink}" font-family="Arial,sans-serif" font-size="265" letter-spacing="-22">${escape(content.brand)}</text><text x="55" y="570" fill="${content.hero.palette.ink}" font-family="Arial,sans-serif" font-size="23">${escape(content.tagline)}</text><text x="1145" y="570" text-anchor="end" fill="${content.hero.palette.ink}" font-family="Arial,sans-serif" font-size="17">${escape(content.offer.descriptor)} · ${escape(content.offer.volume)}</text></svg>`);
const layers = [];
for (const [index, centerX, top, height] of [[1, 360, 185, 330], [2, 850, 140, 380], [0, 600, 90, 440]]) {
  const input = await sharp(path.join(root, 'public', content.products[index].image)).resize({ height }).toBuffer();
  const metadata = await sharp(input).metadata();
  layers.push({ input, left: Math.round(centerX - metadata.width / 2), top });
}
await sharp(card).composite(layers).jpeg({ quality: 90 }).toFile(path.join(root, 'public/images/morrow-collection.jpg'));
console.log('Collection social card exported.');
await prepareProductGeometry(root);
