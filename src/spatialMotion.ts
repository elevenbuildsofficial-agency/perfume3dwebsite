// Only the typography scrolls through the pinned world. Never translate a
// viewport-sized photograph, background, or chapter wrapper.
export function copyTravel(cursor:number,index:number,_last:number,_width:number,height:number,reduced=false) {
  const delta=index-cursor;
  return {x:0,y:reduced?0:delta*height*.96,visible:reduced?Math.round(cursor)===index:Math.abs(delta)<1.3,settled:Math.abs(delta)<.06};
}
