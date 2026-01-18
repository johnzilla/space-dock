# DOCK: First-Person Space Docking Simulator
## Game Design Document v2.0

---

## 1. Concept Overview

**Title**: DOCK (working title)
**Genre**: Realistic space docking simulator
**Platform**: Web browser (desktop)
**Tech Stack**: Three.js + Cannon-es physics
**Core Fantasy**: You are a spacecraft pilot performing precision docking maneuvers, looking through your cockpit window at an approaching docking port.

**One-Liner**: A first-person 6DOF docking simulator where players master Newtonian mechanics to connect with spacecraft and stations in the vacuum of space.

**Reference**: Real-world docking procedures (Crew Dragon, Soyuz, Space Shuttle) and NASA's ISS Docking Simulator.

---

## 2. Core Design Pillars

1. **Realism First** — True Newtonian physics. No cheats, no invisible forces. What you'd experience in actual spaceflight.
2. **First-Person Immersion** — You ARE the pilot. The camera is your eyes. When your ship rotates, your view rotates.
3. **Skill Mastery** — Easy to grasp, difficult to master. The learning curve mirrors real astronaut training.
4. **Clarity** — Despite complexity, HUD and feedback make the physics understandable.

---

## 3. Perspective & Camera

### 3.1 First-Person Cockpit View
- Camera is rigidly attached to the player spacecraft
- Camera position: pilot's eye position, looking forward toward the docking port
- Field of view: ~70 degrees (adjustable)
- The target (station/ship) appears in front of the player
- When the player's ship rotates, the camera rotates with it — the universe appears to move

### 3.2 What the Player Sees
- Through a cockpit window or on a docking monitor
- The target spacecraft/station with visible docking port
- Alignment guides on the target port (cross pattern, like real docking systems)
- Stars in background provide rotational reference
- HUD elements overlaid or as in-cockpit instruments

### 3.3 Optional Views (Future)
- External chase camera (for replay/screenshots)
- Picture-in-picture external view
- Docking camera feed (simulated monitor showing close-up of port)

---

## 4. Physics Model

### 4.1 Reference Frame
- True 3D space with zero gravity
- No atmospheric drag (vacuum)
- Inertial reference frame — the "universe" is fixed, ships move through it

### 4.2 Six Degrees of Freedom (6DOF)

**Three Translation Axes**:
- X: Left/Right (strafe)
- Y: Up/Down (vertical)
- Z: Forward/Back (approach/retreat)

**Three Rotation Axes**:
- Pitch: Nose up/down (rotation around X axis)
- Yaw: Nose left/right (rotation around Y axis)
- Roll: Spin clockwise/counter-clockwise (rotation around Z axis)

### 4.3 Core Physics Properties

**Player Spacecraft**:
```
mass: number                    // kg, affects linear acceleration
inertia: { x, y, z }           // moment of inertia per axis, affects rotational acceleration
position: { x, y, z }          // world position in meters
velocity: { x, y, z }          // linear velocity in m/s
orientation: quaternion         // rotation state
angularVelocity: { x, y, z }   // rotation rate in rad/s
thrusterForce: number          // Newtons per thruster
rcsTorque: { x, y, z }         // torque per rotation axis
```

### 4.4 Physics Rules
- **Newton's First Law**: Objects in motion stay in motion. No velocity decay.
- **Newton's Second Law**: F = ma. Thrust force / mass = acceleration.
- **Newton's Third Law**: Thrust pushes ship opposite to thruster direction.
- **Angular momentum conserved**: Rotation continues until counter-rotation applied.
- **No maximum velocity**: Space has no speed limit.
- **Collisions are failures**: Contact above velocity threshold = crash.

### 4.5 Units
- Distance: meters (m)
- Velocity: meters per second (m/s)
- Mass: kilograms (kg)
- Force: Newtons (N)
- Rotation: degrees for display, radians internally
- Angular velocity: degrees per second for display

---

## 5. Controls

### 5.1 Translation (Moving the Ship)
| Input | Alt Input | Action | Direction |
|-------|-----------|--------|-----------|
| W | Up Arrow | Thrust forward | -Z (toward target) |
| S | Down Arrow | Thrust backward | +Z (away from target) |
| A | Left Arrow | Thrust left | -X |
| D | Right Arrow | Thrust right | +X |
| R | | Thrust up | +Y |
| F | | Thrust down | -Y |

