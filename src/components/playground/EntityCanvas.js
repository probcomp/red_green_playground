import React from 'react';
import { Rnd } from 'react-rnd';
import { PX_SCALE, BORDER_PX, INTERVAL, ENTITY_COLORS } from '../../constants';

const EntityCanvas = ({
  entities,
  worldWidth,
  worldHeight,
  targetDirection,
  ballSpeed,
  contextMenu,
  onEntityDragStop,
  onEntityResizeStop,
  onEntityContextMenu,
  onCanvasClick,
  onDeleteEntity,
  onUpdateTargetDirection,
  updateEntity
}) => {
  const px_scale = PX_SCALE;
  const border_px = BORDER_PX;
  const interval = INTERVAL;

  const renderDirectionPreview = (target) => {
    if (target.type !== "target") return null;
  
    // Calculate the exact center using the same logic as the Rnd component
    const rndX = target.x * px_scale + border_px;
    const rndY = (worldHeight - target.y - target.height) * px_scale + border_px;
    const rndWidth = px_scale;
    const rndHeight = px_scale;
    
    // Center of the ball - exactly the same as the main Rnd component
    const centerX = rndX + rndWidth / 2;
    const centerY = rndY + rndHeight / 2;
  
    // Line end point - exactly ballSpeed * px_scale pixels from center in the direction
    const lineEndX = centerX + ballSpeed * px_scale * Math.cos(targetDirection);
    const lineEndY = centerY - ballSpeed * px_scale * Math.sin(targetDirection);

    const handleDragStop = (e, d) => {
      // Use the Rnd drag position for angle calculation, adjusted for canvas border
      const deltaX = (d.x + px_scale / 2) - centerX;
      const deltaY = centerY - (d.y + px_scale / 2);
      const preciseAngle = Math.atan2(deltaY, deltaX); 
    
      onUpdateTargetDirection(preciseAngle * (180 / Math.PI));
      
      const updatedEntity = {
        ...target,
        direction: preciseAngle,
      };
      updateEntity(target.id, updatedEntity);
    };
  
    return (
      <React.Fragment>
        {/* Line from ball center to end point */}
        <svg
          style={{
            position: "absolute",
            left: "0px",
            top: "0px",
            width: "100%",
            height: "100%",
            pointerEvents: "none",
            zIndex: 10
          }}
        >
          <line
            x1={centerX - 3}
            y1={centerY - 3}
            x2={lineEndX - 3}
            y2={lineEndY - 3}
            stroke="#ef4444"
            strokeWidth="3"
          />
        </svg>
        
        {/* Blue preview at line end */}
        <Rnd
          size={{ width: px_scale, height: px_scale }}
          position={{
            x: lineEndX - px_scale / 2,
            y: lineEndY - px_scale / 2,
          }}
          bounds="parent"
          onDragStop={handleDragStop}
          enableResizing={false}
          style={{
            backgroundColor: "#3b82f6",
            borderRadius: "50%",
            cursor: "grab",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.3)",
            zIndex: 20,
            opacity: 0.6
          }}
        />
      </React.Fragment>
    );
  };

  return (
    <div
      style={{
        position: "relative",
        width: `${worldWidth * px_scale}px`,
        height: `${worldHeight * px_scale}px`,
        border: "3px solid #1e293b",
        borderRadius: "0px",
        overflow: "hidden",
        flexShrink: 0,
        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
        backgroundColor: "#ffffff"
      }}
      onClick={onCanvasClick}
      onContextMenu={(e) => e.preventDefault()}
    >
      {entities.map((entity) => (
        <React.Fragment key={entity.id}>
          <Rnd
            size={{
              width: entity.type === "target" ? px_scale : entity.width * px_scale,
              height: entity.type === "target" ? px_scale : entity.height * px_scale,
            }}
            position={{
              x: entity.x * px_scale + border_px,
              y: (worldHeight - entity.y - entity.height) * px_scale + border_px,
            }}
            onDragStop={(e, d) => onEntityDragStop(entity, d)}
            onResizeStop={(e, direction, ref, delta, position) => onEntityResizeStop(entity, ref, position)}
            bounds="parent"
            grid={[interval * px_scale, interval * px_scale]}
            enableResizing={entity.type !== "target"}
            style={{
              backgroundColor: ENTITY_COLORS[entity.type] || "#6b7280",
              borderRadius: entity.type === "target" ? "50%" : "0px",
              border: "0px solid black",
              cursor: "move",
              boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)"
            }}
            onContextMenu={(e) => onEntityContextMenu(e, entity.id)}
          />
          {entity.type === "target" && renderDirectionPreview(entity)}
        </React.Fragment>
      ))}
      {/* Context Menu */}
      {contextMenu.visible && (
        <div
          style={{
            position: "absolute",
            top: Math.min(contextMenu.y, worldHeight * px_scale - 50),
            left: Math.min(contextMenu.x, worldWidth * px_scale - 100),
            backgroundColor: "#ffffff",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            zIndex: 1000,
            padding: "8px",
            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
          }}
        >
          <button
            onClick={() => onDeleteEntity(contextMenu.entityId)}
            style={{
              cursor: "pointer",
              width: "100%",
              padding: "8px 12px",
              backgroundColor: "#ef4444",
              color: "white",
              border: "none",
              borderRadius: "6px",
              fontSize: "14px",
              fontWeight: "500",
              transition: "background-color 0.2s"
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = "#dc2626"}
            onMouseLeave={(e) => e.target.style.backgroundColor = "#ef4444"}
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
};

export default EntityCanvas;
