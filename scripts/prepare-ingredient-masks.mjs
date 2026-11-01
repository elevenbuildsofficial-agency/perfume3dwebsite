import sharp from 'sharp';
import fs from 'node:fs/promises';

// Trace the existing photographic alpha, keeping the petal/leaf lobes rather
// than using a generic circular slideshow wipe. Coordinates are normalized to
// an inscribed radius so the final aperture always covers the viewport.
const masks=[];
for(const id of ['rose-petal','fig-leaf']){
  const {data,info}=await sharp(`public/ingredients/${id}.webp`).resize(400,400,{fit:'fill'}).ensureAlpha().raw().toBuffer({resolveWithObject:true});
  const cx=info.width*(id==='fig-leaf'?.48:.5),cy=info.height*(id==='fig-leaf'?.58:.5),points=[];
  const alpha=(x,y)=>x<0||y<0||x>=info.width||y>=info.height?0:data[(Math.floor(y)*info.width+Math.floor(x))*4+3];
  if(alpha(cx,cy)<250)throw new Error(`${id}: choose an opaque optical centre`);
  for(let ray=0;ray<32;ray++){
    const angle=ray/32*Math.PI*2-Math.PI/2;let radius=1;
    while(radius<600&&alpha(cx+Math.cos(angle)*radius,cy+Math.sin(angle)*radius)>128)radius++;
    points.push([Math.cos(angle)*radius,Math.sin(angle)*radius]);
  }
  const minimum=Math.min(...points.map(([x,y])=>Math.hypot(x,y)));
  masks.push(points.map(([x,y])=>{
    // Compress long lobes optically so the reveal travels across the lens
    // rather than one leaf tip covering the whole screen too early.
    const radius=Math.hypot(x,y),r=(radius/minimum)**.45;
    return [Number((x/radius*r).toFixed(5)),Number((y/radius*r).toFixed(5))];
  }));
}
await fs.writeFile('src/ingredientMasks.ts',`// Derived from the photographic alpha by scripts/prepare-ingredient-masks.mjs.\nexport const ingredientMasks = ${JSON.stringify(masks)} as const;\n`);
