import * as THREE from 'three';
import { OrbitControls } from "https://unpkg.com/three@0.144.0/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "https://threejs.org/examples/jsm/loaders/GLTFLoader.js";
import { EffectComposer } from "https://threejs.org/examples/jsm/postprocessing/EffectComposer.js"
import { RenderPass } from "https://threejs.org/examples/jsm/postprocessing/RenderPass.js"
import { GlitchPass } from "https://threejs.org/examples/jsm/postprocessing/GlitchPass.js"
import { RGBShiftShader } from "https://threejs.org/examples/jsm/shaders/RGBShiftShader.js"
import { ShaderPass } from  "https://threejs.org/examples/jsm/postprocessing/ShaderPass.js"
import { BloomPass } from  "https://threejs.org/examples/jsm/postprocessing/BloomPass.js"
import { UnrealBloomPass } from  "https://threejs.org/examples/jsm/postprocessing/UnrealBloomPass.js"
import { FilmPass } from  "https://threejs.org/examples/jsm/postprocessing/FilmPass.js"


const renderer = new THREE.WebGLRenderer({
    antialias: true,
    canvas: document.getElementById("render")
    }
);

const monkeyUrl = new URL('bestar4.glb', import.meta.url);

renderer.setSize(window.innerWidth, window.innerHeight);

document.body.appendChild(renderer.domElement);
 
const scene = new THREE.Scene();

{
    const near = 1;
    const far = 15;
    const color = 'black';
    scene.fog = new THREE.Fog(color, near, far);
}


const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);


///renderer.setClearColor(#00000);

//const orbit = new OrbitControls(camera, renderer.domElement);

camera.position.set(4.5, 8 - window.scrollY / 120, 0);
camera.lookAt( 0, 0, 0 );
//orbit.update();

/*const grid = new THREE.GridHelper(30, 30);
scene.add(grid);*/

const assetLoader = new GLTFLoader();

// post processing
const composer = new EffectComposer(renderer);
const renderpass = new RenderPass(scene, camera);
const glitchpass = new GlitchPass();
const unrealbloompass = new UnrealBloomPass();
const filmpass = new FilmPass();
const rgbShift = new ShaderPass(RGBShiftShader);
const rgbAmount = 0.005;
const angle = 10;
rgbShift.uniforms.amount.value = rgbAmount;
rgbShift.uniforms.angle.value = angle;
rgbShift.enabled = true;
const bloompass = new BloomPass(   3,    // strength
    70,   // kernel size
    16,    // sigma ?
    1000,
    ) // blur render target resolution);
composer.addPass(renderpass);
composer.addPass(bloompass);
//composer.addPass(glitchpass);
composer.addPass(rgbShift);



let mixer;
assetLoader.load(monkeyUrl.href, function(gltf) {
    const model = gltf.scene;
    scene.add(model);
    mixer = new THREE.AnimationMixer(model);
    const clips = gltf.animations;

    // Play a certain animation
    // const clip = THREE.AnimationClip.findByName(clips, 'HeadAction');
    // const action = mixer.clipAction(clip);
    // action.play();

    // Play all animations at the same time
    clips.forEach(function(clip) {
        const action = mixer.clipAction(clip);
        action.play();
    });

}, undefined, function(error) {
    console.error(error);
});

const clock = new THREE.Clock();
function animate() {
    if(mixer)
        mixer.update(clock.getDelta());
    composer.render();
    //renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);

window.addEventListener('resize', function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});


function updateCamera(ev) {
	camera.position.y = 8 - window.scrollY / 120.0;
    camera.lookAt( 0, 0, 0 );
}

function updateCamera2(ev) {
	composer.addPass(glitchpass);
    composer.addPass(unrealbloompass);
    composer.addPass(filmpass);
    setTimeout(function(){
        composer.removePass(unrealbloompass);
        composer.removePass(filmpass);
    }, 20);
    setTimeout(function(){
        composer.removePass(glitchpass);
    }, 900);
    
}

window.addEventListener("scroll", updateCamera);

window.addEventListener("click", updateCamera2);

