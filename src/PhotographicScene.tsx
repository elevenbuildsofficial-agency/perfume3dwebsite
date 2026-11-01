import { useEffect, useRef, useState, type MutableRefObject } from 'react';
import { content } from './content';
import type { StoryState } from './story';
import { collectionLayout, silhouetteBounds, type CollectionPose } from './collectionLayout';
import { productGeometry } from './productGeometry';
import { bottleRegistration, bottleAssets } from './bottleAssets';
import { loadBottleSprites, type BottleSprites } from './bottleSprites';
import { clamp, groundFrame, heroBeat, lerp, neckCamera, range, scentLift } from './cinematic';
import styles from './PhotographicScene.module.css';

type StoryRef = MutableRefObject<StoryState>;
type Pose = CollectionPose & { alpha: number };

export function ProductFallback() {
  const [size,setSize]=useState({width:innerWidth,height:innerHeight});
  useEffect(()=>{const resize=()=>setSize({width:innerWidth,height:innerHeight});addEventListener('resize',resize);return()=>removeEventListener('resize',resize);},[]);
  const layout=collectionLayout(size.width,size.height,'hero');
  return <div className={styles.fallback}>{content.products.map((product,index)=><img key={product.id} src={product.imageSmall} alt={product.imageAlt} style={{left:layout[index].x,top:layout[index].y,height:layout[index].height,width:layout[index].height*productGeometry[index].aspect,transform:`translate(-50%,-50%) rotate(${layout[index].angle}rad)`}}/>)}</div>;
}

