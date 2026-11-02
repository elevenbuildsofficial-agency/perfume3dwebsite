import {execFileSync} from 'node:child_process';
import ffmpeg from 'ffmpeg-static';
import sharp from 'sharp';
const video='3d website reference video.mp4';
execFileSync(ffmpeg,['-hide_banner','-loglevel','error','-i',video,'-vf','fps=2,scale=216:-1','-q:v','3','-y','qa/reference-frame-%03d.jpg']);
for(let sheet=0;sheet<3;sheet++){
  const cells=[];
  for(let n=0;n<18;n++){
    const index=sheet*18+n+1;
    if(index>54)break;
    const left=(n%6)*216,top=Math.floor(n/6)*410;
    cells.push({input:await sharp(`qa/reference-frame-${String(index).padStart(3,'0')}.jpg`).toBuffer(),left,top});
    cells.push({input:Buffer.from(`<svg width="216" height="26"><rect width="216" height="26" fill="#151c18"/><text x="10" y="18" fill="white" font-size="14">${((index-1)/2).toFixed(1)} s</text></svg>`),left,top:top+384});
  }
  await sharp({create:{width:1296,height:1230,channels:3,background:'#151c18'}}).composite(cells).jpeg({quality:88}).toFile(`qa/reference-sheet-${sheet+1}.jpg`);
}
console.log('Created three timestamped sheets at 2 fps.');
