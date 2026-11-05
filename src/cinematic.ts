export const clamp = (n: number, a = 0, b = 1) => Math.max(a, Math.min(b, n));
export const smooth = (n: number) => { const t = clamp(n); return t * t * (3 - 2 * t); };
export const range = (n: number, a: number, b: number) => smooth((n - a) / (b - a));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// Units are viewport lengths, not a percentage of the complete five-chapter page.
// All animation is a pure function of scroll; there are no delayed cap tweens.
export function heroBeat(scroll: number, reduced = false) {
  if (reduced) return { lift: 1, focus: 0, dolly: 0, dissolve: 0, mist: 0, text: 1, exit: 0 };
  const lift = 1 - (1 - clamp((scroll - .03) / .09)) ** 3;
  return {
    lift, focus: range(scroll, .08, .16), dolly: range(scroll, .12, .245),
    dissolve: range(scroll, .235, .72), mist: range(scroll, .08, .16),
    text: 1 - range(scroll, .025, .095), exit: range(scroll, .15, .245),
  };
}

export const HERO_HANDOFF_END = .72;
// One camera retreats from the lifted atomiser into the chapter composition.
// Both ends settle at zero velocity, including when touch scroll reverses.
export function heroHandoff(scroll:number,reduced=false) {
  if(reduced)return {settle:1,camera:0,haze:0,copy:1,sides:0};
  const settle=range(scroll,.235,HERO_HANDOFF_END);
  return {
    settle,
    camera:heroBeat(scroll).dolly*(1-settle),
    haze:0,
    copy:range(scroll,.52,.76),
    sides:1-range(scroll,.12,.235),
  };
}

export function chapterStage(scroll: number, first: number, last: number) {
  if (scroll < .30) return clamp(scroll / .30);
  if (scroll < first) return 1;
  return 1 + 3 * clamp((scroll - first) / Math.max(.01, last - first));
}

export const staticChapter = (scroll: number, last = 4) => Math.round(clamp(scroll / Math.max(1, last / 4), 0, 4));

// Ingredient story occupies its own measured scroll interval. Scent anchors keep
// their original pacing; the final collection returns only after this interval.
export function ingredientBeat(scroll:number,start:number,end:number,reduced=false) {
  const progress=clamp((scroll-start)/Math.max(.1,end-start-1));
  const entry=reduced?Number(scroll>=start):range(scroll,start-.70,start-.02);
  const exit=reduced?Number(scroll>=end-.35):range(scroll,end-.65,end-.10);
  const visibility=entry*(1-exit);
  const camera=reduced?0:entry*(1-range(scroll,end-1.25,end-.85));
  return {progress,visibility,cursor:progress*3,entry,exit,camera};
}

// Perspective and drift for individual botanical arrangements.
export function ingredientShot(cursor:number,index:number,reduced=false) {
  if(reduced)return {visible:Math.round(cursor)===index,reveal:Math.round(cursor)===index?1:0,scale:1,x:0,y:0,pitch:0,yaw:0,roll:0,copy:1,copyY:0,focus:0};
  const reveal=index===0?1:range(cursor,index-.58,index-.04);
  const next=index===3?0:range(cursor,index+.42,index+.96);
  const approach=index===0?0:1-range(cursor,index-.58,index);
  const departure=index===3?0:range(cursor,index+.18,index+.80);
  const copyIn=index===0?1:range(cursor,index-.19,index-.02);
  const copyOut=index===3?0:range(cursor,index+.16,index+.43);
  return {
    visible:reveal>0&&next<1,reveal,
    scale:1+approach*.12+departure*.18,
    x:approach*.025-departure*.025,y:approach*.02-departure*.02,
    pitch:approach*3-departure*2,yaw:approach*-5+departure*4,
    roll:approach*4-departure*5,
    copy:copyIn*(1-copyOut),copyY:(1-copyIn)*34-copyOut*30,
    focus:departure**3*2.4,
  };
}

export function ingredientAperture(width:number,height:number,openness:number,x:number,y:number) {
  const radius=Math.max(Math.hypot(x,y),Math.hypot(width-x,y),Math.hypot(x,height-y),Math.hypot(width-x,height-y))+4;
  return {x,y,radius:radius*clamp(openness)};
}

export function ingredientLens(width:number,height:number,amount:number,originX?:number,originY?:number) {
  const x=originX??width*(width<=1000?.48:.76),y=originY??height*(width<=1000?.235:.20);
  const dx=(width*.5-x)*amount*.08,dy=(height*.42-y)*amount*.08,scale=1+amount*.12;
  return {x:x+dx,y:y+dy,scale,transform:amount<.00001?'none':`translate(${x+dx}px,${y+dy}px) scale(${scale}) translate(${-x}px,${-y}px)`};
}

export function ingredientBottleStage(scroll:number,first:number,start:number,end:number,reduced=false) {
  const scent=Math.min(3,reduced?staticChapter(scroll,start):chapterStage(scroll,first,start));
  return lerp(scent,4,range(scroll,end-1.3,end-.95));
}

export function lifestyleBeat(scroll:number,start:number,end:number,reduced=false) {
  const progress=clamp((scroll-start)/Math.max(.1,end-start-1.8));
  const entry=reduced?Number(scroll>=start):range(scroll,start-.65,start-.10);
  const returning=reduced?Number(scroll>=end-.35):range(scroll,end-1.2,end-.10);
  const exit=reduced?returning:range(returning,.26,.98);
  return {progress,entry,exit,returning,visibility:entry*(1-exit)};
}

export function groundFrame(width: number, height: number, pointerX: number, pointerY: number, stage: number, reduced: boolean) {
  return {
    x: reduced ? 0 : pointerX * Math.min(12, width * .012),
    y: reduced ? 0 : pointerY * 5 - Math.min(stage, 4) * 1.5,
    baseline: height * (width <= 1000 ? .555 : .705),
  };
}

export function neckCamera(width: number, height: number, neckX: number, neckY: number, dolly: number) {
  const scale = 1 + dolly * 3.7;
  return { scale, x: (width * .5 - neckX) * dolly, y: (height * .50 - neckY) * dolly };
}

export function scentLift(stage: number, index: number, reduced = false) {
  if (reduced) return 1;
  const arrival = range(stage, index + .68, index + 1.02);
  const departure = 1 - range(stage, index + 1.55, index + 1.9);
  return arrival * departure;
}
