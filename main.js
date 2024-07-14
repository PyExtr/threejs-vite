import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

// Create the scene
const scene = new THREE.Scene();

// Create the camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 18;
camera.position.y = -8;

// Change background color of the scene to white
scene.background = new THREE.Color("#575757");

// Create the renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Add OrbitControls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
controls.dampingFactor = 0.25;
controls.screenSpacePanning = false;
controls.maxPolarAngle = Math.PI / 2;
controls.mouseButtons = {
    LEFT: THREE.MOUSE.ROTATE,
    MIDDLE: THREE.MOUSE.DOLLY,
    RIGHT: THREE.MOUSE.PAN
};

// Function to create text texture
function createTextTexture(text) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    const size = 128;
    canvas.width = size;
    canvas.height = size;
    context.font = 'Bold 48px Arial';
    context.fillStyle = 'transparent';
    context.fillRect(0, 0, size, size);
    context.fillStyle = 'white';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    // add white border around text for better visibility
    context.lineWidth = 4;
    context.strokeStyle = 'black';
    context.strokeText(text, size / 2, size / 2);

    context.fillText(text, size / 2, size / 2);
    const texture = new THREE.CanvasTexture(canvas);
    return texture;
}

// Create the metallic electrodes made of 4 cylinders
const electrodeGeometry = new THREE.CylinderGeometry(0.4, 0.4, 2, 32);
const numCylinders = 4;
const spaceBetween = 0.5;  // Increased space between cylinders

const electrodeGroup = new THREE.Group();
const electrodes = [];

const texts = ["1", "2A", "3A", "4"];

for (let i = 0; i < numCylinders; i++) {
    const materialElectrode = new THREE.MeshPhongMaterial({ 
        color: 0x404040
    });
    const electrode = new THREE.Mesh(electrodeGeometry, materialElectrode);
    electrode.position.y = i * (2 + spaceBetween);

    // Create text plane
    const textTexture = createTextTexture(texts[i]);
    const textMaterial = new THREE.MeshBasicMaterial({ map: textTexture, transparent: true, depthTest: false });
    const textPlane = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), textMaterial);
    textPlane.position.set(0, 0, 0.51);  // Slightly in front of the cylinder
    textPlane.userData.isText = true;  // Mark as text to ignore in raycaster
    electrode.add(textPlane);

    electrodeGroup.add(electrode);
    electrodes.push(electrode);
}

// Create the rounded end (capsule) at the bottom of the first cylinder
const capsuleGeometry = new THREE.CapsuleGeometry(0.3, 15, 64, 64);
const capsuleMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff, transparent: true, opacity: 0.8 });
const capsule = new THREE.Mesh(capsuleGeometry, capsuleMaterial);
capsule.position.y = 5; // Adjust position to connect to the bottom of the first cylinder
electrodeGroup.add(capsule);

// Set initial position of the electrode group
electrodeGroup.position.y = -4;  // Adjusted starting position
scene.add(electrodeGroup);

// Create the transparent green ellipse
const ellipseGeometry = new THREE.CylinderGeometry(4.2, 4, 3, 128);
const ellipseMaterial = new THREE.MeshPhongMaterial({ color: 0x00ff00, transparent: true, opacity: 0.5 });
const ellipse = new THREE.Mesh(ellipseGeometry, ellipseMaterial);
ellipse.position.y = -10;
scene.add(ellipse);

// Add lighting
const ambientLight = new THREE.AmbientLight(0x404040);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xffffff);
pointLight.position.set(5, 5, 5);
scene.add(pointLight);

// Animation variables
let direction = 1;
const speed = 0.01;
let rotateScene = false;

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    // Move the electrode group up and down
    electrodeGroup.position.y += speed * direction;
    if (electrodeGroup.position.y <= -14) {
        direction = 1;
    }
    if (electrodeGroup.position.y >= -4) {  // Adjusted the range of motion
        direction = -1;
    }

    // Rotate the scene if rotateScene is true
    if (rotateScene) {
        scene.rotation.y += 0.01;
    }

    controls.update(); // only required if controls.enableDamping = true, or if controls.autoRotate = true

    renderer.render(scene, camera);
}
animate();

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Raycaster setup
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function onMouseClick(event) {
    // Calculate mouse position in normalized device coordinates (-1 to +1) for both components
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Update the raycaster with the camera and mouse position
    raycaster.setFromCamera(mouse, camera);

    // Calculate objects intersecting the ray
    const intersects = raycaster.intersectObjects(electrodes);

    if (intersects.length > 0) {
        const object = intersects.find(intersect => !intersect.object.userData.isText).object;
        const currentColor = object.material.color.getHex();
        const newColor = currentColor === 0x0000ff ? 0xff0000 : 0x0000ff;
        object.material.color.setHex(newColor);
    }
}

// Add event listener to the window
window.addEventListener('click', onMouseClick);

// Add event listener to the rotate button
document.getElementById('rotate-button').addEventListener('click', () => {
    rotateScene = !rotateScene;
    document.getElementById('rotate-button').textContent = rotateScene ? 'Stop Rotation' : 'Start Rotation';
});
