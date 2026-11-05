import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import ts from 'typescript';
const compile=async name=>ts.transpileModule(await fs.readFile(new URL(`../src/${name}.ts`,import.meta.url),'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText;
const url=text=>`data:text/javascript;base64,${Buffer.from(text).toString('base64')}`;
const cinematic=url(await compile('cinematic')),{ingredientBeat,lifestyleBeat}=await import(cinematic);
const {galleryShot,galleryBeat,ingredientSubject,scentTravel}=await import(url((await compile('referenceMotion')).replace("'./cinematic'",JSON.stringify(cinematic))));
for(const [w,h] of [[390,844],[540,720],[1440,900]]){
  for(let i=0;i<3;i++){
    const shot=galleryShot(i,i,w,h);assert.equal(shot.x,w*.5);assert(Math.abs(shot.yaw)<1e-10);assert.equal(shot.scale,1);
    const still=galleryShot(i+.4,i,w,h,true);assert.equal(still.yaw,0);assert.equal(still.roll,0);assert.equal(still.z,0);
  }
  const frames=Array.from({length:201},(_,i)=>[0,1,2].map(index=>galleryShot(i/100,index,w,h)));
  for(let i=200;i>=0;i--)for(let index=0;index<3;index++){
    const shot=galleryShot(i/100,index,w,h);assert.deepEqual(shot,frames[i][index]);
    for(const key of ['x','y','scale','width','yaw','roll','z'])assert(Number.isFinite(shot[key]));
    assert(shot.width<=w*.74);assert(shot.scale>=.82);
  }
}
for(let step=0;step<=300;step++){
  const cursor=step/100,subjects=[0,1,2].map(i=>ingredientSubject(cursor,i));
  assert(subjects.some(p=>p.alpha===1),'A product must stay present through every ingredient handoff.');
  assert(subjects.every(p=>p.alpha===0||p.alpha===1),'Bottles travel at full opacity; no dissolving products.');
  for(const p of subjects)if(p.alpha===0)assert(Math.abs(p.y)>=.98&&p.z<0,'Hidden subjects must already have traveled outside the frame.');
  const stills=[0,1,2].map(i=>ingredientSubject(cursor,i,true));assert.equal(stills.filter(p=>p.alpha===1).length,1);
}
for(const [cursor,product] of [[0,0],[1,1],[2,1],[3,2]])assert.equal(ingredientSubject(cursor,product).alpha,1);
const a={x:100,y:200,height:400,angle:0,alpha:1},b={x:800,y:250,height:300,angle:0,alpha:0};
for(const [t,target] of [[0,a],[1,b]])for(const key of Object.keys(a))assert(Math.abs(scentTravel(a,b,t,1440,900)[key]-target[key])<1e-8,'Curved bottle paths must preserve the existing chapter poses.');
assert(scentTravel(a,b,.5,1440,900).y<(a.y+b.y)/2,'Bottle travel must follow an arc rather than a straight slide.');
for(let i=0;i<=200;i++){
  const scroll=9.4+i/200*4.4,ingredient=ingredientBeat(scroll,4,10.2),gallery=galleryBeat(scroll,10.2,13.6),day=lifestyleBeat(scroll,13.6,17.8);
  const ingredientCover=ingredient.entry*Number(ingredient.exit<1);
  assert(ingredientCover===1||gallery.visibility===1||day.visibility===1,'Ingredient, gallery and day scenes must keep the viewport covered.');
}
console.log('Reference motion passed: curved gallery, pinned ingredient subjects, exact scent endpoints, reverse traversal, static motion preference and covered handoffs.');

const {copyTravel}=await import(url(await compile('spatialMotion')));
for(const [w,h] of [[390,844],[1440,900]]){
  const forward=Array.from({length:301},(_,step)=>[0,1,2,3].map(i=>copyTravel(step/100,i,3,w,h)));
  for(let step=300;step>=0;step--)for(let i=0;i<4;i++){
    const text=copyTravel(step/100,i,3,w,h);
    assert.deepEqual(text,forward[step][i],'Reverse scrolling must retrace the reading column.');
    assert.equal(text.x,0,'Copy follows vertical scrolling, never a page swipe.');
    if(!text.visible)assert(Math.abs(text.y)>=h,'Text may retire only outside the reading viewport.');
    const still=copyTravel(step/100,i,3,w,h,true);assert.equal(still.y,0);
  }
}
for(let step=0;step<=100;step++){const t=step/100;assert([0,1].includes(scentTravel(a,b,t,1440,900).alpha),'Scent flacons must not crossfade.');}
console.log('Continuous vertical reading flow, reverse traversal and static reduced-motion text passed.');

// Guard the authored scene paths, while leaving glass, shadows and grain materials alone.
for(const file of ['story.ts','aboutMotion.ts','usePageFilm.ts','IngredientStory.tsx','CollectionGallery.tsx','LifestyleStory.tsx']){
  const source=await fs.readFile(new URL(`../src/${file}`,import.meta.url),'utf8');
  assert(!source.includes('sceneArrival'),`${file} must not move a viewport-sized scene.`);
  const assignments=[...source.matchAll(/\.style\.opacity\s*=\s*([^;]+);/g)];
  const safeWrites=[...source.matchAll(/writeMotionStyle\([^,]+,'opacity',([^\)]+)\)/g)];
  assert(assignments.length+safeWrites.length>0);
  for(const [,value] of safeWrites)assert.equal(value.trim(),"'1'",`${file} must keep scene opacity constant.`);
  for(const [,value] of assignments)assert.equal(value.trim(),"'1'",`${file} must not fade a scene, heading or product.`);
}
for(const file of ['AboutJourney.module.css','PageFilm.module.css','IngredientStory.module.css','CollectionGallery.module.css','LifestyleStory.module.css']){
  const source=await fs.readFile(new URL(`../src/${file}`,import.meta.url),'utf8');
  assert(!/opacity:(?:var|calc)\(/.test(source),`${file} must use spatial transforms rather than opacity timelines.`);
}
console.log('Sitewide scene/text/product no-fade regression guards passed.');

const about=await fs.readFile(new URL('../src/AboutJourney.tsx',import.meta.url),'utf8');assert(!about.includes('styles.darkroom')&&!about.includes('styles.natureWindow'),'About must keep one backdrop, without moving background windows.');
