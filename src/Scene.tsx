import { Component, Suspense, useEffect, useMemo, useRef, type MutableRefObject, type ReactNode } from 'react';
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { content, worlds, type ProfileCommand } from './content';
import type { StoryState } from './story';
import { vertex, glassFragment, liquidFragment, brassFragment, mistVertex, mistFragment } from './shaders';

type StoryRef = MutableRefObject<StoryState>;
const colors = worlds.map(palette => ({ a: new THREE.Color(palette.a), b: new THREE.Color(palette.b) }));
const maxProductX = Math.max(...content.scene.positions.map(Math.abs), 1);

function profilePoints(commands: ProfileCommand[]) {
  const points: THREE.Vector2[] = [];
  commands.forEach(command => {
    if (command.type === 'line') points.push(new THREE.Vector2(command.r, command.y));
    else for (let i = 0; i <= command.steps; i++) {
      const angle = THREE.MathUtils.degToRad(command.from + (command.to - command.from) * i / command.steps);
      points.push(new THREE.Vector2(command.center[0] + Math.cos(angle) * command.radius, command.center[1] + Math.sin(angle) * command.radius));
    }
  });
  return points;
}

function makeHalo() {
  const canvas = document.createElement('canvas'); canvas.width = canvas.height = 128;
  const ctx = canvas.getContext('2d')!;
  const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  gradient.addColorStop(0, 'rgba(255,255,255,0.65)');
  gradient.addColorStop(0.35, 'rgba(255,255,255,0.28)');
  gradient.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = gradient; ctx.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(canvas);
}

function makeLabel() {
  const canvas = document.createElement('canvas'); canvas.width = 1024; canvas.height = 768;
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  const draw = () => {
    const ctx = canvas.getContext('2d')!;
    const label = content.label;
    ctx.fillStyle = label.paper; ctx.fillRect(0, 0, 1024, 768);
    ctx.strokeStyle = label.border; ctx.lineWidth = 2; ctx.strokeRect(28, 28, 968, 712);
    ctx.fillStyle = label.ink; ctx.textAlign = 'center';
    ctx.font = `400 132px "${content.font.labelFamily}", sans-serif`; ctx.fillText(label.brand, 512, 235);
    ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(414, 295); ctx.lineTo(610, 295); ctx.stroke();
    ctx.font = `300 160px "${content.font.labelFamily}", sans-serif`; ctx.fillText(label.name, 512, 485);
    ctx.font = `400 38px "${content.font.labelFamily}", sans-serif`; ctx.fillText(label.descriptor, 512, 592);
    ctx.font = `400 30px "${content.font.labelFamily}", sans-serif`; ctx.fillText(label.volume, 512, 659);
    texture.needsUpdate = true;
  };
  draw();
  return { texture, draw };
}

