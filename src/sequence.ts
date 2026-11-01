export type Clip = {id:string; count:number; range:[number,number]; stills:string[]; grade:string; ink:string};
export const film = {
  mobileBreakpoint:768, desktopWidth:1600, mobileWidth:800, dpr:1.5,
  preload:20, chunk:8, desktopCache:48, mobileCache:24, smoothing:12,
  blend:.10, heroEnd:.72, mobileFocal:.35, mobileReadingHeight:.60, mobileFinalHeight:.44, desktopFinalHeight:.72, textExit:[.02,.24] as [number,number],
  anchorViewport:1, end:4, poster:'/frames/posters/hero-A-desktop.webp',
  clips:[
    {id:'hero-captlift',count:120,range:[0,.35],stills:['hero-A','hero-B'],grade:'#d7ba79',ink:'#292b22'},
    {id:'hero-pushin',count:120,range:[.35,.60],stills:['hero-B','hero-C'],grade:'#e3c78c',ink:'#292b22'},
    {id:'first-light',count:120,range:[.60,1.8],stills:['first-light-A','first-light-B'],grade:'#d3ad64',ink:'#332b20'},
    {id:'velvet-hour',count:120,range:[1.8,2.8],stills:['velvet-hour-A','velvet-hour-B'],grade:'#522331',ink:'#33222a'},
    {id:'wild-ground',count:120,range:[2.8,3.8],stills:['wild-ground-A','wild-ground-B'],grade:'#294531',ink:'#243629'},
    {id:'reunion',count:1,range:[3.8,4],stills:['hero-A'],grade:'#d7ba79',ink:'#292b22'},
  ] as Clip[],
};
export const clamp=(n:number)=>Math.max(0,Math.min(1,n));
export function filmPosition(scroll:number){const index=Math.max(0,film.clips.findIndex(c=>scroll<c.range[1]));const i=scroll>=film.end?film.clips.length-1:index;const clip=film.clips[i];return {index:i,clip,progress:clamp((scroll-clip.range[0])/(clip.range[1]-clip.range[0]))};}
export const poster=(name:string,mobile:boolean)=>`/frames/posters/${name}-${mobile?'mobile':'desktop'}.webp`;
