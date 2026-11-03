type Matrix={a:number;b:number;c:number;d:number;e:number;f:number};
export function canPaint(left:number,top:number,right:number,bottom:number,m:Matrix,width:number,height:number,padding=16) {
  const points=[[left,top],[right,top],[left,bottom],[right,bottom]].map(([x,y])=>[m.a*x+m.c*y+m.e,m.b*x+m.d*y+m.f]);
  return Math.max(...points.map(p=>p[0]))>=-padding&&Math.min(...points.map(p=>p[0]))<=width+padding&&Math.max(...points.map(p=>p[1]))>=-padding&&Math.min(...points.map(p=>p[1]))<=height+padding;
}
