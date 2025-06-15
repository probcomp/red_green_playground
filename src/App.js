import React, { useState, useEffect, useRef } from "react";
import { Rnd } from "react-rnd";

const vid_res = 400; 

 
const VideoPlayer = ({ simData, width = vid_res, height = vid_res, fps }) => {
  const canvasRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentFrame, setCurrentFrame] = useState(0);
  const animationRef = useRef(null);
  const lastFrameTime = useRef(0);

  // Extract dimensions from simData
  const numFrames = simData ? simData.num_frames : 0;
  const worldWidth = simData ? simData.scene_dims[0] : 20;
  const worldHeight = simData ? simData.scene_dims[1] : 20;
  const interval = simData ? simData.interval : 0.1;

  // Calculate canvas dimensions based on simulation parameters
  const canvasWidth = Math.floor(worldWidth / interval);
  const canvasHeight = Math.floor(worldHeight / interval);

  useEffect(() => {
    if (!simData) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    const renderFrame = (frameIndex) => {
      // Clear canvas
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      // Render sensors first 
      if (simData.green_sensor) {
        const sensor = simData.green_sensor;
        ctx.fillStyle = 'rgb(0, 255, 0)';
        
        // Convert world coordinates to canvas coordinates
        const canvasX = (sensor.x / worldWidth) * canvasWidth;
        const canvasY = canvasHeight - ((sensor.y + sensor.height) / worldHeight) * canvasHeight;
        const canvasWidth_sensor = (sensor.width / worldWidth) * canvasWidth;
        const canvasHeight_sensor = (sensor.height / worldHeight) * canvasHeight;
        
        ctx.fillRect(canvasX, canvasY, canvasWidth_sensor, canvasHeight_sensor);
      }

      if (simData.red_sensor) {
        const sensor = simData.red_sensor;
        ctx.fillStyle = 'rgb(255, 0, 0)';
        
        // Convert world coordinates to canvas coordinates
        const canvasX = (sensor.x / worldWidth) * canvasWidth;
        const canvasY = canvasHeight - ((sensor.y + sensor.height) / worldHeight) * canvasHeight;
        const canvasWidth_sensor = (sensor.width / worldWidth) * canvasWidth;
        const canvasHeight_sensor = (sensor.height / worldHeight) * canvasHeight;
        
        ctx.fillRect(canvasX, canvasY, canvasWidth_sensor, canvasHeight_sensor);
      }

      // Render barriers
      simData.barriers.forEach(barrier => {
        ctx.fillStyle = 'rgb(0, 0, 0)';
        
        // Convert world coordinates to canvas coordinates
        const canvasX = (barrier.x / worldWidth) * canvasWidth;
        const canvasY = canvasHeight - ((barrier.y + barrier.height) / worldHeight) * canvasHeight;
        const canvasWidth_barrier = (barrier.width / worldWidth) * canvasWidth;
        const canvasHeight_barrier = (barrier.height / worldHeight) * canvasHeight;
        
        ctx.fillRect(canvasX, canvasY, canvasWidth_barrier, canvasHeight_barrier);
      }); 

      // Render target if frame data exists
      if (simData.step_data && simData.step_data[frameIndex]) {
        const targetData = simData.step_data[frameIndex];
        const targetSize = simData.target.size;
        const radius = targetSize / 2;
        const tx = targetData.x;
        const ty = targetData.y;

        // Convert world coordinates to canvas coordinates
        const canvasX = (tx + radius) * (canvasWidth / worldWidth);
        const canvasY = canvasHeight - ((ty + radius) * (canvasHeight / worldHeight));
        const canvasRadius = radius * (canvasWidth / worldWidth);

        ctx.fillStyle = 'rgb(0, 0, 255)';
        ctx.beginPath();
        ctx.arc(canvasX, canvasY, canvasRadius, 0, 2 * Math.PI);
        ctx.fill();
      }

      // Render occluders last
      simData.occluders.forEach(occluder => {
        ctx.fillStyle = 'rgb(128, 128, 128)';
        
        // Convert world coordinates to canvas coordinates
        const canvasX = (occluder.x / worldWidth) * canvasWidth;
        const canvasY = canvasHeight - ((occluder.y + occluder.height) / worldHeight) * canvasHeight;
        const canvasWidth_occluder = (occluder.width / worldWidth) * canvasWidth;
        const canvasHeight_occluder = (occluder.height / worldHeight) * canvasHeight;
        
        ctx.fillRect(canvasX, canvasY, canvasWidth_occluder, canvasHeight_occluder);
      }); 
    };

    const animate = (timestamp) => {
      if (!lastFrameTime.current) lastFrameTime.current = timestamp;
      
      const elapsed = timestamp - lastFrameTime.current;
      const frameTime = 1000 / fps;

      if (elapsed > frameTime * 0.98) {
        setCurrentFrame(prev => {
          const nextFrame = (prev + 1) % numFrames;
          renderFrame(nextFrame);
          return nextFrame;
        });
        lastFrameTime.current = timestamp;
      }

      if (isPlaying) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    // Initial render
    renderFrame(currentFrame);

    // Handle playback
    if (isPlaying) {
      animationRef.current = requestAnimationFrame(animate);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, simData, currentFrame, numFrames, canvasWidth, canvasHeight, worldWidth, worldHeight, interval, fps]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e) => {
    const seekPosition = parseInt(e.target.value);
    setCurrentFrame(seekPosition);
  }; 

  const downloadMP4 = async () => {
    if (!simData) return;

    // Create a temporary off-screen canvas with 3x resolution for high quality recording
    const tempCanvas = document.createElement('canvas');
    const scaleFactor = 3;
    tempCanvas.width = canvasWidth * scaleFactor;
    tempCanvas.height = canvasHeight * scaleFactor;
    const tempCtx = tempCanvas.getContext('2d');
    
    // Disable image smoothing for crisp pixels
    tempCtx.imageSmoothingEnabled = false;

    // Create off-screen stream (won't affect visible canvas)
    const stream = tempCanvas.captureStream(fps);
    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: 'video/mp4',
      videoBitsPerSecond: 8000000 // High bitrate for quality
    });

    const chunks = [];
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunks.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/mp4' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'simulation.mp4';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    };

    // Start recording
    mediaRecorder.start();

    // Background rendering function (doesn't affect visible canvas)
    const renderFrameToTempCanvas = (frameIndex) => {
      // Clear temp canvas
      tempCtx.fillStyle = 'white';
      tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height); 

      // Render sensors first 
      if (simData.green_sensor) {
        const sensor = simData.green_sensor;
        tempCtx.fillStyle = 'rgb(0, 255, 0)';
        
        // Convert world coordinates to temp canvas coordinates with scale factor
        const canvasX = (sensor.x / worldWidth) * tempCanvas.width;
        const canvasY = tempCanvas.height - ((sensor.y + sensor.height) / worldHeight) * tempCanvas.height;
        const canvasWidth_sensor = (sensor.width / worldWidth) * tempCanvas.width;
        const canvasHeight_sensor = (sensor.height / worldHeight) * tempCanvas.height;
        
        tempCtx.fillRect(canvasX, canvasY, canvasWidth_sensor, canvasHeight_sensor);
      }

      if (simData.red_sensor) {
        const sensor = simData.red_sensor;
        tempCtx.fillStyle = 'rgb(255, 0, 0)';
        
        // Convert world coordinates to temp canvas coordinates with scale factor
        const canvasX = (sensor.x / worldWidth) * tempCanvas.width;
        const canvasY = tempCanvas.height - ((sensor.y + sensor.height) / worldHeight) * tempCanvas.height;
        const canvasWidth_sensor = (sensor.width / worldWidth) * tempCanvas.width;
        const canvasHeight_sensor = (sensor.height / worldHeight) * tempCanvas.height;
        
        tempCtx.fillRect(canvasX, canvasY, canvasWidth_sensor, canvasHeight_sensor);
      }

      // Render barriers
      simData.barriers.forEach(barrier => {
        tempCtx.fillStyle = 'rgb(0, 0, 0)';
        
        // Convert world coordinates to temp canvas coordinates with scale factor
        const canvasX = (barrier.x / worldWidth) * tempCanvas.width;
        const canvasY = tempCanvas.height - ((barrier.y + barrier.height) / worldHeight) * tempCanvas.height;
        const canvasWidth_barrier = (barrier.width / worldWidth) * tempCanvas.width;
        const canvasHeight_barrier = (barrier.height / worldHeight) * tempCanvas.height;
        
        tempCtx.fillRect(canvasX, canvasY, canvasWidth_barrier, canvasHeight_barrier);
      }); 

      // Render target if frame data exists
      if (simData.step_data && simData.step_data[frameIndex]) {
        const targetData = simData.step_data[frameIndex];
        const targetSize = simData.target.size;
        const radius = targetSize / 2;
        const tx = targetData.x;
        const ty = targetData.y;

        // Convert world coordinates to temp canvas coordinates with scale factor
        const canvasX = (tx + radius) * (tempCanvas.width / worldWidth);
        const canvasY = tempCanvas.height - ((ty + radius) * (tempCanvas.height / worldHeight));
        const canvasRadius = radius * (tempCanvas.width / worldWidth);

        tempCtx.fillStyle = 'rgb(0, 0, 255)';
        tempCtx.beginPath();
        tempCtx.arc(canvasX, canvasY, canvasRadius, 0, 2 * Math.PI);
        tempCtx.fill();
      }

      // Render occluders last
      simData.occluders.forEach(occluder => {
        tempCtx.fillStyle = 'rgb(128, 128, 128)';
        
        // Convert world coordinates to temp canvas coordinates with scale factor
        const canvasX = (occluder.x / worldWidth) * tempCanvas.width;
        const canvasY = tempCanvas.height - ((occluder.y + occluder.height) / worldHeight) * tempCanvas.height;
        const canvasWidth_occluder = (occluder.width / worldWidth) * tempCanvas.width;
        const canvasHeight_occluder = (occluder.height / worldHeight) * tempCanvas.height;
        
        tempCtx.fillRect(canvasX, canvasY, canvasWidth_occluder, canvasHeight_occluder);
      }); 
    };

    // Render all frames in background with timing (doesn't affect visible canvas)
    let frameIndex = 0;
    const frameInterval = setInterval(() => {
      renderFrameToTempCanvas(frameIndex);
      frameIndex++;
      
      if (frameIndex >= numFrames) {
        clearInterval(frameInterval);
        setTimeout(() => {
          mediaRecorder.stop();
        }, 100);
      }
    }, 1000 / fps);
  };

  if (!simData) {
    return (
      <div
        style={{
          width: `${width}px`,
          height: `${height}px`,
          border: "1px solid black",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f5f5f5",
        }}
      >
        <p>No simulation data available. Run a simulation first.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <canvas
        ref={canvasRef}
        width={canvasWidth}
        height={canvasHeight}
        style={{
          width: `${width}px`,
          height: `${height}px`,
          objectFit: 'contain',
          border: '2px solid black',
          boxSizing: 'border-box',
          imageRendering: 'pixelated', // Keep pixels crisp when scaling
        }}
      />
      <div className="flex flex-col gap-2">
        <button
          onClick={handlePlayPause}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          {isPlaying ? 'Pause' : 'Play'}
        </button>
        <button
          onClick={downloadMP4}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          Download Video
        </button>
        <input
          type="range"
          min="0"
          max={numFrames - 1}
          value={currentFrame}
          onChange={handleSeek}
          className="w-full"
        />
        <div className="text-sm text-gray-600">
          Frame: {currentFrame + 1} / {numFrames}
        </div>
      </div>
    </div>
  );
};

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
  const [rotation, setRotation] = useState(0); // State to manage rotation angle

  // Saving and Loading params
  const [trial_name, setTrial_name] = useState('base'); // Default res multiplier

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

    
    // Convert the rotation angle to radians
    const angleInRadians = (rotationAngle * Math.PI) / 180;

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
    setRotation((prevRotation) => {
      const newRotation = (prevRotation + 90) % 360;
      
      // Update entity positions and directions based on the new rotation
      setEntities((prevEntities) =>
        prevEntities.map((entity) => {
          if (entity.type === "target") {
            // For targets, rotate both position and direction
            const rotatedEntity = rotateEntityPosition(entity, newRotation);
            return rotateEntityDirection(rotatedEntity, newRotation);
          } else {
            // For non-target entities, only rotate the position
            return rotateEntityPosition(entity, newRotation);
          }
        })
      );
      return newRotation; // Update the rotation state
    });
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

  
  const handleSavedata = async () => {
    try {
      const response = await fetch("/save_data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trial_name,
          // selectedDirectory,
          entities,
          override: false, // Add the override flag
        }),
      });
  
      const data = await response.json();
  
      if (response.ok && data.status === "success") {
        // Notify the user of success
        alert("Data saved successfully!");
      } else if (data.status === "override_dir") {
        // Handle the override scenario
        const userConfirm = window.confirm(
          "The directory already exists. Do you want to replace it?"
        );
        if (userConfirm) {
          // Run the function again with the override flag
          const overrideResponse = await fetch("/save_data", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              trial_name,
              // selectedDirectory,
              entities,
              override: true, // Add the override flag
            }),
          });
  
          const overrideData = await overrideResponse.json();
  
          if (overrideResponse.ok && overrideData.status === "success") {
            alert("Data saved successfully with override!");
          } else {
            console.error("Error:", overrideData.message);
            alert("Error overriding data: " + overrideData.message);
          }
        } else {
          // User opted not to override
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
        <VideoPlayer simData={simData} width={vid_res} height={vid_res} fps={fps} />
      </div>
    </div>
  );
}

export default App;