export default function PhotographicScene({story}:{story:StoryRef}) {
  const canvas=useRef<HTMLCanvasElement>(null),shadowCanvas=useRef<HTMLCanvasElement>(null);
  const [ready,setReady]=useState(false);
  useEffect(()=>{
    const node=canvas.current,shadowNode=shadowCanvas.current;
    const ctx=node?.getContext('2d'),shadow=shadowNode?.getContext('2d');
    if(!node||!shadowNode||!ctx||!shadow)return;
    let width=innerWidth,height=innerHeight,frame=0,live=true,previous=0,dirty=true,lastStage=-1;
    const sprites:(BottleSprites|null)[]=[null,null,null];
    let heroLayout=collectionLayout(width,height,'hero'),finalLayout=collectionLayout(width,height,'final');
    let px=0,py=0,tx=0,ty=0;
    const resize=()=>{
      width=node.clientWidth;height=node.clientHeight;
      heroLayout=collectionLayout(width,height,'hero',innerWidth<=1000);finalLayout=collectionLayout(width,height,'final',innerWidth<=1000);
      const ratio=Math.min(devicePixelRatio||1,content.scene.photography.pixelRatio);
      for(const element of [node,shadowNode]){element.width=Math.round(width*ratio);element.height=Math.round(height*ratio);}
      ctx.setTransform(ratio,0,0,ratio,0,0);shadow.setTransform(ratio,0,0,ratio,0,0);
      dirty=true;
    };
    const pointer=(event:PointerEvent)=>{if(event.pointerType==='touch')return;tx=event.clientX/width-.5;ty=event.clientY/height-.5;};
    const pose=(stage:number,index:number):Pose=>{
      if(stage===0||stage===4)return {...(stage===0?heroLayout:finalLayout)[index],alpha:1};
      const s=story.current,config=s.mobile?content.scene.photography.mobileFocus:content.scene.photography.desktopFocus;
      const h=Math.min(config.height[index]*height*(s.mobile&&height<740?.84:1),width*(s.mobile?.8:.44)/productGeometry[index].aspect);
      const bottom=silhouetteBounds(index,0).bottom;
      return {x:index===stage-1?config.x[index]*width:(index<stage-1?-.35:1.35)*width,y:groundFrame(width,height,0,0,stage,s.reduced).baseline-bottom*h,height:h,angle:0,alpha:index===stage-1?1:0};
    };
    const mixPose=(a:Pose,b:Pose,t:number):Pose=>({x:lerp(a.x,b.x,t),y:lerp(a.y,b.y,t),height:lerp(a.height,b.height,t),angle:lerp(a.angle,b.angle,t),alpha:lerp(a.alpha,b.alpha,t)});
    const groundShadow=(p:Pose,index:number,lift:number,exit:number)=>{
      const base=p.y+silhouetteBounds(index,p.angle).bottom*p.height,foot=p.height*productGeometry[index].aspect*bottleRegistration[index].baseWidth;
      shadow.save();shadow.globalAlpha=p.alpha;
      const modelShadow=sprites[index]?.shadow;
      if(modelShadow){shadow.save();shadow.translate(p.x,p.y);shadow.rotate(p.angle);shadow.drawImage(modelShadow,-p.height*productGeometry[index].aspect/2,-p.height/2,p.height*productGeometry[index].aspect,p.height);shadow.restore();}
      // Project the actual silhouette onto sunlit limestone, opposite the upper-left sun.
      // A separate multiply canvas colours the stone without painting an opaque black oval.
      const sprite=sprites[index];
      if(!modelShadow&&sprite){
        const h=p.height,w=h*sprite.width/sprite.height,b=base-p.y,sunX=.58,sunY=.18;
        const project=(source:CanvasImageSource,dx=0,dy=0,softness=1.8,alpha=1)=>{
          shadow.save();shadow.globalAlpha*=alpha;shadow.filter=`blur(${softness}px)`;
          shadow.translate(p.x+dx,p.y+dy);shadow.transform(1,0,-sunX,-sunY,b*sunX,b*(1+sunY));
          shadow.rotate(p.angle);shadow.drawImage(source,-w/2,-h/2,w,h);shadow.restore();
        };
        const cast=lift<.001?sprite.cast:sprite.bodyCast;
        if(cast)project(cast);
        if(lift>=.001&&sprite.capCast&&exit<.99){
          const r=bottleRegistration[index],rise=lift*(r.capBottom-r.capTop)*h*1.2;
          project(sprite.capCast,rise*sunX+lift*w*.055,rise*sunY,2+lift*4,(1-exit)*.78);
        }
      }
      shadow.save();shadow.translate(p.x,base+1);shadow.scale(1,.13);
      const gradient=shadow.createRadialGradient(0,0,0,0,0,foot*.54);gradient.addColorStop(0,'rgba(57,58,40,.67)');gradient.addColorStop(.55,'rgba(75,70,49,.40)');gradient.addColorStop(1,'rgba(97,84,58,0)');
      shadow.fillStyle=gradient;shadow.fillRect(-foot,-foot,foot*2,foot*2);shadow.restore();
      shadow.restore();
    };
    const bottle=(p:Pose,index:number,lift:number,exit:number,blur:number,time:number)=>{
      const sprite=sprites[index];if(!sprite||p.alpha<.002)return;
      const r=bottleRegistration[index],h=p.height,w=h*sprite.width/sprite.height;
      const bottom=silhouetteBounds(index,0).bottom*h;
      // Breathing changes scale about the contact point, never its vertical position.
      const breathing=story.current.reduced?1:1+Math.sin(time*.00065)*.0012;
      groundShadow(p,index,lift,exit);
      ctx.save();ctx.globalAlpha=p.alpha;ctx.translate(p.x,p.y+bottom);ctx.scale(breathing,breathing);ctx.translate(0,-bottom);ctx.rotate(p.angle);
      if(blur>.05)ctx.filter=`blur(${blur.toFixed(2)}px)`;
      if(lift<.001&&!story.current.reduced){ctx.drawImage(sprite.closed,-w/2,-h/2,w,h);}
      else {
        ctx.drawImage(sprite.body,-w/2,-h/2,w,h);
        if(!story.current.reduced&&exit<.999){
          const pivot=(r.capTop+r.capBottom)/2*h-h/2,capHeight=(r.capBottom-r.capTop)*h;
          ctx.save();ctx.translate(lift*w*.055,pivot-lift*capHeight*1.2-exit*height*.9);ctx.rotate(lift*8*Math.PI/180);ctx.translate(0,-pivot);ctx.globalAlpha*=1-range(exit,.6,1);ctx.drawImage(sprite.cap,-w/2,-h/2,w,h);ctx.restore();
        }
      }
      ctx.filter='none';
      // Brass gets a narrow moving streak; wood retains broad photographic highlights.
      if(lift>.01&&!story.current.reduced){ctx.save();ctx.globalCompositeOperation='source-atop';ctx.globalAlpha*=Math.sin(clamp(lift)*Math.PI)*.65;const gx=(-.23+lift*.46)*w,glint=ctx.createLinearGradient(gx-w*.05,0,gx+w*.05,0);glint.addColorStop(0,'#fff6d500');glint.addColorStop(.5,'#fff6d5');glint.addColorStop(1,'#fff6d500');ctx.fillStyle=glint;ctx.fillRect(-w*.18,(r.capBottom-.5)*h,w*.36,h*.047);ctx.restore();}
      // A short, broken stone reflection sits immediately below the thick glass base.
      ctx.save();ctx.beginPath();ctx.rect(-w*.42,bottom,w*.84,Math.min(12,h*.032));ctx.clip();ctx.globalAlpha*=.09;ctx.filter='blur(1.4px)';ctx.translate(0,bottom*1.13);ctx.scale(1,-.13);ctx.drawImage(sprite.body,-w/2,-h/2,w,h);ctx.restore();
      ctx.restore();
    };
    const vapour=(p:Pose,index:number,amount:number,time:number)=>{
      if(amount<.002||story.current.reduced)return;
      const r=bottleRegistration[index],x=p.x+(r.nozzle[0]-.5)*p.height*productGeometry[index].aspect,y=p.y+(r.nozzle[1]-.5)*p.height;
      const colours=['255,241,201','236,206,219','218,232,194'];
      ctx.save();ctx.globalAlpha=p.alpha*amount;ctx.globalCompositeOperation='screen';
      for(let i=0;i<14;i++){
        const t=(i/14+time*.000028)%1,spread=(5+t*24)*p.height/500;
        const xx=x+Math.sin(t*8+index)*spread,yy=y-t*p.height*.55;
        const radius=p.height*(.013+t*.04),g=ctx.createRadialGradient(xx,yy,0,xx,yy,radius);
        g.addColorStop(0,`rgba(${colours[index]},${.14*Math.sin(t*Math.PI)})`);g.addColorStop(1,`rgba(${colours[index]},0)`);ctx.fillStyle=g;ctx.fillRect(xx-radius,yy-radius,radius*2,radius*2);
      }
      for(let i=0;i<3;i++){
        ctx.beginPath();ctx.moveTo(x,y);ctx.bezierCurveTo(x-12-i*3,y-p.height*.12,x+22+i*8,y-p.height*.23,x+Math.sin(time*.0003+i)*17,y-p.height*.43);
        ctx.lineWidth=(1+i*.8)*p.height/500;ctx.strokeStyle=`rgba(${colours[index]},${.12-i*.025})`;ctx.filter='blur(1.5px)';ctx.stroke();
      }
      ctx.restore();
    };
    const draw=(time:number)=>{
      const s=story.current,dt=Math.min(.05,(time-previous)/1000||.016);previous=time;
      if(s.paused||document.hidden){frame=requestAnimationFrame(draw);return;}
      if(s.reduced&&!dirty&&s.stage===lastStage){frame=requestAnimationFrame(draw);return;}
      dirty=false;lastStage=s.stage;
      px=lerp(px,tx,1-Math.exp(-5*dt));py=lerp(py,ty,1-Math.exp(-5*dt));s.pointerX=s.reduced?0:px;s.pointerY=s.reduced?0:py;
      ctx.clearRect(0,0,width,height);shadow.clearRect(0,0,width,height);
      const scroll=s.scroll??0,beat=heroBeat(scroll,s.reduced),ground=groundFrame(width,height,s.pointerX,s.pointerY,s.stage,s.reduced);
      const render=(poses:Pose[],lifts:number[],exits:number[],focus:number,alpha:number,camera:boolean)=>{
        ctx.save();shadow.save();
        if(camera){const hp=heroLayout[0],neckY=hp.y+(bottleRegistration[0].nozzle[1]-.5)*hp.height,c=neckCamera(width,height,hp.x,neckY,beat.dolly);for(const target of [ctx,shadow]){target.translate(hp.x+c.x,neckY+c.y);target.scale(c.scale,c.scale);target.translate(-hp.x,-neckY);}}
        ctx.translate(ground.x,ground.y);shadow.translate(ground.x,ground.y);
        for(const index of [1,2,0]){const p={...poses[index],alpha:poses[index].alpha*alpha};bottle(p,index,lifts[index],exits[index],index===0?0:focus*(s.mobile?2.7:4),time);vapour(p,index,lifts[index]*(1-exits[index]),time);}
        ctx.restore();shadow.restore();
      };
      if(!s.reduced&&scroll<.30){
        const incoming=[0,1,2].map(index=>pose(1,index));
        render(incoming,[1,0,0],[.72,0,0],0,beat.dissolve,false);
        render(heroLayout.map(p=>({...p,alpha:1})),[beat.lift,0,0],[beat.exit,0,0],beat.focus,1-beat.dissolve,true);
        // Backlit scent becomes the dissolve, hiding the camera reset in both directions.
        const fog=Math.sin(Math.PI*range(scroll,.145,.30))*.88;
        if(fog>.001){const g=ctx.createRadialGradient(width*.5,height*.48,0,width*.5,height*.48,Math.max(width,height)*.8);g.addColorStop(0,`rgba(255,245,218,${fog})`);g.addColorStop(.5,`rgba(248,237,210,${fog*.84})`);g.addColorStop(1,`rgba(241,233,212,${fog*.25})`);ctx.fillStyle=g;ctx.fillRect(0,0,width,height);}
      } else {
        const stage=!s.reduced&&scroll>=.30?Math.max(1,s.stage):s.stage;
        const from=Math.min(3,Math.floor(stage)),to=from+1,t=stage===s.stage?s.mix:0;
        const poses=[0,1,2].map(index=>mixPose(pose(from,index),pose(to,index),t));
        const lifts=[0,1,2].map(index=>scentLift(stage,index,s.reduced));
        render(poses,lifts,lifts.map(lift=>s.reduced?1:range(lift,.85,1)*.58),0,1,false);
      }
      // Scent-coloured flecks remain delicate; no particles in reduced motion.
      if(!s.reduced&&s.stage>.85&&s.stage<3.7){const index=clamp(Math.round(s.stage)-1,0,2);ctx.save();ctx.fillStyle=content.products[index].palette.a;for(let i=0;i<13;i++){const life=(time*.000012+i*.077)%1;ctx.globalAlpha=Math.sin(life*Math.PI)*.26;const x=width*(.16+(i*.137)% .70)+Math.sin(life*5+i)*12,y=height*(.76-life*.53);ctx.beginPath();ctx.ellipse(x,y,1.2+i%2,.7,life*5,0,Math.PI*2);ctx.fill();}ctx.restore();}
      node.dataset.scroll=scroll.toFixed(4);node.dataset.lift=beat.lift.toFixed(4);node.dataset.dissolve=beat.dissolve.toFixed(4);
      frame=requestAnimationFrame(draw);
    };
    resize();content.products.forEach((_,index)=>{loadBottleSprites(index).then(sprite=>{if(!live)return;sprites[index]=sprite;dirty=true;if(sprites.every(Boolean))setReady(true);}).catch(error=>console.error(error));});
    addEventListener('resize',resize);addEventListener('pointermove',pointer,{passive:true});frame=requestAnimationFrame(draw);
    return()=>{live=false;cancelAnimationFrame(frame);removeEventListener('resize',resize);removeEventListener('pointermove',pointer);};
  },[story]);
  return <><canvas ref={shadowCanvas} className={`${styles.canvas} ${styles.shadows}`} aria-hidden="true"/>{!ready&&<ProductFallback/>}<canvas ref={canvas} className={styles.canvas} data-asset-modes={bottleAssets.map(asset=>asset.mode).join(',')} aria-label={content.ui.scene}/><div className={styles.finish}/><div className={styles.grain}/></>;
}
