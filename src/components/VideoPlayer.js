import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import { Rnd } from "react-rnd";

const VideoPlayer = forwardRef(({ 
  simData, 
  fps, 
  trial_name, 
  saveDirectoryHandle, 
  worldWidth, 
  worldHeight,
  mode = "regular",
  isAddingKeyDistractor = false,
  setIsAddingKeyDistractor = () => {},
  selectedFrame = 0,
  setSelectedFrame = () => {},
  keyDistractors = [],
  editingDistractorIndex = null,
  onAddKeyDistractor = () => {}
}, ref) => {
  const canvasRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const animationRef = useRef(null);
  const lastFrameTime = useRef(0);
  
  // Distractor mode states
  const [distractorDirection, setDistractorDirection] = useState(0);
  const [distractorDuration, setDistractorDuration] = useState(1.0);
  const [distractorSpeed, setDistractorSpeed] = useState(3.6);
  const [distractorPosition, setDistractorPosition] = useState(null);
  const [isDraggingDistractorDirection, setIsDraggingDistractorDirection] = useState(false);
  const [disguiseDistractors, setDisguiseDistractors] = useState(false);
  const [liftUpTarget, setLiftUpTarget] = useState(false);

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

  const downloadWebM = async () => {
    if (!simData) {
      console.error("No simulation data available for download");
      return Promise.reject(new Error("No simulation data available"));
    }

    // Helper function to record a single video with specific render settings
    const recordVideo = async (renderSettings, filename) => {
      return new Promise((resolve, reject) => {
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
            
            try {
              // If saveDirectoryHandle is available, save to the selected directory
              if (saveDirectoryHandle) {
                const trialDirHandle = await saveDirectoryHandle.getDirectoryHandle(trial_name, { create: true });
                const videoFileHandle = await trialDirHandle.getFileHandle(filename, { create: true });
                const videoWritable = await videoFileHandle.createWritable();
                await videoWritable.write(webmBlob);
                await videoWritable.close();
              } else {
                // Download WebM file directly
                const url = URL.createObjectURL(webmBlob);
                const a = document.createElement('a');
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
              }
              resolve(); // Resolve the promise when download is complete
            } catch (error) {
              console.error("Error saving video to directory:", error);
              // Fallback to download if directory save fails
              const url = URL.createObjectURL(webmBlob);
              const a = document.createElement('a');
              a.href = url;
              a.download = filename;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(url);
              resolve(); // Resolve the promise when fallback download is complete
            }
          };

          mediaRecorder.onerror = (event) => {
            console.error("MediaRecorder error:", event);
            reject(new Error("MediaRecorder error"));
          };

          // Start recording
          mediaRecorder.start();
          setIsRecording(true);

          // Background rendering function with configurable settings
          const renderFrameToTempCanvas = (frameIndex, settings) => {
            const { disguiseDistractors: disguise, liftUpTarget: liftUp } = settings;
            
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

            // Render target function for temp canvas
            const renderTargetTemp = (isLifted = false) => {
            if (simData.step_data && simData.step_data[frameIndex]) {
              const targetData = simData.step_data[frameIndex];
              const targetSize = simData.target.size;
              const radius = targetSize / 2;
              const tx = targetData.x;
              const ty = targetData.y;

              const canvasX = (tx + radius) * (tempCanvas.width / simWorldWidth);
              const canvasY = tempCanvas.height - ((ty + radius) * (tempCanvas.height / simWorldHeight));
              const canvasRadius = radius * (tempCanvas.width / simWorldWidth);

                if (isLifted) {
                  let underOccluder = false;
                  for (const occluder of simData.occluders) {
                    if (tx + radius > occluder.x && tx < occluder.x + occluder.width &&
                        ty + radius > occluder.y && ty < occluder.y + occluder.height) {
                      underOccluder = true;
                      break;
                    }
                  }
                  
                  if (underOccluder) {
                    tempCtx.fillStyle = 'rgba(0, 0, 255, 0.3)';
                  } else {
                    tempCtx.fillStyle = 'rgb(0, 0, 255)';
                  }
                } else {
              tempCtx.fillStyle = 'rgb(0, 0, 255)';
                }

                tempCtx.beginPath();
                tempCtx.arc(canvasX, canvasY, canvasRadius, 0, 2 * Math.PI);
                tempCtx.fill();
                
                if (liftUp) {
                  tempCtx.strokeStyle = '#000';
                  tempCtx.lineWidth = 2 * scaleFactor;
                  tempCtx.stroke();
                }
              }
            };

            // Render distractors (key and random) before occluders if not lifted and revealed
            if (!(liftUp && !disguise)) {
              if (simData.key_distractors) {
                simData.key_distractors.forEach(distractor => {
                  if (distractor.step_data && distractor.step_data[frameIndex]) {
                    const halData = distractor.step_data[frameIndex];
                    const targetSize = simData.target.size;
                    const radius = targetSize / 2;
                    const tx = halData.x;
                    const ty = halData.y;

                    const canvasX = (tx + radius) * (tempCanvas.width / simWorldWidth);
                    const canvasY = tempCanvas.height - ((ty + radius) * (tempCanvas.height / simWorldHeight));
                    const canvasRadius = radius * (tempCanvas.width / simWorldWidth);

                    tempCtx.fillStyle = disguise ? 'rgb(0, 0, 255)' : 'rgb(138, 43, 226)';
                    tempCtx.beginPath();
                    tempCtx.arc(canvasX, canvasY, canvasRadius, 0, 2 * Math.PI);
                    tempCtx.fill();
                  }
                });
              }

              if (simData.random_distractors) {
                simData.random_distractors.forEach(distractor => {
                  if (distractor.step_data && distractor.step_data[frameIndex]) {
                    const halData = distractor.step_data[frameIndex];
                    const targetSize = simData.target.size;
                    const radius = targetSize / 2;
                    const tx = halData.x;
                    const ty = halData.y;

                    const canvasX = (tx + radius) * (tempCanvas.width / simWorldWidth);
                    const canvasY = tempCanvas.height - ((ty + radius) * (tempCanvas.height / simWorldHeight));
                    const canvasRadius = radius * (tempCanvas.width / simWorldWidth);

                    tempCtx.fillStyle = disguise ? 'rgb(0, 0, 255)' : 'rgb(255, 105, 180)';
                    tempCtx.beginPath();
                    tempCtx.arc(canvasX, canvasY, canvasRadius, 0, 2 * Math.PI);
                    tempCtx.fill();
                  }
                });
              }
            }

            // Render target before occluders if not lifted
            if (!liftUp) {
              renderTargetTemp(false);
            }

            // Render occluders
            simData.occluders.forEach(occluder => {
              tempCtx.fillStyle = 'rgb(128, 128, 128)';
              
              // Convert world coordinates to temp canvas coordinates with scale factor
              const canvasX = (occluder.x / simWorldWidth) * tempCanvas.width;
              const canvasY = tempCanvas.height - ((occluder.y + occluder.height) / simWorldHeight) * tempCanvas.height;
              const canvasWidth_occluder = (occluder.width / simWorldWidth) * tempCanvas.width;
              const canvasHeight_occluder = (occluder.height / simWorldHeight) * tempCanvas.height;
              
              tempCtx.fillRect(canvasX, canvasY, canvasWidth_occluder, canvasHeight_occluder);
            }); 
            
            // Render target after occluders if lifted
            if (liftUp) {
              renderTargetTemp(true);
            }
            
            // Render distractors after occluders if lifted and revealed
            if (liftUp && !disguise) {
              if (simData.key_distractors) {
                simData.key_distractors.forEach(distractor => {
                  if (distractor.step_data && distractor.step_data[frameIndex]) {
                    const halData = distractor.step_data[frameIndex];
                    const targetSize = simData.target.size;
                    const radius = targetSize / 2;
                    const tx = halData.x;
                    const ty = halData.y;

                    const canvasX = (tx + radius) * (tempCanvas.width / simWorldWidth);
                    const canvasY = tempCanvas.height - ((ty + radius) * (tempCanvas.height / simWorldHeight));
                    const canvasRadius = radius * (tempCanvas.width / simWorldWidth);

                    // Check if distractor is under an occluder when lifted and revealed
                    let underOccluder = false;
                    for (const occluder of simData.occluders) {
                      if (tx + radius > occluder.x && tx < occluder.x + occluder.width &&
                          ty + radius > occluder.y && ty < occluder.y + occluder.height) {
                        underOccluder = true;
                        break;
                      }
                    }

                    if (underOccluder) {
                      tempCtx.fillStyle = 'rgba(138, 43, 226, 0.3)'; // Semi-transparent purple when occluded
                    } else {
                      tempCtx.fillStyle = 'rgb(138, 43, 226)';
                    }
                    
                    tempCtx.beginPath();
                    tempCtx.arc(canvasX, canvasY, canvasRadius, 0, 2 * Math.PI);
                    tempCtx.fill();
                    
                    // Add border if lifted and revealed
                    tempCtx.strokeStyle = '#000';
                    tempCtx.lineWidth = 2 * scaleFactor;
                    tempCtx.stroke();
                  }
                });
              }

              if (simData.random_distractors) {
                simData.random_distractors.forEach(distractor => {
                  if (distractor.step_data && distractor.step_data[frameIndex]) {
                    const halData = distractor.step_data[frameIndex];
                    const targetSize = simData.target.size;
                    const radius = targetSize / 2;
                    const tx = halData.x;
                    const ty = halData.y;

                    const canvasX = (tx + radius) * (tempCanvas.width / simWorldWidth);
                    const canvasY = tempCanvas.height - ((ty + radius) * (tempCanvas.height / simWorldHeight));
                    const canvasRadius = radius * (tempCanvas.width / simWorldWidth);

                    // Check if distractor is under an occluder when lifted and revealed
                    let underOccluder = false;
                    for (const occluder of simData.occluders) {
                      if (tx + radius > occluder.x && tx < occluder.x + occluder.width &&
                          ty + radius > occluder.y && ty < occluder.y + occluder.height) {
                        underOccluder = true;
                        break;
                      }
                    }

                    if (underOccluder) {
                      tempCtx.fillStyle = 'rgba(255, 105, 180, 0.3)'; // Semi-transparent pink when occluded
                    } else {
                      tempCtx.fillStyle = 'rgb(255, 105, 180)';
                    }
                    
                    tempCtx.beginPath();
                    tempCtx.arc(canvasX, canvasY, canvasRadius, 0, 2 * Math.PI);
                    tempCtx.fill();
                    
                    // Add border if lifted and revealed
                    tempCtx.strokeStyle = '#000';
                    tempCtx.lineWidth = 2 * scaleFactor;
                    tempCtx.stroke();
                  }
                });
              }
            }
          };

          // Render all frames in background with timing (doesn't affect visible canvas)
          let frameIndex = 0;
          const frameInterval = setInterval(() => {
            renderFrameToTempCanvas(frameIndex, renderSettings);
            frameIndex++;
            
            if (frameIndex >= numFrames) {
              clearInterval(frameInterval);
              setTimeout(() => {
                mediaRecorder.stop();
                setIsRecording(false);
              }, 100);
            }
          }, 1000 / fps);
        } catch (error) {
          console.error("Error in recordVideo:", error);
          setIsRecording(false);
          reject(error);
        }
      });
    };

    // Record both videos sequentially
    try {
      // Record stimulus version (everything is blue ball, occlusion works)
      // disguiseDistractors = true, liftUpTarget = false
      await recordVideo(
        { disguiseDistractors: true, liftUpTarget: false },
        `${trial_name}_stimulus.webm`
      );
      
      // Small delay to ensure recording state is reset
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Record revealed version (un-occluded, distractor balls with non-disguised colors)
      // disguiseDistractors = false, liftUpTarget = true
      await recordVideo(
        { disguiseDistractors: false, liftUpTarget: true },
        `${trial_name}_revealed.webm`
      );
    } catch (error) {
      console.error("Error in downloadWebM:", error);
      setIsRecording(false);
      throw error;
    }
  };

  // Expose downloadWebM function to parent component
  useImperativeHandle(ref, () => ({
    downloadWebM: downloadWebM
  }), [downloadWebM]);

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

      // Render target if frame data exists (before occluders if not lifted)
      const renderTarget = (isLifted = false) => {
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

          if (isLifted) {
            // When lifted, check if it's under an occluder
            let underOccluder = false;
            for (const occluder of simData.occluders) {
              if (tx + radius > occluder.x && tx < occluder.x + occluder.width &&
                  ty + radius > occluder.y && ty < occluder.y + occluder.height) {
                underOccluder = true;
                break;
              }
            }
            
            if (underOccluder) {
              ctx.fillStyle = 'rgba(0, 0, 255, 0.3)'; // Semi-transparent gray-blue when occluded
            } else {
              ctx.fillStyle = 'rgb(0, 0, 255)';
            }
          } else {
        ctx.fillStyle = 'rgb(0, 0, 255)';
          }
          
          ctx.beginPath();
          ctx.arc(canvasX, canvasY, canvasRadius, 0, 2 * Math.PI);
          ctx.fill();
          
          // Add border if lifted
          if (liftUpTarget) {
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 2;
            ctx.stroke();
          }
        }
      };

      // Render distractors (key and random) before occluders if not lifted and revealed
      if (!(liftUpTarget && !disguiseDistractors)) {
        if (simData.key_distractors) {
          simData.key_distractors.forEach(distractor => {
            if (distractor.step_data && distractor.step_data[frameIndex]) {
              const halData = distractor.step_data[frameIndex];
              const targetSize = simData.target.size;
              const radius = targetSize / 2;
              const tx = halData.x;
              const ty = halData.y;

              const canvasX = (tx + radius) * (canvasWidth / simWorldWidth);
              const canvasY = canvasHeight - ((ty + radius) * (canvasHeight / simWorldHeight));
              const canvasRadius = radius * (canvasWidth / simWorldWidth);

              ctx.fillStyle = disguiseDistractors ? 'rgb(0, 0, 255)' : 'rgb(138, 43, 226)';
              ctx.beginPath();
              ctx.arc(canvasX, canvasY, canvasRadius, 0, 2 * Math.PI);
              ctx.fill();
            }
          });
        }

        if (simData.random_distractors) {
          simData.random_distractors.forEach(distractor => {
            if (distractor.step_data && distractor.step_data[frameIndex]) {
              const halData = distractor.step_data[frameIndex];
              const targetSize = simData.target.size;
              const radius = targetSize / 2;
              const tx = halData.x;
              const ty = halData.y;

              const canvasX = (tx + radius) * (canvasWidth / simWorldWidth);
              const canvasY = canvasHeight - ((ty + radius) * (canvasHeight / simWorldHeight));
              const canvasRadius = radius * (canvasWidth / simWorldWidth);

              ctx.fillStyle = disguiseDistractors ? 'rgb(0, 0, 255)' : 'rgb(255, 105, 180)';
              ctx.beginPath();
              ctx.arc(canvasX, canvasY, canvasRadius, 0, 2 * Math.PI);
              ctx.fill();
            }
          });
        }
      }

      // Render target before occluders if not lifted
      if (!liftUpTarget) {
        renderTarget(false);
      }

      // Render occluders
      simData.occluders.forEach(occluder => {
        ctx.fillStyle = 'rgb(128, 128, 128)';
        
        // Convert world coordinates to canvas coordinates
        const canvasX = (occluder.x / simWorldWidth) * canvasWidth;
        const canvasY = canvasHeight - ((occluder.y + occluder.height) / simWorldHeight) * canvasHeight;
        const canvasWidth_occluder = (occluder.width / simWorldWidth) * canvasWidth;
        const canvasHeight_occluder = (occluder.height / simWorldHeight) * canvasHeight;
        
        ctx.fillRect(canvasX, canvasY, canvasWidth_occluder, canvasHeight_occluder);
      }); 
      
      // Render target after occluders if lifted
      if (liftUpTarget) {
        renderTarget(true);
      }
      
      // Render distractors after occluders if lifted and revealed
      if (liftUpTarget && !disguiseDistractors) {
        if (simData.key_distractors) {
          simData.key_distractors.forEach(distractor => {
            if (distractor.step_data && distractor.step_data[frameIndex]) {
              const halData = distractor.step_data[frameIndex];
              const targetSize = simData.target.size;
              const radius = targetSize / 2;
              const tx = halData.x;
              const ty = halData.y;

              const canvasX = (tx + radius) * (canvasWidth / simWorldWidth);
              const canvasY = canvasHeight - ((ty + radius) * (canvasHeight / simWorldHeight));
              const canvasRadius = radius * (canvasWidth / simWorldWidth);

              // Check if distractor is under an occluder when lifted and revealed
              let underOccluder = false;
              for (const occluder of simData.occluders) {
                if (tx + radius > occluder.x && tx < occluder.x + occluder.width &&
                    ty + radius > occluder.y && ty < occluder.y + occluder.height) {
                  underOccluder = true;
                  break;
                }
              }

              if (underOccluder) {
                ctx.fillStyle = 'rgba(138, 43, 226, 0.3)'; // Semi-transparent purple when occluded
              } else {
                ctx.fillStyle = 'rgb(138, 43, 226)';
              }
              
              ctx.beginPath();
              ctx.arc(canvasX, canvasY, canvasRadius, 0, 2 * Math.PI);
              ctx.fill();
              
              // Add border if lifted and revealed
              ctx.strokeStyle = '#000';
              ctx.lineWidth = 2;
              ctx.stroke();
            }
          });
        }

        if (simData.random_distractors) {
          simData.random_distractors.forEach(distractor => {
            if (distractor.step_data && distractor.step_data[frameIndex]) {
              const halData = distractor.step_data[frameIndex];
              const targetSize = simData.target.size;
              const radius = targetSize / 2;
              const tx = halData.x;
              const ty = halData.y;

              const canvasX = (tx + radius) * (canvasWidth / simWorldWidth);
              const canvasY = canvasHeight - ((ty + radius) * (canvasHeight / simWorldHeight));
              const canvasRadius = radius * (canvasWidth / simWorldWidth);

              // Check if distractor is under an occluder when lifted and revealed
              let underOccluder = false;
              for (const occluder of simData.occluders) {
                if (tx + radius > occluder.x && tx < occluder.x + occluder.width &&
                    ty + radius > occluder.y && ty < occluder.y + occluder.height) {
                  underOccluder = true;
                  break;
                }
              }

              if (underOccluder) {
                ctx.fillStyle = 'rgba(255, 105, 180, 0.3)'; // Semi-transparent pink when occluded
              } else {
                ctx.fillStyle = 'rgb(255, 105, 180)';
              }
              
              ctx.beginPath();
              ctx.arc(canvasX, canvasY, canvasRadius, 0, 2 * Math.PI);
              ctx.fill();
              
              // Add border if lifted and revealed
              ctx.strokeStyle = '#000';
              ctx.lineWidth = 2;
              ctx.stroke();
            }
          });
        }
      }
      
      // Note: Distractor preview is now rendered via Rnd overlay components (not on canvas)
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
  }, [isPlaying, simData, currentFrame, numFrames, canvasWidth, canvasHeight, worldWidth, worldHeight, interval, fps, disguiseDistractors, liftUpTarget]);

  // Pre-populate editing interface when editing a distractor
  useEffect(() => {
    if (editingDistractorIndex !== null && keyDistractors[editingDistractorIndex]) {
      const distractor = keyDistractors[editingDistractorIndex];
      setDistractorPosition({ x: distractor.x, y: distractor.y });
      setDistractorDirection(distractor.direction);
      setDistractorSpeed(distractor.speed || 3.6);
      setDistractorDuration(distractor.duration);
      setCurrentFrame(distractor.startFrame);
    }
  }, [editingDistractorIndex, keyDistractors]);

  // Auto-create initial distractor position when "Add Key Distractor" is clicked
  useEffect(() => {
    if (isAddingKeyDistractor && !distractorPosition && editingDistractorIndex === null) {
      // Set initial position to center of scene (convert from center to bottom-left)
      const radius = simData.target.size / 2;
      const centerX = simWorldWidth / 2 - radius;
      const centerY = simWorldHeight / 2 - radius;
      setDistractorPosition({ x: centerX, y: centerY });
      setDistractorDirection(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAddingKeyDistractor, editingDistractorIndex]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e) => {
    const seekPosition = parseInt(e.target.value);
    setCurrentFrame(seekPosition);
    if (mode === "distractor") {
      setSelectedFrame(seekPosition);
    }
  };

  const handleCanvasClick = (e) => {
    if (!isAddingKeyDistractor) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvasWidth / rect.width;
    const scaleY = canvasHeight / rect.height;
    
    const canvasX = (e.clientX - rect.left) * scaleX;
    const canvasY = (e.clientY - rect.top) * scaleY;
    
    // Convert canvas coordinates to world coordinates (center of where clicked)
    const centerWorldX = (canvasX / canvasWidth) * simWorldWidth;
    const centerWorldY = simWorldHeight - ((canvasY / canvasHeight) * simWorldHeight);
    
    // Convert from center to bottom-left corner (backend stores positions as bottom-left)
    const radius = simData.target.size / 2;
    const worldX = centerWorldX - radius;
    const worldY = centerWorldY - radius;
    
    // Update distractor position
    setDistractorPosition({ x: worldX, y: worldY });
  };

  const handleConfirmKeyDistractor = () => {
    if (!distractorPosition) return;
    
    const distractorData = {
      startFrame: currentFrame,
      x: distractorPosition.x,
      y: distractorPosition.y,
      direction: distractorDirection,
      duration: distractorDuration,
      speed: distractorSpeed
    };
    
    onAddKeyDistractor(distractorData);
    setDistractorPosition(null);
    setDistractorDirection(0);
  };

  const handleCancelKeyDistractor = () => {
    setDistractorPosition(null);
    setDistractorDirection(0);
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
      {/* Canvas Container with relative positioning for overlay */}
      <div style={{ position: 'relative', width: `${displayWidth}px`, height: `${displayHeight}px` }}>
      <canvas
        ref={canvasRef}
        width={canvasWidth}
        height={canvasHeight}
          onClick={handleCanvasClick}
        style={{
          width: `${displayWidth}px`,
          height: `${displayHeight}px`,
          objectFit: 'contain',
            border: isAddingKeyDistractor ? '3px solid #8b5cf6' : '3px solid #1e293b',
          borderRadius: '0px',
          boxSizing: 'border-box',
          imageRendering: 'pixelated',
            boxShadow: isAddingKeyDistractor 
              ? "0 0 0 4px rgba(139, 92, 246, 0.2), 0 10px 25px -5px rgba(0, 0, 0, 0.1)" 
              : "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
            backgroundColor: "#ffffff",
            cursor: isAddingKeyDistractor ? 'crosshair' : 'default'
          }}
        />
        
        {/* Key Distractor Direction Control - Overlay on canvas */}
        {isAddingKeyDistractor && distractorPosition && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: `${displayWidth}px`,
          height: `${displayHeight}px`,
          pointerEvents: 'none',
          zIndex: 100
        }}>
          <svg style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            pointerEvents: 'none'
          }}>
            {(() => {
              const radius = simData.target.size / 2;
              const px_scale_x = displayWidth / simWorldWidth;
              const px_scale_y = displayHeight / simWorldHeight;
              const centerX = (distractorPosition.x + radius) * px_scale_x;
              const centerY = displayHeight - ((distractorPosition.y + radius) * px_scale_y);
              const lineEndX = centerX + distractorSpeed * px_scale_x * Math.cos(distractorDirection);
              const lineEndY = centerY - distractorSpeed * px_scale_y * Math.sin(distractorDirection);
              
              return (
                <line
                  x1={centerX}
                  y1={centerY}
                  x2={lineEndX}
                  y2={lineEndY}
                  stroke="#ef4444"
                  strokeWidth="3"
                />
              );
            })()}
          </svg>
          
          {/* Draggable ball for position control */}
          <Rnd
            size={(() => {
              const radius = simData.target.size / 2;
              const px_scale_x = displayWidth / simWorldWidth;
              const ballSizePx = radius * 2 * px_scale_x;
              return { width: ballSizePx, height: ballSizePx };
            })()}
            position={(() => {
              const radius = simData.target.size / 2;
              const px_scale_x = displayWidth / simWorldWidth;
              const px_scale_y = displayHeight / simWorldHeight;
              const centerX = (distractorPosition.x + radius) * px_scale_x;
              const centerY = displayHeight - ((distractorPosition.y + radius) * px_scale_y);
              const ballSizePx = radius * 2 * px_scale_x;
              return {
                x: centerX - ballSizePx / 2,
                y: centerY - ballSizePx / 2
              };
            })()}
            bounds="parent"
            onDragStop={(e, d) => {
              const radius = simData.target.size / 2;
              const px_scale_x = displayWidth / simWorldWidth;
              const px_scale_y = displayHeight / simWorldHeight;
              const ballSizePx = radius * 2 * px_scale_x;
              const centerX = d.x + ballSizePx / 2;
              const centerY = d.y + ballSizePx / 2;
              
              // Convert display coordinates to world coordinates
              const worldX = (centerX / px_scale_x) - radius;
              const worldY = ((displayHeight - centerY) / px_scale_y) - radius;
              
              setDistractorPosition({ x: worldX, y: worldY });
            }}
            enableResizing={false}
            style={{
              backgroundColor: 'rgba(139, 92, 246, 0.5)',
              borderRadius: '50%',
              cursor: 'move',
              boxShadow: '0 2px 8px rgba(139, 92, 246, 0.5)',
              border: '2px solid #8b5cf6',
              pointerEvents: 'auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              fontWeight: 'bold',
              color: '#ffffff'
            }}
          >
            ⊕
          </Rnd>
          
          {/* Draggable control point for direction */}
          <Rnd
            size={{ width: displayWidth / simWorldWidth, height: displayWidth / simWorldWidth }}
            position={(() => {
              const radius = simData.target.size / 2;
              const px_scale_x = displayWidth / simWorldWidth;
              const px_scale_y = displayHeight / simWorldHeight;
              const centerX = (distractorPosition.x + radius) * px_scale_x;
              const centerY = displayHeight - ((distractorPosition.y + radius) * px_scale_y);
              const lineEndX = centerX + distractorSpeed * px_scale_x * Math.cos(distractorDirection);
              const lineEndY = centerY - distractorSpeed * px_scale_y * Math.sin(distractorDirection);
              return {
                x: lineEndX - (displayWidth / simWorldWidth) / 2,
                y: lineEndY - (displayWidth / simWorldWidth) / 2
              };
            })()}
            bounds="parent"
            onDragStart={() => setIsDraggingDistractorDirection(true)}
            onDragStop={(e, d) => {
              setIsDraggingDistractorDirection(false);
              const radius = simData.target.size / 2;
              const px_scale_x = displayWidth / simWorldWidth;
              const px_scale_y = displayHeight / simWorldHeight;
              const centerX = (distractorPosition.x + radius) * px_scale_x;
              const centerY = displayHeight - ((distractorPosition.y + radius) * px_scale_y);
              
              const deltaX = (d.x + (displayWidth / simWorldWidth) / 2) - centerX;
              const deltaY = centerY - (d.y + (displayWidth / simWorldWidth) / 2);
              const newDirection = Math.atan2(deltaY, deltaX);
              setDistractorDirection(newDirection);
            }}
            enableResizing={false}
            style={{
              backgroundColor: '#3b82f6',
              borderRadius: '50%',
              cursor: 'grab',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
              opacity: 0.6,
              pointerEvents: 'auto'
            }}
          />
        </div>
        )}
      </div>
      
      {/* Distractor Configuration Controls */}
      {isAddingKeyDistractor && distractorPosition && (
        <div style={{
          background: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)',
          padding: '16px',
          borderRadius: '12px',
          border: '2px solid #d8b4fe',
          boxShadow: '0 4px 6px rgba(139, 92, 246, 0.2)',
          marginTop: '12px'
        }}>
          <h4 style={{
            margin: '0 0 12px 0',
            fontSize: '14px',
            fontWeight: '700',
            color: '#6b21a8'
          }}>
            {editingDistractorIndex !== null ? 'Edit' : 'Configure'} Key Distractor
          </h4>
          
          <div style={{ marginBottom: '12px' }}>
            <label style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: '600',
              color: '#7c3aed',
              marginBottom: '4px'
            }}>
              Frame: {currentFrame} | Position: ({distractorPosition.x.toFixed(2)}, {distractorPosition.y.toFixed(2)})
            </label>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '12px' }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: '11px',
                fontWeight: '600',
                color: '#6b21a8',
                marginBottom: '4px'
              }}>
                Direction (°)
              </label>
              <input
                type="number"
                value={(distractorDirection * 180 / Math.PI).toFixed(1)}
                onChange={(e) => setDistractorDirection(parseFloat(e.target.value || 0) * Math.PI / 180)}
                min="-180"
                max="180"
                step="1"
                style={{
                  width: '100%',
                  padding: '6px 8px',
                  border: '2px solid #e9d5ff',
                  borderRadius: '6px',
                  fontSize: '11px',
                  boxSizing: 'border-box'
                }}
              />
            </div>
            
            <div>
              <label style={{
                display: 'block',
                fontSize: '11px',
                fontWeight: '600',
                color: '#6b21a8',
                marginBottom: '4px'
              }}>
                Speed (d/s)
              </label>
              <input
                type="number"
                value={distractorSpeed}
                onChange={(e) => setDistractorSpeed(parseFloat(e.target.value || 0))}
                min="0.1"
                step="0.1"
                style={{
                  width: '100%',
                  padding: '6px 8px',
                  border: '2px solid #e9d5ff',
                  borderRadius: '6px',
                  fontSize: '11px',
                  boxSizing: 'border-box'
                }}
              />
            </div>
            
            <div>
              <label style={{
                display: 'block',
                fontSize: '11px',
                fontWeight: '600',
                color: '#6b21a8',
                marginBottom: '4px'
              }}>
                Duration (s)
              </label>
              <input
                type="number"
                value={distractorDuration}
                onChange={(e) => setDistractorDuration(parseFloat(e.target.value || 0))}
                min="0.1"
                step="0.1"
                style={{
                  width: '100%',
                  padding: '6px 8px',
                  border: '2px solid #e9d5ff',
                  borderRadius: '6px',
                  fontSize: '11px',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handleCancelKeyDistractor}
              style={{
                flex: 1,
                padding: '8px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                backgroundColor: 'white',
                color: '#374151',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmKeyDistractor}
              style={{
                flex: 1,
                padding: '8px',
                border: 'none',
                borderRadius: '6px',
                background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                color: 'white',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              {editingDistractorIndex !== null ? '✓ Update' : '✓ Confirm'}
            </button>
          </div>
        </div>
      )}
      
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
            onClick={downloadWebM}
            disabled={isRecording}
            style={{
              background: isRecording ? "linear-gradient(135deg, #6b7280 0%, #4b5563 100%)" : "linear-gradient(135deg, #10b981 0%, #059669 100%)",
              color: "white",
              padding: "8px 12px",
              borderRadius: "6px",
              border: "none",
              fontSize: "12px",
              fontWeight: "600",
              cursor: isRecording ? "not-allowed" : "pointer",
              transition: "all 0.2s ease",
              boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
              flex: 1
            }}
            onMouseEnter={(e) => {
              if (!isRecording) {
                e.target.style.transform = "translateY(-1px)";
                e.target.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.15)";
              }
            }}
            onMouseLeave={(e) => {
              if (!isRecording) {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.1)";
              }
            }}
          >
            {isRecording ? "🔄 Recording..." : "📥 Download WebM"}
          </button>
        </div>
        
        {/* Legend and Control Buttons */}
        <div style={{ 
          display: 'flex', 
          gap: '8px',
          marginBottom: '6px',
          flexWrap: 'wrap',
          alignItems: 'center'
        }}>
          {/* Legend */}
          <div style={{
            display: 'flex',
            gap: '12px',
            padding: '8px 12px',
            backgroundColor: '#f9fafb',
            borderRadius: '6px',
            border: '1px solid #e5e7eb',
            flex: 1,
            flexWrap: 'wrap'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: 'rgb(0, 0, 255)',
                border: liftUpTarget ? '2px solid #000' : 'none'
              }} />
              <span style={{ fontSize: '11px', fontWeight: '500', color: '#374151' }}>Target</span>
            </div>
            {mode === "distractor" && simData && (simData.key_distractors?.length > 0 || simData.random_distractors?.length > 0) && !disguiseDistractors && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: 'rgb(138, 43, 226)'
                  }} />
                  <span style={{ fontSize: '11px', fontWeight: '500', color: '#374151' }}>Key</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: 'rgb(255, 105, 180)'
                  }} />
                  <span style={{ fontSize: '11px', fontWeight: '500', color: '#374151' }}>Random</span>
                </div>
              </>
            )}
          </div>
          
          {/* Disguise/Reveal Button */}
          {mode === "distractor" && simData && (simData.key_distractors?.length > 0 || simData.random_distractors?.length > 0) && (
            <button
              onClick={() => setDisguiseDistractors(!disguiseDistractors)}
              style={{
                background: disguiseDistractors 
                  ? "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)"
                  : "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
                color: "white",
                padding: "6px 12px",
                borderRadius: "6px",
                border: "none",
                fontSize: "11px",
                fontWeight: "600",
                cursor: "pointer",
                transition: "all 0.2s ease",
                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                whiteSpace: 'nowrap'
              }}
            >
              {disguiseDistractors ? "👁️ Reveal" : "🎭 Disguise"}
            </button>
          )}
          
          {/* Lift Up/Put Down Target Button */}
          <button
            onClick={() => setLiftUpTarget(!liftUpTarget)}
            style={{
              background: liftUpTarget
                ? "linear-gradient(135deg, #10b981 0%, #059669 100%)"
                : "linear-gradient(135deg, #6b7280 0%, #4b5563 100%)",
              color: "white",
              padding: "6px 12px",
              borderRadius: "6px",
              border: "none",
              fontSize: "11px",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.2s ease",
              boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
              whiteSpace: 'nowrap'
            }}
          >
            {liftUpTarget ? "⬇️ Occlude" : "⬆️ Un-occlude"}
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