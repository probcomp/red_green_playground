import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import VideoPlayer from "./components/VideoPlayer";
import NavigationBar from "./components/playground/NavigationBar";
import SimulationSettingsPanel from "./components/playground/SimulationSettingsPanel";
import SceneControlsPanel from "./components/playground/SceneControlsPanel";
import DistractorControlsPanel from "./components/playground/DistractorControlsPanel";
import EntityCanvas from "./components/playground/EntityCanvas";
import ControlBar from "./components/playground/ControlBar";
import { useEntities } from "./hooks/useEntities";
import { useDistractors } from "./hooks/useDistractors";
import { useSimulation } from "./hooks/useSimulation";
import { usePhysics } from "./hooks/usePhysics";
import { useTargetDirection } from "./hooks/useTargetDirection";
import { useSceneTransform } from "./hooks/useSceneTransform";
import { createFileLoadHandler, createSetSaveDirectoryHandler, createSaveDataHandler } from "./utils/fileUtils";
import { DEFAULT_RANDOM_DISTRACTOR_PARAMS, VID_RES, PX_SCALE, INTERVAL, BORDER_PX, ENTITY_WIDTH, ENTITY_HEIGHT, RES_MULTIPLIER } from "./constants";

function App() {
  const videoPlayerRef = useRef(null);

  // Simulation parameters
  const [videoLength, setVideoLength] = useState(10);
  const [ballSpeed, setBallSpeed] = useState(3.6);
  const [fps, setFps] = useState(30);
  const [worldWidth, setWorldWidth] = useState(20);
  const [worldHeight, setWorldHeight] = useState(20);
  const res_multiplier = RES_MULTIPLIER;

  // Physics calculations
  const physics = usePhysics(ballSpeed, fps);
  const { physicsStepsPerFrame, timestep, isValid: isValidPhysics, warning: physicsWarning, ballMovementPerFrame } = physics;

  // Saving and Loading params
  const [trial_name, setTrial_name] = useState('base');
  const [saveDirectoryHandle, setSaveDirectoryHandle] = useState(null);
  const [autoDownloadWebM, setAutoDownloadWebM] = useState(true);
  const [videoFormat, setVideoFormat] = useState('webm'); // 'webm' or 'mp4'

  // Scene transformation controls
  const [movementUnit, setMovementUnit] = useState(1.0);

  // Use hooks for state management
  const entitiesHook = useEntities(worldWidth, worldHeight);
  const { entities, setEntities, contextMenu, setContextMenu, addEntity: addEntityBase, updateEntity, deleteEntity, clearAllEntities, handleContextMenu } = entitiesHook;

  const distractorsHook = useDistractors();
  const { mode, setMode, keyDistractors, setKeyDistractors, randomDistractorParams, setRandomDistractorParams, isAddingKeyDistractor, setIsAddingKeyDistractor, editingDistractorIndex, setEditingDistractorIndex, selectedFrame, setSelectedFrame, resetDistractorParams } = distractorsHook;

  const simulationHook = useSimulation();
  const { simData, setSimData, shouldAutoSimulate, setShouldAutoSimulate, handleSimulate: handleSimulateBase } = simulationHook;

  const targetDirectionHook = useTargetDirection(entities, updateEntity);
  const { targetDirection, setTargetDirection, directionInput, setDirectionInput, updateTargetDirection, handleDirectionInputChange } = targetDirectionHook;

  const sceneTransformHook = useSceneTransform(entities, setEntities, worldWidth, worldHeight, movementUnit, setTargetDirection, setDirectionInput);
  const { moveScene, rotateScene } = sceneTransformHook;

  // Keyboard event listener for arrow keys
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
      }
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault();
        moveScene(e.key);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [moveScene]);

  // Auto-simulate when keyDistractors change
  useEffect(() => {
    if (shouldAutoSimulate && entities.length > 0) {
      handleSimulate(true);
      setShouldAutoSimulate(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyDistractors, shouldAutoSimulate, entities]);

  // Wrapper for addEntity to handle target direction initialization
  const addEntity = (type) => {
    addEntityBase(type, () => {
      if (type === "target") {
        setDirectionInput("0");
        setTargetDirection(0);
      }
    });
  };

  // Wrapper for clearAllEntities to also clear simData and distractor data
  const handleClearAll = () => {
    clearAllEntities();
    setSimData(null);
    resetDistractorParams();
  };

  // Wrapper for handleSimulate
  const handleSimulate = (autoRun = false) => {
    const simulationParams = {
      videoLength,
      ballSpeed,
      fps,
      physicsStepsPerFrame,
      res_multiplier,
      timestep,
      worldWidth,
      worldHeight
    };
    handleSimulateBase(entities, simulationParams, mode, keyDistractors, randomDistractorParams, autoRun);
  };

  // File operation handlers
  const handleFileLoad = createFileLoadHandler({
    setSimData,
    setEntities,
    setVideoLength,
    setBallSpeed,
    setFps,
    setWorldWidth,
    setWorldHeight,
    setKeyDistractors,
    setRandomDistractorParams,
    setMode,
    setTargetDirection,
    setDirectionInput,
    setShouldAutoSimulate,
    mode,
    DEFAULT_RANDOM_DISTRACTOR_PARAMS
  });

  const handleSetSaveDirectory = createSetSaveDirectoryHandler(setSaveDirectoryHandle);

  const handleSavedata = createSaveDataHandler({
    simData,
    entities,
    mode,
    keyDistractors,
    randomDistractorParams,
    videoLength,
    ballSpeed,
    fps,
    worldWidth,
    worldHeight,
    trial_name,
    saveDirectoryHandle,
    autoDownloadWebM,
    videoFormat,
    videoPlayerRef
  });

  // Entity canvas handlers
  const handleEntityDragStop = (entity, d) => {
    const px_scale = PX_SCALE;
    const border_px = BORDER_PX;
    const interval = INTERVAL;
    const snappedX = Math.round((d.x - border_px) / (interval * px_scale)) * interval;
    const snappedY = Math.round(
      (worldHeight - ((d.y - border_px) / px_scale + entity.height)) / interval
    ) * interval;

    const updatedEntity = {
      ...entity,
      x: Math.max(0, Math.min(snappedX, worldWidth - entity.width)),
      y: Math.max(0, Math.min(snappedY, worldHeight - entity.height)),
    };
    updateEntity(entity.id, updatedEntity);

    // Update target direction if it's a target
    if (entity.type === "target") {
      setTargetDirection(updatedEntity.direction || 0);
      setDirectionInput(((updatedEntity.direction || 0) * (180 / Math.PI)).toString());
    }
  };

  const handleEntityResizeStop = (entity, ref, position) => {
    if (entity.type === "target") return;
    
    const px_scale = PX_SCALE;
    const border_px = BORDER_PX;
    const interval = INTERVAL;
    const snappedX = Math.round((position.x - border_px) / (interval * px_scale)) * interval;
    const snappedY = Math.round(
      (worldHeight -
        ((position.y - border_px) / px_scale + parseFloat(ref.style.height) / px_scale)) /
      interval
    ) * interval;

    const snappedWidth = Math.round(parseFloat(ref.style.width) / (interval * px_scale)) * interval;
    const snappedHeight = Math.round(parseFloat(ref.style.height) / (interval * px_scale)) * interval;

    const updatedEntity = {
      ...entity,
      x: Math.max(0, Math.min(snappedX, worldWidth - snappedWidth)),
      y: Math.max(0, Math.min(snappedY, worldHeight - snappedHeight)),
      width: snappedWidth,
      height: snappedHeight,
    };
    updateEntity(entity.id, updatedEntity);
  };

  const handleCanvasClick = () => {
    setContextMenu({ visible: false, x: 0, y: 0, entityId: null });
  };

  const handleDeleteEntity = (id) => {
    deleteEntity(id);
  };

  const handleUpdateTargetDirection = (angleDegrees) => {
    updateTargetDirection(angleDegrees);
  };

  // Distractor handlers
  const handleEditDistractor = (index) => {
    setEditingDistractorIndex(index);
    setIsAddingKeyDistractor(true);
  };

  const handleDeleteDistractor = (index) => {
    setKeyDistractors(keyDistractors.filter((_, i) => i !== index));
    if (editingDistractorIndex === index) {
      setEditingDistractorIndex(null);
      setIsAddingKeyDistractor(false);
    }
  };

  const handleAddKeyDistractor = (distractorData) => {
    if (editingDistractorIndex !== null) {
      const updated = [...keyDistractors];
      updated[editingDistractorIndex] = distractorData;
      setKeyDistractors(updated);
      setEditingDistractorIndex(null);
    } else {
      setKeyDistractors([...keyDistractors, distractorData]);
    }
    setIsAddingKeyDistractor(false);
    setShouldAutoSimulate(true);
  };

  return (
    <div style={{ 
      display: "flex", 
      flexDirection: "column", 
      height: "100vh",
      overflow: "hidden",
      backgroundColor: "#f8fafc",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
    }}>
      {/* Top Bar with Navigation and Mode Switcher */}
      <NavigationBar mode={mode} setMode={setMode} />

      {/* Middle Section - Canvas and Video Player */}
      <div style={{ 
        flex: 1, 
        display: "flex", 
        flexDirection: "row", 
        alignItems: "flex-start", 
        gap: "24px",
        padding: "24px",
        overflow: "auto"
      }}>
        {/* Left Side - Simulation Settings */}
        <div style={{ 
          display: "flex", 
          flexDirection: "column", 
          gap: "20px",
          maxWidth: "300px",
          flexShrink: 0
        }}>
          <SimulationSettingsPanel
            videoLength={videoLength}
            ballSpeed={ballSpeed}
            fps={fps}
            worldWidth={worldWidth}
            worldHeight={worldHeight}
            directionInput={directionInput}
            onVideoLengthChange={setVideoLength}
            onBallSpeedChange={setBallSpeed}
            onFpsChange={setFps}
            onWorldWidthChange={setWorldWidth}
            onWorldHeightChange={setWorldHeight}
            onDirectionInputChange={handleDirectionInputChange}
            physicsWarning={physicsWarning}
            ballMovementPerFrame={ballMovementPerFrame}
          />

          <SceneControlsPanel
            movementUnit={movementUnit}
            onMovementUnitChange={setMovementUnit}
            onRotateScene={rotateScene}
            hasEntities={entities.length > 0}
          />

          {mode === "distractor" && (
            <DistractorControlsPanel
              simData={simData}
              isAddingKeyDistractor={isAddingKeyDistractor}
              setIsAddingKeyDistractor={setIsAddingKeyDistractor}
              keyDistractors={keyDistractors}
              editingDistractorIndex={editingDistractorIndex}
              onEditDistractor={handleEditDistractor}
              onDeleteDistractor={handleDeleteDistractor}
              randomDistractorParams={randomDistractorParams}
              onRandomDistractorParamsChange={setRandomDistractorParams}
              onShouldAutoSimulate={setShouldAutoSimulate}
            />
          )}
        </div>

        {/* Right Side - Canvas and Video Player */}
        <div style={{ 
          display: "flex", 
          flexDirection: "row", 
          gap: "24px",
          flex: 1,
          justifyContent: "flex-start"
        }}>
          <EntityCanvas
            entities={entities}
            worldWidth={worldWidth}
            worldHeight={worldHeight}
            targetDirection={targetDirection}
            ballSpeed={ballSpeed}
            contextMenu={contextMenu}
            onEntityDragStop={handleEntityDragStop}
            onEntityResizeStop={handleEntityResizeStop}
            onEntityContextMenu={handleContextMenu}
            onCanvasClick={handleCanvasClick}
            onDeleteEntity={handleDeleteEntity}
            onUpdateTargetDirection={handleUpdateTargetDirection}
            updateEntity={updateEntity}
          />

          {/* Video Player Section */}
          <div style={{ 
            flexShrink: 0,
            borderRadius: "0px",
            overflow: "hidden",
            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)"
          }}>
            {simData ? (
              <VideoPlayer 
                simData={simData} 
                fps={fps} 
                trial_name={trial_name}
                saveDirectoryHandle={saveDirectoryHandle}
                worldWidth={worldWidth}
                worldHeight={worldHeight}
                mode={mode}
                isAddingKeyDistractor={isAddingKeyDistractor}
                setIsAddingKeyDistractor={setIsAddingKeyDistractor}
                selectedFrame={selectedFrame}
                setSelectedFrame={setSelectedFrame}
                keyDistractors={keyDistractors}
                editingDistractorIndex={editingDistractorIndex}
                onAddKeyDistractor={handleAddKeyDistractor}
                videoFormat={videoFormat}
                ref={videoPlayerRef}
              />
            ) : (
              <div
                style={{
                  width: `${VID_RES}px`,
                  height: `${VID_RES}px`,
                  border: "3px solid #1e293b",
                  borderRadius: "0px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "#f8fafc",
                  color: "#6b7280",
                  fontSize: "16px",
                  fontWeight: "500"
                }}
              >
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "48px", marginBottom: "16px", opacity: 0.5 }}>📹</div>
                  <p style={{ margin: 0 }}>No simulation data available</p>
                  <p style={{ margin: "8px 0 0 0", fontSize: "14px", opacity: 0.7 }}>Run a simulation first</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Section - All Controls and Buttons */}
      <ControlBar
        onAddEntity={addEntity}
        onSimulate={handleSimulate}
        isValidPhysics={isValidPhysics}
        trial_name={trial_name}
        onTrialNameChange={setTrial_name}
        saveDirectoryHandle={saveDirectoryHandle}
        onSetSaveDirectory={handleSetSaveDirectory}
        autoDownloadWebM={autoDownloadWebM}
        onAutoDownloadWebMChange={setAutoDownloadWebM}
        videoFormat={videoFormat}
        onVideoFormatChange={setVideoFormat}
        onSaveData={handleSavedata}
        onFileLoad={handleFileLoad}
        onClearAll={handleClearAll}
      />
    </div>
  );
}

export default App;