### 5.2 Rotation (Orienting the Ship)
| Input | Action | Effect on View |
|-------|--------|----------------|
| I | Pitch up | Target drifts down on screen |
| K | Pitch down | Target drifts up on screen |
| J | Yaw left | Target drifts right on screen |
| L | Yaw right | Target drifts left on screen |
| Q | Roll CCW | Horizon rotates clockwise |
| E | Roll CW | Horizon rotates counter-clockwise |

### 5.3 Utility Controls
| Input | Action |
|-------|--------|
| SPACE | Kill rotation (zero all angular velocity) |
| X | Kill translation (zero all linear velocity relative to target) |
| SHIFT (hold) | Precision mode (10% thrust power) |
| TAB | Toggle HUD overlay |
| V | Cycle camera views (future) |
| R | Restart mission |
| ESC | Pause menu |

### 5.4 Control Feel
- Thrusters fire only while key is held
- No auto-stabilization except explicit kill commands
- Visual feedback: thruster particle effects visible at screen edges
- Audio feedback: RCS hiss sounds directionally

---

## 6. HUD / Instruments

### 6.1 Primary Flight Display (Always Visible)

**Center Crosshair / Alignment Indicator**:
- Fixed crosshair at screen center (where your docking port points)
- Target docking port marker shows where target port is relative to center
- When markers align = aligned for docking

**Closure Rate**: 
- Large numeric display: approach velocity in m/s
- Color coded: Green (< 0.3), Yellow (0.3-1.0), Red (> 1.0)
- Negative = approaching, Positive = retreating

**Distance to Target**:
- Distance to docking port in meters
- Countdown as you approach

**Relative Velocity Vector (Prograde Marker)**:
- Shows direction of travel relative to target
- Should align with center crosshair for straight approach

### 6.2 Attitude Indicators

**Pitch/Roll Indicator (Artificial Horizon)**:
- Shows ship orientation relative to target
- Ball or ladder display

**Alignment Status**:
- Pitch offset (degrees)
- Yaw offset (degrees)  
- Roll offset (degrees)
- All must be near zero for successful dock

### 6.3 Secondary Information

**Translation Velocity**:
- Current velocity on X, Y, Z axes in ship-local frame
- Small bar graphs or numeric display

**Angular Velocity**:
- Current rotation rates
- Shows when you're spinning and how fast

**Fuel Gauge** (if fuel mechanic enabled):
- RCS propellant remaining

### 6.4 Docking Guidance

**COAS (Crew Optical Alignment Sight) Style**:
- Reticle pattern that aligns with target markers when correctly oriented
- Like real Shuttle/Soyuz docking aids

**Range/Rate Tape**:
- Shows distance and closure rate on a tape-style display
- Common in real docking systems

---

## 7. Docking Mechanics

### 7.1 Success Criteria

A successful "soft dock" requires ALL conditions met simultaneously:

| Parameter | Threshold | Description |
|-----------|-----------|-------------|
| Distance | < 0.5 m | Docking ports within capture range |
| Lateral offset | < 0.2 m | Aligned on X and Y axes |
| Pitch alignment | < 5° | Nose angle vertical |
| Yaw alignment | < 5° | Nose angle horizontal |
| Roll alignment | < 10° | Roll orientation (more forgiving) |
| Closure rate | < 0.15 m/s | Gentle contact |
| Lateral velocity | < 0.1 m/s | Not drifting sideways at contact |

### 7.2 Failure States

**Collision**: Contact outside docking port area or exceeding velocity threshold
- Crash animation/sound
- Mission failed screen

**Miss**: Pass by the target without docking
- Can attempt to re-approach (no failure unless out of fuel/time)

### 7.3 Docking Sequence

1. **Approach Phase**: Close distance from starting position (~100-500m out)
2. **Alignment Phase**: Orient ship, zero lateral velocity
3. **Final Approach**: Slow, controlled approach (< 0.3 m/s)
4. **Capture**: Enter capture zone meeting all criteria
5. **Hard Dock**: Automatic after soft dock (port secures)

---

## 8. Game Modes

### 8.1 Training / Tutorial

**Mission 1: Translation** 
- Learn WASD/RF movement
- Reach waypoints in space

**Mission 2: Rotation**
- Learn IJKL/QE rotation
- Face target markers

**Mission 3: Kill Commands**
- Learn SPACE and X to zero motion
- Stop at precise locations

**Mission 4: Combined Movement**
- Navigate an approach path
- Manage translation and rotation together

**Mission 5: First Dock**
- Stationary target, generous tolerances
- Complete walk-through guidance

### 8.2 Campaign Missions

