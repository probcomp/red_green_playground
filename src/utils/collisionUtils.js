/**
 * Check if a circle overlaps with a rectangle
 * @param {number} circleX - Circle center X
 * @param {number} circleCenterY - Circle center Y
 * @param {number} circleRadius - Circle radius
 * @param {number} rectX - Rectangle X (left)
 * @param {number} rectY - Rectangle Y (bottom)
 * @param {number} rectWidth - Rectangle width
 * @param {number} rectHeight - Rectangle height
 * @returns {boolean} True if collision detected
 */
export const checkCircleRectangleCollision = (
  circleX,
  circleCenterY,
  circleRadius,
  rectX,
  rectY,
  rectWidth,
  rectHeight
) => {
  // Find the closest point on the rectangle to the circle's center
  const closestX = Math.max(rectX, Math.min(circleX, rectX + rectWidth));
  const closestY = Math.max(rectY, Math.min(circleCenterY, rectY + rectHeight));
  
  // Calculate the distance between the circle's center and this closest point
  const distanceX = circleX - closestX;
  const distanceY = circleCenterY - closestY;
  const distanceSquared = (distanceX * distanceX) + (distanceY * distanceY);
  
  // Check if the distance is less than the circle's radius (collision detected)
  return distanceSquared < (circleRadius * circleRadius);
};

/**
 * Validate ball positions against barriers
 * @param {Array} entities - Array of entities
 * @param {Array} keyDistractors - Array of key distractors (optional)
 * @param {string} mode - Current mode ('regular' or 'distractor')
 * @returns {{valid: boolean, message?: string}}
 */
export const validateBallPositions = (entities, keyDistractors = [], mode = 'regular') => {
  const barriers = entities.filter(e => e.type === 'barrier');
  
  if (barriers.length === 0) {
    return { valid: true };
  }

  // Check all target balls
  const targets = entities.filter(e => e.type === 'target');
  for (const target of targets) {
    const ballCenterX = target.x + target.width / 2;
    const ballCenterY = target.y + target.height / 2;
    const ballRadius = target.width / 2;
    
    for (const barrier of barriers) {
      if (checkCircleRectangleCollision(
        ballCenterX,
        ballCenterY,
        ballRadius,
        barrier.x,
        barrier.y,
        barrier.width,
        barrier.height
      )) {
        return {
          valid: false,
          message: "Cannot simulate: A ball is placed inside or overlapping a barrier. Please move the ball to a valid position."
        };
      }
    }
  }

  // Check key distractor balls if in distractor mode
  if (mode === 'distractor' && keyDistractors.length > 0) {
    const ballRadius = targets.length > 0 ? targets[0].width / 2 : 0.5;
    
    for (let i = 0; i < keyDistractors.length; i++) {
      const distractor = keyDistractors[i];
      const ballCenterX = distractor.x;
      const ballCenterY = distractor.y;
      
      for (const barrier of barriers) {
        if (checkCircleRectangleCollision(
          ballCenterX,
          ballCenterY,
          ballRadius,
          barrier.x,
          barrier.y,
          barrier.width,
          barrier.height
        )) {
          return {
            valid: false,
            message: `Cannot simulate: Key distractor at frame ${distractor.startFrame} is placed inside or overlapping a barrier. Please move it to a valid position.`
          };
        }
      }
    }
  }

  return { valid: true };
};

/**
 * Check if two rectangles overlap (not just touching)
 * @param {number} x1 - Rectangle 1 X (left)
 * @param {number} y1 - Rectangle 1 Y (bottom)
 * @param {number} w1 - Rectangle 1 width
 * @param {number} h1 - Rectangle 1 height
 * @param {number} x2 - Rectangle 2 X (left)
 * @param {number} y2 - Rectangle 2 Y (bottom)
 * @param {number} w2 - Rectangle 2 width
 * @param {number} h2 - Rectangle 2 height
 * @returns {boolean} True if rectangles overlap (not just touching)
 */
export const checkRectangleOverlap = (x1, y1, w1, h1, x2, y2, w2, h2) => {
  // Check if rectangles overlap (not just touching)
  // Overlap means: x1 < x2 + w2 && x1 + w1 > x2 && y1 < y2 + h2 && y1 + h1 > y2
  // This returns true only if there's actual area overlap (not just touching edges)
  return x1 < x2 + w2 && x1 + w1 > x2 && y1 < y2 + h2 && y1 + h1 > y2;
};

/**
 * Calculate the overlap region between two rectangles
 * @param {number} x1 - Rectangle 1 X (left)
 * @param {number} y1 - Rectangle 1 Y (bottom)
 * @param {number} w1 - Rectangle 1 width
 * @param {number} h1 - Rectangle 1 height
 * @param {number} x2 - Rectangle 2 X (left)
 * @param {number} y2 - Rectangle 2 Y (bottom)
 * @param {number} w2 - Rectangle 2 width
 * @param {number} h2 - Rectangle 2 height
 * @returns {{x: number, y: number, width: number, height: number} | null} Overlap region or null if no overlap
 */
