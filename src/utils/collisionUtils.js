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

