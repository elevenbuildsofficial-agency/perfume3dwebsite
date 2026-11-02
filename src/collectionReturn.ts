import { collectionLayout, silhouetteBounds, type CollectionPose } from './collectionLayout';
import { lerp, range } from './cinematic';

export type ReturnPose=CollectionPose&{alpha:number};
// Register the live green flacon to the stone in the clean lifestyle plate.
export function outsideBottlePose(width:number,height:number,mobile:boolean,arrival=0,pointer=0):CollectionPose {
  const portrait=mobile&&height>500,inset=mobile?.02:.03,aspect=portrait?9/16:16/9;
  const photoHeight=Math.max(height*(1+2*inset),width*(1+2*inset)/aspect),photoWidth=photoHeight*aspect;
  const x=-width*inset+(width*(1+2*inset)-photoWidth)*(portrait?.5:.62)+photoWidth*(portrait?.67:.66);
  const baseline=-height*inset+(height*(1+2*inset)-photoHeight)*.5+photoHeight*(portrait?.61:.84);
  const bounds=silhouetteBounds(2,0),h=photoHeight*(portrait?.225:.64)/(bounds.bottom-bounds.top);
  const scale=1+arrival*.045;
  return {x:(x-width*.5)*scale+width*.5+arrival*.012*width+pointer*7,y:(baseline-height*.5)*scale+height*.5+arrival*.01*height-bounds.bottom*h*scale,height:h*scale,angle:0};
}

export function collectionReturn(width:number,height:number,mobile:boolean,progress:number,arrival=0,pointer=0):ReturnPose[] {
  const final=collectionLayout(width,height,'final',mobile),green=outsideBottlePose(width,height,mobile,arrival,pointer);
  return final.map((target,index)=>{
    const t=range(progress,index===2?0:index===0?.12:.24,index===2?.80:index===0?.93:1);
    const h=height*(index===0?.65:.55),bounds=silhouetteBounds(index,0);
    const start=index===2?green:{x:width*(index===0?.30:.18),y:height*.80-bounds.bottom*h,height:h,angle:index===0?.10:-.08};
    const alpha=index===2?1:range(progress,index===0?.09:.23,index===0?.24:.39);
    return {x:lerp(start.x,target.x,t),y:lerp(start.y,target.y,t)-Math.sin(t*Math.PI)*height*.025,height:lerp(start.height,target.height,t),angle:lerp(start.angle,target.angle,t),alpha};
  });
}
