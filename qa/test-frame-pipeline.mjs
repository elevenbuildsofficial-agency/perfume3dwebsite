import fs from 'node:fs/promises';import path from 'node:path';import {spawnSync}from'node:child_process';import ffmpeg from 'ffmpeg-static';
const base=path.resolve('qa/film-pipeline-fixture');await fs.mkdir(path.join(base,'public/source/frames'),{recursive:true});
// A low-detail, short transcode of an existing project clip tests the import contract, not creative motion.
const input=path.join(base,'public/source/hero-captlift-16x9.mp4');const transcode=spawnSync(ffmpeg,['-y','-i',path.resolve('public/videos/morrow-orchard-loop.mp4'),'-vf','scale=160:90','-t','0.4','-an','-c:v','libx264',input],{encoding:'utf8'});if(transcode.status!==0)throw new Error(transcode.stderr);
const result=spawnSync(process.execPath,[path.resolve('scripts/extract-frames.mjs')],{cwd:base,encoding:'utf8'});console.log(result.stdout);if(result.status!==0)throw new Error(result.stderr);const manifest=JSON.parse(await fs.readFile(path.join(base,'public/frames/manifest.json'),'utf8'));const clip=manifest.clips['hero-captlift'].desktop;if(clip.count!==120)throw new Error('Incorrect extraction count');console.log('Real MP4 extraction verified:',clip);

