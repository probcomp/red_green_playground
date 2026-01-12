import { useMemo } from 'react';
import {
  calculatePhysicsStepsPerFrame,
  calculateTimestep,
  validatePhysics,
  calculateBallMovementPerFrame
} from '../utils/physicsUtils';

/**
 * Hook for physics calculations
 */
export const usePhysics = (ballSpeed, fps) => {
  const physics = useMemo(() => {
    const physicsStepsPerFrame = calculatePhysicsStepsPerFrame(ballSpeed, fps);
    const timestep = calculateTimestep(ballSpeed, fps, physicsStepsPerFrame);
    const { isValid, warning } = validatePhysics(physicsStepsPerFrame);
    const ballMovementPerFrame = calculateBallMovementPerFrame(ballSpeed, fps);

    return {
      physicsStepsPerFrame,
      timestep,
      isValid,
      warning,
      ballMovementPerFrame,
    };
  }, [ballSpeed, fps]);

  return physics;
};

