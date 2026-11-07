/* A procedural photographic studio: no external HDRI, no star field, no wall-clock animation. */
import * as THREE from 'three';
const smooth=(a,b,T)=>{const k=Math.max(0,Math.min(1,(T-a)/(b-a)));return k*k*(3-2*k)};
export function createStudio(scene,renderer){
 renderer.outputColorSpace=THREE.SRGBColorSpace;
 renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.03;
 const stage=new THREE.Scene();stage.background=new THREE.Color(0x1a2530);
 const panels=[];
 function softbox(w,h,x,y,z,intensity){const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({color:new THREE.Color(intensity,intensity*1.035,intensity*1.06),side:THREE.DoubleSide}));m.position.set(x,y,z);m.lookAt(0,0,0);stage.add(m);panels.push(m)}
 softbox(10,3,-5,7,5,4);softbox(4,10,8,4,-5,2.3);softbox(8,2,0,10,-8,3.2);softbox(2,7,-9,1,-3,1.5);
 const pmrem=new THREE.PMREMGenerator(renderer);const env=pmrem.fromScene(stage,.04,.1,100);scene.environment=env.texture;pmrem.dispose();for(const p of panels){p.geometry.dispose();p.material.dispose()}
 scene.fog=new THREE.FogExp2(0x07151f,.014);
 const key=new THREE.DirectionalLight(0xe7eff3,3.1);key.position.set(-12,20,12);scene.add(key);
 const rim=new THREE.DirectionalLight(0x9fb9cc,1.6);rim.position.set(18,7,-13);scene.add(rim);
 const fill=new THREE.HemisphereLight(0xd6e1e5,0x091521,.65);scene.add(fill);
 const floor=new THREE.Mesh(new THREE.PlaneGeometry(220,220),new THREE.MeshStandardMaterial({color:0x081722,roughness:.94,metalness:.06,envMapIntensity:.12}));floor.material.transparent=true;floor.material.depthWrite=false;
 floor.material.onBeforeCompile=shader=>{
 shader.vertexShader='varying vec3 vFloorPosition;\n'+shader.vertexShader;
 shader.vertexShader=shader.vertexShader.replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\nvFloorPosition=(modelMatrix*vec4(transformed,1.)).xyz;');
 shader.fragmentShader='varying vec3 vFloorPosition;\n'+shader.fragmentShader;
 shader.fragmentShader=shader.fragmentShader.replace('#include <alphatest_fragment>', '#include <alphatest_fragment>\ndiffuseColor.a*=1.-smoothstep(22.,88.,length(vFloorPosition.xz-cameraPosition.xz));');
 };
 floor.rotation.x=-Math.PI/2;floor.position.y=-.014;scene.add(floor);
 const shadows=[];
 for(const [x,z,w,d]of[[-12,-8,14,8],[12,-8,11,8],[-11,7,8,5],[11,7,9,5],[0,0,12,12]]){
  const m=new THREE.Mesh(new THREE.PlaneGeometry(w*1.35,d*1.35),new THREE.ShaderMaterial({transparent:true,depthWrite:false,uniforms:{k:{value:.45}},vertexShader:'varying vec2 v;void main(){v=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'varying vec2 v;uniform float k;void main(){float r=length((v-.5)*2.);gl_FragColor=vec4(.001,.004,.008,k*exp(-r*r*4.)*(1.-smoothstep(.7,1.,r)));}'}));m.position.set(x,-.010,z);m.rotation.x=-Math.PI/2;scene.add(m);shadows.push(m);
 }
 return {update(T){key.position.set(-13+T*.14,18+Math.sin(T*.035)*2,12-T*.08);rim.position.x=17-Math.sin(T*.04)*4;floor.material.opacity=smooth(7,11,T);floor.visible=floor.material.opacity>.001;for(const s of shadows){s.material.uniforms.k.value=.45*smooth(9,12,T);s.visible=T>9;}},dispose(){env.dispose();floor.geometry.dispose();floor.material.dispose();floor.removeFromParent();key.removeFromParent();rim.removeFromParent();fill.removeFromParent();for(const s of shadows){s.geometry.dispose();s.material.dispose();s.removeFromParent()}}};
}
