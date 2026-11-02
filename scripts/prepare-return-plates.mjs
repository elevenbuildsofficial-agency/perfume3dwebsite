import sharp from 'sharp';
for(const [source,target,width] of [['day-outside-clean.png','day-outside-clean.webp',1920],['day-outside-clean-portrait.png','day-outside-clean-mobile.webp',900]]) {
  const meta=await sharp(`assets/source/${source}`).metadata();
  await sharp(`assets/source/${source}`).resize({width,withoutEnlargement:true}).webp({quality:88,effort:6}).toFile(`public/images/${target}`);
  console.log(`${source}: ${meta.width} x ${meta.height}`);
}
