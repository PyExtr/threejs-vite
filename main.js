import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.150.1/build/three.module.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

// Define the Labels object
const Labels = {
  // "1", "2A", "3A", "4"
  FIRST: {text:"1", gap:false, position:0},
  SECOND: {text:"2A", gap:true, position:1},
  THIRD: {text:"3A", gap:true, position:2},
  FOURTH: {text:"4", gap:false, position:3},
  // FIFTH: {text:"7", gap:true, position:-1}
};

// Create the scene
const scene = new THREE.Scene();

// Create the camera
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000,
);
camera.position.z = 20;
camera.position.y = -15;

// Change background color of the scene to white
scene.background = new THREE.Color("#575757");

// Create the renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Add OrbitControls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
controls.dampingFactor = 0.5;
controls.screenSpacePanning = false;
controls.maxPolarAngle = Math.PI * 2;
controls.mouseButtons = {
  LEFT: THREE.MOUSE.ROTATE,
  MIDDLE: THREE.MOUSE.DOLLY,
  RIGHT: THREE.MOUSE.PAN,
};

// Function to create text texture
function createTextTexture(text) {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  const size = 128;
  canvas.width = size;
  canvas.height = size;
  context.font = "Bold 48px Arial";
  context.fillStyle = "transparent";
  context.fillRect(0, 0, size, size);
  context.fillStyle = "white";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.lineWidth = 4;
  context.strokeStyle = "black";
  context.strokeText(text, size / 2, size / 2);
  context.fillText(text, size / 2, size / 2);
  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

// Function to create a cylinder with a side gap, preserving the top and bottom faces
function createCylinderWithGap(
  radiusTop,
  radiusBottom,
  height,
  radialSegments,
  gapSize,
) {
  // Create a standard cylinder geometry
  const geometry = new THREE.CylinderGeometry(
    radiusTop,
    radiusBottom,
    height,
    radialSegments,
    1,
    false,
    0,
    Math.PI * 2 - gapSize,
  );
  geometry.rotateY(Math.PI / 2);
  return geometry;
}

// Create the metallic electrodes made of 4 cylinders
const electrodeGeometry = new THREE.CylinderGeometry(0.4, 0.4, 2, 128);
const gapSize = Math.PI / 8; // Gap size in radians
const spaceBetween = 0.5; // Increased space between cylinders

const electrodeGroup = new THREE.Group();
const electrodes = [];

// const texts = [Labels.FIRST, Labels.SECOND, Labels.THIRD, Labels.FOURTH];

for (const label of Object.values(Labels)) {
  const materialElectrode = new THREE.MeshPhongMaterial({
    color: 0x404040,
  });

  let electrode;
  if (label.gap) {
    electrode = new THREE.Mesh(
      createCylinderWithGap(0.4, 0.4, 2, 128, gapSize),
      materialElectrode,
    );
  } else {
    electrode = new THREE.Mesh(electrodeGeometry, materialElectrode);
  }
  electrode.position.y = label.position * (2 + spaceBetween);

  // Create text plane
  const textTexture = createTextTexture(label.text);
  const textMaterial = new THREE.MeshBasicMaterial({
    map: textTexture,
    transparent: true,
    depthTest: false,
  });
  const textPlane = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), textMaterial);
  textPlane.position.set(0, 0, 0.32); // Slightly in front of the cylinder
  textPlane.userData.isText = true; // Mark as text to ignore in raycaster
  electrode.add(textPlane);

  electrodeGroup.add(electrode);
  electrodes.push(electrode);
}

// Create the rounded end (capsule) at the bottom of the first cylinder
const capsuleGeometry = new THREE.CapsuleGeometry(0.3, 15, 64, 128);
const capsuleMaterial = new THREE.MeshPhongMaterial({
  color: 0xffffff,
  transparent: true,
  opacity: 0.8,
  depthWrite: false,
});
const capsule = new THREE.Mesh(capsuleGeometry, capsuleMaterial);
capsule.position.y = 5; // Adjust position to connect to the bottom of the first cylinder
electrodeGroup.add(capsule);

// Set initial position of the electrode group
electrodeGroup.position.y = -4; // Adjusted starting position
scene.add(electrodeGroup);

// Create the transparent green ellipse
const ellipseGeometry = new THREE.CylinderGeometry(4.2, 4, 3, 128);
const ellipseMaterial = new THREE.MeshPhongMaterial({
  color: 0x00ff00,
  transparent: true,
  opacity: 0.1,
  depthWrite: false,
});
const ellipse = new THREE.Mesh(ellipseGeometry, ellipseMaterial);
ellipse.position.y = -10;
ellipse.renderOrder = 1;
scene.add(ellipse);

// Add lighting
const ambientLight = new THREE.AmbientLight(0x404040);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xffffff);
pointLight.position.set(5, 5, 5);
scene.add(pointLight);

// Declare the rotateScene variable globally
let rotateScene = false;

// Animation loop
function animate() {
  requestAnimationFrame(animate);

  // Rotate the scene if rotateScene is true
  if (rotateScene) {
    scene.rotation.y += 0.01;
  }

  controls.update(); // only required if controls.enableDamping = true, or if controls.autoRotate = true

  renderer.render(scene, camera);
}
animate();

// Handle window resize
window.addEventListener("resize", () => {
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
    const object = intersects.find(
      (intersect) => !intersect.object.userData.isText,
    ).object;
    const currentColor = object.material.color.getHex();
    let newColor;
    if (currentColor === 0x404040) {
      newColor = 0x0000ff; // Change from grey to blue
    } else if (currentColor === 0x0000ff) {
      newColor = 0xff0000; // Change from blue to red
    } else {
      newColor = 0x404040; // Change from red to grey
    }
    object.material.color.setHex(newColor);
  }
}

// Add event listener to the window
window.addEventListener("click", onMouseClick);

// Handle slider input
const slider = document.getElementById("position-slider");
slider.addEventListener("input", (event) => {
  const position = parseFloat(event.target.value);
  electrodeGroup.position.y = position;
});

// Add event listener to the rotate button
document.getElementById("rotate-button").addEventListener("click", () => {
  rotateScene = !rotateScene;
  document.getElementById("rotate-button").textContent = rotateScene
    ? "Stop Rotation"
    : "Start Rotation";
});
