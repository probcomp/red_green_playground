import { useState, useCallback } from 'react';

/**
 * Hook for managing target direction
 */
export const useTargetDirection = (entities, updateEntity) => {
  const [targetDirection, setTargetDirection] = useState(0);
  const [directionInput, setDirectionInput] = useState('0');

  const updateTargetDirection = useCallback((angleDegrees) => {
    const snappedAngle = angleDegrees;
    
    if (snappedAngle >= -180 && snappedAngle < 180) {
      const newDirection = (snappedAngle * Math.PI) / 180;
      setTargetDirection(newDirection);
      setDirectionInput(snappedAngle.toString());
      
      // Update the target entity's direction
      const targetEntity = entities.find(e => e.type === 'target');
      if (targetEntity) {
        const updatedEntity = {
          ...targetEntity,
          direction: newDirection,
        };
        updateEntity(targetEntity.id, updatedEntity);
      }
    }
  }, [entities, updateEntity]);

  const handleDirectionInputChange = useCallback((value) => {
    setDirectionInput(value);
    const angleDegrees = parseFloat(value);
    if (!isNaN(angleDegrees) && angleDegrees >= -180 && angleDegrees < 180) {
      const newDirection = (angleDegrees * Math.PI) / 180;
      setTargetDirection(newDirection);
      
      // Update the target entity's direction
      const targetEntity = entities.find(e => e.type === 'target');
      if (targetEntity) {
        const updatedEntity = {
          ...targetEntity,
          direction: newDirection,
        };
        updateEntity(targetEntity.id, updatedEntity);
      }
    }
  }, [entities, updateEntity]);

  const syncDirectionFromEntity = useCallback((entity) => {
    if (entity && entity.type === 'target') {
      setTargetDirection(entity.direction || 0);
      setDirectionInput(((entity.direction || 0) * (180 / Math.PI)).toString());
    }
  }, []);

  return {
    targetDirection,
    directionInput,
    setTargetDirection,
    setDirectionInput,
    updateTargetDirection,
    handleDirectionInputChange,
    syncDirectionFromEntity,
  };
};

