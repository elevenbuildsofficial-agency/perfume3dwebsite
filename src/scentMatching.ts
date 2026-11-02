// Local, deterministic scent matching; no visitor data leaves the browser.
export type ScentAnswer=0|1|2|null;
export const scentQuestions=[
  {title:'Follow a feeling.',prompt:'What do you want your scent to feel like?',label:'The feeling',weight:3,choices:[{label:'Bright & open',detail:'Light through an open window.'},{label:'Soft & magnetic',detail:'A little warmth, held close.'},{label:'Green & grounded',detail:'The long way through the trees.'}]},
  {title:'Trust your nose.',prompt:'Which notes draw you in?',label:'The notes',weight:3,choices:[{label:'Citrus & petals',detail:'Bergamot peel. Neroli. Cedarwood.'},{label:'Rose & black tea',detail:'Rose petals. Dark tea. Soft amber.'},{label:'Fig leaf & woods',detail:'Crushed leaves. Vetiver. Dry cedar.'}]},
  {title:'Make it a moment.',prompt:'Where do you picture wearing it?',label:'The moment',weight:1,choices:[{label:'A fresh beginning',detail:'An unhurried morning, a new day.'},{label:'The softer hours',detail:'Dinner, dusk, a familiar room.'},{label:'Out in the world',detail:'A walk with nowhere to rush.'}]},
] as const;

export function matchScent(answers:readonly ScentAnswer[]):number|null {
  if(answers.length!==3||answers.some(answer=>answer===null))return null;
  const scores=[0,0,0];
  answers.forEach((answer,index)=>{if(answer!==null)scores[answer]+=scentQuestions[index].weight;});
  const best=Math.max(...scores),notes=answers[1]!;
  return scores[notes]===best?notes:scores.indexOf(best);
}
