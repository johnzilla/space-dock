/**
 * InputController - Handles keyboard input for 6DOF controls
 *
 * Translation: WASD/RF
 * Rotation: IJKL/QE
 * Kill rotation: SPACE
 * Kill translation: X
 * Precision mode: SHIFT (held)
 */
export class InputController {
    constructor() {
        this.keys = {};

        // Bind handlers
        this.onKeyDown = this.onKeyDown.bind(this);
        this.onKeyUp = this.onKeyUp.bind(this);

        window.addEventListener('keydown', this.onKeyDown);
        window.addEventListener('keyup', this.onKeyUp);
    }

    onKeyDown(e) {
        this.keys[e.code] = true;

        // Prevent default for game keys
        if (['Space', 'KeyX', 'KeyW', 'KeyA', 'KeyS', 'KeyD', 'KeyR', 'KeyF',
             'KeyQ', 'KeyE', 'KeyI', 'KeyJ', 'KeyK', 'KeyL'].includes(e.code)) {
            e.preventDefault();
        }
    }

    onKeyUp(e) {
        this.keys[e.code] = false;
    }

    isPressed(code) {
        return this.keys[code] === true;
    }

    /**
     * Get translation input as a vector (-1 to 1 per axis)
     * Returns { x, y, z } in ship-local coordinates
     */
    getTranslationInput() {
        let x = 0, y = 0, z = 0;

        // Forward/Back (Z axis) - W forward (-Z), S back (+Z)
        if (this.isPressed('KeyW')) z -= 1;
        if (this.isPressed('KeyS')) z += 1;

        // Left/Right (X axis) - A left (-X), D right (+X)
        if (this.isPressed('KeyA')) x -= 1;
        if (this.isPressed('KeyD')) x += 1;

        // Up/Down (Y axis) - R up (+Y), F down (-Y)
        if (this.isPressed('KeyR')) y += 1;
        if (this.isPressed('KeyF')) y -= 1;

        return { x, y, z };
    }

    /**
     * Get rotation input as a vector (-1 to 1 per axis)
     * Returns { x, y, z } representing pitch, yaw, roll
     */
    getRotationInput() {
        let pitch = 0, yaw = 0, roll = 0;

        // Pitch (X axis rotation) - I up, K down
        if (this.isPressed('KeyI')) pitch += 1;
        if (this.isPressed('KeyK')) pitch -= 1;

        // Yaw (Y axis rotation) - J left, L right
        if (this.isPressed('KeyJ')) yaw += 1;
        if (this.isPressed('KeyL')) yaw -= 1;

        // Roll (Z axis rotation) - Q CCW, E CW
        if (this.isPressed('KeyQ')) roll += 1;
        if (this.isPressed('KeyE')) roll -= 1;

        return { x: pitch, y: yaw, z: roll };
    }

    /**
     * Check if precision mode is active (SHIFT held)
     */
    isPrecisionMode() {
        return this.isPressed('ShiftLeft') || this.isPressed('ShiftRight');
    }

    /**
     * Check if kill rotation is pressed (SPACE)
     */
    isKillRotation() {
        return this.isPressed('Space');
    }

    /**
     * Check if kill translation is pressed (X)
     */
    isKillTranslation() {
        return this.isPressed('KeyX');
    }

    dispose() {
        window.removeEventListener('keydown', this.onKeyDown);
        window.removeEventListener('keyup', this.onKeyUp);
    }
}
