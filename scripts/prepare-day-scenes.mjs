import sharp from 'sharp';
import { existsSync } from 'node:fs';
for(const id of ['morning','evening','outside']){
  const source=`assets/source/day-${id}.png`,meta=await sharp(source).metadata();
  await sharp(source).resize({width:1920,withoutEnlargement:true}).webp({quality:87,effort:6}).toFile(`public/images/day-${id}.webp`);
  const width=Math.round(meta.height*9/16),left=Math.max(0,Math.min(meta.width-width,Math.round(meta.width*.62-width/2)));
  const portrait=`assets/source/day-${id}-portrait.png`;
  const mobile=existsSync(portrait)?sharp(portrait):sharp(source).extract({left,top:0,width,height:meta.height});
  await mobile.resize({width:900,withoutEnlargement:true}).webp({quality:87,effort:6}).toFile(`public/images/day-${id}-mobile.webp`);
}
