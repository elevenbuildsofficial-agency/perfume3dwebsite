import fs from 'node:fs/promises';
import sharp from 'sharp';

// Register photographic layers to the existing product canvases so the original
// continuous choreography, contact points and responsive spacing stay intact.
const ids=['first-light','velvet-hour','wild-ground'];
const cuts=[.309,.345,.270];
await fs.mkdir('public/bottles',{recursive:true});
for(const [i,id] of ids.entries()){
  const original=`public/images/morrow-0${i+1}.webp`;
  const closedPath=`assets/source/${id}-premium-capon.png`;
  const openPath=`assets/source/${id}-premium-capoff.png`;
  const target=await sharp(original).metadata(),source=await sharp(closedPath).metadata();
  const trimmed=await sharp(closedPath).trim({background:'#00000000',threshold:10}).png().toBuffer({resolveWithObject:true});
  const reference=await sharp(original).trim({background:'#00000000',threshold:10}).png().toBuffer({resolveWithObject:true});
  const left=-reference.info.trimOffsetLeft,top=-reference.info.trimOffsetTop;
  const crop={left:-trimmed.info.trimOffsetLeft,top:-trimmed.info.trimOffsetTop,width:trimmed.info.width,height:trimmed.info.height};
  const blank=()=>sharp({create:{width:target.width,height:target.height,channels:4,background:'#00000000'}});
  const register=async path=>{
    const full=await sharp(path).resize(source.width,source.height,{fit:'fill'}).png().toBuffer();
    const layer=await sharp(full).extract(crop).resize(reference.info.width,reference.info.height,{fit:'fill'}).png().toBuffer();
    return blank().composite([{input:layer,left,top}]).png().toBuffer();
  };
  const closed=await register(closedPath),open=await register(openPath);
  const cut=Math.round(target.height*cuts[i]);
  const cap=await sharp(closed).extract({left:0,top:0,width:target.width,height:cut}).png().toBuffer();
  // Keep the original closed photograph below the brass shoulder, ensuring no
  // label/glass re-generation flicker when the cap begins moving.
  const join=Math.round(target.height*(cuts[i]+.052));
  const nozzle=await sharp(open).extract({left:0,top:0,width:target.width,height:join}).png().toBuffer();
  const lower=await sharp(closed).extract({left:0,top:join,width:target.width,height:target.height-join}).png().toBuffer();
  await sharp(closed).png({compressionLevel:9}).toFile(`public/bottles/${id}-capon.png`);
  await blank().composite([{input:nozzle,left:0,top:0},{input:lower,left:0,top:join}]).png({compressionLevel:9}).toFile(`public/bottles/${id}-capoff.png`);
  await blank().composite([{input:cap,left:0,top:0}]).png({compressionLevel:9}).toFile(`public/bottles/${id}-cap.png`);
  for(const part of ['capon','capoff','cap']){
    await sharp(`public/bottles/${id}-${part}.png`).webp({quality:92,alphaQuality:100,effort:6}).toFile(`public/bottles/${id}-${part}.webp`);
  }
  console.log(`${id}: ${target.width}×${target.height}, registered cap/body layers`);
}
