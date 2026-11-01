import { content } from './content';
import { productGeometry } from './productGeometry';

export type CollectionScene = 'hero' | 'final' | 'about';
export type CollectionPose = { x:number; y:number; height:number; angle:number };
export const collectionOrder = [1,0,2] as const;
const clamp = (value:number,min:number,max:number)=>Math.max(min,Math.min(max,value));

export function silhouetteBounds(index:number,angle:number) {
  const cos=Math.cos(angle),sin=Math.sin(angle);
  let left=Infinity,right=-Infinity,top=Infinity,bottom=-Infinity;
  for(const [x,y] of productGeometry[index].hull){
    const px=x*cos-y*sin,py=x*sin+y*cos;
    left=Math.min(left,px);right=Math.max(right,px);top=Math.min(top,py);bottom=Math.max(bottom,py);
  }
  return {left,right,top,bottom};
}

// Fit the visible, rotated silhouettes as one centred row. Transparent padding
// and unequal bottle widths must not become part of the spacing calculation.
export function collectionLayout(width:number,height:number,scene:CollectionScene,mobile=width<=content.scene.mobileBreakpoint):CollectionPose[] {
  const photography=content.scene.photography;
  const config=scene==='about'
    ? (mobile?photography.mobileAboutFinal:photography.desktopAboutFinal)
    : scene==='hero'?(mobile?photography.mobileHero:photography.desktopHero):(mobile?photography.mobileFinal:photography.desktopFinal);
  const compact=mobile&&height<740?(scene==='about'?.85:.86):1;
  const desired=config.height.map(value=>value*height*compact);
  const bounds=config.tilt.map((angle,index)=>silhouetteBounds(index,angle));
  const gutter=clamp(width*.056,40,108),panel=clamp(width*.183,225,330);
  const maxWidth=mobile?width*(scene==='about'?.90:.82):scene==='about'?width*.70:Math.min(width*.62,width-2*(gutter+panel+20));
  const gap=mobile?clamp(width*.035,10,20):clamp(width*.022,20,42);
  const total=desired.reduce((sum,h,index)=>sum+(bounds[index].right-bounds[index].left)*h,0);
  const scale=Math.min(1,Math.max(1,maxWidth-2*gap)/total);
  const span=total*scale+2*gap;
  let cursor=width/2-span/2;
  const poses:CollectionPose[]=new Array(3);
  for(const index of collectionOrder){
    const h=desired[index]*scale,bound=bounds[index];
    poses[index]={x:cursor-bound.left*h,y:config.baseline*height-bound.bottom*h,height:h,angle:config.tilt[index]};
    cursor+=(bound.right-bound.left)*h+gap;
  }
  return poses;
}
