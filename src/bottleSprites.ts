import { content } from './content';
import { BOTTLE_SOURCE, bottleAssets, bottleRegistration } from './bottleAssets';

export type BottleSprites = { closed: CanvasImageSource; body: CanvasImageSource; cap: CanvasImageSource; cast?: CanvasImageSource; bodyCast?: CanvasImageSource; capCast?: CanvasImageSource; shadow?: CanvasImageSource; width: number; height: number; approximate: boolean };
const loadImage = (src: string) => new Promise<HTMLImageElement>((resolve, reject) => {
  const image=new Image(); image.decoding='async'; image.onload=()=>resolve(image); image.onerror=()=>reject(new Error(`Cannot load ${src}`)); image.src=src;
});
const surface = (width: number, height: number) => {
  const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
  return { canvas, ctx:canvas.getContext('2d')! };
};

function grade(image: CanvasImageSource, width: number, height: number, part: 'body'|'cap'|'closed') {
  const {canvas,ctx}=surface(width,height);
  ctx.drawImage(image,0,0,width,height);
  ctx.globalCompositeOperation='source-atop';
  ctx.fillStyle='rgba(204,172,113,.045)';ctx.fillRect(0,0,width,height);
  if(part!=='cap') {
    const bounce=ctx.createLinearGradient(0,height*.79,0,height);
    bounce.addColorStop(0,'rgba(224,198,151,0)');bounce.addColorStop(.72,'rgba(229,205,162,.13)');bounce.addColorStop(1,'rgba(236,216,178,.24)');
    ctx.fillStyle=bounce;ctx.fillRect(0,height*.79,width,height*.21);
    const rim=ctx.createLinearGradient(0,0,width,0);
    rim.addColorStop(0,'rgba(255,239,188,.20)');rim.addColorStop(.17,'rgba(255,239,188,.035)');rim.addColorStop(.65,'rgba(255,239,188,0)');rim.addColorStop(1,'rgba(57,66,42,.08)');
    ctx.fillStyle=rim;ctx.fillRect(0,0,width,height);
  }
  return canvas;
}

function withCastShadows(sprite: BottleSprites): BottleSprites {
  const silhouette=(source:CanvasImageSource)=>{
    const {canvas,ctx}=surface(sprite.width,sprite.height);
    ctx.drawImage(source,0,0,sprite.width,sprite.height);
    ctx.globalCompositeOperation='source-in';
    ctx.fillStyle='rgba(81,75,49,.32)';ctx.fillRect(0,0,sprite.width,sprite.height);
    return canvas;
  };
  return {...sprite,cast:silhouette(sprite.closed),bodyCast:silhouette(sprite.body),capCast:silhouette(sprite.cap)};
}

export async function loadBottleSprites(index: number): Promise<BottleSprites> {
  return withCastShadows(await loadSprites(index));
}

async function loadSprites(index: number): Promise<BottleSprites> {
  const asset=bottleAssets[index],r=bottleRegistration[index];
  if(BOTTLE_SOURCE==='auto'&&asset.mode==='glb'&&asset.model) {
    try { const {renderModelSprites}=await import('./modelSprites');return await renderModelSprites(asset.model,index); }
    catch(error) { console.warn('Model could not be prepared; using the original photograph.',error); }
  }
  if(BOTTLE_SOURCE==='auto'&&asset.mode==='layers'&&asset.capoff&&asset.cap) {
    try {
      const [closed,body,cap]=await Promise.all([loadImage(asset.capon),loadImage(asset.capoff),loadImage(asset.cap)]);
      if([body,cap].some(image=>image.width!==closed.width||image.height!==closed.height))throw new Error('Bottle layers must share a registered canvas.');
      return {closed:grade(closed,closed.width,closed.height,'closed'),body:grade(body,closed.width,closed.height,'body'),cap:grade(cap,closed.width,closed.height,'cap'),width:closed.width,height:closed.height,approximate:false};
    } catch(error) { console.warn('Invalid layered asset set; using the original photograph.',error); }
  }
  const image=await loadImage(content.products[index].image);
  const width=image.naturalWidth,height=image.naturalHeight,cut=Math.round(height*r.capBottom);
  const body=surface(width,height),cap=surface(width,height);
  body.ctx.drawImage(image,0,cut,width,height-cut,0,cut,width,height-cut);
  cap.ctx.drawImage(image,0,0,width,cut,0,0,width,cut);
  // This retains the real wood/glass/brass photography; it cannot recover the
  // hidden atomiser. The small brass atomiser is the documented asset fallback.
  const nx=width*r.nozzle[0],ny=height*r.nozzle[1],nw=width*.085,nh=height*.042;
  const metal=body.ctx.createLinearGradient(nx-nw/2,0,nx+nw/2,0);
  metal.addColorStop(0,'#796038');metal.addColorStop(.23,'#dac490');metal.addColorStop(.4,'#fff1bf');metal.addColorStop(.63,'#bca16b');metal.addColorStop(1,'#6a5232');
  body.ctx.fillStyle=metal;body.ctx.fillRect(nx-nw/2,ny-nh,nw,nh);
  body.ctx.beginPath();body.ctx.ellipse(nx,ny-nh,nw/2,nh*.13,0,0,Math.PI*2);body.ctx.fillStyle='#e8d8b2';body.ctx.fill();
  body.ctx.beginPath();body.ctx.ellipse(nx+nw*.21,ny-nh*.58,nw*.085,nh*.075,0,0,Math.PI*2);body.ctx.fillStyle='#51462e';body.ctx.fill();
  return {closed:grade(image,width,height,'closed'),body:grade(body.canvas,width,height,'body'),cap:grade(cap.canvas,width,height,'cap'),width,height,approximate:true};
}
