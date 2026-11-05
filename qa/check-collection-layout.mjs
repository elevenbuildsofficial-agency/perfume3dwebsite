import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import ts from 'typescript';
import { createCanvas, loadImage } from '@napi-rs/canvas';

const compile=async name=>ts.transpileModule(await fs.readFile(new URL(`../src/${name}.ts`,import.meta.url),'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText;
const moduleUrl=text=>`data:text/javascript;base64,${Buffer.from(text).toString('base64')}`;
const contentUrl=moduleUrl(await compile('content')),geometryUrl=moduleUrl(await compile('productGeometry')),cinematicUrl=moduleUrl(await compile('cinematic'));
const layoutCode=(await compile('collectionLayout')).replace("'./content'",JSON.stringify(contentUrl)).replace("'./productGeometry'",JSON.stringify(geometryUrl)).replace("'./cinematic'",JSON.stringify(cinematicUrl));
const layoutUrl=moduleUrl(layoutCode),{collectionLayout}=await import(layoutUrl);
const returnCode=(await compile('collectionReturn')).replace("'./collectionLayout'",JSON.stringify(layoutUrl)).replace("'./cinematic'",JSON.stringify(cinematicUrl));
const {collectionReturn,ritualBottlePose}=await import(moduleUrl(returnCode));
for(const [w,h] of [[390,844],[540,720],[1440,900]]){
  const mobile=w<=1000,start=collectionReturn(w,h,mobile,0),end=collectionReturn(w,h,mobile,1),final=collectionLayout(w,h,'final',mobile);
  for(let index=0;index<3;index++)assert.deepEqual(start[index],ritualBottlePose(w,h,mobile,index,2),'The return must start from the exact last ritual frame.');
  for(let index=0;index<3;index++)for(const key of ['x','y','height','angle'])assert(Math.abs(end[index][key]-final[index][key])<1e-8,'Every returning bottle must land in its exact collection slot.');
  const forward=Array.from({length:101},(_,i)=>collectionReturn(w,h,mobile,i/100));
  for(let i=100;i>=0;i--){assert.deepEqual(collectionReturn(w,h,mobile,i/100),forward[i]);assert.equal(forward[i][2].alpha,1,'Green must stay present throughout the return, without a dissolve swap.');}
  for(let index=0;index<3;index++)assert(start[index].height>end[index].height,'Each bottle must recede in depth toward the final row.');
}
const large=await Promise.all(['01','02','03'].map(async n=>loadImage(await fs.readFile(new URL(`../public/images/morrow-${n}.webp`,import.meta.url)))));
const small=await Promise.all(['01','02','03'].map(async n=>loadImage(await fs.readFile(new URL(`../public/images/morrow-${n}-small.webp`,import.meta.url)))));
const layered=await Promise.all(['first-light','velvet-hour','wild-ground'].map(async (id,i)=>{
  try{return await loadImage(await fs.readFile(new URL(`../public/bottles/${id}-capon.webp`,import.meta.url)));}
  catch{return large[i];}
}));
const viewports=[[320,568],[360,650],[375,667],[390,844],[393,852],[430,932],[667,375],[844,390],[932,430],[540,720],[720,540],[768,1024],[1000,800],[1005,800],[1024,768],[1114,720],[1366,768],[1440,900],[1920,720],[1920,1080]];
let checks=0;
for(const [viewportWidth,height] of viewports)for(const gutter of [0,10])for(const scene of ['hero','final','about']){
  // Include the scrollbar gutter independently of the CSS media-query width.
  const width=viewportWidth-gutter,mobile=viewportWidth<=1000,images=scene==='about'?(mobile?small:large):layered;
  const poses=collectionLayout(width,height,scene,mobile),bounds=[];
  for(let index=0;index<3;index++){
    const canvas=createCanvas(width,height),ctx=canvas.getContext('2d'),pose=poses[index],image=images[index];
    const imageWidth=pose.height*image.width/image.height;
    ctx.translate(pose.x,pose.y);ctx.rotate(pose.angle);ctx.drawImage(image,-imageWidth/2,-pose.height/2,imageWidth,pose.height);
    const pixels=ctx.getImageData(0,0,width,height).data;
    let left=width,right=-1,top=height,bottom=-1;
    for(let y=0;y<height;y++)for(let x=0;x<width;x++)if(pixels[(y*width+x)*4+3]>32){left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);}
    assert(right>left,`Missing product ${index}`);bounds[index]={left,right:right+1,top,bottom:bottom+1};
  }
  const [left,centre,right]=[bounds[1],bounds[0],bounds[2]];
  const gaps=[centre.left-left.right,right.left-centre.right];
  const label=`${viewportWidth}x${height} ${scene}`;
  assert(Math.abs((left.left+right.right)/2-width/2)<=2,`${label}: group off centre`);
  assert(Math.abs(gaps[0]-gaps[1])<=2,`${label}: unequal visible gaps ${gaps}`);
  assert(Math.min(...gaps)>=8,`${label}: bottles overlap`);
  assert(Math.max(...bounds.map(b=>b.bottom))-Math.min(...bounds.map(b=>b.bottom))<=2,`${label}: uneven bases`);
  assert(left.left>=8&&right.right<=width-8&&bounds.every(b=>b.top>=0&&b.bottom<height),`${label}: clipped product`);
  checks++;
}
console.log(`${checks} raster checks passed: centred groups, equal gaps, aligned bases and no clipping across phone, iPhone, Duo, tablet and desktop sizes.`);
