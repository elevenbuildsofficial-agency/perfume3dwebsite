export const clamp = (n: number, a = 0, b = 1) => Math.max(a, Math.min(b, n));
export const smooth = (n: number) => { const t = clamp(n); return t * t * (3 - 2 * t); };
export const range = (n: number, a: number, b: number) => smooth((n - a) / (b - a));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// Units are viewport lengths, not a percentage of the complete five-chapter page.
// All animation is a pure function of scroll; there are no delayed cap tweens.
export function heroBeat(scroll: number, reduced = false) {
  if (reduced) return { lift: 1, focus: 0, dolly: 0, dissolve: 0, mist: 0, text: 1, exit: 0 };
  const lift = 1 - (1 - clamp((scroll - .03) / .09)) ** 3;
  return {
    lift, focus: range(scroll, .08, .16), dolly: range(scroll, .12, .245),
    dissolve: range(scroll, .225, .30), mist: range(scroll, .08, .16),
    text: 1 - range(scroll, .025, .095), exit: range(scroll, .15, .245),
  };
}

export function chapterStage(scroll: number, first: number, last: number) {
  if (scroll < .30) return clamp(scroll / .30);
  if (scroll < first) return 1;
  return 1 + 3 * clamp((scroll - first) / Math.max(.01, last - first));
}

export function groundFrame(width: number, height: number, pointerX: number, pointerY: number, stage: number, reduced: boolean) {
  return {
    x: reduced ? 0 : pointerX * Math.min(12, width * .012),
    y: reduced ? 0 : pointerY * 5 - Math.min(stage, 4) * 1.5,
    baseline: height * (width <= 1000 ? .555 : .705),
  };
}

export function neckCamera(width: number, height: number, neckX: number, neckY: number, dolly: number) {
  const scale = 1 + dolly * 3.7;
  return { scale, x: (width * .5 - neckX) * dolly, y: (height * .50 - neckY) * dolly };
}

export function scentLift(stage: number, index: number, reduced = false) {
  if (reduced) return 1;
  const arrival = range(stage, index + .68, index + 1.02);
  const departure = 1 - range(stage, index + 1.55, index + 1.9);
  return arrival * departure;
}
