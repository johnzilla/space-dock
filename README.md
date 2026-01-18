# DOCK

A first-person 6DOF space docking simulator built with Three.js.

Master Newtonian physics to dock with spacecraft and stations in the vacuum of space. No friction, no damping - just you and orbital mechanics.

## Play

```bash
npx serve .
```

Open `http://localhost:3000`

## Controls

| Input | Action |
|-------|--------|
| W / S | Forward / backward |
| A / D | Strafe left / right |
| R / F | Up / down |
| I / K | Pitch up / down |
| J / L | Yaw left / right |
| Q / E | Roll CCW / CW |
| SPACE | Kill rotation |
| X | Kill translation |
| SHIFT | Precision mode (10% thrust) |

## Features

- True Newtonian physics - velocity and rotation persist until countered
- First-person cockpit view
- 6 degrees of freedom movement
- Target station with docking port alignment guides
- Real-time HUD: distance, closure rate, velocity, angular velocity

## Tech

- Three.js (ES modules via CDN)
- No build step required
- Vanilla JavaScript

## License

MIT
