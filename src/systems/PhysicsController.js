import * as THREE from 'three';

/**
 * PhysicsController - Handles Newtonian 6DOF physics
 *
 * No damping, no friction. Velocity and angular velocity persist
 * until countered by thrust.
 */
export class PhysicsController {
    constructor(ship) {
        this.ship = ship;

        // Physics state
        this.velocity = new THREE.Vector3(0, 0, 0);           // m/s in world space
        this.angularVelocity = new THREE.Vector3(0, 0, 0);    // rad/s in local space

        // Ship properties
        this.mass = 5000;                    // kg
        this.thrusterForce = 500;            // Newtons per thruster
        this.rcsTorque = 100;                // Nm per rotation axis
        this.inertia = new THREE.Vector3(5000, 5000, 3000);   // moment of inertia
    }

    /**
     * Apply translation thrust in ship-local coordinates
     * @param {Object} input - { x, y, z } each -1 to 1
     * @param {number} delta - time step in seconds
     * @param {boolean} precision - use precision mode (10% thrust)
     */
    applyThrust(input, delta, precision = false) {
        if (input.x === 0 && input.y === 0 && input.z === 0) return;

        const thrustMultiplier = precision ? 0.1 : 1.0;
        const force = this.thrusterForce * thrustMultiplier;

        // Create local force vector
        const localForce = new THREE.Vector3(input.x, input.y, input.z);
        localForce.multiplyScalar(force);

        // Convert to world space using ship's orientation
        const worldForce = localForce.applyQuaternion(this.ship.quaternion);

        // F = ma, so a = F/m
        const acceleration = worldForce.divideScalar(this.mass);

        // v = v0 + a*t
        this.velocity.add(acceleration.multiplyScalar(delta));
    }

    /**
     * Apply rotational thrust
     * @param {Object} input - { x, y, z } representing pitch, yaw, roll (-1 to 1)
     * @param {number} delta - time step in seconds
     * @param {boolean} precision - use precision mode (10% torque)
     */
    applyTorque(input, delta, precision = false) {
        if (input.x === 0 && input.y === 0 && input.z === 0) return;

        const torqueMultiplier = precision ? 0.1 : 1.0;
        const torque = this.rcsTorque * torqueMultiplier;

        // Angular acceleration = torque / inertia
        const angularAccel = new THREE.Vector3(
            (input.x * torque) / this.inertia.x,
            (input.y * torque) / this.inertia.y,
            (input.z * torque) / this.inertia.z
        );

        // Update angular velocity
        this.angularVelocity.add(angularAccel.multiplyScalar(delta));
    }

    /**
     * Kill all rotation (zero angular velocity)
     */
    killRotation() {
        this.angularVelocity.set(0, 0, 0);
    }

    /**
     * Kill all translation (zero linear velocity)
     */
    killTranslation() {
        this.velocity.set(0, 0, 0);
    }

    /**
     * Update physics state - integrate position and rotation
     * @param {number} delta - time step in seconds
     */
    update(delta) {
        // Update position based on velocity (Euler integration)
        this.ship.position.add(this.velocity.clone().multiplyScalar(delta));

        // Update rotation based on angular velocity
        if (this.angularVelocity.lengthSq() > 0.0000001) {
            // Create rotation quaternion from angular velocity
            const angularDelta = this.angularVelocity.clone().multiplyScalar(delta);
            const rotationQuat = new THREE.Quaternion();

            // Apply rotation in local space (pitch, yaw, roll order)
            rotationQuat.setFromEuler(new THREE.Euler(
                angularDelta.x,
                angularDelta.y,
                angularDelta.z,
                'YXZ'
            ));

            // Multiply current orientation by rotation delta
            this.ship.quaternion.multiply(rotationQuat);
            this.ship.quaternion.normalize();
        }
    }

    /**
     * Get velocity magnitude
     */
    getSpeed() {
        return this.velocity.length();
    }

    /**
     * Get angular velocity magnitude in degrees/sec
     */
    getAngularSpeed() {
        return this.angularVelocity.length() * (180 / Math.PI);
    }
}
