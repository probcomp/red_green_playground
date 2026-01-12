import { useState } from 'react';
import { DEFAULT_RANDOM_DISTRACTOR_PARAMS } from '../constants';

/**
 * Hook for managing distractor mode state
 */
export const useDistractors = () => {
  const [mode, setMode] = useState('regular');
  const [keyDistractors, setKeyDistractors] = useState([]);
  const [randomDistractorParams, setRandomDistractorParams] = useState(DEFAULT_RANDOM_DISTRACTOR_PARAMS);
  const [isAddingKeyDistractor, setIsAddingKeyDistractor] = useState(false);
  const [editingDistractorIndex, setEditingDistractorIndex] = useState(null);
  const [selectedFrame, setSelectedFrame] = useState(0);

  const resetDistractorParams = () => {
    setKeyDistractors([]);
    setRandomDistractorParams(DEFAULT_RANDOM_DISTRACTOR_PARAMS);
    setIsAddingKeyDistractor(false);
    setEditingDistractorIndex(null);
  };

  return {
    mode,
    setMode,
    keyDistractors,
    setKeyDistractors,
    randomDistractorParams,
    setRandomDistractorParams,
    isAddingKeyDistractor,
    setIsAddingKeyDistractor,
    editingDistractorIndex,
    setEditingDistractorIndex,
    selectedFrame,
    setSelectedFrame,
    resetDistractorParams,
  };
};

