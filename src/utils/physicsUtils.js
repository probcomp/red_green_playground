import { TARGET_TIMESTEP, MAX_PHYSICS_STEPS_PER_FRAME, PHYSICS_WARNING_THRESHOLD } from '../constants';

/**
 * Calculate physics steps per frame based on ball speed and FPS
 * @param {number} ballSpeed - Ball speed in diameter/s
 * @param {number} fps - Frames per second
 * @returns {number} Physics steps per frame
 */
export const calculatePhysicsStepsPerFrame = (ballSpeed, fps) => {
  const idealPhysicsStepsPerFrame = (ballSpeed / fps) / TARGET_TIMESTEP;
  return Math.max(1, Math.round(idealPhysicsStepsPerFrame));
};

/**
 * Calculate actual timestep to achieve exact ball speed
 * @param {number} ballSpeed - Ball speed in diameter/s
 * @param {number} fps - Frames per second
 * @param {number} physicsStepsPerFrame - Physics steps per frame
 * @returns {number} Timestep
 */
export const calculateTimestep = (ballSpeed, fps, physicsStepsPerFrame) => {
  return (ballSpeed / fps) / physicsStepsPerFrame;
};

/**
 * Validate physics parameters
 * @param {number} physicsStepsPerFrame - Physics steps per frame
 * @returns {{isValid: boolean, warning: string|null}}
 */
export const validatePhysics = (physicsStepsPerFrame) => {
  const isValid = physicsStepsPerFrame <= MAX_PHYSICS_STEPS_PER_FRAME;
  const warning = physicsStepsPerFrame > PHYSICS_WARNING_THRESHOLD
    ? "High physics steps - consider reducing ball speed or increasing FPS"
    : null;
  return { isValid, warning };
};

/**
 * Calculate ball movement per frame
 * @param {number} ballSpeed - Ball speed in diameter/s
 * @param {number} fps - Frames per second
 * @returns {number} Diameters per frame
 */
export const calculateBallMovementPerFrame = (ballSpeed, fps) => {
  return ballSpeed / fps;
};

