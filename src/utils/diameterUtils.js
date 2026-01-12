/**
 * Diameter navigation utilities
 * Diameters are ordered from smallest to largest
 */
export const DIAMETERS = ['0_5', '0_8', '0_9', '0_925', '0_95', '0_99'];

/**
 * Get the index of a diameter in the ordered array
 * @param {string} diameter - Diameter string (e.g., "0_95")
 * @returns {number} Index of the diameter, or -1 if not found
 */
export const getDiameterIndex = (diameter) => {
  return DIAMETERS.indexOf(diameter);
};

/**
 * Get the next larger diameter
 * @param {string} diameter - Current diameter string
 * @returns {string|null} Next diameter or null if at the end
 */
export const getNextDiameter = (diameter) => {
  const index = getDiameterIndex(diameter);
  if (index === -1 || index === DIAMETERS.length - 1) {
    return null;
  }
  return DIAMETERS[index + 1];
};

/**
 * Get the previous smaller diameter
 * @param {string} diameter - Current diameter string
 * @returns {string|null} Previous diameter or null if at the start
 */
export const getPrevDiameter = (diameter) => {
  const index = getDiameterIndex(diameter);
  if (index === -1 || index === 0) {
    return null;
  }
  return DIAMETERS[index - 1];
};

/**
 * Format diameter for display (e.g., "0_95" -> "95.00%")
 * @param {string} diameter - Diameter string (e.g., "0_95")
 * @returns {string} Formatted diameter as percentage
 */
export const formatDiameter = (diameter) => {
  const num = diameter.replace('_', '.');
  return `${(parseFloat(num) * 100).toFixed(2)}%`;
};
