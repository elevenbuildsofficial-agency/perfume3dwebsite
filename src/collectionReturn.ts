import { collectionLayout, focusPose, silhouetteBounds, type CollectionPose } from './collectionLayout';
import { clamp, lerp, range } from './cinematic';

export type ReturnPose=CollectionPose&{alpha:number};
// Each flacon rises through the same garden, rolling and changing projected
// size as it approaches or leaves the stone ledge.
export function ritualBottlePose(width:number,height:number,mobile:boolean,index:number,cursor=index,entry=1,reduced=false):ReturnPose {
  const distance = reduced ? 0 : index - cursor;
  const approach = reduced ? 0 : 1 - entry;
  const turn = clamp(distance + approach, -1.5, 1.5);
  const focus = focusPose(width, height, index, mobile);
  const heightOnStage = focus.height * (mobile ? .96 : 1);
  const projectedHeight = heightOnStage * (1 - Math.min(.08, Math.abs(turn) * .08));
  const angle = turn * .22;
  const base = height * (mobile ? .61 : .705);
  return {
    x: width * ((mobile ? .63 : .73) + Math.sin(turn * 1.3) * .19),
    y: base - silhouetteBounds(index, angle).bottom * projectedHeight + (distance + approach) * height * 1.17,
    height: projectedHeight,
    angle,
    alpha: reduced ? Number(Math.round(cursor) === index) : 1,
  };
}

export function collectionReturn(width:number,height:number,mobile:boolean,progress:number):ReturnPose[] {
  const final = collectionLayout(width, height, 'final', mobile);
  return final.map((target, index) => {
    const start = ritualBottlePose(width, height, mobile, index, 2);
    const t = range(progress, [ .12, .24, 0 ][index], [ .93, 1, .80 ][index]);
    const arc = Math.sin(t * Math.PI);
    return {
      x: lerp(start.x, target.x, t) + arc * width * [ .12, -.12, .06 ][index],
      y: lerp(start.y, target.y, t) - arc * height * .035,
      height: lerp(start.height, target.height, t),
      angle: lerp(start.angle, target.angle, t),
      alpha: 1,
    };
  });
}
