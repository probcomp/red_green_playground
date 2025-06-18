import React, { useState, useRef } from "react";
import { Rnd } from "react-rnd";
import VideoPlayer from "./components/VideoPlayer";

const vid_res = 400; 

function App() { 
  const [entities, setEntities] = useState([]);
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, entityId: null });
  const [targetDirection, setTargetDirection] = useState(0); // Angle in radians
  const [simData, setSimData] = useState(null); // State to hold the simulation data
  const videoPlayerRef = useRef(null); // Ref for VideoPlayer component

  // Simulation parameters
  const [videoLength, setVideoLength] = useState(10); // Video length in seconds
  const [ballSpeed, setBallSpeed] = useState(3.6); // Ball speed in diameter/s
  const [fps, setFps] = useState(30); // FPS
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
  const [autoDownloadMP4, setAutoDownloadMP4] = useState(false); // State for MP4 download toggle

  const worldHeight = 20;
  const worldWidth = 20;
  const px_scale = 25;
  const interval = 0.1;
  const border_px = 2;
  const entityHeight = 1;
  const entityWidth = 1;

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
  };

  const updateEntity = (id, updatedEntity) => {
    setEntities(entities.map((e) => (e.id === id ? updatedEntity : e)));
  };
  

  const updateTargetDirectionAndSpeed = (angleDegrees) => {
    const snappedAngle = angleDegrees; // Snap angle to the nearest degree
  
    if (snappedAngle >= -180 && snappedAngle < 180) {
      setTargetDirection((snappedAngle * Math.PI) / 180); // Convert degrees to radians
    }
  };

  const renderArrowForTarget = (target) => {
    if (target.type !== "target") return null;
  
    // Calculate the center of the target
    const centerX = (target.x + target.width / 2) * px_scale + border_px;
    const centerY = (worldHeight - (target.y + target.height / 2)) * px_scale + border_px;
  
    // Calculate the arrow endpoint
    const arrowLength = ballSpeed * px_scale;
    console.log("targetDirection: ", targetDirection);
    const arrowEndX = centerX + arrowLength * Math.cos(targetDirection);
    const arrowEndY = centerY - arrowLength * Math.sin(targetDirection);
  
    const handleArrowDragStop = (e, d) => {
      const deltaX = d.x - centerX;
      const deltaY = centerY - d.y;
    
      // Calculate the precise angle in radians
      const preciseAngle = Math.atan2(deltaY, deltaX); 
    
      updateTargetDirectionAndSpeed(preciseAngle * (180 / Math.PI));

      console.log("preciseAngle: ", preciseAngle);
    
      // Update the entity's direction
      const updatedEntity = {
        ...target,
        direction: preciseAngle, // Use the precise angle in radians
      };
      updateEntity(target.id, updatedEntity);
    };
  
    return (
      <React.Fragment>
        {/* Line for the arrow */}
        <div
          style={{
            position: "absolute",
            left: `${centerX}px`,
            top: `${centerY}px`,
            width: `${arrowLength}px`,
            height: "2px",
            backgroundColor: "red",
            transformOrigin: "0 50%",
            transform: `rotate(${-targetDirection}rad)`,
          }}
        />
        {/* Draggable endpoint of the arrow */}
        <Rnd
          size={{ width: 10, height: 10 }}
          position={{
            x: arrowEndX - 0,
            y: arrowEndY - 0,
          }}
          bounds="parent"
          onDragStop={handleArrowDragStop}
          enableResizing={false}
          style={{
            backgroundColor: "red",
            borderRadius: "50%",
            cursor: "pointer",
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
  };

  const handleContextMenu = (e, entityId) => {
    e.preventDefault();
    setContextMenu({ visible: true, x: e.clientX, y: e.clientY, entityId });
  };

  const handleSimulate = async () => {
    fetch("/simulate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        entities,
        simulationParams: {
          videoLength,
          ballSpeed,
          fps,
          physicsStepsPerFrame,
          res_multiplier,
          timestep
        },
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.status === "success") {
          setSimData(data.sim_data); // Store the simulation data instead of viz_array
        } else {
          console.error("Simulation error:", data.message);
        }
      })
      .catch((error) => console.error("Error during simulation:", error));
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
            const parsedEntities = JSON.parse(e.target.result);
            if (Array.isArray(parsedEntities)) {
              setEntities(parsedEntities); // Reset entities state
  
              // Find the target entity and update its direction and speed
              const targetEntity = parsedEntities.find((entity) => entity.type === "target");
              if (targetEntity) {
                setTargetDirection(targetEntity.direction || 0);
              }
            } else {
              alert("Invalid file format. Ensure the JSON contains an array of entities.");
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
      alert("File System Access API is not supported in this browser. Please use a modern browser like Chrome, Edge, or Opera.");
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
    if (!saveDirectoryHandle) {
      alert("Please set a save directory first!");
      return;
    }

    if (!simData) {
      alert("No simulation data available. Please run a simulation first!");
      return;
    }

    try {
      // Check if trial directory already exists
      let trialDirExists = false;
      try {
        await saveDirectoryHandle.getDirectoryHandle(trial_name);
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
      }

      // Create trial directory
      const trialDirHandle = await saveDirectoryHandle.getDirectoryHandle(trial_name, { create: true });
      
      // Save entities JSON file
      const entitiesFileHandle = await trialDirHandle.getFileHandle('init_state_entities.json', { create: true });
      const entitiesWritable = await entitiesFileHandle.createWritable();
      await entitiesWritable.write(JSON.stringify(entities, null, 2));
      await entitiesWritable.close();
      
      // Save simulation data JSON file
      const simDataFileHandle = await trialDirHandle.getFileHandle('simulation_data.json', { create: true });
      const simDataWritable = await simDataFileHandle.createWritable();
      await simDataWritable.write(JSON.stringify(simData, null, 2));
      await simDataWritable.close();
      
      alert("Data saved successfully!");
      
      // If auto download is enabled and we have simulation data, download the MP4
      if (autoDownloadMP4 && simData && videoPlayerRef.current) {
        videoPlayerRef.current.downloadMP4();
      }
    } catch (error) {
      console.error("Error saving data:", error);
      
      // Fallback: download files if File System Access API fails
      if (error.name === 'NotAllowedError' || error.name === 'SecurityError') {
        alert("Permission denied. Falling back to download files.");
        
        // Download entities JSON
        const entitiesBlob = new Blob([JSON.stringify(entities, null, 2)], { type: 'application/json' });
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
    <div style={{ display: "flex", flexDirection: "row", alignItems: "flex-start", gap: "20px" }}>
      {/* Controls Section */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          maxWidth: "300px",
        }}
      >
        {/* Input Fields */}
        <div>
          <label>
            Video Length (seconds):
            <input
              type="number"
              value={videoLength}
              onChange={(e) => setVideoLength(Number(e.target.value))}
              className="ml-2 px-2 py-1 border rounded w-full"
            />
          </label>
        </div>
        <div>
          <label>
            Ball Speed (diameter/s):
            <input
              type="number"
              value={ballSpeed}
              onChange={(e) => setBallSpeed(Number(e.target.value))}
              className="ml-2 px-2 py-1 border rounded w-full"
            />
          </label>
        </div>
        <div>
          <label>
            FPS:
            <input
              type="number"
              value={fps}
              onChange={(e) => setFps(Number(e.target.value))}
              className="ml-2 px-2 py-1 border rounded w-full"
            />
          </label>
        </div>
        <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
          Ball moves {(ballSpeed / fps).toFixed(3)} diameters per frame
          {physicsWarning && (
            <div style={{ color: '#ff6b35', marginTop: '2px' }}>
              ⚠️ {physicsWarning}
            </div>
          )}
        </div>

        {/* Entity Buttons */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => addEntity("occluder")}
            style={{ backgroundColor: "gray", color: "white", padding: "8px", borderRadius: "4px" }}
          >
            Add Occluder
          </button>
          <button
            onClick={() => addEntity("barrier")}
            style={{ backgroundColor: "black", color: "white", padding: "8px", borderRadius: "4px" }}
          >
            Add Barrier
          </button>
          <button
            onClick={() => addEntity("red_sensor")}
            style={{ backgroundColor: "red", color: "white", padding: "8px", borderRadius: "4px" }}
          >
            Add Red Sensor
          </button>
          <button
            onClick={() => addEntity("green_sensor")}
            style={{ backgroundColor: "green", color: "white", padding: "8px", borderRadius: "4px" }}
          >
            Add Green Sensor
          </button>
          <button
            onClick={() => addEntity("target")}
            style={{ backgroundColor: "blue", color: "white", padding: "8px", borderRadius: "4px" }}
          >
            Add Target
          </button>
        </div>

        {/* Action Buttons */}
        <button
          onClick={handleSimulate}
          disabled={!isValidPhysics}
          style={{
            backgroundColor: isValidPhysics ? "orange" : "#ccc",
            color: "white",
            padding: "12px",
            borderRadius: "4px",
            marginTop: "10px",
            cursor: isValidPhysics ? "pointer" : "not-allowed",
          }}
        >
          {isValidPhysics ? "Simulate" : "Invalid Physics Parameters"}
        </button>

        <div>
          <label>
            Trial Name:
            <input
              type="text"
              value={trial_name}
              onChange={(e) => setTrial_name(e.target.value)}
              className="ml-2 px-2 py-1 border rounded w-full"
            />
          </label>
        </div>

        <button
          onClick={handleSetSaveDirectory}
          style={{
            backgroundColor: "blue",
            color: "white",
            padding: "12px",
            borderRadius: "4px",
            marginBottom: "10px",
          }}
        >
          Select Save Directory
        </button>

        <div style={{ marginBottom: "10px" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <input
              type="checkbox"
              checked={autoDownloadMP4}
              onChange={(e) => setAutoDownloadMP4(e.target.checked)}
            />
            Auto-download MP4 when saving
          </label>
        </div>

        <button
          onClick={handleSavedata}
          style={{
            backgroundColor: "purple",
            color: "white",
            padding: "12px",
            borderRadius: "4px",
          }}
        >
          Save Data
        </button>

        <div>
          <label
            style={{
              backgroundColor: "green",
              color: "white",
              padding: "8px",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Load Scene
            <input
              type="file"
              accept=".json"
              onChange={handleFileLoad}
              style={{ display: "none" }}
            />
          </label>
        </div>
        <button
          onClick={clearAllEntities}
          style={{
            backgroundColor: "white",
            color: "black",
            padding: "12px",
            borderRadius: "4px",
            marginTop: "10px",
          }}
        >
          Clear All
        </button>
      </div>
      <div
        style={{
          position: "relative",
          width: `${worldWidth * px_scale}px`, // Fixed width for the canvas
          height: `${worldHeight * px_scale}px`, // Fixed height for the canvas
          border: `${border_px}px solid black`,
          overflow: "hidden", // Ensures content doesn't overflow the fixed dimensions
        }}
        onClick={() => setContextMenu({ visible: false, x: 0, y: 0, entityId: null })}
        onContextMenu={(e) => e.preventDefault()} // Prevent default browser context menu
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
            entity.type !== "target" // Resizing is disabled only for the blue target
          }
          style={{
            backgroundColor: {
              occluder: "gray",
              barrier: "black",
              red_sensor: "red",
              green_sensor: "green",
              target: "blue",
            }[entity.type],
            borderRadius: entity.type === "target" ? "50%" : "0%",
            border: "0px solid black",
            cursor: "move",
          }}
          onContextMenu={(e) => handleContextMenu(e, entity.id)}
        />

          {entity.type === "target" && renderArrowForTarget(entity)}
          </React.Fragment>
        ))}
        {/* Context Menu */}
        {contextMenu.visible && (
            <div
              style={{
                position: "absolute",
                top: Math.min(contextMenu.y, worldHeight * px_scale - 50), // Prevent overflow
                left: Math.min(contextMenu.x, worldWidth * px_scale - 100), // Prevent overflow
                backgroundColor: "white",
                border: "1px solid black",
                zIndex: 1000,
                padding: "5px",
                boxShadow: "0 2px 5px rgba(0, 0, 0, 0.2)",
              }}
            >
              <button
                onClick={() => deleteEntity(contextMenu.entityId)}
                style={{
                  cursor: "pointer",
                  width: "100%",
                  padding: "5px",
                  backgroundColor: "red",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                }}
              >
                Delete
              </button>
            </div>
          )}
        </div>
      {/* Video Player Section */}
      <div style={{ marginLeft: "20px", border: `1px solid blue`,}}>
        {simData ? (
          <VideoPlayer 
            simData={simData} 
            width={vid_res} 
            height={vid_res} 
            fps={fps} 
            trial_name={trial_name}
            saveDirectoryHandle={saveDirectoryHandle}
            ref={videoPlayerRef}
          />
        ) : (
          <div
            style={{
              width: `${vid_res}px`,
              height: `${vid_res}px`,
              border: "1px solid black",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#f5f5f5",
            }}
          >
            <p>No simulation data available. Run a simulation first.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;