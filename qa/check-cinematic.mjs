import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import ts from 'typescript';
const code=ts.transpileModule(await fs.readFile(new URL('../src/cinematic.ts',import.meta.url),'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText;
const {heroBeat,heroHandoff,HERO_HANDOFF_END,chapterStage,scentLift,groundFrame,staticChapter,ingredientBeat,ingredientShot,ingredientAperture,ingredientLens,ingredientBottleStage,lifestyleBeat}=await import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`);
for(const scroll of [0,.01,.03])assert.equal(heroBeat(scroll).lift,0,'Idle must not detach the cap.');
assert.equal(heroBeat(.12).lift,1,'Cap must complete its lift by 12% of one viewport.');
assert.equal(heroBeat(.095).text,0,'Hero copy must clear the bottle before the dolly.');
assert.equal(heroBeat(.12).dolly,0,'Camera must wait for the cap lift.');
assert.equal(heroBeat(.16).focus,1,'The focus pull must finish at 16%.');
assert.equal(heroBeat(HERO_HANDOFF_END).dissolve,1,'The handoff must settle into First Light.');
assert(heroHandoff(.30).camera>.8,'The close-up must continue through the former hard-cut boundary.');
for(const boundary of [.235,.30,HERO_HANDOFF_END]){
  const before=heroHandoff(boundary-.00001),after=heroHandoff(boundary+.00001);
  for(const key of ['settle','camera','haze','copy'])assert(Math.abs(before[key]-after[key])<.001,`No ${key} jump across ${boundary}.`);
}
assert.equal(heroHandoff(HERO_HANDOFF_END).camera,0,'Camera must reach the chapter transform before changing render paths.');
assert.equal(heroHandoff(HERO_HANDOFF_END).settle,1,'The same bottle must reach the exact chapter pose.');
assert.equal(heroHandoff(.76).copy,1);
assert.equal(heroHandoff(.64).haze,0,'Haze must recede before the final camera handoff.');
assert(heroHandoff(.30).haze<=.30,'Haze must not wash the frame white.');
const handoffFrames=Array.from({length:801},(_,i)=>heroHandoff(i/1000));
for(let i=800;i>=0;i--)assert.deepEqual(heroHandoff(i/1000),handoffFrames[i],'Reverse scrolling must retrace the same camera.');
for(const scroll of [0,.2,.3,.5,.8])assert.deepEqual(heroHandoff(scroll,true),heroHandoff(0,true),'Reduced motion must hold a still camera.');
assert.equal(chapterStage(.30,1,4),1);assert.equal(chapterStage(2,1,4),2);assert.equal(chapterStage(3,1,4),3);assert.equal(chapterStage(4,1,4),4);
const forward=Array.from({length:301},(_,i)=>heroBeat(i/1000));
for(let i=300;i>=0;i--)assert.deepEqual(heroBeat(i/1000),forward[i],'Reversing scroll must reproduce the same cap/lens state.');
for(let index=0;index<3;index++){assert(scentLift(index+1,index)>.98);assert.equal(scentLift(0,index),0);assert.equal(scentLift(4,index),0);assert.equal(scentLift(index+1,index,true),1);}
assert.deepEqual(heroBeat(.2,true),heroBeat(0,true),'Reduced motion must not animate the transition.');
for(const scroll of [0,.03,.12,.30,.49])assert.equal(staticChapter(scroll),0,'Reduced motion must hold a still composition during hero scrolling.');
for(const scroll of [.51,1,1.49])assert.equal(staticChapter(scroll),1,'Reduced motion switches between still chapters.');
for(const [width,height] of [[390,844],[1440,900]]){const a=groundFrame(width,height,-.4,.3,0,false),b=groundFrame(width,height,.4,-.3,0,false);assert.equal(a.baseline,b.baseline,'Pointer movement must preserve the ledge plane.');}
// The inserted ingredient interval must leave the original scent timing intact,
// fully cover the bottle compositor, and release it before the final collection.
for(const scroll of [1,2,3])assert.equal(ingredientBottleStage(scroll,1,4,10.2),scroll);
assert.equal(ingredientBeat(3,4,10.2).visibility,0);
assert.equal(ingredientBeat(4.1,4,10.2).visibility,1);
assert.equal(ingredientBeat(10.2,4,10.2).visibility,0);
for(const scroll of [3,4,7])assert.equal(ingredientBottleStage(scroll,1,4,10.2),3,'Wild Ground must stay on stage until the ingredient scene covers it.');
assert.equal(ingredientBottleStage(10.2,1,4,10.2),4,'The final collection must be ready when the lens closes.');
assert.equal(ingredientBeat(9.35,4,10.2).camera,0,'Reset the bottle camera while the ingredient frame is fully opaque.');
assert.equal(ingredientBeat(9.35,4,10.2).visibility,1);
for(let step=0;step<=100;step++){
  const cursor=step/100*3,shots=[0,1,2,3].map(index=>ingredientShot(cursor,index));
  assert.equal(shots.filter(shot=>shot.visible&&shot.reveal===1).length,1,'Every aperture needs a fully covered opaque scene behind it.');
  const stills=[0,1,2,3].map(index=>ingredientShot(cursor,index,true));
  assert.equal(stills.filter(shot=>shot.visible).length,1,'Reduced motion shows exactly one still ingredient.');
  for(const shot of stills){assert.equal(shot.scale,1);assert.equal(shot.yaw,0);assert.equal(shot.x,0);}
  const scroll=4+step/100*6.2;
  assert([0,1].includes(ingredientBeat(scroll,4,10.2,true).visibility),'Reduced motion has no animated ingredient aperture.');
}
for(let index=0;index<4;index++){
  assert(Math.abs(ingredientBeat(4+5.2*index/3,4,10.2).cursor-index)<.00001,'Each ingredient must have a distinct reachable scroll stop.');
  const shot=ingredientShot(index,index);assert.equal(shot.copy,1);assert.equal(shot.scale,1);
}
for(let step=0;step<=300;step++)for(let index=0;index<4;index++)assert(ingredientShot(step/100,index).scale<=1.3,'Full-frame ingredient movement must stay restrained without a macro portal.');
for(const [w,h] of [[390,844],[844,390],[1440,900]]){
  const lens=ingredientLens(w,h,.5),a=ingredientAperture(w,h,1,lens.x,lens.y);
  for(const [x,y] of [[0,0],[w,0],[0,h],[w,h]])assert(Math.hypot(x-a.x,y-a.y)<a.radius,'Open aperture must cover every viewport corner.');
  assert.equal(ingredientAperture(w,h,0,lens.x,lens.y).radius,0);
}
console.log('Cinematic requirements passed: exact beat boundaries, reverse traversal, all scent cap lifts, unchanged chapter anchors and static reduced motion.');
for(let i=0;i<=100;i++){
  const scroll=9.4+i/100*.9,ingredient=ingredientBeat(scroll,4,10.2),day=lifestyleBeat(scroll,10.2,14.4);
  const coveredIngredient=ingredient.entry*Number(ingredient.exit<1);
  assert(coveredIngredient===1||day.visibility===1,'Ingredient-to-day handoff must always have a complete opaque scene.');
}
assert.equal(lifestyleBeat(14.4,10.2,14.4).visibility,0,'Lifestyle must release the closing collection.');
assert.equal(lifestyleBeat(11,10.2,14.4,true).visibility,1,'Reduced motion keeps a still daily scene.');
