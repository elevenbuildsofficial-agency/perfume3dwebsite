import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const cross = (o, a, b) => (a[0]-o[0])*(b[1]-o[1])-(a[1]-o[1])*(b[0]-o[0]);
function convexHull(points) {
  points.sort((a,b)=>a[0]-b[0]||a[1]-b[1]);
  const lower=[],upper=[];
  for(const p of points){while(lower.length>1&&cross(lower.at(-2),lower.at(-1),p)<=0)lower.pop();lower.push(p);}
  for(const p of points.toReversed()){while(upper.length>1&&cross(upper.at(-2),upper.at(-1),p)<=0)upper.pop();upper.push(p);}
  return lower.slice(0,-1).concat(upper.slice(0,-1));
}
export async function prepareProductGeometry(root=process.cwd()) {
  const geometry=[];
  for(const number of ['01','02','03']){
    const {data,info}=await sharp(path.join(root,`public/images/morrow-${number}.webp`)).ensureAlpha().raw().toBuffer({resolveWithObject:true});
    const points=[];
    for(let y=0;y<info.height;y++){
      let left=info.width,right=-1;
      for(let x=0;x<info.width;x++)if(data[(y*info.width+x)*4+3]>32){left=Math.min(left,x);right=x;}
      if(right>=left)points.push([left,y],[right+1,y+1]);
    }
    geometry.push({aspect:info.width/info.height,hull:convexHull(points).map(([x,y])=>[Number(((x-info.width/2)/info.height).toFixed(6)),Number(((y-info.height/2)/info.height).toFixed(6))])});
  }
  await fs.writeFile(path.join(root,'src/productGeometry.ts'),`// Generated from visible alpha silhouettes by scripts/product-geometry.mjs.\nexport const productGeometry = ${JSON.stringify(geometry)} as const;\n`);
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))await prepareProductGeometry();
