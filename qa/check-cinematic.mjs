import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import ts from 'typescript';
const code=ts.transpileModule(await fs.readFile(new URL('../src/cinematic.ts',import.meta.url),'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText;
const {heroBeat,chapterStage,scentLift,groundFrame,staticChapter,ingredientBeat,ingredientWeight}=await import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`);
for(const scroll of [0,.01,.03])assert.equal(heroBeat(scroll).lift,0,'Idle must not detach the cap.');
assert.equal(heroBeat(.12).lift,1,'Cap must complete its lift by 12% of one viewport.');
assert.equal(heroBeat(.095).text,0,'Hero copy must clear the bottle before the dolly.');
assert.equal(heroBeat(.12).dolly,0,'Camera must wait for the cap lift.');
assert.equal(heroBeat(.16).focus,1,'The focus pull must finish at 16%.');
assert.equal(heroBeat(.30).dissolve,1,'The First Light dissolve must finish at 30%.');
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
for(const scroll of [1,2,3])assert.equal(chapterStage(scroll,1,4),scroll);
assert.equal(ingredientBeat(3,4,9.2).visibility,0);
assert.equal(ingredientBeat(4.1,4,9.2).visibility,1);
assert.equal(ingredientBeat(9.2,4,9.2).visibility,0);
for(let step=0;step<=100;step++){
  const cursor=step/100*3,weights=[0,1,2,3].map(index=>ingredientWeight(cursor,index));
  assert(Math.abs(weights.reduce((a,b)=>a+b,0)-1)<.00001,'Ingredient transitions must never leave a blank frame.');
  assert.equal([0,1,2,3].reduce((sum,index)=>sum+ingredientWeight(cursor,index,true),0),1,'Reduced motion shows exactly one still ingredient.');
  const scroll=4+step/100*5.2;
  assert([0,1].includes(ingredientBeat(scroll,4,9.2,true).visibility),'Reduced motion has no animated ingredient dissolve.');
}
for(let index=0;index<4;index++)assert(Math.abs(ingredientBeat(4+4.2*index/3,4,9.2).cursor-index)<.00001,'Each ingredient must have a distinct reachable scroll stop.');
console.log('Cinematic requirements passed: exact beat boundaries, reverse traversal, all scent cap lifts, unchanged chapter anchors and static reduced motion.');