export const calculateOverlapRegion = (x1, y1, w1, h1, x2, y2, w2, h2) => {
  if (!checkRectangleOverlap(x1, y1, w1, h1, x2, y2, w2, h2)) {
    return null;
  }

  // Calculate overlap region
  const overlapX = Math.max(x1, x2);
  const overlapY = Math.max(y1, y2);
  const overlapRight = Math.min(x1 + w1, x2 + w2);
  const overlapTop = Math.min(y1 + h1, y2 + h2);
  const overlapWidth = overlapRight - overlapX;
  const overlapHeight = overlapTop - overlapY;

  return {
    x: overlapX,
    y: overlapY,
    width: overlapWidth,
    height: overlapHeight
  };
};

/**
 * Validate entity overlaps and return overlap regions
 * @param {Array} entities - Array of entities
 * @param {boolean} strictOcclusionMode - Whether strict occlusion mode is enabled
 * @returns {{valid: boolean, message?: string, overlapRegions: Array}} Validation result with overlap regions
 */
export const validateEntityOverlaps = (entities, strictOcclusionMode = true) => {
  const overlapRegions = [];
  let hasBarrierOverlaps = false;
  let hasOccluderOverlaps = false;
  let hasBarrierSensorOverlaps = false;
  let hasSensorOverlaps = false;
  
  const barriers = entities.filter(e => e.type === 'barrier');
  const occluders = entities.filter(e => e.type === 'occluder');
  const redSensors = entities.filter(e => e.type === 'red_sensor');
  const greenSensors = entities.filter(e => e.type === 'green_sensor');
  const sensors = [...redSensors, ...greenSensors];

  // Check barriers vs barriers (always enforced)
  for (let i = 0; i < barriers.length; i++) {
    for (let j = i + 1; j < barriers.length; j++) {
      const b1 = barriers[i];
      const b2 = barriers[j];
      const overlap = calculateOverlapRegion(
        b1.x, b1.y, b1.width, b1.height,
        b2.x, b2.y, b2.width, b2.height
      );
      if (overlap) {
        overlapRegions.push(overlap);
        hasBarrierOverlaps = true;
      }
    }
  }

  // Check barriers vs sensors (always enforced)
  for (const barrier of barriers) {
    for (const sensor of sensors) {
      const overlap = calculateOverlapRegion(
        barrier.x, barrier.y, barrier.width, barrier.height,
        sensor.x, sensor.y, sensor.width, sensor.height
      );
      if (overlap) {
        overlapRegions.push(overlap);
        hasBarrierSensorOverlaps = true;
      }
    }
  }

  // Check red sensor vs green sensor (always enforced)
  for (const redSensor of redSensors) {
    for (const greenSensor of greenSensors) {
      const overlap = calculateOverlapRegion(
        redSensor.x, redSensor.y, redSensor.width, redSensor.height,
        greenSensor.x, greenSensor.y, greenSensor.width, greenSensor.height
      );
      if (overlap) {
        overlapRegions.push(overlap);
        hasSensorOverlaps = true;
      }
    }
  }

  // Check occluders vs barriers/sensors (only when strict mode is enabled)
  if (strictOcclusionMode) {
    for (const occluder of occluders) {
      // Check occluder vs barriers
      for (const barrier of barriers) {
        const overlap = calculateOverlapRegion(
          occluder.x, occluder.y, occluder.width, occluder.height,
          barrier.x, barrier.y, barrier.width, barrier.height
        );
        if (overlap) {
          overlapRegions.push(overlap);
          hasOccluderOverlaps = true;
        }
      }

      // Check occluder vs sensors
      for (const sensor of sensors) {
        const overlap = calculateOverlapRegion(
          occluder.x, occluder.y, occluder.width, occluder.height,
          sensor.x, sensor.y, sensor.width, sensor.height
        );
        if (overlap) {
          overlapRegions.push(overlap);
          hasOccluderOverlaps = true;
        }
      }
    }
  }

  if (overlapRegions.length > 0) {
    let message = "Cannot simulate: ";
    const parts = [];
    
    if (hasBarrierOverlaps) {
      parts.push("barriers are overlapping each other");
    }
    if (hasBarrierSensorOverlaps) {
      parts.push("barriers are overlapping sensors");
    }
    if (hasSensorOverlaps) {
      parts.push("red and green sensors are overlapping each other");
    }
    if (hasOccluderOverlaps) {
      parts.push("occluders are overlapping barriers or sensors");
    }
    
    if (parts.length > 0) {
      message += parts.join(", ") + ". Please resolve all overlaps (touching edges is allowed).";
    }
    
    return {
      valid: false,
      message,
      overlapRegions
    };
  }

  return {
    valid: true,
    overlapRegions: []
  };
};
