import { useState, useCallback } from 'react';
import { ENTITY_TYPES, ENTITY_WIDTH, ENTITY_HEIGHT } from '../constants';

/**
 * Hook for managing entities (targets, sensors, barriers, occluders)
 */
export const useEntities = (worldWidth, worldHeight) => {
  const [entities, setEntities] = useState([]);
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, entityId: null });

  const addEntity = useCallback((type, onTargetAdded) => {
    const existingTarget = entities.some((e) => e.type === ENTITY_TYPES.TARGET);
    const existingRedSensor = entities.some((e) => e.type === ENTITY_TYPES.RED_SENSOR);
    const existingGreenSensor = entities.some((e) => e.type === ENTITY_TYPES.GREEN_SENSOR);

    if (
      (type === ENTITY_TYPES.TARGET && existingTarget) ||
      (type === ENTITY_TYPES.RED_SENSOR && existingRedSensor) ||
      (type === ENTITY_TYPES.GREEN_SENSOR && existingGreenSensor)
    ) {
      alert(`Only one ${type.replace("_", " ")} is allowed.`);
      return;
    }

    const newEntity = {
      id: Date.now(),
      type,
      x: worldWidth / 2 - ENTITY_WIDTH / 2,
      y: worldHeight / 2 - ENTITY_HEIGHT / 2,
      width: ENTITY_WIDTH,
      height: ENTITY_HEIGHT,
      direction: 0,
    };
    setEntities((prev) => [...prev, newEntity]);
    
    // Initialize direction input if adding a target
    if (type === ENTITY_TYPES.TARGET && onTargetAdded) {
      onTargetAdded();
    }
  }, [entities, worldWidth, worldHeight]);

  const updateEntity = useCallback((id, updatedEntity) => {
    setEntities((prev) => prev.map((e) => (e.id === id ? updatedEntity : e)));
  }, []);

  const deleteEntity = useCallback((id) => {
    setEntities((prev) => prev.filter((e) => e.id !== id));
    setContextMenu({ visible: false, x: 0, y: 0, entityId: null });
  }, []);

  const clearAllEntities = useCallback(() => {
    setEntities([]);
    setContextMenu({ visible: false, x: 0, y: 0, entityId: null });
  }, []);

  const handleContextMenu = useCallback((e, entityId) => {
    e.preventDefault();
    setContextMenu({ visible: true, x: e.clientX, y: e.clientY, entityId });
  }, []);

  return {
    entities,
    setEntities,
    contextMenu,
    setContextMenu,
    addEntity,
    updateEntity,
    deleteEntity,
    clearAllEntities,
    handleContextMenu,
  };
};

