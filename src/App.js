import React, { useState, useRef, useEffect, useCallback } from "react";
import { Rnd } from "react-rnd";
import VideoPlayer from "./components/VideoPlayer";

const vid_res = 400; 

function App() { 
  const [entities, setEntities] = useState([]);
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, entityId: null });
  const [targetDirection, setTargetDirection] = useState(0); // Angle in radians
  const [directionInput, setDirectionInput] = useState("0"); // Direction input as string
  const [, setIsDraggingDirection] = useState(false); // Track if dragging direction
  const [, setDragPosition] = useState({ x: 0, y: 0 }); // Current drag position
  const [, setRedDotPosition] = useState({ x: 0, y: 0 }); // Red dot position during drag
  const [simData, setSimData] = useState(null); // State to hold the simulation data
  const videoPlayerRef = useRef(null); // Ref for VideoPlayer component

  // Mode state (regular or distractor)
  const [mode, setMode] = useState("regular"); // "regular" or "distractor"
  
  // Distractor mode states
  const [keyDistractors, setKeyDistractors] = useState([]); // Array of key distractors
  const [randomDistractorParams, setRandomDistractorParams] = useState({
    probability: 0.1,
    seed: 42,
    duration: 1.0,
    maxActive: 5,
    startDelay: 0.333  // Delay in seconds before first random distractor (default: ~10 frames at 30fps)
  });
  const [isAddingKeyDistractor, setIsAddingKeyDistractor] = useState(false);
  const [editingDistractorIndex, setEditingDistractorIndex] = useState(null);
  const [selectedFrame, setSelectedFrame] = useState(0);

  // Track when to auto-simulate
  const [shouldAutoSimulate, setShouldAutoSimulate] = useState(false);

  // Simulation parameters
  const [videoLength, setVideoLength] = useState(10); // Video length in seconds
  const [ballSpeed, setBallSpeed] = useState(3.6); // Ball speed in diameter/s
  const [fps, setFps] = useState(30); // FPS
  const [worldWidth, setWorldWidth] = useState(20); // Scene width
  const [worldHeight, setWorldHeight] = useState(20); // Scene height
  const res_multiplier = 4;
  // Calculate physics steps per frame to keep timestep close to 0.01
  // while ensuring ball speed = fps * physicsStepsPerFrame * timestep
  const targetTimestep = 0.01;
  const idealPhysicsStepsPerFrame = (ballSpeed / fps) / targetTimestep;
  const physicsStepsPerFrame = Math.max(1, Math.round(idealPhysicsStepsPerFrame));
  
  // Calculate actual timestep to achieve exact ball speed
  const timestep = (ballSpeed / fps) / physicsStepsPerFrame;
  // Validate physics parameters
  const isValidPhysics = physicsStepsPerFrame <= 50; // Reasonable upper limit
  const physicsWarning = physicsStepsPerFrame > 20 ? "High physics steps - consider reducing ball speed or increasing FPS" : null;

  // Saving and Loading params
  const [trial_name, setTrial_name] = useState('base'); // Default res multiplier
  const [saveDirectoryHandle, setSaveDirectoryHandle] = useState(null); // State to store the actual directory handle
  const [autoDownloadWebM, setAutoDownloadWebM] = useState(true); // State for WebM download toggle

  const px_scale = 25;
  const interval = 0.1;
  const border_px = 2;
  const entityHeight = 1;
  const entityWidth = 1;

  // Auto-simulate when keyDistractors change (for add/edit/delete operations)
  useEffect(() => {
    if (shouldAutoSimulate && entities.length > 0) {
      handleSimulate(true);
      setShouldAutoSimulate(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyDistractors, shouldAutoSimulate, entities]);

  const addEntity = (type) => {
    const existingTarget = entities.some((e) => e.type === "target");
    const existingRedSensor = entities.some((e) => e.type === "red_sensor");
    const existingGreenSensor = entities.some((e) => e.type === "green_sensor");

    if (
      (type === "target" && existingTarget) ||
      (type === "red_sensor" && existingRedSensor) ||
      (type === "green_sensor" && existingGreenSensor)
    ) {
      alert(`Only one ${type.replace("_", " ")} is allowed.`);
      return;
    }

    const newEntity = {
      id: Date.now(),
      type,
      x: worldWidth / 2 - entityWidth / 2,
      y: worldHeight / 2 - entityHeight / 2,
      width: entityWidth,
      height: entityHeight,
      direction: 0, // Initial direction in radians
    };
    setEntities([...entities, newEntity]);
    
    // Initialize direction input if adding a target
    if (type === "target") {
      setDirectionInput("0");
      setTargetDirection(0);
    }
  };

  const updateEntity = (id, updatedEntity) => {
    setEntities(entities.map((e) => (e.id === id ? updatedEntity : e)));
  };
  

  const updateTargetDirectionAndSpeed = (angleDegrees) => {
    const snappedAngle = angleDegrees; // Snap angle to the nearest degree
  
    if (snappedAngle >= -180 && snappedAngle < 180) {
      const newDirection = (snappedAngle * Math.PI) / 180; // Convert degrees to radians
      setTargetDirection(newDirection);
      setDirectionInput(snappedAngle.toString()); // Update the input field
    }
  };

  const handleDirectionInputChange = (value) => {
    setDirectionInput(value);
    const angleDegrees = parseFloat(value);
    if (!isNaN(angleDegrees) && angleDegrees >= -180 && angleDegrees < 180) {
      const newDirection = (angleDegrees * Math.PI) / 180; // Convert degrees to radians
      setTargetDirection(newDirection);
      
      // Update the target entity's direction
      const targetEntity = entities.find(e => e.type === "target");
      if (targetEntity) {
        const updatedEntity = {
          ...targetEntity,
          direction: newDirection,
        };
        updateEntity(targetEntity.id, updatedEntity);
      }
    }
  };

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

    const handleDrag = (e, d) => {
      setDragPosition({ x: e.clientX, y: e.clientY });
      setRedDotPosition({ x: d.x + px_scale / 2, y: d.y + px_scale / 2 }); // Center of the blue preview (25x25, so +12.5)
    };

    const handleDragStart = () => {
      setIsDraggingDirection(true);
    };

    const handleDragStop = (e, d) => {
      setIsDraggingDirection(false);
      
      // Use the Rnd drag position for angle calculation, adjusted for canvas border
      const deltaX = (d.x + px_scale / 2) - centerX;
      const deltaY = centerY - (d.y + px_scale / 2);
      const preciseAngle = Math.atan2(deltaY, deltaX); 
    
      updateTargetDirectionAndSpeed(preciseAngle * (180 / Math.PI));
      
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
          onDragStart={handleDragStart}
          onDrag={handleDrag}
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
  
  const deleteEntity = (id) => {
    setEntities(entities.filter((e) => e.id !== id));
    setContextMenu({ visible: false, x: 0, y: 0, entityId: null });
  };

  const clearAllEntities = () => {
    setEntities([]);
    setSimData(null);
    setContextMenu({ visible: false, x: 0, y: 0, entityId: null });
    // Clear distractor data
    setKeyDistractors([]);
    setRandomDistractorParams({
      probability: 0.1,
      seed: 42,
      duration: 1.0,
      maxActive: 5,
      startDelay: 0.333
    });
    setIsAddingKeyDistractor(false);
  };

  const handleContextMenu = (e, entityId) => {
    e.preventDefault();
    setContextMenu({ visible: true, x: e.clientX, y: e.clientY, entityId });
  };

  // Validation function to check if a ball (circle) overlaps with a barrier (rectangle)
  const checkCircleRectangleCollision = (circleX, circleCenterY, circleRadius, rectX, rectY, rectWidth, rectHeight) => {
    // Find the closest point on the rectangle to the circle's center
    const closestX = Math.max(rectX, Math.min(circleX, rectX + rectWidth));
    const closestY = Math.max(rectY, Math.min(circleCenterY, rectY + rectHeight));
    
    // Calculate the distance between the circle's center and this closest point
    const distanceX = circleX - closestX;
    const distanceY = circleCenterY - closestY;
    const distanceSquared = (distanceX * distanceX) + (distanceY * distanceY);
    
    // Check if the distance is less than the circle's radius (collision detected)
    return distanceSquared < (circleRadius * circleRadius);
  };

  const validateBallPositions = () => {
    // Get all barriers
    const barriers = entities.filter(e => e.type === "barrier");
    
    if (barriers.length === 0) {
      return { valid: true }; // No barriers, so no collision possible
    }

    // Check all target balls (entities with type "target")
    const targets = entities.filter(e => e.type === "target");
    for (const target of targets) {
      const ballCenterX = target.x + target.width / 2;
      const ballCenterY = target.y + target.height / 2;
      const ballRadius = target.width / 2; // Assuming width === height for balls
      
      for (const barrier of barriers) {
        if (checkCircleRectangleCollision(ballCenterX, ballCenterY, ballRadius, barrier.x, barrier.y, barrier.width, barrier.height)) {
          return {
            valid: false,
            message: "Cannot simulate: A ball is placed inside or overlapping a barrier. Please move the ball to a valid position."
          };
        }
      }
    }

    // Check key distractor balls if in distractor mode
    if (mode === "distractor" && keyDistractors.length > 0) {
      // Assume distractor balls have the same size as target balls
      const ballRadius = targets.length > 0 ? targets[0].width / 2 : 0.5; // Default to 0.5 if no targets
      
      for (let i = 0; i < keyDistractors.length; i++) {
        const distractor = keyDistractors[i];
        const ballCenterX = distractor.x;
        const ballCenterY = distractor.y;
        
        for (const barrier of barriers) {
          if (checkCircleRectangleCollision(ballCenterX, ballCenterY, ballRadius, barrier.x, barrier.y, barrier.width, barrier.height)) {
            return {
              valid: false,
              message: `Cannot simulate: Key distractor at frame ${distractor.startFrame} is placed inside or overlapping a barrier. Please move it to a valid position.`
            };
          }
        }
      }
    }

    return { valid: true };
  };

  const handleSimulate = async (autoRun = false) => {
    // Validate ball positions before simulating
    const validation = validateBallPositions();
    if (!validation.valid) {
      alert(validation.message);
      return; // Don't proceed with simulation
    }

    const requestBody = {
      entities,
      simulationParams: {
        videoLength,
        ballSpeed,
        fps,
        physicsStepsPerFrame,
        res_multiplier,
        timestep,
        worldWidth,
        worldHeight
      },
    };

    // Add distractor parameters if in distractor mode
    if (mode === "distractor") {
      requestBody.distractorParams = {
        keyDistractors,
        randomDistractorParams
      };
    }

    fetch("/simulate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.status === "success") {
          setSimData(data.sim_data); // Store the simulation data instead of viz_array
        } else {
          if (!autoRun) {
            console.error("Simulation error:", data.message);
          }
        }
      })
      .catch((error) => {
        if (!autoRun) {
          console.error("Error during simulation:", error);
        }
      });
  };

  const handleFileLoad = async (event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        // Step 1: Call the Flask function to clear the simulation
        const clearResponse = await fetch("/clear_simulation", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });
  
        if (!clearResponse.ok) {
          const errorMessage = await clearResponse.text();
          alert(`Failed to clear simulation: ${errorMessage}`);
          return;
        }


        // Step 2: Clear the simulation data
        setSimData(null);
  
        // Step 2: Proceed with loading the JSON file
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const parsedData = JSON.parse(e.target.result);
            
            // Handle both old format (array) and new format (object with entities + distractor data + simulation params)
            let parsedEntities;
            let hasDistractorData = false;
            
            if (Array.isArray(parsedData)) {
              // Old format - just entities
              parsedEntities = parsedData;
            } else if (parsedData.entities) {
              // New format - entities + optional distractor data + optional simulation params
              parsedEntities = parsedData.entities;
              
              // Load simulation params if present
              if (parsedData.simulationParams) {
                const simParams = parsedData.simulationParams;
                if (simParams.videoLength !== undefined) setVideoLength(simParams.videoLength);
                if (simParams.ballSpeed !== undefined) setBallSpeed(simParams.ballSpeed);
                if (simParams.fps !== undefined) setFps(simParams.fps);
                if (simParams.worldWidth !== undefined) setWorldWidth(simParams.worldWidth);
                if (simParams.worldHeight !== undefined) setWorldHeight(simParams.worldHeight);
              }
              
              if (parsedData.distractorData || parsedData.hallucinationData) {
                hasDistractorData = true;
                // Load distractor data (handle both new and old key names for backward compatibility)
                const distractorData = parsedData.distractorData || parsedData.hallucinationData;
                if (distractorData.keyDistractors || distractorData.keyHallucinations) {
                  setKeyDistractors(distractorData.keyDistractors || distractorData.keyHallucinations);
                }
                if (distractorData.randomDistractorParams || distractorData.randomHallucinationParams) {
                  setRandomDistractorParams(distractorData.randomDistractorParams || distractorData.randomHallucinationParams);
                }
              }
            } else {
              alert("Invalid file format. Ensure the JSON contains entities!");
              return;
            }
            
            if (Array.isArray(parsedEntities)) {
              setEntities(parsedEntities); // Reset entities state
  
              // Find the target entity and update its direction and speed
              const targetEntity = parsedEntities.find((entity) => entity.type === "target");
              if (targetEntity) {
                setTargetDirection(targetEntity.direction || 0);
                setDirectionInput(((targetEntity.direction || 0) * (180 / Math.PI)).toString());
              }
              
              // Auto-switch mode based on distractor data
              if (hasDistractorData && mode === "regular") {
                setMode("distractor");
              } else if (!hasDistractorData && mode === "distractor") {
                setMode("regular");
                // Clear distractor data when switching to regular mode
                setKeyDistractors([]);
                setRandomDistractorParams({
                  probability: 0.1,
                  seed: 42,
                  duration: 1.0,
                  maxActive: 5,
                  startDelay: 0.333
                });
              }
              
              // Auto-simulate after loading
              setShouldAutoSimulate(true);
            } else {
              alert("Invalid file format. Ensure the JSON contains an array of entities!");
            }
          } catch (err) {
            alert("Failed to parse file. Ensure it's a valid JSON format.");
          }
        };
        reader.readAsText(file);
      } catch (err) {
        console.error("Error clearing simulation:", err);
        alert("An unexpected error occurred while clearing the simulation.");
      }
    }
  };

  const handleSetSaveDirectory = async () => {
    // Check if File System Access API is supported
    if (!('showDirectoryPicker' in window)) {
      alert("Your browser doesn't support directory selection. When you save, files will be downloaded to your default downloads folder instead.");
      return;
    }

    try {
      const directoryHandle = await window.showDirectoryPicker();
      setSaveDirectoryHandle(directoryHandle);
      alert(`Save directory set to: ${directoryHandle.name}`);
    } catch (error) {
      if (error.name === 'AbortError') {
        // User cancelled the directory picker
        alert("Directory selection was cancelled.");
      } else {
        console.error("Error selecting directory:", error);
        alert("An error occurred while selecting the directory.");
      }
    }
  };

  const handleSavedata = async () => {
    if (!simData) {
      alert("No simulation data available. Please run a simulation first!");
      return;
    }

    // If no directory handle is set (e.g., Firefox), use download fallback
    if (!saveDirectoryHandle) {
      try {
        // Prepare init state data
        const initStateData = {
          entities: entities
        };
        
        if (mode === "distractor" && (keyDistractors.length > 0 || randomDistractorParams.probability > 0)) {
          initStateData.distractorData = {
            keyDistractors,
            randomDistractorParams
          };
        }
        
        // Download entities JSON
        const entitiesBlob = new Blob([JSON.stringify(initStateData, null, 2)], { type: 'application/json' });
        const entitiesUrl = URL.createObjectURL(entitiesBlob);
        const entitiesLink = document.createElement('a');
        entitiesLink.href = entitiesUrl;
        entitiesLink.download = `${trial_name}_init_state_entities.json`;
        document.body.appendChild(entitiesLink);
        entitiesLink.click();
        document.body.removeChild(entitiesLink);
        URL.revokeObjectURL(entitiesUrl);
        
        // Download simulation data JSON
        const simDataBlob = new Blob([JSON.stringify(simData, null, 2)], { type: 'application/json' });
        const simDataUrl = URL.createObjectURL(simDataBlob);
        const simDataLink = document.createElement('a');
        simDataLink.href = simDataUrl;
        simDataLink.download = `${trial_name}_simulation_data.json`;
        document.body.appendChild(simDataLink);
        simDataLink.click();
        document.body.removeChild(simDataLink);
        URL.revokeObjectURL(simDataUrl);
        
        // If auto download is enabled, download the WebM
        if (autoDownloadWebM && videoPlayerRef.current) {
          try {
            await videoPlayerRef.current.downloadWebM();
            alert("Files downloaded successfully!");
          } catch (error) {
            console.error("Error downloading video:", error);
            alert("Data files downloaded successfully, but video download failed!");
          }
        } else {
          alert("Files downloaded successfully!");
        }
      } catch (error) {
        console.error("Error downloading files:", error);
        alert("An error occurred while downloading files: " + error.message);
      }
      return;
    }

    try {
      // Check if trial directory already exists
      let trialDirExists = false;
      let existingTrialDirHandle = null;
      try {
        existingTrialDirHandle = await saveDirectoryHandle.getDirectoryHandle(trial_name);
        trialDirExists = true;
      } catch (error) {
        // Directory doesn't exist, which is fine
        trialDirExists = false;
      }

      // If directory exists, ask user for confirmation
      if (trialDirExists) {
        const userConfirmed = window.confirm(
          `The trial directory "${trial_name}" already exists in the save directory. Do you want to override it?`
        );
        if (!userConfirmed) {
          return; // User chose not to override
        }
        
        // If user confirmed override, remove any existing WebM files
        if (existingTrialDirHandle) {
          const filesToRemove = [
            `${trial_name}.webm`,  // Old format
            `${trial_name}_stimulus.webm`,
            `${trial_name}_revealed.webm`
          ];
          
          for (const filename of filesToRemove) {
            try {
              await existingTrialDirHandle.removeEntry(filename, { recursive: false });
              console.log(`Removed existing WebM file: ${filename}`);
            } catch (error) {
              // File doesn't exist or couldn't be removed, which is fine
              console.log(`No existing WebM file to remove (${filename}):`, error);
            }
          }
        }
      }

      // Create trial directory
      const trialDirHandle = await saveDirectoryHandle.getDirectoryHandle(trial_name, { create: true });
      
      // Prepare init state data (entities + distractor data if in distractor mode + simulation params)
      const initStateData = {
        entities: entities,
        simulationParams: {
          videoLength,
          ballSpeed,
          fps,
          worldWidth,
          worldHeight
        }
      };
      
      if (mode === "distractor" && (keyDistractors.length > 0 || randomDistractorParams.probability > 0)) {
        initStateData.distractorData = {
          keyDistractors,
          randomDistractorParams
        };
      }
      
      // Save entities JSON file
      const entitiesFileHandle = await trialDirHandle.getFileHandle('init_state_entities.json', { create: true });
      const entitiesWritable = await entitiesFileHandle.createWritable();
      await entitiesWritable.write(JSON.stringify(initStateData, null, 2));
      await entitiesWritable.close();
      
      // Save simulation data JSON file
      const simDataFileHandle = await trialDirHandle.getFileHandle('simulation_data.json', { create: true });
      const simDataWritable = await simDataFileHandle.createWritable();
      await simDataWritable.write(JSON.stringify(simData, null, 2));
      await simDataWritable.close();
      
      // If auto download is enabled and we have simulation data, download the WebM first
      if (autoDownloadWebM && simData && videoPlayerRef.current) {
        try {
          await videoPlayerRef.current.downloadWebM();
          alert("Data and video saved successfully!");
        } catch (error) {
          console.error("Error downloading video:", error);
          alert("Data saved successfully, but video download failed!");
        }
      } else {
        // Show success message immediately if no auto-download
        alert("Data saved successfully!");
      }
    } catch (error) {
      console.error("Error saving data:", error);
      
      // Fallback: download files if File System Access API fails
      if (error.name === 'NotAllowedError' || error.name === 'SecurityError') {
        alert("Permission denied. Falling back to download files.");
        
        // Prepare init state data
        const initStateData = {
          entities: entities,
          simulationParams: {
            videoLength,
            ballSpeed,
            fps,
            worldWidth,
            worldHeight
          }
        };
        
        if (mode === "distractor" && (keyDistractors.length > 0 || randomDistractorParams.probability > 0)) {
          initStateData.distractorData = {
            keyDistractors,
            randomDistractorParams
          };
        }
        
        // Download entities JSON
        const entitiesBlob = new Blob([JSON.stringify(initStateData, null, 2)], { type: 'application/json' });
        const entitiesUrl = URL.createObjectURL(entitiesBlob);
        const entitiesLink = document.createElement('a');
        entitiesLink.href = entitiesUrl;
        entitiesLink.download = `${trial_name}_init_state_entities.json`;
        document.body.appendChild(entitiesLink);
        entitiesLink.click();
        document.body.removeChild(entitiesLink);
        URL.revokeObjectURL(entitiesUrl);
        
        // Download simulation data JSON
        const simDataBlob = new Blob([JSON.stringify(simData, null, 2)], { type: 'application/json' });
        const simDataUrl = URL.createObjectURL(simDataBlob);
        const simDataLink = document.createElement('a');
        simDataLink.href = simDataUrl;
        simDataLink.download = `${trial_name}_simulation_data.json`;
        document.body.appendChild(simDataLink);
        simDataLink.click();
        document.body.removeChild(simDataLink);
        URL.revokeObjectURL(simDataUrl);
        
        alert("Files downloaded successfully!");
      } else {
        alert("An error occurred while saving data: " + error.message);
      }
    }
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
      {/* Top Bar with Mode Switcher */}
      <div style={{
        display: "flex",
        justifyContent: "flex-end",
        alignItems: "center",
        padding: "12px 24px",
        background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
        borderBottom: "2px solid #e2e8f0",
        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)"
      }}>
        <div style={{
          display: "flex",
          gap: "8px",
          alignItems: "center"
        }}>
          <span style={{
            fontSize: "14px",
            fontWeight: "600",
            color: "#64748b",
            marginRight: "8px"
          }}>
            Mode:
          </span>
          <button
            onClick={() => setMode("regular")}
            style={{
              background: mode === "regular" 
                ? "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)" 
                : "linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%)",
              color: mode === "regular" ? "white" : "#6b7280",
              padding: "8px 16px",
              borderRadius: "6px",
              border: "none",
              fontSize: "13px",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.2s ease",
              boxShadow: mode === "regular" 
                ? "0 2px 8px rgba(59, 130, 246, 0.3)" 
                : "0 2px 4px rgba(0, 0, 0, 0.1)"
            }}
          >
            Regular Mode
          </button>
          <button
            onClick={() => setMode("distractor")}
            style={{
              background: mode === "distractor" 
                ? "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)" 
                : "linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%)",
              color: mode === "distractor" ? "white" : "#6b7280",
              padding: "8px 16px",
              borderRadius: "6px",
              border: "none",
              fontSize: "13px",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.2s ease",
              boxShadow: mode === "distractor" 
                ? "0 2px 8px rgba(139, 92, 246, 0.3)" 
                : "0 2px 4px rgba(0, 0, 0, 0.1)"
            }}
          >
            Distractor Mode
          </button>
        </div>
      </div>
      
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
          <div style={{ 
            background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)", 
            padding: '24px', 
            borderRadius: '12px', 
            border: '1px solid #e2e8f0',
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
          }}>
            <h3 style={{ 
              margin: '0 0 20px 0', 
              fontSize: '18px', 
              fontWeight: '700', 
              color: '#1e293b',
              letterSpacing: '-0.025em'
            }}>
              Simulation Settings
            </h3>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ 
                display: 'block', 
                fontSize: '14px', 
                fontWeight: '600', 
                color: '#374151', 
                marginBottom: '8px',
                letterSpacing: '0.025em'
              }}>
                Video Length (seconds)
              </label>
              <input
                type="number"
                value={videoLength}
                onChange={(e) => setVideoLength(Number(e.target.value))}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'all 0.2s ease',
                  boxSizing: 'border-box',
                  WebkitAppearance: 'none',
                  MozAppearance: 'textfield',
                  backgroundColor: '#ffffff',
                  color: '#1f2937'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#3b82f6';
                  e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e5e7eb';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ 
                display: 'block', 
                fontSize: '14px', 
                fontWeight: '600', 
                color: '#374151', 
                marginBottom: '8px',
                letterSpacing: '0.025em'
              }}>
                Ball Speed (diameter/s)
              </label>
              <input
                type="number"
                value={ballSpeed}
                onChange={(e) => setBallSpeed(Number(e.target.value))}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'all 0.2s ease',
                  boxSizing: 'border-box',
                  WebkitAppearance: 'none',
                  MozAppearance: 'textfield',
                  backgroundColor: '#ffffff',
                  color: '#1f2937'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#3b82f6';
                  e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e5e7eb';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ 
                display: 'block', 
                fontSize: '14px', 
                fontWeight: '600', 
                color: '#374151', 
                marginBottom: '8px',
                letterSpacing: '0.025em'
              }}>
                FPS
              </label>
              <input
                type="number"
                value={fps}
                onChange={(e) => setFps(Number(e.target.value))}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'all 0.2s ease',
                  boxSizing: 'border-box',
                  WebkitAppearance: 'none',
                  MozAppearance: 'textfield',
                  backgroundColor: '#ffffff',
                  color: '#1f2937'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#3b82f6';
                  e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e5e7eb';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ 
                display: 'block', 
                fontSize: '14px', 
                fontWeight: '600', 
                color: '#374151', 
                marginBottom: '8px',
                letterSpacing: '0.025em'
              }}>
                Ball Direction (degrees)
              </label>
              <input
                type="number"
                value={directionInput}
                onChange={(e) => handleDirectionInputChange(e.target.value)}
                min="-180"
                max="179.9"
                step="0.1"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'all 0.2s ease',
                  boxSizing: 'border-box',
                  WebkitAppearance: 'none',
                  MozAppearance: 'textfield',
                  backgroundColor: '#ffffff',
                  color: '#1f2937'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#3b82f6';
                  e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e5e7eb';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ 
                display: 'block', 
                fontSize: '14px', 
                fontWeight: '600', 
                color: '#374151', 
                marginBottom: '8px',
                letterSpacing: '0.025em'
              }}>
                Scene Dimensions
              </label>
              <div style={{ 
                display: 'flex', 
                gap: '12px', 
                alignItems: 'center'
              }}>
                <div style={{ flex: 1 }}>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '12px', 
                    fontWeight: '500', 
                    color: '#6b7280', 
                    marginBottom: '4px'
                  }}>
                    Width
                  </label>
                  <input
                    type="number"
                    value={worldWidth}
                    onChange={(e) => setWorldWidth(Number(e.target.value))}
                    min="5"
                    max="50"
                    step="1"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'all 0.2s ease',
                      boxSizing: 'border-box',
                      WebkitAppearance: 'none',
                      MozAppearance: 'textfield',
                      backgroundColor: '#ffffff',
                      color: '#1f2937'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#3b82f6';
                      e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e5e7eb';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>
                <div style={{ 
                  fontSize: '16px', 
                  color: '#9ca3af', 
                  fontWeight: '600',
                  marginTop: '20px'
                }}>
                  ×
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '12px', 
                    fontWeight: '500', 
                    color: '#6b7280', 
                    marginBottom: '4px'
                  }}>
                    Height
                  </label>
                  <input
                    type="number"
                    value={worldHeight}
                    onChange={(e) => setWorldHeight(Number(e.target.value))}
                    min="5"
                    max="50"
                    step="1"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'all 0.2s ease',
                      boxSizing: 'border-box',
                      WebkitAppearance: 'none',
                      MozAppearance: 'textfield',
                      backgroundColor: '#ffffff',
                      color: '#1f2937'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#3b82f6';
                      e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e5e7eb';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>
              </div>
            </div>
            
            <div style={{ 
              fontSize: '13px', 
              color: '#6b7280', 
              padding: '16px',
              backgroundColor: 'linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)',
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
              background: 'linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)',
              fontWeight: '500'
            }}>
              Ball moves {(ballSpeed / fps).toFixed(3)} diameters per frame
              {physicsWarning && (
                <div style={{ 
                  color: '#dc2626', 
                  marginTop: '8px', 
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <span style={{ fontSize: '16px' }}>⚠️</span> {physicsWarning}
                </div>
              )}
            </div>
          </div>

          {/* Distractor Controls - Only show in distractor mode */}
          {mode === "distractor" && (
            <div style={{ 
              background: "linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)", 
              padding: '24px', 
              borderRadius: '12px', 
              border: '2px solid #d8b4fe',
              boxShadow: "0 4px 6px -1px rgba(139, 92, 246, 0.2), 0 2px 4px -1px rgba(139, 92, 246, 0.1)"
            }}>
              <h3 style={{ 
                margin: '0 0 20px 0', 
                fontSize: '18px', 
                fontWeight: '700', 
                color: '#6b21a8',
                letterSpacing: '-0.025em'
              }}>
                Distractor Controls
              </h3>
              
              {/* Key Distractor Section */}
              <div style={{ marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid #e9d5ff' }}>
                <h4 style={{ 
                  margin: '0 0 12px 0', 
                  fontSize: '14px', 
                  fontWeight: '600', 
                  color: '#7c3aed'
                }}>
                  Key Distractor
                </h4>
                
                <button
                  onClick={() => setIsAddingKeyDistractor(!isAddingKeyDistractor)}
                  disabled={!simData}
                  style={{
                    width: '100%',
                    background: isAddingKeyDistractor 
                      ? "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)"
                      : "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
                    color: "white",
                    padding: "10px 14px",
                    borderRadius: "8px",
                    border: "none",
                    fontSize: "13px",
                    fontWeight: "600",
                    cursor: simData ? "pointer" : "not-allowed",
                    transition: "all 0.2s ease",
                    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                    marginBottom: "12px",
                    opacity: simData ? 1 : 0.5
                  }}
                >
                  {isAddingKeyDistractor ? "❌ Cancel Adding" : "➕ Add Key Distractor"}
                </button>
                
                {keyDistractors.length > 0 && (
                  <div style={{ marginTop: '12px' }}>
                    <div style={{ 
                      fontSize: '12px', 
                      color: '#7c3aed', 
                      fontWeight: '600',
                      marginBottom: '8px'
                    }}>
                      Active Key Distractors: {keyDistractors.length}
                    </div>
                    {keyDistractors.map((distractor, index) => (
                      <div 
                        key={index}
                        style={{
                          padding: '8px 10px',
                          backgroundColor: 'white',
                          borderRadius: '6px',
                          marginBottom: '6px',
                          border: editingDistractorIndex === index ? '2px solid #8b5cf6' : '1px solid #e9d5ff',
                          fontSize: '11px',
                          color: '#6b7280',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        <span>
                          Frame {distractor.startFrame} • {distractor.duration}s • {distractor.speed?.toFixed(1) || '3.6'} d/s
                        </span>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button
                            onClick={() => {
                              setEditingDistractorIndex(index);
                              setIsAddingKeyDistractor(true);
                            }}
                            style={{
                              background: '#8b5cf6',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              padding: '4px 8px',
                              fontSize: '10px',
                              cursor: 'pointer',
                              fontWeight: '600'
                            }}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => {
                              setKeyDistractors(keyDistractors.filter((_, i) => i !== index));
                              if (editingDistractorIndex === index) {
                                setEditingDistractorIndex(null);
                                setIsAddingKeyDistractor(false);
                              }
                              // Trigger auto-simulate after deleting
                              setShouldAutoSimulate(true);
                            }}
                            style={{
                              background: '#ef4444',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              padding: '4px 8px',
                              fontSize: '10px',
                              cursor: 'pointer',
                              fontWeight: '600'
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Random Distractor Parameters */}
              <div>
                <h4 style={{ 
                  margin: '0 0 12px 0', 
                  fontSize: '14px', 
                  fontWeight: '600', 
                  color: '#7c3aed'
                }}>
                  Random Distractors
                </h4>
                
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '12px', 
                    fontWeight: '600', 
                    color: '#6b21a8', 
                    marginBottom: '6px'
                  }}>
                    Start Delay (seconds)
                  </label>
                  <input
                    type="number"
                    value={randomDistractorParams.startDelay}
                    onChange={(e) => setRandomDistractorParams({
                      ...randomDistractorParams,
                      startDelay: parseFloat(e.target.value)
                    })}
                    min="0"
                    step="0.1"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '2px solid #e9d5ff',
                      borderRadius: '6px',
                      fontSize: '12px',
                      outline: 'none',
                      transition: 'all 0.2s ease',
                      boxSizing: 'border-box',
                      backgroundColor: '#ffffff',
                      color: '#1f2937'
                    }}
                  />
                  <div style={{ 
                    fontSize: '10px', 
                    color: '#9ca3af', 
                    marginTop: '4px' 
                  }}>
                    Delay before first random distractor appears
                  </div>
                </div>
                
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '12px', 
                    fontWeight: '600', 
                    color: '#6b21a8', 
                    marginBottom: '6px'
                  }}>
                    Spawn Probability (per frame)
                  </label>
                  <input
                    type="number"
                    value={randomDistractorParams.probability}
                    onChange={(e) => setRandomDistractorParams({
                      ...randomDistractorParams,
                      probability: parseFloat(e.target.value)
                    })}
                    min="0"
                    max="1"
                    step="0.01"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '2px solid #e9d5ff',
                      borderRadius: '6px',
                      fontSize: '12px',
                      outline: 'none',
                      transition: 'all 0.2s ease',
                      boxSizing: 'border-box',
                      backgroundColor: '#ffffff',
                      color: '#1f2937'
                    }}
                  />
                </div>
                
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '12px', 
                    fontWeight: '600', 
                    color: '#6b21a8', 
                    marginBottom: '6px'
                  }}>
                    Random Seed
                  </label>
                  <input
                    type="number"
                    value={randomDistractorParams.seed}
                    onChange={(e) => setRandomDistractorParams({
                      ...randomDistractorParams,
                      seed: parseInt(e.target.value)
                    })}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '2px solid #e9d5ff',
                      borderRadius: '6px',
                      fontSize: '12px',
                      outline: 'none',
                      transition: 'all 0.2s ease',
                      boxSizing: 'border-box',
                      backgroundColor: '#ffffff',
                      color: '#1f2937'
                    }}
                  />
                </div>
                
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '12px', 
                    fontWeight: '600', 
                    color: '#6b21a8', 
                    marginBottom: '6px'
                  }}>
                    Duration (seconds)
                  </label>
                  <input
                    type="number"
                    value={randomDistractorParams.duration}
                    onChange={(e) => setRandomDistractorParams({
                      ...randomDistractorParams,
                      duration: parseFloat(e.target.value)
                    })}
                    min="0.1"
                    step="0.1"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '2px solid #e9d5ff',
                      borderRadius: '6px',
                      fontSize: '12px',
                      outline: 'none',
                      transition: 'all 0.2s ease',
                      boxSizing: 'border-box',
                      backgroundColor: '#ffffff',
                      color: '#1f2937'
                    }}
                  />
                </div>
                
                <div style={{ marginBottom: '0' }}>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '12px', 
                    fontWeight: '600', 
                    color: '#6b21a8', 
                    marginBottom: '6px'
                  }}>
                    Max Active Distractors
                  </label>
                  <input
                    type="number"
                    value={randomDistractorParams.maxActive}
                    onChange={(e) => setRandomDistractorParams({
                      ...randomDistractorParams,
                      maxActive: parseInt(e.target.value)
                    })}
                    min="1"
                    step="1"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '2px solid #e9d5ff',
                      borderRadius: '6px',
                      fontSize: '12px',
                      outline: 'none',
                      transition: 'all 0.2s ease',
                      boxSizing: 'border-box',
                      backgroundColor: '#ffffff',
                      color: '#1f2937'
                    }}
                  />
                </div>
              </div>
            </div>
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
          {/* Canvas Section */}
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
            onClick={() => setContextMenu({ visible: false, x: 0, y: 0, entityId: null })}
            onContextMenu={(e) => e.preventDefault()}
          >
            {entities.map((entity) => (
              <React.Fragment key={entity.id}>
              <Rnd
              key={entity.id}
              size={{
                width: entity.type === "target" ? px_scale : entity.width * px_scale,
                height: entity.type === "target" ? px_scale : entity.height * px_scale,
              }}
              position={{
                x: entity.x * px_scale + border_px,
                y: (worldHeight - entity.y - entity.height) * px_scale + border_px,
              }}
              onDragStop={(e, d) => {
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
              }}
              onResizeStop={(e, direction, ref, delta, position) => {
                if (entity.type !== "target") {
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
                }
              }}
              bounds="parent"
              grid={[interval * px_scale, interval * px_scale]}
              enableResizing={
                entity.type !== "target"
              }
              style={{
                backgroundColor: {
                  occluder: "#6b7280",
                  barrier: "#1f2937",
                  red_sensor: "#ef4444",
                  green_sensor: "#10b981",
                  target: "#3b82f6",
                }[entity.type],
                borderRadius: entity.type === "target" ? "50%" : "0px",
                border: "0px solid black",
                cursor: "move",
                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)"
              }}
              onContextMenu={(e) => handleContextMenu(e, entity.id)}
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
                    onClick={() => deleteEntity(contextMenu.entityId)}
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
                onAddKeyDistractor={(distractorData) => {
                  if (editingDistractorIndex !== null) {
                    // Update existing distractor
                    const updated = [...keyDistractors];
                    updated[editingDistractorIndex] = distractorData;
                    setKeyDistractors(updated);
                    setEditingDistractorIndex(null);
                  } else {
                    // Add new distractor
                    setKeyDistractors([...keyDistractors, distractorData]);
                  }
                  setIsAddingKeyDistractor(false);
                  // Trigger auto-simulate after state updates
                  setShouldAutoSimulate(true);
                }}
                ref={videoPlayerRef}
              />
            ) : (
              <div
                style={{
                  width: `${vid_res}px`,
                  height: `${vid_res}px`,
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
      <div style={{ 
        background: "linear-gradient(135deg, #1e293b 0%, #334155 100%)", 
        borderTop: "1px solid #475569",
        padding: "16px 24px",
        boxShadow: "0 -4px 6px -1px rgba(0, 0, 0, 0.1), 0 -2px 4px -1px rgba(0, 0, 0, 0.06)"
      }}>
        <div style={{ 
          display: "flex", 
          flexWrap: "wrap", 
          gap: "12px", 
          alignItems: "center",
          justifyContent: "flex-start"
        }}>
          {/* Entity Buttons */}
          <div style={{ 
            display: "flex", 
            gap: "8px", 
            marginRight: "20px",
            paddingRight: "20px",
            borderRight: "1px solid #475569"
          }}>
            <button
              onClick={() => addEntity("occluder")}
              style={{ 
                background: "linear-gradient(135deg, #6b7280 0%, #4b5563 100%)", 
                color: "white", 
                padding: "8px 14px", 
                borderRadius: "6px",
                border: "none",
                fontSize: "12px",
                fontWeight: "600",
                cursor: "pointer",
                transition: "all 0.2s ease",
                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)"
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = "translateY(-1px)";
                e.target.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.15)";
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.1)";
              }}
            >
              Add Occluder
            </button>
            <button
              onClick={() => addEntity("barrier")}
              style={{ 
                background: "linear-gradient(135deg, #374151 0%, #1f2937 100%)", 
                color: "white", 
                padding: "8px 14px", 
                borderRadius: "6px",
                border: "none",
                fontSize: "12px",
                fontWeight: "600",
                cursor: "pointer",
                transition: "all 0.2s ease",
                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)"
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = "translateY(-1px)";
                e.target.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.15)";
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.1)";
              }}
            >
              Add Barrier
            </button>
            <button
              onClick={() => addEntity("red_sensor")}
              style={{ 
                background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)", 
                color: "white", 
                padding: "8px 14px", 
                borderRadius: "6px",
                border: "none",
                fontSize: "12px",
                fontWeight: "600",
                cursor: "pointer",
                transition: "all 0.2s ease",
                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)"
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = "translateY(-1px)";
                e.target.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.15)";
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.1)";
              }}
            >
              Add Red Sensor
            </button>
            <button
              onClick={() => addEntity("green_sensor")}
              style={{ 
                background: "linear-gradient(135deg, #10b981 0%, #059669 100%)", 
                color: "white", 
                padding: "8px 14px", 
                borderRadius: "6px",
                border: "none",
                fontSize: "12px",
                fontWeight: "600",
                cursor: "pointer",
                transition: "all 0.2s ease",
                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)"
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = "translateY(-1px)";
                e.target.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.15)";
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.1)";
              }}
            >
              Add Green Sensor
            </button>
            <button
              onClick={() => addEntity("target")}
              style={{ 
                background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)", 
                color: "white", 
                padding: "8px 14px", 
                borderRadius: "6px",
                border: "none",
                fontSize: "12px",
                fontWeight: "600",
                cursor: "pointer",
                transition: "all 0.2s ease",
                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)"
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = "translateY(-1px)";
                e.target.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.15)";
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.1)";
              }}
            >
              Add Target
            </button>
          </div>

          {/* Action Buttons */}
          <div style={{ 
            display: "flex", 
            gap: "8px", 
            marginRight: "20px",
            paddingRight: "20px",
            borderRight: "1px solid #475569"
          }}>
            <button
              onClick={handleSimulate}
              disabled={!isValidPhysics}
              style={{
                background: isValidPhysics ? "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)" : "linear-gradient(135deg, #6b7280 0%, #4b5563 100%)",
                color: "white",
                padding: "8px 14px",
                borderRadius: "6px",
                border: "none",
                fontSize: "12px",
                fontWeight: "600",
                cursor: isValidPhysics ? "pointer" : "not-allowed",
                transition: "all 0.2s ease",
                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)"
              }}
              onMouseEnter={(e) => {
                if (isValidPhysics) {
                  e.target.style.transform = "translateY(-1px)";
                  e.target.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.15)";
                }
              }}
              onMouseLeave={(e) => {
                if (isValidPhysics) {
                  e.target.style.transform = "translateY(0)";
                  e.target.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.1)";
                }
              }}
            >
              {isValidPhysics ? "🚀 Simulate" : "Invalid Physics"}
            </button>
          </div>

          {/* Trial Settings */}
          <div style={{ 
            display: "flex", 
            gap: "8px", 
            alignItems: "center",
            marginRight: "20px",
            paddingRight: "20px",
            borderRight: "1px solid #475569"
          }}>
            <label style={{ 
              fontSize: "12px", 
              fontWeight: "600", 
              color: "#e2e8f0"
            }}>
              Trial Name:
            </label>
            <input
              type="text"
              value={trial_name}
              onChange={(e) => setTrial_name(e.target.value)}
              style={{
                padding: "6px 10px",
                border: "2px solid #475569",
                borderRadius: "4px",
                fontSize: "12px",
                outline: "none",
                transition: "all 0.2s ease",
                width: "100px",
                backgroundColor: "#1e293b",
                color: "#f1f5f9",
                fontWeight: "500"
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#3b82f6";
                e.target.style.boxShadow = "0 0 0 3px rgba(59, 130, 246, 0.1)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#475569";
                e.target.style.boxShadow = "none";
              }}
            />
          </div>

          {/* Save Controls */}
          <div style={{ 
            display: "flex", 
            gap: "8px", 
            alignItems: "center",
            marginRight: "20px",
            paddingRight: "20px",
            borderRight: "1px solid #475569"
          }}>
            <button
              onClick={handleSetSaveDirectory}
              style={{
                background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                color: "white",
                padding: "8px 14px",
                borderRadius: "6px",
                border: "none",
                fontSize: "12px",
                fontWeight: "600",
                cursor: "pointer",
                transition: "all 0.2s ease",
                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)"
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = "translateY(-1px)";
                e.target.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.15)";
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.1)";
              }}
            >
              📁 Select Save Directory
            </button>
            {saveDirectoryHandle && (
              <div style={{
                background: "linear-gradient(135deg, #1e293b 0%, #334155 100%)",
                color: "#e2e8f0",
                padding: "6px 10px",
                borderRadius: "4px",
                fontSize: "11px",
                fontWeight: "500",
                border: "1px solid #475569",
                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                maxWidth: "160px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap"
              }}>
                📂 {saveDirectoryHandle.name}
              </div>
            )}
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <input
                type="checkbox"
                checked={autoDownloadWebM}
                onChange={(e) => setAutoDownloadWebM(e.target.checked)}
                style={{ 
                  margin: 0,
                  width: "14px",
                  height: "14px",
                  accentColor: "#3b82f6"
                }}
              />
              <label style={{ fontSize: "12px", color: "#e2e8f0", margin: 0, fontWeight: "500" }}>
                Auto-download WebM
              </label>
            </div>
            <button
              onClick={handleSavedata}
              style={{
                background: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
                color: "white",
                padding: "8px 14px",
                borderRadius: "6px",
                border: "none",
                fontSize: "12px",
                fontWeight: "600",
                cursor: "pointer",
                transition: "all 0.2s ease",
                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)"
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = "translateY(-1px)";
                e.target.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.15)";
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.1)";
              }}
            >
              💾 Save Data
            </button>
          </div>

          {/* File Controls */}
          <div style={{ 
            display: "flex", 
            gap: "8px", 
            alignItems: "center"
          }}>
            <label
              style={{
                background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                color: "white",
                padding: "8px 14px",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "12px",
                fontWeight: "600",
                transition: "all 0.2s ease",
                margin: 0,
                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                display: "inline-block"
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = "translateY(-1px)";
                e.target.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.15)";
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.1)";
              }}
            >
              📂 Load Scene
              <input
                type="file"
                accept=".json"
                onChange={handleFileLoad}
                style={{ display: "none" }}
              />
            </label>
            <button
              onClick={clearAllEntities}
              style={{
                background: "linear-gradient(135deg, #6b7280 0%, #4b5563 100%)",
                color: "white",
                padding: "8px 14px",
                borderRadius: "6px",
                border: "none",
                fontSize: "12px",
                fontWeight: "600",
                cursor: "pointer",
                transition: "all 0.2s ease",
                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)"
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = "translateY(-1px)";
                e.target.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.15)";
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.1)";
              }}
            >
              🗑️ Clear All
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;