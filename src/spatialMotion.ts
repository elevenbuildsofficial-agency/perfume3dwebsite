import { range } from './cinematic';

export function collectionPaper(progress:number) {
  const a=[220,227,207],b=[238,234,222];
  return `rgb(${a.map((value,i)=>Math.round(value+(b[i]-value)*progress)).join(' ')})`;
}

// Opaque planes pass the camera. The outgoing frame remains underneath until
// the arriving plane covers it completely; no opacity or shaped mask is used.
export function sceneArrival(progress:number,width:number,height:number,vertical=false,reduced=false) {
  const travel=reduced?0:1-progress;
  return `perspective(1600px) translate3d(${vertical?0:travel*width*1.12}px,${vertical?travel*height*1.12:0}px,0) rotateX(${vertical?travel*7:0}deg) rotateY(${vertical?0:travel*-7}deg) scale(${1+travel*.06})`;
}

export function sceneShot(cursor:number,index:number,last:number,reduced=false) {
  const entry=reduced?Number(Math.round(cursor)===index):index===0?1:range(cursor,index-.58,index-.04);
  const next=index===last?0:range(cursor,index+.42,index+.96);
  return {entry,visible:reduced?Math.round(cursor)===index:entry>0&&next<1};
}

// Text clears the composition before the next heading arrives. Values are
// viewport distances, so a heading cannot linger over the next bottle on mobile.
export function copyTravel(cursor:number,index:number,last:number,width:number,height:number,reduced=false) {
  const enter=reduced||index===0?1:range(cursor,index-.45,index-.04);
  const leave=reduced||index===last?0:range(cursor,index+.12,index+.47);
  const x=((1-enter)-leave)*width*1.12;
  return {x,y:Math.sin(Math.PI*(1-enter))*height*.05-leave*height*.06,visible:reduced?Math.round(cursor)===index:enter>0&&leave<1,settled:enter===1&&leave===0};
}
