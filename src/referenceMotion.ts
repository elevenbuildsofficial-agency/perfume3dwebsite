import { clamp, lerp, range } from './cinematic';
import type { CollectionPose } from './collectionLayout';

export function galleryShot(cursor:number,index:number,width:number,height:number,reduced=false) {
  const delta=index-cursor,cardWidth=Math.min(width*(width<=1000?.73:.26),350),distance=Math.abs(delta);
  return {x:width*.5+delta*cardWidth*1.06,y:height*(width<=1000?.50:.55)+Math.min(2,distance)**2*height*.045,width:cardWidth,scale:reduced?1:1-Math.min(.18,distance*.085),yaw:reduced?0:-clamp(delta,-2,2)*19,roll:reduced?0:clamp(delta,-2,2)*7,z:reduced?0:-distance*95,visible:distance<2.3};
}

export function ingredientSubject(cursor:number,index:number,reduced=false) {
  if (reduced) {
    return {alpha:Number([0,1,1,2][Math.round(cursor)]===index),x:0,y:0,z:0,scale:1,roll:0,yaw:0,pitch:0};
  }
  const anchor = [0, 1.5, 3][index];
  const angle = (cursor - anchor) * .45;
  const rose = range(cursor, .35, .99);
  const fig = range(cursor, 2.35, 2.99);
  const travel = index === 0 ? -rose : index === 1 ? 1 - rose - fig : 1 - fig;
  const arc = Math.sin(travel * Math.PI / 2);
  return {
    alpha: Number(Math.abs(travel) < 1),
    x: Math.sin(angle) * .07 + arc * .23,
    y: travel * .98,
    z: -Math.abs(travel) * 260,
    scale: 1 - Math.min(.12, Math.abs(angle) * .06),
    roll: -angle * 12 + arc * 19,
    yaw: angle * 10 - arc * 33,
    pitch: arc * 17,
  };
}

export function scentTravel(a:CollectionPose&{alpha:number},b:CollectionPose&{alpha:number},t:number,width:number,height:number,reduced=false) {
  const arc=reduced?0:Math.sin(Math.PI*t),outgoing=a.alpha>b.alpha;
  if(a.alpha===0&&b.alpha===0)return {...a};
  return {x:lerp(a.x,b.x,t)+arc*width*(outgoing?-.075:.075),y:lerp(a.y,b.y,t)-arc*height*(outgoing?.13:.075),height:lerp(a.height,b.height,t)*(1+arc*(outgoing?-.22:.10)),angle:lerp(a.angle,b.angle,t)+arc*(outgoing?-.20:.15),alpha:t===0?a.alpha:t===1?b.alpha:1};
}

export function galleryBeat(scroll:number,start:number,end:number,reduced=false) {
  const progress=clamp((scroll-start)/Math.max(.1,end-start-1));
  const entry=reduced?Number(scroll>=start):range(scroll,start-.65,start-.10);
  const exit=reduced?Number(scroll>=end-.35):range(scroll,end-.65,end-.10);
  return {progress,entry,exit,visibility:entry*Number(exit<1)};
}