function Bottle({ story }: { story: StoryRef }) {
  const liquidGroup = useRef<THREE.Group>(null);
  const resources = useMemo(() => {
    const p = content.product;
    const height = p.bodyHeight * p.fillLevel;
    const glassGeometry = new THREE.LatheGeometry(profilePoints(p.profile), p.segments);
    const liquidGeometry = new THREE.LatheGeometry(profilePoints([
      { type: 'line', r: 0, y: 0.16 }, { type: 'line', r: p.innerRadius - 0.10, y: 0.16 },
      { type: 'arc', center: [p.innerRadius - 0.10, 0.26], radius: 0.10, from: -90, to: 0, steps: 10 },
      { type: 'line', r: p.innerRadius, y: height }, { type: 'line', r: 0, y: height },
    ]), p.segments);
    const capGeometry = new THREE.LatheGeometry(profilePoints(p.capProfile), p.segments);
    const surfaceGeometry = new THREE.CircleGeometry(p.innerRadius, p.segments);
    const collarGeometry = new THREE.CylinderGeometry(p.collarRadius, p.collarRadius, 0.13, p.segments);
    const glass = new THREE.ShaderMaterial({ vertexShader: vertex, fragmentShader: glassFragment, uniforms: { uColorA: { value: colors[0].a.clone() } }, transparent: true, depthWrite: false, side: THREE.DoubleSide });
    const liquid = new THREE.ShaderMaterial({ vertexShader: vertex, fragmentShader: liquidFragment, uniforms: { uColorA: { value: colors[0].a.clone() }, uColorB: { value: colors[0].b.clone() }, uTime: { value: 0 }, uHeight: { value: height } }, transparent: true, depthWrite: false, side: THREE.FrontSide });
    const brass = new THREE.ShaderMaterial({ vertexShader: vertex, fragmentShader: brassFragment, uniforms: { uBrass: { value: new THREE.Color(p.brass) } } });
    const surface = new THREE.MeshBasicMaterial({ color: colors[0].a, transparent: true, opacity: 0.28, depthWrite: false, side: THREE.DoubleSide });
    const label = makeLabel();
    return { glassGeometry, liquidGeometry, capGeometry, surfaceGeometry, collarGeometry, glass, liquid, brass, surface, label };
  }, []);
  useEffect(() => {
    let live = true;
    document.fonts.ready.then(() => { if (live) resources.label.draw(); });
    return () => {
      live = false;
      resources.glassGeometry.dispose(); resources.liquidGeometry.dispose(); resources.capGeometry.dispose();
      resources.surfaceGeometry.dispose(); resources.collarGeometry.dispose();
      resources.glass.dispose(); resources.liquid.dispose(); resources.brass.dispose(); resources.surface.dispose(); resources.label.texture.dispose();
    };
  }, [resources]);
  useFrame(({ clock }) => {
    const s = story.current;
    const a = colors[s.from]; const b = colors[s.to];
    resources.glass.uniforms.uColorA.value.lerpColors(a.a, b.a, s.mix);
    resources.liquid.uniforms.uColorA.value.lerpColors(a.a, b.a, s.mix);
    resources.liquid.uniforms.uColorB.value.lerpColors(a.b, b.b, s.mix);
    resources.surface.color.lerpColors(a.a, b.a, s.mix);
    resources.liquid.uniforms.uTime.value = s.reduced ? 0 : clock.elapsedTime;
    if (liquidGroup.current) liquidGroup.current.rotation.z = s.reduced ? 0 : s.slosh + Math.sin(clock.elapsedTime * 1.2) * 0.006;
  });
  const p = content.product;
  return <group position-y={-p.centerY}>
    <group ref={liquidGroup}>
      <mesh geometry={resources.liquidGeometry} material={resources.liquid} renderOrder={1} dispose={null} />
      <mesh position-y={p.bodyHeight * p.fillLevel + 0.004} rotation-x={-Math.PI / 2} renderOrder={1} geometry={resources.surfaceGeometry} material={resources.surface} dispose={null} />
    </group>
    <mesh geometry={resources.glassGeometry} material={resources.glass} renderOrder={2} dispose={null} />
    <mesh position-y={0.15} rotation-x={Math.PI / 2} renderOrder={3}>
      <torusGeometry args={[0.66, 0.027, 10, p.segments]} />
      <meshBasicMaterial color="#f7f5cf" transparent opacity={0.55} depthWrite={false} />
    </mesh>
    <mesh geometry={resources.capGeometry} material={resources.brass} position-y={p.capY} renderOrder={3} dispose={null} />
    <mesh position-y={p.collarY} geometry={resources.collarGeometry} material={resources.brass} renderOrder={3} dispose={null} />
    <mesh position-y={p.capY + 0.052} rotation-x={Math.PI / 2} renderOrder={4}>
      <torusGeometry args={[0.475, 0.005, 6, p.segments]} />
      <meshBasicMaterial color="#e4c786" />
    </mesh>
    <mesh position-y={p.labelY} renderOrder={4}>
      <cylinderGeometry args={[p.labelRadius, p.labelRadius, p.labelHeight, 48, 1, true, -p.labelArc / 2, p.labelArc]} />
      <meshBasicMaterial map={resources.label.texture} side={THREE.FrontSide} toneMapped={false} />
    </mesh>
  </group>;
}

