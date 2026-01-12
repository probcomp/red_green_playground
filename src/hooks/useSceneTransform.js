import { useCallback } from 'react';
import { rotatePoint, rotateDirection, getEntityCenter, clamp } from '../utils/sceneUtils';

/**
 * Hook for scene transformation operations (move, rotate)
 */
export const useSceneTransform = (entities, setEntities, worldWidth, worldHeight, movementUnit) => {
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
      return prevEntities.map((entity) => {
        const newX = clamp(entity.x + deltaX, 0, worldWidth - entity.width);
        const newY = clamp(entity.y + deltaY, 0, worldHeight - entity.height);
        
        return {
          ...entity,
          x: newX,
          y: newY,
        };
      });
    });
  }, [entities.length, movementUnit, worldWidth, worldHeight, setEntities]);

  const rotateScene = useCallback((clockwise) => {
    if (entities.length === 0) return;

    const centerX = worldWidth / 2;
    const centerY = worldHeight / 2;
    const rotationAngle = clockwise ? Math.PI / 2 : -Math.PI / 2;

    setEntities((prevEntities) => {
      return prevEntities.map((entity) => {
        const entityCenter = getEntityCenter(entity);
        const relX = entityCenter.x - centerX;
        const relY = entityCenter.y - centerY;

        // Rotate the position
        let newRelX, newRelY;
        if (clockwise) {
          newRelX = relY;
          newRelY = -relX;
        } else {
          newRelX = -relY;
          newRelY = relX;
        }

        // Convert back to absolute coordinates
        const newEntityCenterX = newRelX + centerX;
        const newEntityCenterY = newRelY + centerY;

        // For barriers, occluders, and sensors, swap width and height when rotating
        let newWidth = entity.width;
        let newHeight = entity.height;
        if (['barrier', 'occluder', 'red_sensor', 'green_sensor'].includes(entity.type)) {
          newWidth = entity.height;
          newHeight = entity.width;
        }

        // Calculate new position (bottom-left corner)
        const newX = clamp(newEntityCenterX - newWidth / 2, 0, worldWidth - newWidth);
        const newY = clamp(newEntityCenterY - newHeight / 2, 0, worldHeight - newHeight);

        // Rotate the target direction if it's a target
        let newDirection = entity.direction || 0;
        if (entity.type === 'target') {
          newDirection = rotateDirection(entity.direction || 0, rotationAngle);
        }

        // Return updated entity
        const updatedEntity = {
          id: entity.id,
          type: entity.type,
          x: newX,
          y: newY,
          width: newWidth,
          height: newHeight,
        };

        if (entity.type === 'target' || entity.direction !== undefined) {
          updatedEntity.direction = newDirection;
        }

        // Copy any other properties
        Object.keys(entity).forEach(key => {
          if (!['id', 'type', 'x', 'y', 'width', 'height', 'direction'].includes(key)) {
            updatedEntity[key] = entity[key];
          }
        });

        return updatedEntity;
      });
    });
  }, [entities.length, worldWidth, worldHeight, setEntities]);

  return {
    moveScene,
    rotateScene,
  };
};

