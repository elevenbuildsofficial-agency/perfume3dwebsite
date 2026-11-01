import fs from 'node:fs/promises';import ts from 'typescript';import assert from 'node:assert/strict';
const code=ts.transpileModule(await fs.readFile('src/sequence.ts','utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText;
const {film,filmPosition,poster}=await import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`);
assert.equal(filmPosition(0).clip.id,'hero-captlift');assert.equal(filmPosition(.35).clip.id,'hero-pushin');assert.equal(filmPosition(.60).clip.id,'first-light');assert.equal(filmPosition(4).clip.id,'reunion');
for(let i=0;i<film.clips.length-1;i++)assert.equal(film.clips[i].range[1],film.clips[i+1].range[0]);
let bytes=0;for(const c of film.clips)for(const name of c.stills)for(const mobile of [false,true]){const file='public'+poster(name,mobile);const stat=await fs.stat(file);if(!mobile)bytes+=stat.size;}
assert(bytes<15*1024*1024,'Desktop still fallback exceeds 15MB');console.log('Clip boundaries, frame existence and desktop fallback budget passed.',bytes);
