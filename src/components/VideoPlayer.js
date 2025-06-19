import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from "react";

const VideoPlayer = forwardRef(({ simData, fps, trial_name, saveDirectoryHandle, worldWidth, worldHeight }, ref) => {
  const canvasRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isConverting, setIsConverting] = useState(false);
  const animationRef = useRef(null);
  const lastFrameTime = useRef(0);

  // Extract dimensions from simData
  const numFrames = simData ? simData.num_frames : 0;
  const simWorldWidth = simData ? simData.scene_dims[0] : worldWidth;
  const simWorldHeight = simData ? simData.scene_dims[1] : worldHeight;
  const interval = simData ? simData.interval : 0.1;

  // Calculate canvas dimensions based on simulation parameters
  const canvasWidth = Math.floor(simWorldWidth / interval);
  const canvasHeight = Math.floor(simWorldHeight / interval);

  // Calculate display dimensions maintaining aspect ratio
  const maxDisplaySize = 400; // Maximum display size
  const aspectRatio = simWorldWidth / simWorldHeight;
  
  let displayWidth, displayHeight;
  if (aspectRatio >= 1) {
    // Landscape or square
    displayWidth = maxDisplaySize;
    displayHeight = maxDisplaySize / aspectRatio;
  } else {
    // Portrait
    displayHeight = maxDisplaySize;
    displayWidth = maxDisplaySize * aspectRatio;
  }

  const downloadMP4 = async () => {
    if (!simData) {
      console.error("No simulation data available for download");
      return;
    }

    try {
      // Test if MediaRecorder is supported
      if (!window.MediaRecorder) {
        throw new Error("MediaRecorder is not supported in this browser");
      }

      // Test if the required codec is supported
      const supportedTypes = MediaRecorder.isTypeSupported('video/webm;codecs=vp9') 
        ? 'video/webm;codecs=vp9' 
        : MediaRecorder.isTypeSupported('video/webm;codecs=vp8')
        ? 'video/webm;codecs=vp8'
        : 'video/webm';

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
        mimeType: supportedTypes,
        videoBitsPerSecond: 8000000 // High bitrate for quality
      });

      const chunks = [];
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const webmBlob = new Blob(chunks, { type: 'video/webm' });
        
        setIsConverting(true);
        try {
          // Convert WebM blob to base64
          const reader = new FileReader();
          const webmBase64 = await new Promise((resolve, reject) => {
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(webmBlob);
          });
          
          // Send to server for conversion
          const response = await fetch('/convert_webm_to_mp4', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              webm_data: webmBase64,
              trial_name: trial_name,
              fps: fps
            }),
          });
          
          const result = await response.json();
          
          if (result.status === 'success') {
            // Convert base64 back to blob
            const mp4Base64 = result.mp4_data;
            const mp4Data = atob(mp4Base64);
            const mp4Array = new Uint8Array(mp4Data.length);
            for (let i = 0; i < mp4Data.length; i++) {
              mp4Array[i] = mp4Data.charCodeAt(i);
            }
            const mp4Blob = new Blob([mp4Array], { type: 'video/mp4' });
            
            // If saveDirectoryHandle is available, save to the selected directory
            if (saveDirectoryHandle) {
              try {
                const trialDirHandle = await saveDirectoryHandle.getDirectoryHandle(trial_name, { create: true });
                const videoFileHandle = await trialDirHandle.getFileHandle(`${trial_name}.mp4`, { create: true });
                const videoWritable = await videoFileHandle.createWritable();
                await videoWritable.write(mp4Blob);
                await videoWritable.close();
              } catch (error) {
                console.error("Error saving video to directory:", error);
                // Fallback to download if directory save fails
                const url = URL.createObjectURL(mp4Blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${trial_name}.mp4`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
              }
            } else {
              // Download MP4 file
              const url = URL.createObjectURL(mp4Blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `${trial_name}.mp4`;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(url);
            }
          } else {
            throw new Error(result.message || 'Server conversion failed');
          }
        } catch (error) {
          console.error("MP4 conversion failed:", error);
          // Fallback: download the WebM file directly
          const url = URL.createObjectURL(webmBlob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${trial_name}.webm`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        } finally {
          setIsConverting(false);
        }
      };

      mediaRecorder.onerror = (event) => {
        console.error("MediaRecorder error:", event);
        setIsConverting(false);
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
          const canvasX = (sensor.x / simWorldWidth) * tempCanvas.width;
          const canvasY = tempCanvas.height - ((sensor.y + sensor.height) / simWorldHeight) * tempCanvas.height;
          const canvasWidth_sensor = (sensor.width / simWorldWidth) * tempCanvas.width;
          const canvasHeight_sensor = (sensor.height / simWorldHeight) * tempCanvas.height;
          
          tempCtx.fillRect(canvasX, canvasY, canvasWidth_sensor, canvasHeight_sensor);
        }

        if (simData.red_sensor) {
          const sensor = simData.red_sensor;
          tempCtx.fillStyle = 'rgb(255, 0, 0)';
          
          // Convert world coordinates to temp canvas coordinates with scale factor
          const canvasX = (sensor.x / simWorldWidth) * tempCanvas.width;
          const canvasY = tempCanvas.height - ((sensor.y + sensor.height) / simWorldHeight) * tempCanvas.height;
          const canvasWidth_sensor = (sensor.width / simWorldWidth) * tempCanvas.width;
          const canvasHeight_sensor = (sensor.height / simWorldHeight) * tempCanvas.height;
          
          tempCtx.fillRect(canvasX, canvasY, canvasWidth_sensor, canvasHeight_sensor);
        }

        // Render barriers
        simData.barriers.forEach(barrier => {
          tempCtx.fillStyle = 'rgb(0, 0, 0)';
          
          // Convert world coordinates to temp canvas coordinates with scale factor
          const canvasX = (barrier.x / simWorldWidth) * tempCanvas.width;
          const canvasY = tempCanvas.height - ((barrier.y + barrier.height) / simWorldHeight) * tempCanvas.height;
          const canvasWidth_barrier = (barrier.width / simWorldWidth) * tempCanvas.width;
          const canvasHeight_barrier = (barrier.height / simWorldHeight) * tempCanvas.height;
          
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
          const canvasX = (tx + radius) * (tempCanvas.width / simWorldWidth);
          const canvasY = tempCanvas.height - ((ty + radius) * (tempCanvas.height / simWorldHeight));
          const canvasRadius = radius * (tempCanvas.width / simWorldWidth);

          tempCtx.fillStyle = 'rgb(0, 0, 255)';
          tempCtx.beginPath();
          tempCtx.arc(canvasX, canvasY, canvasRadius, 0, 2 * Math.PI);
          tempCtx.fill();
        }

        // Render occluders last
        simData.occluders.forEach(occluder => {
          tempCtx.fillStyle = 'rgb(128, 128, 128)';
          
          // Convert world coordinates to temp canvas coordinates with scale factor
          const canvasX = (occluder.x / simWorldWidth) * tempCanvas.width;
          const canvasY = tempCanvas.height - ((occluder.y + occluder.height) / simWorldHeight) * tempCanvas.height;
          const canvasWidth_occluder = (occluder.width / simWorldWidth) * tempCanvas.width;
          const canvasHeight_occluder = (occluder.height / simWorldHeight) * tempCanvas.height;
          
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
    } catch (error) {
      console.error("Error in downloadMP4:", error);
      setIsConverting(false);
    }
  };

  // Expose downloadMP4 function to parent component
  useImperativeHandle(ref, () => ({
    downloadMP4: downloadMP4
  }), [simData, trial_name, fps, numFrames, canvasWidth, canvasHeight, worldWidth, worldHeight, interval, saveDirectoryHandle]);

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
        const canvasX = (sensor.x / simWorldWidth) * canvasWidth;
        const canvasY = canvasHeight - ((sensor.y + sensor.height) / simWorldHeight) * canvasHeight;
        const canvasWidth_sensor = (sensor.width / simWorldWidth) * canvasWidth;
        const canvasHeight_sensor = (sensor.height / simWorldHeight) * canvasHeight;
        
        ctx.fillRect(canvasX, canvasY, canvasWidth_sensor, canvasHeight_sensor);
      }

      if (simData.red_sensor) {
        const sensor = simData.red_sensor;
        ctx.fillStyle = 'rgb(255, 0, 0)';
        
        // Convert world coordinates to canvas coordinates
        const canvasX = (sensor.x / simWorldWidth) * canvasWidth;
        const canvasY = canvasHeight - ((sensor.y + sensor.height) / simWorldHeight) * canvasHeight;
        const canvasWidth_sensor = (sensor.width / simWorldWidth) * canvasWidth;
        const canvasHeight_sensor = (sensor.height / simWorldHeight) * canvasHeight;
        
        ctx.fillRect(canvasX, canvasY, canvasWidth_sensor, canvasHeight_sensor);
      }

      // Render barriers
      simData.barriers.forEach(barrier => {
        ctx.fillStyle = 'rgb(0, 0, 0)';
        
        // Convert world coordinates to canvas coordinates
        const canvasX = (barrier.x / simWorldWidth) * canvasWidth;
        const canvasY = canvasHeight - ((barrier.y + barrier.height) / simWorldHeight) * canvasHeight;
        const canvasWidth_barrier = (barrier.width / simWorldWidth) * canvasWidth;
        const canvasHeight_barrier = (barrier.height / simWorldHeight) * canvasHeight;
        
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
        const canvasX = (tx + radius) * (canvasWidth / simWorldWidth);
        const canvasY = canvasHeight - ((ty + radius) * (canvasHeight / simWorldHeight));
        const canvasRadius = radius * (canvasWidth / simWorldWidth);

        ctx.fillStyle = 'rgb(0, 0, 255)';
        ctx.beginPath();
        ctx.arc(canvasX, canvasY, canvasRadius, 0, 2 * Math.PI);
        ctx.fill();
      }

      // Render occluders last
      simData.occluders.forEach(occluder => {
        ctx.fillStyle = 'rgb(128, 128, 128)';
        
        // Convert world coordinates to canvas coordinates
        const canvasX = (occluder.x / simWorldWidth) * canvasWidth;
        const canvasY = canvasHeight - ((occluder.y + occluder.height) / simWorldHeight) * canvasHeight;
        const canvasWidth_occluder = (occluder.width / simWorldWidth) * canvasWidth;
        const canvasHeight_occluder = (occluder.height / simWorldHeight) * canvasHeight;
        
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

  if (!simData) {
    return (
      <div
        style={{
          width: `${displayWidth}px`,
          height: `${displayHeight}px`,
          border: "3px solid #1e293b",
          borderRadius: "0px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f8fafc",
          color: "#6b7280",
          fontSize: "16px",
          fontWeight: "500",
          boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)"
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px", opacity: 0.5 }}>📹</div>
          <p style={{ margin: 0 }}>No simulation data available</p>
          <p style={{ margin: "8px 0 0 0", fontSize: "14px", opacity: 0.7 }}>Run a simulation first</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      display: "flex", 
      flexDirection: "column", 
      gap: "16px",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
    }}>
      <canvas
        ref={canvasRef}
        width={canvasWidth}
        height={canvasHeight}
        style={{
          width: `${displayWidth}px`,
          height: `${displayHeight}px`,
          objectFit: 'contain',
          border: '3px solid #1e293b',
          borderRadius: '0px',
          boxSizing: 'border-box',
          imageRendering: 'pixelated',
          boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
          backgroundColor: "#ffffff"
        }}
      />
      <div style={{ 
        display: "flex", 
        flexDirection: "column", 
        gap: "8px",
        background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
        padding: "12px",
        borderRadius: "12px",
        border: "1px solid #e2e8f0",
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
      }}>
        <div style={{ 
          display: "flex", 
          gap: "8px",
          marginBottom: "6px"
        }}>
          <button
            onClick={handlePlayPause}
            style={{
              background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
              color: "white",
              padding: "8px 12px",
              borderRadius: "6px",
              border: "none",
              fontSize: "12px",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.2s ease",
              boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
              flex: 1
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
            {isPlaying ? "⏸️ Pause" : "▶️ Play"}
          </button>
          <button
            onClick={downloadMP4}
            disabled={isConverting}
            style={{
              background: isConverting ? "linear-gradient(135deg, #6b7280 0%, #4b5563 100%)" : "linear-gradient(135deg, #10b981 0%, #059669 100%)",
              color: "white",
              padding: "8px 12px",
              borderRadius: "6px",
              border: "none",
              fontSize: "12px",
              fontWeight: "600",
              cursor: isConverting ? "not-allowed" : "pointer",
              transition: "all 0.2s ease",
              boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
              flex: 1
            }}
            onMouseEnter={(e) => {
              if (!isConverting) {
                e.target.style.transform = "translateY(-1px)";
                e.target.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.15)";
              }
            }}
            onMouseLeave={(e) => {
              if (!isConverting) {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.1)";
              }
            }}
          >
            {isConverting ? "🔄 Converting..." : "📥 Download MP4"}
          </button>
        </div>
        
        <div style={{ marginBottom: "6px" }}>
          <input
            type="range"
            min="0"
            max={numFrames - 1}
            value={currentFrame}
            onChange={handleSeek}
            style={{
              width: "100%",
              height: "4px",
              borderRadius: "2px",
              background: "linear-gradient(90deg, #3b82f6 0%, #e5e7eb 0%)",
              outline: "none",
              WebkitAppearance: "none",
              cursor: "pointer"
            }}
            onInput={(e) => {
              const value = e.target.value;
              const percentage = (value / (numFrames - 1)) * 100;
              e.target.style.background = `linear-gradient(90deg, #3b82f6 ${percentage}%, #e5e7eb ${percentage}%)`;
            }}
          />
        </div>
        
        <div style={{ 
          fontSize: "12px", 
          color: "#6b7280", 
          fontWeight: "500",
          textAlign: "center",
          padding: "6px 8px",
          backgroundColor: "#f9fafb",
          borderRadius: "4px",
          border: "1px solid #e5e7eb"
        }}>
          Frame: {currentFrame + 1} / {numFrames}
        </div>
      </div>
    </div>
  );
});

export default VideoPlayer; 