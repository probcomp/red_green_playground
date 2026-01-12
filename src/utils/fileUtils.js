/**
 * Prepare init state data for saving
 * @param {Array} entities - Array of entities
 * @param {string} mode - Current mode
 * @param {Array} keyDistractors - Key distractors array
 * @param {Object} randomDistractorParams - Random distractor parameters
 * @param {Object} simulationParams - Simulation parameters
 * @returns {Object} Init state data object
 */
export const prepareInitStateData = (
  entities,
  mode,
  keyDistractors,
  randomDistractorParams,
  simulationParams
) => {
  const initStateData = {
    entities: entities,
    simulationParams: simulationParams
  };
  
  if (mode === 'distractor' && (keyDistractors.length > 0 || randomDistractorParams.probability > 0)) {
    initStateData.distractorData = {
      keyDistractors,
      randomDistractorParams
    };
  }
  
  return initStateData;
};

/**
 * Download a file as JSON
 * @param {Object} data - Data to download
 * @param {string} filename - Filename
 */
export const downloadJSON = (data, filename) => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Parse loaded file data
 * @param {Object|Array} parsedData - Parsed JSON data
 * @returns {{entities: Array, hasDistractorData: boolean, distractorData?: Object, simulationParams?: Object}}
 */
export const parseFileData = (parsedData) => {
  let parsedEntities;
  let hasDistractorData = false;
  let distractorData = null;
  let simulationParams = null;
  
  if (Array.isArray(parsedData)) {
    // Old format - just entities
    parsedEntities = parsedData;
  } else if (parsedData.entities) {
    // New format - entities + optional distractor data + optional simulation params
    parsedEntities = parsedData.entities;
    
    if (parsedData.simulationParams) {
      simulationParams = parsedData.simulationParams;
    }
    
    if (parsedData.distractorData || parsedData.hallucinationData) {
      hasDistractorData = true;
      // Handle both new and old key names for backward compatibility
      distractorData = parsedData.distractorData || parsedData.hallucinationData;
    }
  } else {
    throw new Error("Invalid file format. Ensure the JSON contains entities!");
  }
  
  if (!Array.isArray(parsedEntities)) {
    throw new Error("Invalid file format. Ensure the JSON contains an array of entities!");
  }
  
  return {
    entities: parsedEntities,
    hasDistractorData,
    distractorData,
    simulationParams
  };
};

