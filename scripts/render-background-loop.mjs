import fs from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { createCanvas, loadImage } from '@napi-rs/canvas';
import ffmpeg from 'ffmpeg-static';
import sharp from 'sharp';

const root = process.cwd();
const width = 1920; const height = 1080; const fps = 24; const seconds = 8; const frames = fps * seconds;
const [orchard, branch, butterfly] = await Promise.all([
  loadImage(path.join(root, 'assets/source/morrow-orchard-sharp.png')),
  loadImage(path.join(root, 'assets/source/morrow-fig-branch.png')),
  loadImage(path.join(root, 'assets/source/morrow-butterfly.png')),
]);
await fs.mkdir(path.join(root, 'public/videos'), { recursive: true });
const output = path.join(root, 'public/videos/morrow-orchard-loop.mp4');
const mobile = path.join(root, 'public/videos/morrow-orchard-loop-mobile.mp4');
const canvas = createCanvas(width, height); const ctx = canvas.getContext('2d');
const tau = Math.PI * 2;
let log = '';
const encoder = spawn(ffmpeg, ['-y', '-f', 'rawvideo', '-pixel_format', 'rgba', '-video_size', `${width}x${height}`, '-framerate', String(fps), '-i', 'pipe:0', '-an', '-c:v', 'libx264', '-preset', 'fast', '-crf', '25', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', output], { windowsHide: true, stdio: ['pipe', 'ignore', 'pipe'] });
encoder.stderr.on('data', chunk => { log = (log + chunk.toString()).slice(-5000); });
const complete = new Promise((resolve, reject) => { encoder.on('error', reject); encoder.on('close', code => code === 0 ? resolve() : reject(new Error(log))); });

function drawBranch(x, y, size, angle, flip) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(angle); if (flip) ctx.scale(-1, 1);
  ctx.globalAlpha = 0.90; ctx.drawImage(branch, 0, 0, size, size * branch.height / branch.width); ctx.restore();
}

function drawButterfly(x, y, size, angle, phase, opacity) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(angle); ctx.globalAlpha = opacity;
  const wing = 0.18 + 0.82 * Math.abs(Math.sin(phase));
  const half = butterfly.width / 2; const wingWidth = size / 2 * wing;
  ctx.drawImage(butterfly, 0, 0, half, butterfly.height, -wingWidth, -size / 2, wingWidth, size);
  ctx.drawImage(butterfly, half, 0, half, butterfly.height, 0, -size / 2, wingWidth, size);
  ctx.drawImage(butterfly, butterfly.width * .45, 0, butterfly.width * .10, butterfly.height, -size * .05, -size / 2, size * .10, size);
  ctx.restore();
}

for (let frame = 0; frame < frames; frame++) {
  const time = frame / fps; const cycle = tau * time / seconds;
  ctx.clearRect(0, 0, width, height);
  ctx.drawImage(orchard, 0, 0, width, height);
  drawBranch(-70, -95, 540, -0.025 + Math.sin(cycle) * .035, false);
  drawBranch(width + 85, -125, 465, 0.02 + Math.sin(cycle + 1.7) * .03, true);
  ctx.fillStyle = `rgba(255,252,226,${.012 + .009 * Math.sin(cycle + .3)})`; ctx.fillRect(0, 0, width, height);
  for (let index = 0; index < 3; index++) {
    const progress = (time / seconds + index * .31) % 1;
    const backwards = index === 1;
    const x = backwards ? width + 120 - progress * (width + 240) : -120 + progress * (width + 240);
    const y = height * ([.25, .46, .64][index] + .085 * Math.sin(progress * tau + index));
    const angle = (backwards ? Math.PI : 0) + Math.sin(progress * tau * 2 + index) * .36;
    const opacity = Math.min(1, progress * 10, (1 - progress) * 10) * [.95, .80, .68][index];
    drawButterfly(x, y, [48, 36, 27][index], angle, tau * 6 * time + index, opacity);
  }
  if (frame === 0) {
    const poster = canvas.toBuffer('image/png');
    await fs.writeFile(path.join(root, 'assets/source/morrow-loop-poster.png'), poster);
    await sharp(poster).webp({ quality: 84 }).toFile(path.join(root, 'public/images/morrow-loop-poster.webp'));
    await sharp(poster).resize({ width: 1000 }).webp({ quality: 81 }).toFile(path.join(root, 'public/images/morrow-loop-poster-small.webp'));
  }
  const rgba = ctx.getImageData(0, 0, width, height).data;
  if (!encoder.stdin.write(Buffer.from(rgba.buffer, rgba.byteOffset, rgba.byteLength))) await once(encoder.stdin, 'drain');
  if (frame % 48 === 0) console.log(`Rendering orchard loop: ${Math.round(frame / frames * 100)}%`);
}
encoder.stdin.end(); await complete;
await new Promise((resolve, reject) => {
  const process = spawn(ffmpeg, ['-y', '-i', output, '-an', '-vf', 'scale=1280:720', '-c:v', 'libx264', '-preset', 'fast', '-crf', '28', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', mobile], { windowsHide: true, stdio: ['ignore', 'ignore', 'pipe'] });
  let error = ''; process.stderr.on('data', chunk => { error = (error + chunk.toString()).slice(-3000); });
  process.on('error', reject); process.on('close', code => code === 0 ? resolve() : reject(new Error(error)));
});
for (const file of [output, mobile]) console.log(`${path.relative(root, file)}: ${((await fs.stat(file)).size / 1024 / 1024).toFixed(2)} MB`);
console.log('8-second silent loop rendered locally. No generation credits used.');
