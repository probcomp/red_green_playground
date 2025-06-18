import React, { useState, useEffect, useRef } from "react";
import { Rnd } from "react-rnd";
import VideoPlayer from "./components/VideoPlayer";

import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';
const ffmpeg = createFFmpeg({ log: true });
let ffmpegLoaded = false;

const vid_res = 400; 

function App() { 
  const [entities, setEntities] = useState([]);
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, entityId: null });
  const [targetDirection, setTargetDirection] = useState(0); // Angle in radians
  const [targetSpeed, setTargetSpeed] = useState(0); // Speed in intervals of 0.1
  const [simData, setSimData] = useState(null); // State to hold the simulation data

  // Simulation parameters
  const [numFrames, setNumFrames] = useState(300);
  const [timestepsPerFrame, setTimestepsPerFrame] = useState(6);
  const [timestep, setTimestep] = useState(0.02);
  const [fps, setFps] = useState(20); // Default FPS
  const [res_multiplier, setRes_multiplier] = useState(1); // Default res multiplier

  // Saving and Loading params
  const [trial_name, setTrial_name] = useState('base'); // Default res multiplier
  const [saveDirectory, setSaveDirectory] = useState(null); // State to store the selected save directory
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
      speed: 1, // Initial speed (1 unit)
    };
    setEntities([...entities, newEntity]);
  };

  const updateEntity = (id, updatedEntity) => {
    setEntities(entities.map((e) => (e.id === id ? updatedEntity : e)));
  };

  
  const rotateEntityPosition = (entity, rotationAngle) => {
    const centerX = worldWidth / 2; // The center of the scene (X coordinate)
    const centerY = worldHeight / 2; // The center of the scene (Y coordinate)


    const entity_x = entity.x + entity.width/2;
    const entity_y = entity.y + entity.height/2;
    const new_width = entity.height;
    const new_height = entity.width;
    
    const translatedX = entity_x - centerX;
    const translatedY = entity_y - centerY;
    
    const rotatedX =  translatedY;
    const rotatedY = -translatedX;
    
    // Translate back to the original position
    const newX = rotatedX + centerX - new_width/2;
    const newY = rotatedY + centerY - new_height/2;
    
    return {
      ...entity,
      x: newX,
      y: newY,
      width: new_width,
      height: new_height
    };
  };
  

  const rotateEntityDirection = (entity, rotationAngle) => {
    console.log("prev: ", entity.direction);
    const newDirection = ((entity.direction - Math.PI / 2 + Math.PI) % (2 * Math.PI) + (2 * Math.PI)) % (2 * Math.PI) - Math.PI;
    updateTargetDirectionAndSpeed(newDirection * (180/Math.PI), entity.speed);
    console.log("next", newDirection);
    return { ...entity, direction: newDirection };
  };
  
  
  const rotateScene = () => {
    // Update entity positions and directions based on 90° rotation
    setEntities((prevEntities) =>
      prevEntities.map((entity) => {
        if (entity.type === "target") {
          const rotatedEntity = rotateEntityPosition(entity, 90);
          return rotateEntityDirection(rotatedEntity, 90);
        } else {
          return rotateEntityPosition(entity, 90);
        }
      })
    );
  };
  

  const updateTargetDirectionAndSpeed = (angleDegrees, speed) => {
    // const snappedAngle = Math.round(angleDegrees); // Snap angle to the nearest degree
    const snappedAngle = angleDegrees; // Snap angle to the nearest degree
    const snappedSpeed = Math.round(speed / interval) * interval; // Snap speed to the nearest interval
  
    if (snappedAngle >= -180 && snappedAngle < 180) {
      setTargetDirection((snappedAngle * Math.PI) / 180); // Convert degrees to radians
    }
    if (snappedSpeed >= 0) {
      setTargetSpeed(snappedSpeed);
    }
  };

  const renderArrowForTarget = (target) => {
    if (target.type !== "target") return null;
  
    // Calculate the center of the target
    const centerX = (target.x + target.width / 2) * px_scale + border_px;
    const centerY = (worldHeight - (target.y + target.height / 2)) * px_scale + border_px;
  
    // Calculate the arrow endpoint
    const arrowLength = targetSpeed * px_scale;
    console.log("targetDirection: ", targetDirection);
    const arrowEndX = centerX + arrowLength * Math.cos(targetDirection);
    const arrowEndY = centerY - arrowLength * Math.sin(targetDirection);
  
    const handleArrowDragStop = (e, d) => {
      const deltaX = d.x - centerX;
      const deltaY = centerY - d.y;
    
      // Calculate the precise angle in radians
      const preciseAngle = Math.atan2(deltaY, deltaX); 
    
      // Always set the speed to 1.0
      const fixedSpeed = 1.0;
    
      updateTargetDirectionAndSpeed(preciseAngle * (180 / Math.PI), fixedSpeed);

      console.log("preciseAngle: ", preciseAngle);
    
      // Update the entity's direction and speed
      const updatedEntity = {
        ...target,
        direction: preciseAngle, // Use the precise angle in radians
        speed: fixedSpeed, // Always use the fixed speed
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
          numFrames,
          timestepsPerFrame,
          timestep,
          res_multiplier,
          fps
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
                setTargetSpeed(targetEntity.speed || 0);
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
    try {
      const directoryHandle = await window.showDirectoryPicker();
      setSaveDirectory(directoryHandle.name);
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
    if (!saveDirectory) {
      alert("Please set a save directory first!");
      return;
    }

    try {
      const response = await fetch("/save_data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trial_name,
          selectedDirectory: saveDirectory,
          entities,
          override: false,
        }),
      });
  
      const data = await response.json();
  
      if (response.ok && data.status === "success") {
        alert("Data saved successfully!");
        
        // If auto download is enabled and we have simulation data, download the MP4
        if (autoDownloadMP4 && simData) {
          const videoPlayerRef = document.querySelector('canvas');
          if (videoPlayerRef) {
            const videoPlayer = videoPlayerRef.__reactFiber$;
            if (videoPlayer && videoPlayer.downloadMP4) {
              videoPlayer.downloadMP4();
            }
          }
        }
      } else if (data.status === "override_dir") {
        const userConfirm = window.confirm(
          "The directory already exists. Do you want to replace it?"
        );
        if (userConfirm) {
          const overrideResponse = await fetch("/save_data", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              trial_name,
              selectedDirectory: saveDirectory,
              entities,
              override: true,
            }),
          });
  
          const overrideData = await overrideResponse.json();
  
          if (overrideResponse.ok && overrideData.status === "success") {
            alert("Data saved successfully with override!");
            
            // If auto download is enabled and we have simulation data, download the MP4
            if (autoDownloadMP4 && simData) {
              const videoPlayerRef = document.querySelector('canvas');
              if (videoPlayerRef) {
                const videoPlayer = videoPlayerRef.__reactFiber$;
                if (videoPlayer && videoPlayer.downloadMP4) {
                  videoPlayer.downloadMP4();
                }
              }
            }
          } else {
            console.error("Error:", overrideData.message);
            alert("Error overriding data: " + overrideData.message);
          }
        } else {
          alert("Operation canceled. Data was not saved.");
        }
      } else {
        console.error("Error:", data.message);
        alert("Error saving data: " + data.message);
      }
    } catch (error) {
      console.error("Fetch error:", error);
      alert("An unexpected error occurred while saving data.");
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
            Number of Frames:
            <input
              type="number"
              value={numFrames}
              onChange={(e) => setNumFrames(Number(e.target.value))}
              className="ml-2 px-2 py-1 border rounded w-full"
            />
          </label>
        </div>
        <div>
          <label>
            Timesteps per Frame:
            <input
              type="number"
              value={timestepsPerFrame}
              onChange={(e) => setTimestepsPerFrame(Number(e.target.value))}
              className="ml-2 px-2 py-1 border rounded w-full"
            />
          </label>
        </div>
        <div>
          <label>
            Timestep:
            <input
              type="number"
              value={timestep}
              step="0.01"
              onChange={(e) => setTimestep(Number(e.target.value))}
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
        <div>
          <label>
            Resolution Multiplier:
            <input
              type="number"
              value={res_multiplier}
              onChange={(e) => setRes_multiplier(Number(e.target.value))}
              className="ml-2 px-2 py-1 border rounded w-full"
            />
          </label>
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
        <button
          onClick={rotateScene}
          style={{
            backgroundColor: "purple",
            color: "white",
            padding: "12px",
            borderRadius: "4px",
          }}
        >
          Rotate Scene 90° Clockwise
        </button>

        {/* Action Buttons */}
        <button
          onClick={handleSimulate}
          style={{
            backgroundColor: "orange",
            color: "white",
            padding: "12px",
            borderRadius: "4px",
            marginTop: "10px",
          }}
        >
          Simulate
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
          Set Save Directory
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
          // transform: `rotate(${rotation}deg)`, // Apply the rotation here
          // transformOrigin: "center", // Ensure rotation is centered
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