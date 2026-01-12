import { useState, useCallback } from 'react';
import { validateBallPositions } from '../utils/collisionUtils';

/**
 * Hook for simulation management
 */
export const useSimulation = () => {
  const [simData, setSimData] = useState(null);
  const [shouldAutoSimulate, setShouldAutoSimulate] = useState(false);

  const handleSimulate = useCallback(async (
    entities,
    simulationParams,
    mode,
    keyDistractors,
    randomDistractorParams,
    autoRun = false
  ) => {
    // Validate ball positions before simulating
    const validation = validateBallPositions(entities, keyDistractors, mode);
    if (!validation.valid) {
      if (!autoRun) {
        alert(validation.message);
      }
      return;
    }

    const requestBody = {
      entities,
      simulationParams,
    };

    // Add distractor parameters if in distractor mode
    if (mode === 'distractor') {
      requestBody.distractorParams = {
        keyDistractors,
        randomDistractorParams
      };
    }

    try {
      const response = await fetch('/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      if (data.status === 'success') {
        setSimData(data.sim_data);
      } else {
        if (!autoRun) {
          console.error('Simulation error:', data.message);
        }
      }
    } catch (error) {
      if (!autoRun) {
        console.error('Error during simulation:', error);
      }
    }
  }, []);

  const clearSimulation = useCallback(async () => {
    try {
      await fetch('/clear_simulation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      setSimData(null);
    } catch (error) {
      console.error('Error clearing simulation:', error);
    }
  }, []);

  return {
    simData,
    setSimData,
    shouldAutoSimulate,
    setShouldAutoSimulate,
    handleSimulate,
    clearSimulation,
  };
};

