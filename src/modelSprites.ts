import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { content } from './content';
import type { BottleSprites } from './bottleSprites';
import { productGeometry } from './productGeometry';

// Loaded only when a named GLB is present. Render registered PBR passes once;
// the shared compositor then applies the same reversible lens/cap choreography.
export async function renderModelSprites(url: string, index: number): Promise<BottleSprites> {
  const model=await new GLTFLoader().loadAsync(url);
  const body=model.scene.getObjectByName('body'),cap=model.scene.getObjectByName('cap');
  if(!body||!cap)throw new Error(`${url} needs nodes named body and cap.`);
  const width=Math.round(1200*productGeometry[index].aspect),height=1200;
  const renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,preserveDrawingBuffer:true});
  renderer.setSize(width,height);renderer.setPixelRatio(1);renderer.setClearColor(0,0);
  renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(30,width/height,.01,1000);
  const texture=await new THREE.TextureLoader().loadAsync(content.scene.background.image);
  const plate=document.createElement('canvas');plate.width=1024;plate.height=512;
  const ctx=plate.getContext('2d')!;ctx.filter='blur(22px)';ctx.drawImage(texture.image,0,0,1024,512);ctx.filter='none';ctx.fillStyle='#e6cd9b22';ctx.fillRect(0,0,1024,512);
  const envTexture=new THREE.CanvasTexture(plate);envTexture.mapping=THREE.EquirectangularReflectionMapping;envTexture.colorSpace=THREE.SRGBColorSpace;
  const pmrem=new THREE.PMREMGenerator(renderer),environment=pmrem.fromEquirectangular(envTexture);
  scene.environment=environment.texture;
  const sun=new THREE.DirectionalLight('#fff0d0',3.4);sun.position.set(-4,7,5);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);sun.shadow.bias=-.00015;sun.shadow.normalBias=.012;scene.add(sun);
  const bounce=new THREE.HemisphereLight('#e4ebdf','#c1a878',1.6);scene.add(bounce);
  const edge=new THREE.DirectionalLight('#f4f5ed',1.3);edge.position.set(3,3,-3);scene.add(edge);
  model.scene.traverse(object=>{
    if(!(object instanceof THREE.Mesh))return;
    object.castShadow=true;
    const materials=Array.isArray(object.material)?object.material:[object.material];
    const upgraded=materials.map(material=>{
      const name=material.name.toLowerCase();
      if(/glass|liquid/.test(name)) {
        const tint=/liquid/.test(name)?content.products[index].palette.a:'#f9f8ed';
        return new THREE.MeshPhysicalMaterial({name:material.name,color:'#ffffff',transmission:1,transparent:false,roughness:/liquid/.test(name)?.035:.075,ior:1.48,thickness:/liquid/.test(name)?.22:.085,attenuationColor:new THREE.Color(tint),attenuationDistance:/liquid/.test(name)?.48:2.5,envMapIntensity:1.2});
      }
      if(material instanceof THREE.MeshStandardMaterial){material.roughness=/wood|cap/.test(name)?.36:/brass|metal/.test(name)?.22:material.roughness;material.envMapIntensity=1.1;}
      return material;
    });
    object.material=Array.isArray(object.material)?upgraded:upgraded[0];
  });
  scene.add(model.scene);
  const box=new THREE.Box3().setFromObject(model.scene),size=box.getSize(new THREE.Vector3()),centre=box.getCenter(new THREE.Vector3());
  sun.position.copy(centre).add(new THREE.Vector3(-size.y*3,size.y*4,size.y*3));sun.target.position.copy(centre);scene.add(sun.target);
  Object.assign(sun.shadow.camera,{left:-size.y*2,right:size.y*2,top:size.y*2,bottom:-size.y*2,near:.01,far:size.y*20});sun.shadow.camera.updateProjectionMatrix();
  const catcher=new THREE.Mesh(new THREE.PlaneGeometry(size.y*8,size.y*8),new THREE.ShadowMaterial({color:'#686142',opacity:.27}));
  catcher.rotation.x=-Math.PI/2;catcher.position.set(centre.x,box.min.y+.0005,centre.z);catcher.receiveShadow=true;scene.add(catcher);
  camera.position.set(centre.x,centre.y+size.y*.025,centre.z+Math.max(size.y,size.x/(width/height))/Math.tan(THREE.MathUtils.degToRad(15))*.54);
  camera.lookAt(centre);camera.updateProjectionMatrix();
  const pass=()=>{renderer.render(scene,camera);const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;canvas.getContext('2d')!.drawImage(renderer.domElement,0,0);return canvas;};
  const materialVisibility=new Map<THREE.Material,[boolean,boolean]>();
  model.scene.traverse(object=>{if(object instanceof THREE.Mesh)for(const material of Array.isArray(object.material)?object.material:[object.material]){materialVisibility.set(material,[material.colorWrite,material.depthWrite]);material.colorWrite=false;material.depthWrite=false;}});
  const shadowPass=pass();materialVisibility.forEach(([colorWrite,depthWrite],material)=>{material.colorWrite=colorWrite;material.depthWrite=depthWrite;});catcher.visible=false;
  const closed=pass();cap.visible=false;const bodyPass=pass();
  const visibility=new Map<THREE.Object3D,boolean>();model.scene.traverse(object=>{visibility.set(object,object.visible);if(object instanceof THREE.Mesh)object.visible=false;});
  cap.visible=true;cap.traverse(object=>{object.visible=true;});const capPass=pass();
  visibility.forEach((visible,object)=>{object.visible=visible;});
  model.scene.traverse(object=>{if(object instanceof THREE.Mesh){object.geometry.dispose();for(const material of Array.isArray(object.material)?object.material:[object.material])material.dispose();}});
  catcher.geometry.dispose();(catcher.material as THREE.Material).dispose();sun.shadow.map?.dispose();
  environment.dispose();envTexture.dispose();texture.dispose();pmrem.dispose();renderer.dispose();
  return {closed,body:bodyPass,cap:capPass,shadow:shadowPass,width,height,approximate:false};
}
