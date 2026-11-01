import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import ts from 'typescript';
import { createCanvas, loadImage } from '@napi-rs/canvas';

const compile=async name=>ts.transpileModule(await fs.readFile(new URL(`../src/${name}.ts`,import.meta.url),'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText;
const moduleUrl=text=>`data:text/javascript;base64,${Buffer.from(text).toString('base64')}`;
const contentUrl=moduleUrl(await compile('content')),geometryUrl=moduleUrl(await compile('productGeometry'));
const layoutCode=(await compile('collectionLayout')).replace("'./content'",JSON.stringify(contentUrl)).replace("'./productGeometry'",JSON.stringify(geometryUrl));
const {collectionLayout}=await import(moduleUrl(layoutCode));
const large=await Promise.all(['01','02','03'].map(async n=>loadImage(await fs.readFile(new URL(`../public/images/morrow-${n}.webp`,import.meta.url)))));
const small=await Promise.all(['01','02','03'].map(async n=>loadImage(await fs.readFile(new URL(`../public/images/morrow-${n}-small.webp`,import.meta.url)))));
const viewports=[[320,568],[360,650],[375,667],[390,844],[393,852],[430,932],[667,375],[844,390],[932,430],[540,720],[720,540],[768,1024],[1000,800],[1005,800],[1024,768],[1114,720],[1366,768],[1440,900],[1920,720],[1920,1080]];
let checks=0;
for(const [viewportWidth,height] of viewports)for(const gutter of [0,10])for(const scene of ['hero','final','about']){
  // Include the scrollbar gutter independently of the CSS media-query width.
  const width=viewportWidth-gutter,mobile=viewportWidth<=1000,images=mobile?small:large;
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