**Tier 1 - Orbital Operations**:
- Stationary targets, normal tolerances
- Increasing starting distances
- Introduction of fuel limits

**Tier 2 - Rendezvous**:
- Moving targets (constant velocity)
- Intercept approach required
- Targets at various orientations

**Tier 3 - Complex Docking**:
- Rotating targets (tumbling station scenario)
- Time pressure (emergency rescue)
- Multiple sequential docks
- Damaged thruster scenarios (asymmetric control)

**Tier 4 - Master Pilot**:
- Combination challenges
- Minimal fuel constraints
- Speed run challenges
- "Apollo 13" style degraded systems

### 8.3 Free Play / Sandbox
- Select any spacecraft and scenario
- Adjust physics parameters
- Practice without scoring

### 8.4 Challenges (Future)
- Daily procedural challenge
- Global leaderboards
- Scenario sharing

---

## 9. Spacecraft & Stations

### 9.1 Player Spacecraft (Unlockable)

| Name | Mass | Handling | Description |
|------|------|----------|-------------|
| Training Pod | 1,000 kg | Very responsive | Tutorial craft |
| Crew Capsule | 5,000 kg | Responsive | Standard crewed vehicle |
| Cargo Vehicle | 12,000 kg | Moderate | Automated resupply craft |
| Space Tug | 25,000 kg | Sluggish | Heavy orbital transfer |
| Station Module | 50,000 kg | Very sluggish | Moving station sections |

### 9.2 Target Types

- **Station Module**: Standard ISS-style docking port
- **Crew Vehicle**: Capsule with forward docking port
- **Cargo Ship**: Rear docking port, berthing style
- **Rotating Station**: Spin gravity station, dock to hub
- **Damaged Vehicle**: Tumbling, requires matching rotation
- **Asteroid Base**: Non-standard geometry (future)

---

## 10. Assists & Difficulty

### 10.1 Difficulty Levels

| Level | Auto-features | Tolerances | Score Multiplier |
|-------|---------------|------------|------------------|
| Training | Rotation damping, trajectory guides | Very generous | 0.5x |
| Normal | None | Standard | 1.0x |
| Realistic | None | Tight | 1.5x |
| Hardcore | Fuel limits, system failures | Very tight | 2.0x |

### 10.2 Optional Assists (Toggle Per-Mission)

| Assist | Effect | Score Impact |
|--------|--------|--------------|
| Rotation Damping | Slowly zeros angular velocity | -20% |
| Translation Damping | Slowly zeros relative velocity | -20% |
| Approach Corridor | Shows safe approach path | -10% |
| Auto-Alignment | Maintains target lock orientation | -50% |
| Unlimited Fuel | No propellant limit | No fuel bonus |

### 10.3 Purist Mode
All assists off, tightest tolerances, full score multiplier. For real astronaut wannabes.

---

## 11. Scoring System

**Base Score**: 1000 points for mission completion

**Bonuses**:
- Fuel efficiency: Up to +40%
- Time bonus: Based on par time
- Alignment precision: Tighter = higher bonus
- Contact gentleness: Slower final contact = bonus
- No assists: +25%
- No HUD: +10% (expert players)

**Grades**: S / A / B / C / D

---

## 12. Technical Specifications

### 12.1 Engine & Libraries

```
Three.js          - 3D rendering
Cannon-es         - Physics (or custom Euler integration for simplicity)
```

No build step required — ES modules via browser.

### 12.2 Project Structure

```
/src
  main.js                 # Three.js setup, render loop
  /scenes
    GameScene.js          # Main 3D scene setup
  /objects
    PlayerShip.js         # Player craft: physics state, docking port
    TargetStation.js      # Target: model, docking port, optional motion
    DockingPort.js        # Port position, alignment checking
  /systems
    PhysicsController.js  # 6DOF physics integration
    InputController.js    # Keyboard state, thrust/rotation commands
    DockingEvaluator.js   # Check all docking criteria
  /ui
    HUD.js                # HTML overlay for instruments
  /data
    spacecraft.json       # Ship stats
    missions.json         # Mission definitions
  /assets
    /models               # 3D models (or procedural geometry)
    /audio                # SFX
/index.html
/styles.css               # HUD styling
```

### 12.3 Render Loop Structure

```javascript
function animate() {
    requestAnimationFrame(animate);

    const delta = clock.getDelta();

    inputController.update();           // Read keyboard state
    physicsController.update(delta);    // Apply forces, integrate
    dockingEvaluator.update();          // Check dock/collision
    hud.update();                       // Refresh displays

    renderer.render(scene, camera);
}
```

