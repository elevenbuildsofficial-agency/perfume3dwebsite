import { clamp, lerp, range } from './cinematic';
import type { CollectionPose } from './collectionLayout';

export function galleryShot(cursor:number,index:number,width:number,height:number,reduced=false) {
  const delta=index-cursor,cardWidth=Math.min(width*(width<=1000?.73:.26),350),distance=Math.abs(delta);
  return {x:width*.5+delta*cardWidth*1.06,y:height*(width<=1000?.50:.55)+Math.min(2,distance)**2*height*.045,width:cardWidth,scale:reduced?1:1-Math.min(.18,distance*.085),yaw:reduced?0:-clamp(delta,-2,2)*19,roll:reduced?0:clamp(delta,-2,2)*7,z:reduced?0:-distance*95,visible:distance<2.3};
}

export function ingredientSubject(cursor:number,index:number,reduced=false) {
  const anchors=[0,1.5,3],angle=(cursor-anchors[index])*.45;
  const rose=range(cursor,.42,.96),fig=range(cursor,2.42,2.96);
  const alpha=reduced?Number([0,1,1,2][Math.round(cursor)]===index):index===0?1-rose:index===1?rose*(1-fig):fig;
  return {alpha,x:reduced?0:Math.sin(angle)*.15,y:reduced?0:(1-Math.cos(angle))*.10,scale:reduced?1:1-Math.min(.18,Math.abs(angle)*.10),roll:reduced?0:-angle*20,yaw:reduced?0:angle*16};
}

export function scentTravel(a:CollectionPose&{alpha:number},b:CollectionPose&{alpha:number},t:number,width:number,height:number,reduced=false) {
  const arc=reduced?0:Math.sin(Math.PI*t),outgoing=a.alpha>b.alpha;
  return {x:lerp(a.x,b.x,t)+arc*width*(outgoing?-.075:.075),y:lerp(a.y,b.y,t)-arc*height*(outgoing?.13:.075),height:lerp(a.height,b.height,t)*(1+arc*(outgoing?-.22:.10)),angle:lerp(a.angle,b.angle,t)+arc*(outgoing?-.20:.15),alpha:lerp(a.alpha,b.alpha,t)};
}

export function galleryBeat(scroll:number,start:number,end:number,reduced=false) {
  const progress=clamp((scroll-start)/Math.max(.1,end-start-1));
  const entry=reduced?Number(scroll>=start):range(scroll,start-.65,start-.10);
  const exit=reduced?Number(scroll>=end-.35):range(scroll,end-.65,end-.10);
  return {progress,entry,exit,visibility:entry*Number(exit<1)};
}
