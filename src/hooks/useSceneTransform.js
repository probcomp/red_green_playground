import { useCallback } from 'react';
import { clamp } from '../utils/sceneUtils';

/**
 * Hook for scene transformation operations (move, rotate)
 */
export const useSceneTransform = (entities, setEntities, worldWidth, worldHeight, movementUnit, setTargetDirection, setDirectionInput) => {
  const moveScene = useCallback((direction) => {
    if (entities.length === 0) return;

    let deltaX = 0;
    let deltaY = 0;

    switch (direction) {
      case 'ArrowUp':
        deltaY = movementUnit;
        break;
      case 'ArrowDown':
        deltaY = -movementUnit;
        break;
      case 'ArrowLeft':
        deltaX = -movementUnit;
        break;
      case 'ArrowRight':
        deltaX = movementUnit;
        break;
      default:
        return;
    }

    setEntities((prevEntities) => {
      const updatedEntities = prevEntities.map((entity) => {
        const newX = clamp(entity.x + deltaX, 0, worldWidth - entity.width);
        const newY = clamp(entity.y + deltaY, 0, worldHeight - entity.height);
        
        return {
          ...entity,
          x: newX,
          y: newY,
        };
      });

      // Update target direction input if target exists
      const targetEntity = updatedEntities.find(e => e.type === "target");
      if (targetEntity && setTargetDirection && setDirectionInput) {
        setTargetDirection(targetEntity.direction || 0);
        setDirectionInput(((targetEntity.direction || 0) * (180 / Math.PI)).toString());
      }

      return updatedEntities;
    });
  }, [entities.length, movementUnit, worldWidth, worldHeight, setEntities, setTargetDirection, setDirectionInput]);

  const rotateScene = useCallback((clockwise) => {
    if (entities.length === 0) return;

    const centerX = worldWidth / 2;
    const centerY = worldHeight / 2;
    const rotationAngle = clockwise ? Math.PI / 2 : -Math.PI / 2;

    setEntities((prevEntities) => {
      const updatedEntities = prevEntities.map((entity) => {
        // Calculate center of entity relative to scene center
        // entity.y is the bottom coordinate, so center is at y + height/2
        const entityCenterX = entity.x + entity.width / 2;
        const entityCenterY = entity.y + entity.height / 2;
        const relX = entityCenterX - centerX;
        const relY = entityCenterY - centerY;

        // Rotate the position (90 degrees clockwise or anticlockwise)
        let newRelX, newRelY;
        if (clockwise) {
          // Clockwise 90°: (x, y) -> (y, -x)
          newRelX = relY;
          newRelY = -relX;
        } else {
          // Anticlockwise 90°: (x, y) -> (-y, x)
          newRelX = -relY;
          newRelY = relX;
        }

        // Convert back to absolute coordinates
        const newEntityCenterX = newRelX + centerX;
        const newEntityCenterY = newRelY + centerY;

        // For barriers, occluders, and sensors, swap width and height when rotating
        // Targets are circular so they keep their dimensions
        let newWidth = entity.width;
        let newHeight = entity.height;
        if (entity.type === 'barrier' || entity.type === 'occluder' || 
            entity.type === 'red_sensor' || entity.type === 'green_sensor') {
          newWidth = entity.height;
          newHeight = entity.width;
        }

        // Calculate new position (bottom-left corner, which is what entity.y represents)
        // This applies to ALL entity types including sensors, targets, etc.
        const newX = Math.max(0, Math.min(newEntityCenterX - newWidth / 2, worldWidth - newWidth));
        const newY = Math.max(0, Math.min(newEntityCenterY - newHeight / 2, worldHeight - newHeight));

        // Rotate the target direction if it's a target
        // The direction needs to rotate to maintain the same relative direction in the rotated scene
        // In this coordinate system: 0 = right, π/2 = up, π = left, -π/2 = down
        // When rotating the scene clockwise 90°: positions rotate (x,y) -> (y,-x)
        // For directions: a vector pointing right (0) should point down (-π/2) after clockwise rotation
        // So clockwise rotation: direction -> direction - π/2
        // Anticlockwise rotation: direction -> direction + π/2
        let newDirection = entity.direction || 0;
        if (entity.type === 'target') {
          // Rotate the direction opposite to the scene rotation (because we're rotating the coordinate system)
          // If scene rotates clockwise by π/2, direction rotates by -π/2
          // If scene rotates anticlockwise by -π/2, direction rotates by +π/2
          newDirection = (entity.direction || 0) - rotationAngle;
          // Normalize to [-π, π]
          while (newDirection > Math.PI) newDirection -= 2 * Math.PI;
          while (newDirection < -Math.PI) newDirection += 2 * Math.PI;
        }

        // Return updated entity - create new object to ensure React detects the change
        // This applies to ALL entity types: target, barrier, occluder, red_sensor, green_sensor, etc.
        const updatedEntity = {
          id: entity.id,
          type: entity.type,
          x: newX,
          y: newY,
          width: newWidth,
          height: newHeight,
        };

        // Only add direction if it's a target (or if entity already has direction)
        if (entity.type === 'target' || entity.direction !== undefined) {
          updatedEntity.direction = newDirection;
        }

        // Copy any other properties that might exist
        Object.keys(entity).forEach(key => {
          if (!['id', 'type', 'x', 'y', 'width', 'height', 'direction'].includes(key)) {
            updatedEntity[key] = entity[key];
          }
        });

        return updatedEntity;
      });

      // Update target direction state
      const targetEntity = updatedEntities.find(e => e.type === "target");
      if (targetEntity && setTargetDirection && setDirectionInput) {
        setTargetDirection(targetEntity.direction || 0);
        setDirectionInput(((targetEntity.direction || 0) * (180 / Math.PI)).toString());
      }

      return updatedEntities;
    });
  }, [entities.length, worldWidth, worldHeight, setEntities, setTargetDirection, setDirectionInput]);

  return {
    moveScene,
    rotateScene,
  };
};

