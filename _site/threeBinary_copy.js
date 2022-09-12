import * as THREE from 'three';
import { OrbitControls } from "https://unpkg.com/three@0.144.0/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "https://threejs.org/examples/jsm/loaders/GLTFLoader.js";
import { }


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

camera.position.set(5, 5 - window.scrollY / 100, 0);
camera.lookAt( 0, 0, 0 );
//orbit.update();

/*const grid = new THREE.GridHelper(30, 30);
scene.add(grid);*/

const assetLoader = new GLTFLoader();

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
    renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);

window.addEventListener('resize', function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});


function updateCamera(ev) {
	camera.position.y = 5 - window.scrollY / 100.0;
    camera.lookAt( 0, 0, 0 );
}

window.addEventListener("scroll", updateCamera);