function ExternalModel({ url }: { url: string }) {
  const gltf = useLoader(GLTFLoader, url);
  const model = useMemo(() => {
    const clone = gltf.scene.clone(true);
    const bounds = new THREE.Box3().setFromObject(clone);
    const size = bounds.getSize(new THREE.Vector3());
    const center = bounds.getCenter(new THREE.Vector3());
    const scale = 3 / Math.max(size.y, 0.001);
    clone.position.copy(center).multiplyScalar(-scale);
    clone.scale.setScalar(scale);
    return clone;
  }, [gltf]);
  useEffect(() => () => {
    const geometries = new Set<THREE.BufferGeometry>(); const materials = new Set<THREE.Material>();
    const textures = new Set<THREE.Texture>();
    gltf.scene.traverse(object => {
      if (!(object instanceof THREE.Mesh)) return;
      geometries.add(object.geometry);
      const list = Array.isArray(object.material) ? object.material : [object.material];
      list.forEach(material => {
        materials.add(material);
        Object.values(material).forEach(value => { if (value instanceof THREE.Texture) textures.add(value); });
      });
    });
    geometries.forEach(geometry => geometry.dispose()); materials.forEach(material => material.dispose()); textures.forEach(texture => texture.dispose());
    useLoader.clear(GLTFLoader, url);
  }, [gltf, url]);
  return <primitive object={model} dispose={null} />;
}

class ModelBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? this.props.fallback : this.props.children; }
}

function Atmosphere({ story }: { story: StoryRef }) {
  const viewWidth = useThree(renderState => renderState.viewport.width);
  const aura = useRef<THREE.Mesh>(null);
  const shadow = useRef<THREE.Mesh>(null);
  const haloTexture = useMemo(makeHalo, []);
  const mist = useMemo(() => {
    const count = content.scene.mistCount;
    const positions = new Float32Array(count * 3); const seeds = new Float32Array(count);
    // Deterministic distribution: no allocations or CPU particle simulation per frame.
    for (let i = 0; i < count; i++) {
      const seed = (Math.sin(i * 127.1 + 13.7) * 43758.5453) % 1;
      seeds[i] = Math.abs(seed);
      positions[i * 3] = Math.sin(i * 2.399) * (1 + seeds[i] * 2.4);
      positions[i * 3 + 1] = (i / count) * 6 - 3;
      positions[i * 3 + 2] = -1 - seeds[i] * 2;
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1));
    const material = new THREE.ShaderMaterial({ vertexShader: mistVertex, fragmentShader: mistFragment, uniforms: { uTime: { value: 0 }, uColor: { value: colors[0].a.clone() } }, transparent: true, depthWrite: false });
    return { geometry, material };
  }, []);
  useEffect(() => () => { haloTexture.dispose(); mist.geometry.dispose(); mist.material.dispose(); }, [haloTexture, mist]);
  useFrame(({ clock }) => {
    const s = story.current;
    if (aura.current) {
      aura.current.position.x = s.mobile ? 0 : s.x * Math.min(1, viewWidth * 0.26 / maxProductX);
      aura.current.position.y = s.mobile ? 0.8 : -0.1;
      (aura.current.material as THREE.MeshBasicMaterial).color.lerpColors(colors[s.from].a, colors[s.to].a, s.mix);
    }
    if (shadow.current) { shadow.current.position.x = s.mobile ? 0 : s.x * Math.min(1, viewWidth * 0.26 / maxProductX); shadow.current.visible = !s.mobile; }
    mist.material.uniforms.uTime.value = s.reduced ? 0 : clock.elapsedTime;
    mist.material.uniforms.uColor.value.lerpColors(colors[s.from].a, colors[s.to].a, s.mix);
  });
  return <>
    <mesh ref={aura} position-z={-2.1} scale={[5.8, 5.8, 1]} renderOrder={-2}>
      <planeGeometry /><meshBasicMaterial map={haloTexture} color={content.hero.palette.a} transparent opacity={0.15} depthWrite={false} />
    </mesh>
    <mesh ref={shadow} position={[0, -1.7, -0.8]} scale={[2.5, 0.28, 1]} renderOrder={-1}>
      <planeGeometry /><meshBasicMaterial map={haloTexture} color="#273b19" transparent opacity={0.26} depthWrite={false} />
    </mesh>
    {!story.current.reduced && <points geometry={mist.geometry} material={mist.material} frustumCulled={false} dispose={null} />}
  </>;
}

