/**
 * Diameter navigation utilities
 * Diameters are integers from 10 to 100 (inclusive), representing percentages
 */
export const DIAMETERS = Array.from({ length: 91 }, (_, i) => (i + 10).toString());

/**
 * Get the index of a diameter in the ordered array
 * @param {string} diameter - Diameter string (e.g., "50" for 50%)
 * @returns {number} Index of the diameter, or -1 if not found
 */
export const getDiameterIndex = (diameter) => {
  const diameterInt = parseInt(diameter, 10);
  if (isNaN(diameterInt) || diameterInt < 10 || diameterInt > 100) {
    return -1;
  }
  return diameterInt;
};

/**
 * Get the next larger diameter
 * @param {string} diameter - Current diameter string
 * @returns {string|null} Next diameter or null if at the end
 */
export const getNextDiameter = (diameter) => {
  const index = getDiameterIndex(diameter);
  if (index === -1 || index === 100) {
    return null;
  }
  return (index + 1).toString();
};

/**
 * Get the previous smaller diameter
 * @param {string} diameter - Current diameter string
 * @returns {string|null} Previous diameter or null if at the start
 */
export const getPrevDiameter = (diameter) => {
  const index = getDiameterIndex(diameter);
  if (index === -1 || index === 10) {
    return null;
  }
  return (index - 1).toString();
};

/**
 * Format diameter for display (e.g., "50" -> "50%")
 * @param {string} diameter - Diameter string (e.g., "50")
 * @returns {string} Formatted diameter as percentage
 */
export const formatDiameter = (diameter) => {
  const diameterInt = parseInt(diameter, 10);
  if (isNaN(diameterInt)) {
    return `${diameter}%`;
  }
  return `${diameterInt}%`;
};

/**
 * Get the diameter path for assets
 * @param {string} diameter - Diameter string (e.g., "50")
 * @returns {string} Path segment for the diameter folder
 */
export const getDiameterPath = (diameter) => {
  return `diameter_${diameter}`;
};