### 12.4 Physics Integration

```javascript
// Translation: Apply thrust in ship-local direction, convert to world
const localForce = new THREE.Vector3(thrustX, thrustY, thrustZ);
const worldForce = localForce.applyQuaternion(ship.quaternion);
ship.velocity.add(worldForce.multiplyScalar(delta / ship.mass));
ship.position.add(ship.velocity.clone().multiplyScalar(delta));

// Rotation: Apply torque, update angular velocity and quaternion
ship.angularVelocity.add(torqueInput.multiply(delta / ship.inertia));
const rotationDelta = new THREE.Quaternion().setFromEuler(
    new THREE.Euler(
        ship.angularVelocity.x * delta,
        ship.angularVelocity.y * delta,
        ship.angularVelocity.z * delta
    )
);
ship.quaternion.multiply(rotationDelta);
```

### 12.5 Camera Setup

```javascript
// Camera is child of ship — moves with it automatically
const camera = new THREE.PerspectiveCamera(70, aspect, 0.1, 10000);
camera.position.set(0, 0.5, 0);  // Pilot eye position
camera.rotation.set(0, 0, 0);    // Looking forward (-Z)
ship.add(camera);
```

### 12.6 Relative Velocity Calculation

```javascript
function getRelativeVelocity(player, target) {
    return new THREE.Vector3().subVectors(
        player.velocity,
        target.velocity
    );
}

function getClosureRate(player, target) {
    const toTarget = new THREE.Vector3().subVectors(
        target.position,
        player.position
    ).normalize();
    const relVel = getRelativeVelocity(player, target);
    return relVel.dot(toTarget);  // Negative = approaching
}
```

---

## 13. MVP Scope (Phase 1)

Build this first:

- [ ] Three.js scene with starfield background
- [ ] Player "ship" (camera rig with physics state)
- [ ] 6DOF controls: WASD/RF translation, IJKL/QE rotation
- [ ] Newtonian physics: velocity persists, rotation persists
- [ ] Kill rotation (SPACE), kill translation (X)
- [ ] Precision mode (SHIFT)
- [ ] Target station with visible docking port (simple geometry)
- [ ] HUD: crosshair, distance, closure rate, alignment angles
- [ ] Docking detection (success state)
- [ ] Collision detection (failure state)
- [ ] Restart (R)

**Stretch for MVP**:
- [ ] Thruster particle effects at screen edges
- [ ] Basic sound effects
- [ ] One complete tutorial mission

---

## 14. Art Direction

### 14.1 Visual Style
- Clean, functional, NASA-inspired aesthetic
- High contrast for readability
- Focus on usability over flashiness

### 14.2 Spacecraft
- Simple geometric shapes for prototype (boxes, cylinders)
- Docking ports clearly marked with illuminated rings
- Alignment guides visible (cross pattern, chevrons)

### 14.3 Environment
- Black space with star field (provides rotation reference)
- Optional: Earth or planetary body in background for context
- Subtle ambient lighting

### 14.4 HUD Style
- Green/amber monochrome instruments (Apollo/Shuttle style)
- Or modern blue/white (Crew Dragon style)
- Semi-transparent overlays
- Clear typography, readable at speed

---

## 15. Audio

### 15.1 Sound Effects
- RCS thruster bursts (positional, varies by axis)
- Rotation thrusters (different tone)
- Proximity warning beeps
- Dock capture clunk
- Collision alarm/crunch
- Radio chatter ambiance (optional)

### 15.2 Music
- Ambient space atmosphere
- Tension music during close approach
- Success fanfare on dock

---

## 16. Future Considerations (Post-MVP)

- Multiplayer (co-op, competitive)
- Mission editor / community scenarios
- VR support (natural fit for first-person)
- Mobile port with gyro controls
- Electron/Steam standalone release
- Historical missions (Apollo, Shuttle, ISS)
- Realistic comms simulation

---

## 17. Success Metrics

The game is successful if:
1. Players feel like they're piloting a spacecraft in space
2. Physics are intuitively understandable within 10 minutes
3. Successful docking feels earned and satisfying
4. Players return to improve scores/times
5. Runs at 60fps in modern browsers

---

## 18. Reference Material

- NASA ISS Docking Simulator: https://iss-sim.spacex.com/
- Real Soyuz docking footage
- Kerbal Space Program docking tutorials
- Apollo docking procedures documentation

---

## End of Document

**Next Step**: Initialize Three.js project, implement MVP Phase 1 with basic 6DOF flight and a target to approach.
