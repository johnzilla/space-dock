# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/claude-code) when working with code in this repository.

## Project Overview

DOCK is a first-person 6DOF space docking simulator built with Three.js. Players pilot a spacecraft using Newtonian physics to dock with stations and other spacecraft.

## Tech Stack

- **Three.js** - 3D rendering (loaded via ES modules from unpkg CDN)
- **Vanilla JavaScript** - No build step, ES modules in browser
- **No framework** - Pure HTML/CSS/JS

## Running the Project

```bash
npx serve .
```
Then open `http://localhost:3000`

## Project Structure

```
/
  index.html              # Entry point, HUD overlay, importmap for Three.js
  styles.css              # HUD styling (green monochrome, NASA-inspired)
  DOCK_GDD.md             # Full game design document
  src/
    main.js               # Three.js setup, render loop, scene objects
    systems/
      InputController.js  # Keyboard input for 6DOF controls
      PhysicsController.js # Newtonian physics (no damping)
```

## Architecture

- **Ship**: An invisible `Object3D` with physics state (velocity, angularVelocity)
- **Camera**: Attached as child of ship (first-person view)
- **Physics**: Pure Newtonian - no damping, velocity/rotation persist until countered
- **Input**: Keyboard only, WASD/RF for translation, IJKL/QE for rotation

## Controls

| Input | Action |
|-------|--------|
| W/S | Forward/backward thrust |
| A/D | Strafe left/right |
| R/F | Up/down |
| I/K | Pitch up/down |
| J/L | Yaw left/right |
| Q/E | Roll CCW/CW |
| SPACE | Kill all rotation |
| X | Kill all translation |
| SHIFT | Precision mode (10% thrust) |

## Key Design Principles

1. **Realism First** - True Newtonian physics, no cheats
2. **First-Person Immersion** - Camera rotates with ship
3. **No damping** - Motion persists until countered (space has no friction)

## Future MVP Items (from GDD)

- Kill rotation (SPACE) / kill translation (X) - DONE
- Precision mode (SHIFT) - DONE
- HUD: crosshair, distance, closure rate - DONE
- Docking detection (success state)
- Collision detection (failure state)
- Restart mission (R key)
