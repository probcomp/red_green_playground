import React, { useState, useEffect, useRef } from "react";
import { createFFmpeg } from '@ffmpeg/ffmpeg';

const vid_res = 400;

const VideoPlayer = ({ simData, width = vid_res, height = vid_res, fps, trial_name }) => {
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

  // Expose downloadMP4 function to parent component
  useEffect(() => {
    if (canvasRef.current) {
      canvasRef.current.downloadMP4 = downloadMP4;
    }
  }, [simData, trial_name]);

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
      mimeType: 'video/webm;codecs=vp9',
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
      const webmBuffer = await webmBlob.arrayBuffer();
  
      const ffmpeg = createFFmpeg({ log: true });
      await ffmpeg.load();
  
      const inputName = 'input.webm';
      const outputName = 'output.mp4';
  
      ffmpeg.FS('writeFile', inputName, new Uint8Array(webmBuffer));
  
      await ffmpeg.run('-i', inputName, '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '23', outputName);
  
      const mp4Data = ffmpeg.FS('readFile', outputName);
  
      const mp4Blob = new Blob([mp4Data.buffer], { type: 'video/mp4' });
      const url = URL.createObjectURL(mp4Blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${trial_name}.mp4`;
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

export default VideoPlayer; 