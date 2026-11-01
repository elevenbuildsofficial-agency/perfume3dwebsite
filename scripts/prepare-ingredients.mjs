import fs from 'node:fs/promises';
import sharp from 'sharp';

await fs.mkdir('public/ingredients',{recursive:true});
for(const id of ['citrus-peel','rose-petal','tea-leaf','fig-leaf']){
  const path=`assets/source/ingredient-${id}.png`;
  const metadata=await sharp(path).metadata();
  if(!metadata.hasAlpha)throw new Error(`${id} must have real transparency`);
  await sharp(path).resize({width:1200,height:1200,fit:'inside',withoutEnlargement:true}).webp({quality:90,alphaQuality:100,effort:6}).toFile(`public/ingredients/${id}.webp`);
  await sharp(path).resize({width:450,height:450,fit:'inside'}).png().toFile(`qa/ingredient-${id}.png`);
}
