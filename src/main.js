import * as THREE from 'three';
import { InputController } from './systems/InputController.js';
import { PhysicsController } from './systems/PhysicsController.js';

// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

// Player ship (invisible - camera is attached to it)
const ship = new THREE.Object3D();
ship.position.set(0, 0, 100);  // Start 100m from origin
scene.add(ship);

// Camera (attached to ship, represents pilot's eyes)
const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 10000);
camera.position.set(0, 0.5, 0);  // Slightly above ship center (pilot eye position)
camera.rotation.set(0, 0, 0);    // Looking forward (-Z)
ship.add(camera);

// Controllers
const inputController = new InputController();
const physicsController = new PhysicsController(ship);

// Create starfield
function createStarfield() {
    const starCount = 2000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount * 3; i += 3) {
        // Distribute stars in a large sphere
        const radius = 1000 + Math.random() * 4000;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);

        positions[i] = radius * Math.sin(phi) * Math.cos(theta);
        positions[i + 1] = radius * Math.sin(phi) * Math.sin(theta);
        positions[i + 2] = radius * Math.cos(phi);
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 2,
        sizeAttenuation: false
    });

    return new THREE.Points(geometry, material);
}

const starfield = createStarfield();
scene.add(starfield);

// Create target station
function createTargetStation() {
    const group = new THREE.Group();

    // Main body (cylinder)
    const bodyGeometry = new THREE.CylinderGeometry(3, 3, 15, 16);
    const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0x888888 });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.rotation.x = Math.PI / 2;  // Orient along Z axis
    group.add(body);

    // Docking port ring (facing the player)
    const ringGeometry = new THREE.TorusGeometry(1.5, 0.2, 8, 32);
    const ringMaterial = new THREE.MeshStandardMaterial({
        color: 0x00ff88,
        emissive: 0x00ff88,
        emissiveIntensity: 0.5
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.position.z = 7.5;  // Front of station
    group.add(ring);

    // Docking port cross guides
    const crossMaterial = new THREE.MeshStandardMaterial({
        color: 0xff4444,
        emissive: 0xff4444,
        emissiveIntensity: 0.3
    });

    const crossH = new THREE.Mesh(
        new THREE.BoxGeometry(2.5, 0.1, 0.1),
        crossMaterial
    );
    crossH.position.z = 7.5;
    group.add(crossH);

    const crossV = new THREE.Mesh(
        new THREE.BoxGeometry(0.1, 2.5, 0.1),
        crossMaterial
    );
    crossV.position.z = 7.5;
    group.add(crossV);

    // Solar panels
    const panelGeometry = new THREE.BoxGeometry(20, 0.1, 5);
    const panelMaterial = new THREE.MeshStandardMaterial({ color: 0x1a1a4a });

    const panelLeft = new THREE.Mesh(panelGeometry, panelMaterial);
    panelLeft.position.set(-13, 0, 0);
    group.add(panelLeft);

    const panelRight = new THREE.Mesh(panelGeometry, panelMaterial);
    panelRight.position.set(13, 0, 0);
    group.add(panelRight);

    return group;
}

const targetStation = createTargetStation();
targetStation.position.set(0, 0, 0);  // Station at origin
scene.add(targetStation);

// Lighting
const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
scene.add(ambientLight);

const sunLight = new THREE.DirectionalLight(0xffffff, 1.5);
sunLight.position.set(100, 50, 100);
scene.add(sunLight);

// HUD elements
const distanceEl = document.getElementById('distance');
const closureEl = document.getElementById('closure');
const velocityEl = document.getElementById('velocity');
const angularEl = document.getElementById('angular');

// Clock for delta time
const clock = new THREE.Clock();

// Calculate relative values
function getDistanceToTarget() {
    return ship.position.distanceTo(targetStation.position);
}

function getClosureRate() {
    const toTarget = new THREE.Vector3().subVectors(targetStation.position, ship.position).normalize();
    return -physicsController.velocity.dot(toTarget);  // Negative because approaching = positive closure
}

// Update HUD
function updateHUD() {
    const distance = getDistanceToTarget();
    const closure = getClosureRate();
    const vel = physicsController.velocity;
    const angVel = physicsController.angularVelocity;

    distanceEl.textContent = distance.toFixed(1);

    // Color code closure rate
    const closureAbs = Math.abs(closure);
    if (closureAbs < 0.3) {
        closureEl.style.color = '#00ff88';
    } else if (closureAbs < 1.0) {
        closureEl.style.color = '#ffff00';
    } else {
        closureEl.style.color = '#ff4444';
    }
    closureEl.textContent = closure.toFixed(2);

    velocityEl.textContent = `${vel.x.toFixed(2)}, ${vel.y.toFixed(2)}, ${vel.z.toFixed(2)}`;

    const angDeg = angVel.clone().multiplyScalar(180 / Math.PI);
    angularEl.textContent = `${angDeg.x.toFixed(1)}, ${angDeg.y.toFixed(1)}, ${angDeg.z.toFixed(1)} deg/s`;
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    const delta = clock.getDelta();

    // Get input
    const translationInput = inputController.getTranslationInput();
    const rotationInput = inputController.getRotationInput();
    const precision = inputController.isPrecisionMode();

    // Handle kill commands
    if (inputController.isKillRotation()) {
        physicsController.killRotation();
    }
    if (inputController.isKillTranslation()) {
        physicsController.killTranslation();
    }

    // Apply thrust and torque
    physicsController.applyThrust(translationInput, delta, precision);
    physicsController.applyTorque(rotationInput, delta, precision);

    // Update physics
    physicsController.update(delta);

    // Update HUD
    updateHUD();

    // Render
    renderer.render(scene, camera);
}

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Start animation
animate();

console.log('DOCK - Space Docking Simulator');
console.log('Controls: WASD/RF translate, IJKL/QE rotate, SPACE kill rot, X kill vel, SHIFT precision');
