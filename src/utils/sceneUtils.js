/**
 * Rotate a point around a center point
 * @param {number} x - Point X
 * @param {number} y - Point Y
 * @param {number} centerX - Center X
 * @param {number} centerY - Center Y
 * @param {number} angle - Rotation angle in radians
 * @returns {{x: number, y: number}} Rotated point
 */
export const rotatePoint = (x, y, centerX, centerY, angle) => {
  const relX = x - centerX;
  const relY = y - centerY;
  
  const newRelX = relX * Math.cos(angle) - relY * Math.sin(angle);
  const newRelY = relX * Math.sin(angle) + relY * Math.cos(angle);
  
  return {
    x: newRelX + centerX,
    y: newRelY + centerY
  };
};

/**
 * Rotate direction by an angle
 * @param {number} direction - Current direction in radians
 * @param {number} rotationAngle - Rotation angle in radians
 * @returns {number} New direction normalized to [-π, π]
 */
export const rotateDirection = (direction, rotationAngle) => {
  let newDirection = direction - rotationAngle;
  // Normalize to [-π, π]
  while (newDirection > Math.PI) newDirection -= 2 * Math.PI;
  while (newDirection < -Math.PI) newDirection += 2 * Math.PI;
  return newDirection;
};

/**
 * Calculate entity center coordinates
 * @param {Object} entity - Entity object
 * @returns {{x: number, y: number}} Center coordinates
 */
export const getEntityCenter = (entity) => {
  return {
    x: entity.x + entity.width / 2,
    y: entity.y + entity.height / 2
  };
};

/**
 * Clamp a value between min and max
 * @param {number} value - Value to clamp
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Clamped value
 */
export const clamp = (value, min, max) => {
  return Math.max(min, Math.min(max, value));
};

