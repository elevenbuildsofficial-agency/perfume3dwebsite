import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import ffmpeg from 'ffmpeg-static';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
const root=process.cwd(),source=path.join(root,'public/source'),output=path.join(root,'public/frames');
await fs.mkdir(path.join(output,'posters'),{recursive:true});
for(const file of await fs.readdir(path.join(source,'frames'))){if(!file.endsWith('.png'))continue;const mobile=file.includes('-9x16'),name=file.replace(/-(16x9|9x16)\.png$/,'');await sharp(path.join(source,'frames',file)).resize({width:mobile?800:1600,withoutEnlargement:true}).webp({quality:80}).toFile(path.join(output,'posters',`${name}-${mobile?'mobile':'desktop'}.webp`));}
const manifest={version:1,clips:{}};
for(const id of ['hero-captlift','hero-pushin','first-light','velvet-hour','wild-ground'])for(const [variant,ratio,width]of[['desktop','16x9',1600],['mobile','9x16',800]]){
 const candidates=[`${id}-${ratio}.mp4`,...(variant==='desktop'?[`${id}.mp4`]:[])];let input;
 for(const file of candidates){try{await fs.access(path.join(source,file));input=path.join(source,file);break;}catch{}}
 const directory=path.join(output,id,variant);if(input){await fs.mkdir(directory,{recursive:true});const probe=spawnSync(ffmpeg,['-i',input],{encoding:'utf8'}).stderr;const match=/Duration: (\d+):(\d+):([\d.]+)/.exec(probe);if(!match)throw new Error(`Unreadable clip ${input}`);const seconds=Number(match[1])*3600+Number(match[2])*60+Number(match[3]);for(const old of await fs.readdir(directory))if(/^\d{4}\.webp$/.test(old))await fs.unlink(path.join(directory,old));let quality=75;
  for(let attempt=0;attempt<4;attempt++){const result=spawnSync(ffmpeg,['-y','-i',input,'-vf',`tpad=stop_mode=clone:stop_duration=1,fps=${120/seconds},scale=${width}:-2`,'-frames:v','120','-c:v','libwebp','-quality',String(quality),'-compression_level','5',path.join(directory,'%04d.webp')],{encoding:'utf8'});if(result.status!==0)throw new Error(result.stderr);const files=(await fs.readdir(directory)).filter(f=>/^\d{4}\.webp$/.test(f)).sort();const hashes=new Map(),refs=[],duplicates=[];let total=0;for(const file of files){const buffer=await fs.readFile(path.join(directory,file));const hash=createHash('sha256').update(buffer).digest('hex');if(!hashes.has(hash)){hashes.set(hash,file);total+=buffer.length;}else duplicates.push(file);refs.push('/frames/'+id+'/'+variant+'/'+hashes.get(hash));}if(total<=2.9*1024*1024){manifest.clips[id]??={};manifest.clips[id][variant]={count:files.length,base:`/frames/${id}/${variant}`,bytes:total,frames:refs};for(const file of duplicates)await fs.unlink(path.join(directory,file));break;}quality-=15;if(attempt===3)throw new Error(`${id}/${variant} exceeds the 2.9MB per-clip budget (14.5MB aggregate desktop). Reduce source complexity.`);}
 }else{try{const files=(await fs.readdir(directory)).filter(f=>/^\d{4}\.webp$/.test(f)).sort();if(files.length){manifest.clips[id]??={};manifest.clips[id][variant]={count:files.length,base:`/frames/${id}/${variant}`};}}catch{}}
}
await fs.writeFile(path.join(output,'manifest.json'),JSON.stringify(manifest,null,2));console.log('Prepared posters and available motion sequences.',manifest);

