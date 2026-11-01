import { useEffect, useRef, useState, type MutableRefObject } from 'react';
import { content } from './content';
import type { StoryState } from './story';
import styles from './PhotographicScene.module.css';

type StoryRef = MutableRefObject<StoryState>;
type Pose = Float32Array;

export function ProductFallback() {
  return <div className={styles.fallback}>
    {content.products.map((product, index) => <img key={product.id} src={product.imageSmall} alt={product.imageAlt} className={styles[`bottle${index}`]} />)}
  </div>;
}

export default function PhotographicScene({ story }: { story: StoryRef }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const node = canvas.current;
    const ctx = node?.getContext('2d', { alpha: true });
    if (!node || !ctx) return;
    const images: (HTMLImageElement | null)[] = [null, null, null];
    const first = new Float32Array(5); const second = new Float32Array(5); const result = new Float32Array(15);
    const pointer = { x: 0, y: 0 };
    let width = innerWidth; let height = innerHeight; let frame = 0; let live = true;
    let lastStage = -1; let lastTime = -1;
    const resize = () => {
      width = innerWidth; height = innerHeight;
      const ratio = Math.min(devicePixelRatio || 1, content.scene.photography.pixelRatio);
      node.width = Math.round(width * ratio); node.height = Math.round(height * ratio);
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0); lastStage = -1;
    };
    const move = (event: PointerEvent) => { pointer.x = event.clientX / width - 0.5; pointer.y = event.clientY / height - 0.5; story.current.pointerX = pointer.x; story.current.pointerY = pointer.y; };
    const pose = (stage: number, index: number, target: Pose) => {
      const s = story.current; const config = content.scene.photography;
      const compact = height < 740;
      const hero = s.mobile ? config.mobileHero : config.desktopHero;
      if (stage === 0) {
        target[0] = hero.x[index]; target[1] = hero.y[index];
        target[2] = hero.height[index] * (s.mobile && compact ? 0.86 : 1);
        target[3] = hero.tilt[index]; target[4] = 1;
        if (!s.mobile && width < 1200 && index === 2) { target[1] -= 0.07; target[2] *= 0.90; }
      } else if (stage === 4) {
        const finale = s.mobile ? config.mobileFinal : config.desktopFinal;
        target[0] = finale.x[index]; target[1] = finale.y[index];
        target[2] = finale.height[index] * (s.mobile && compact ? 0.86 : 1);
        target[3] = finale.tilt[index]; target[4] = 1;
        if (!s.mobile && width < 1200 && index === 2) { target[1] -= 0.07; target[2] *= 0.90; }
      } else if (index === stage - 1) {
        const focus = s.mobile ? config.mobileFocus : config.desktopFocus;
        target[0] = focus.x[index]; target[1] = focus.y;
        target[2] = focus.height[index] * (s.mobile && compact ? 0.82 : 1);
        target[3] = focus.tilt[index]; target[4] = 1;
      } else {
        target[0] = index < stage - 1 ? -0.25 : 1.25;
        target[1] = 0.52; target[2] = 0.25; target[3] = index % 2 ? -0.15 : 0.15; target[4] = 0;
      }
    };
    const draw = (time: number) => {
      const s = story.current;
      if (s.reduced && s.stage === lastStage && lastTime !== -1) { frame = requestAnimationFrame(draw); return; }
      lastStage = s.stage; lastTime = time;
      ctx.clearRect(0, 0, width, height);
      for (let index = 0; index < 3; index++) {
        pose(s.from, index, first); pose(s.to, index, second);
        for (let channel = 0; channel < 5; channel++) result[index * 5 + channel] = first[channel] + (second[channel] - first[channel]) * s.mix;
      }
      // The centre flacon sits in front of the two companion products.
      for (let drawIndex = 0; drawIndex < 3; drawIndex++) {
        const index = drawIndex === 2 ? 0 : drawIndex + 1;
        const image = images[index]; const offset = index * 5;
        if (!image || result[offset + 4] < 0.002) continue;
        const aspect = image.naturalWidth / image.naturalHeight;
        let imageHeight = result[offset + 2] * height;
        const maxWidth = width * (s.mobile ? (s.stage < 0.5 && index !== 0 ? 0.42 : 0.80) : 0.44);
        if (imageHeight * aspect > maxWidth) imageHeight = maxWidth / aspect;
        const imageWidth = imageHeight * aspect;
        const float = s.reduced ? 0 : Math.sin(time * 0.00065 + index * 1.4) * content.scene.photography.floatPx;
        const parallax = s.reduced ? 0 : pointer.x * content.scene.photography.parallaxPx;
        ctx.save();
        ctx.globalAlpha = result[offset + 4];
        ctx.translate(result[offset] * width + parallax * (index === 0 ? 1 : 0.5), result[offset + 1] * height + float);
        ctx.rotate(result[offset + 3] + (s.reduced ? 0 : pointer.x * 0.025));
        ctx.drawImage(image, -imageWidth / 2, -imageHeight / 2, imageWidth, imageHeight);
        ctx.restore();
      }
      frame = requestAnimationFrame(draw);
    };
    resize();
    content.products.forEach((product, index) => {
      const image = new Image(); image.decoding = 'async';
      image.onload = () => { if (live) { images[index] = image; lastStage = -1; if (index === 0) setReady(true); } };
      image.src = width <= content.scene.mobileBreakpoint ? product.imageSmall : product.image;
    });
    addEventListener('resize', resize); addEventListener('pointermove', move, { passive: true });
    frame = requestAnimationFrame(draw);
    return () => { live = false; cancelAnimationFrame(frame); removeEventListener('resize', resize); removeEventListener('pointermove', move); images.length = 0; };
  }, [story]);
  return <>
    {!ready && <ProductFallback />}
    <canvas ref={canvas} className={styles.canvas} aria-label={content.ui.scene} />
  </>;
}