function World({ story, modelUrl, onFailure }: { story: StoryRef; modelUrl?: string; onFailure: () => void }) {
  const group = useRef<THREE.Group>(null);
  const pointer = useRef({ x: 0, y: 0 });
  const { gl } = useThree();
  const height = useThree(renderState => renderState.size.height);
  const viewWidth = useThree(renderState => renderState.viewport.width);
  useEffect(() => {
    const move = (event: PointerEvent) => { pointer.current.x = event.clientX / innerWidth - 0.5; pointer.current.y = event.clientY / innerHeight - 0.5; };
    const lost = (event: Event) => { event.preventDefault(); onFailure(); };
    addEventListener('pointermove', move, { passive: true });
    gl.domElement.addEventListener('webglcontextlost', lost);
    return () => { removeEventListener('pointermove', move); gl.domElement.removeEventListener('webglcontextlost', lost); };
  }, [gl, onFailure]);
  useFrame(({ clock }, delta) => {
    if (!group.current) return;
    const s = story.current; const time = clock.elapsedTime;
    group.current.position.x = s.mobile ? 0 : s.x * Math.min(1, viewWidth * 0.26 / maxProductX);
    group.current.position.y = (s.mobile ? (height < 740 ? 0.70 : 0.60) : -0.12) + (s.reduced ? 0 : Math.sin(time * 0.75) * content.scene.idleFloat);
    group.current.rotation.y = -0.12 + s.stage / 4 * Math.PI * 2 * content.scene.rotations + (s.reduced ? 0 : Math.sin(time * 0.2) * content.scene.idleRotation);
    const tilt = s.reduced ? 0 : pointer.current.x * 0.08;
    group.current.rotation.z = THREE.MathUtils.damp(group.current.rotation.z, -0.09 + tilt + Math.sin(s.stage * Math.PI) * 0.055, 4, delta);
    group.current.rotation.x = s.reduced ? 0.03 : 0.04 + pointer.current.y * 0.055;
    group.current.scale.setScalar(s.mobile ? (height < 740 ? 0.62 : 0.73) : 1.00);
  });
  return <>
    <Atmosphere story={story} />
    <ambientLight intensity={1.5} /><directionalLight position={[3, 5, 5]} intensity={3} />
    <group ref={group}>
      {modelUrl ? <ModelBoundary fallback={<Bottle story={story} />}><Suspense fallback={<Bottle story={story} />}><ExternalModel url={modelUrl} /></Suspense></ModelBoundary> : <Bottle story={story} />}
    </group>
  </>;
}

export default function Scene({ story, modelUrl, onFailure }: { story: StoryRef; modelUrl?: string; onFailure: () => void }) {
  return <Canvas dpr={[1, Math.min(2, content.scene.pixelRatio)]} camera={{ position: [0, 0, content.scene.cameraZ], fov: content.scene.fov }} gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }} fallback={null} onCreated={({ gl }) => { gl.setClearColor(0x000000, 0); gl.toneMapping = THREE.ACESFilmicToneMapping; }}>
    <World story={story} modelUrl={modelUrl} onFailure={onFailure} />
  </Canvas>;
}
