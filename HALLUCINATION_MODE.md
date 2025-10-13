# Hallucination Mode Documentation

## Overview

The Red Green Playground now includes a **Hallucination Mode** that extends the regular simulation functionality by allowing you to add hallucinated balls to confuse and mistrust observers. This mode includes two types of hallucinations: **Key Hallucinations** and **Random Hallucinations**.

## Features

### 1. Mode Switcher

At the top right of the interface, you'll find a mode switcher that toggles between:
- **Regular Mode**: Standard simulation functionality
- **Hallucination Mode**: Enhanced mode with hallucination capabilities

The mode automatically switches when loading JSON files:
- Loading a file with hallucination data in Regular Mode → switches to Hallucination Mode
- Loading a file without hallucination data in Hallucination Mode → switches to Regular Mode

### 2. Key Hallucinations

Key Hallucinations are fully controllable hallucinated balls that you can add to specific frames of your simulation.

#### How to Add a Key Hallucination:

1. **Run a Simulation First**: You must run a regular simulation before adding hallucinations
2. **Switch to Hallucination Mode**: Click the "Hallucination Mode" button at the top right
3. **Click "Add Key Hallucination"**: This button appears in the purple Hallucination Controls panel
4. **Select Frame**: Use the video player slider to navigate to the frame where you want the hallucination to start
5. **Click on Canvas**: Click anywhere on the video player canvas to place the hallucination ball
6. **Set Direction**: Drag the blue control point to set the direction and visually see the trajectory
7. **Configure Parameters**:
   - **Direction**: Fine-tune the direction in degrees (-180 to 180)
   - **Speed**: Set the hallucination speed in diameters/second (defaults to regular ball speed)
   - **Duration**: Set how long the hallucination lasts in seconds
8. **Confirm**: Click "✓ Confirm" to add the hallucination

#### Key Hallucination Features:

- **Interactive Direction Control**: Drag the blue control point to visually set direction, similar to regular ball setup
- **Appears/Disappears**: The hallucination ball appears at the specified frame and disappears after the duration ends
- **Same Physics**: Bounces off scene edges and barriers just like the regular ball
- **No Collision Stopping**: Can overlap with the original ball without disappearing or stopping
- **Adjustable Speed**: Set custom speed for each key hallucination
- **Visual Distinction**: Rendered in purple/violet color (unless disguised)
- **Multiple Hallucinations**: You can add multiple key hallucinations to a single simulation
- **Deletable**: Each key hallucination can be deleted from the list in the control panel

### 3. Random Hallucinations

Random Hallucinations are automatically generated based on probability parameters.

#### Parameters:

1. **Spawn Probability (per frame)**: 
   - Range: 0.0 to 1.0
   - Probability that a new hallucination will spawn at each frame
   - Example: 0.1 = 10% chance per frame

2. **Random Seed**:
   - Integer value for reproducible randomness
   - Use the same seed to get identical random hallucinations

3. **Duration (seconds)**:
   - How long each random hallucination lasts
   - All random hallucinations share the same duration

4. **Max Active Hallucinations**:
   - Maximum number of random hallucinations that can be active at any frame
   - Once the limit is reached, no new hallucinations spawn until some expire

#### Random Hallucination Features:

- **Automatic Spawning**: Spawns at random valid locations
- **Valid Locations**: Never spawns inside barriers, sensors, or on top of the regular ball
- **Random Direction**: Each hallucination moves in a uniformly random direction
- **Same Speed**: Moves at the same speed as the regular ball
- **Collision Physics**: Bounces off walls and barriers
- **No Regular Ball Overlap**: Never intersects with the regular ball
- **Visual Distinction**: Rendered in hot pink color (unless disguised)
- **Controlled Density**: The max active parameter prevents overcrowding

### 4. Visual Controls

#### Legend

Below the video player, a legend shows the color coding for all balls:
- **Blue circle**: Target (regular ball)
  - Shows black border when "Lifted Up"
- **Purple circle**: Key Hallucinations (only shown when not disguised and hallucinations exist)
- **Pink circle**: Random Hallucinations (only shown when not disguised and hallucinations exist)

#### Disguise/Reveal Hallucinations Button

- **🎭 Disguise**: Makes all hallucinations appear in the same blue color as the regular ball
  - Use this to create scenarios where all balls look identical
  - Perfect for testing observer confusion
- **👁️ Reveal**: Returns hallucinations to their distinct colors (purple and pink)
- Only appears when hallucinations exist in Hallucination Mode

#### Lift Up/Put Down Target Button

- **⬆️ Lift Up**: Adds special rendering to the regular target ball
  - Adds a thin black border around the ball
  - Makes the ball visible even when occluded
  - When under an occluder, the ball appears semi-transparent (gray-ish blue)
  - Useful for tracking the true ball's position at all times
- **⬇️ Put Down**: Returns to normal rendering where occluders fully hide the ball
- Available in both Regular and Hallucination modes

### 5. Simulation with Hallucinations

When you click "Simulate" in Hallucination Mode:

1. The regular ball simulation runs first
2. Each key hallucination is simulated independently with the specified parameters
3. Random hallucinations are generated and simulated based on your parameters
4. All hallucinations respect the max active limit
5. Results are displayed in the video player with color-coded balls (unless disguised)

### 6. Saving and Loading

#### Saving Data

When you save data (using "💾 Save Data"), the system saves:
- `init_state_entities.json`: Contains entities AND hallucination parameters if in Hallucination Mode
  - Entities array
  - Hallucination data (if present):
    - Key hallucinations with their full configuration
    - Random hallucination parameters
- `simulation_data.json`: Contains the full simulation results including all hallucination trajectories

#### Loading Data

When you load an `init_state_entities.json` file:
- The mode automatically switches based on the file contents
- If the file contains hallucination data → switches to Hallucination Mode and loads the hallucination parameters
- If the file doesn't contain hallucination data → switches to Regular Mode
- Maintains backward compatibility with old format (arrays of entities only)

#### JSON Format

**Init State Format** (new format with hallucinations):
```json
{
  "entities": [
    {
      "id": 1234567890,
      "type": "target",
      "x": 10,
      "y": 10,
      "width": 1,
      "height": 1,
      "direction": 0.785
    },
    ...
  ],
  "hallucinationData": {
    "keyHallucinations": [
      {
        "startFrame": 30,
        "x": 5.5,
        "y": 8.3,
        "direction": 1.57,
        "duration": 2.0,
        "speed": 3.6
      }
    ],
    "randomHallucinationParams": {
      "probability": 0.1,
      "seed": 42,
      "duration": 1.0,
      "maxActive": 5
    }
  }
}
```

**Simulation Data Format** (includes hallucination trajectories):
```json
{
  "barriers": [...],
  "occluders": [...],
  "target": {...},
  "step_data": {...},
  "key_hallucinations": [
    {
      "startFrame": 30,
      "duration": 2.0,
      "step_data": {
        "30": {"x": 5.5, "y": 8.3, "vx": 0, "vy": 3.6},
        "31": {"x": 5.5, "y": 8.42, "vx": 0, "vy": 3.6},
        ...
      }
    }
  ],
  "random_hallucinations": [
    {
      "startFrame": 15,
      "duration": 1.0,
      "step_data": {
        "15": {"x": 8.1, "y": 9.2, "vx": -1.8, "vy": 3.12},
        "16": {"x": 7.94, "y": 9.3, "vx": -1.8, "vy": 3.12},
        ...
      }
    }
  ]
}
```

### 7. Video Recording

When you download a WebM video:
- All hallucinations are rendered in the video
- Respects the current Disguise/Reveal state
- Respects the current Lift Up/Put Down state
- Color-coded for easy identification (unless disguised)
- Appears and disappears according to their defined durations
- Target shows through occluders if lifted

### 8. Clear All

The "🗑️ Clear All" button now clears:
- All entities
- All simulation data
- All key hallucinations
- Resets random hallucination parameters to defaults
- Exits key hallucination addition mode

## Use Cases

1. **Observer Confusion**: Add hallucinations that mislead observers about the true path
2. **Perceptual Studies**: Test how hallucinations affect perception and prediction
3. **Multiple Hypotheses**: Show alternative paths the ball could have taken
4. **Distractor Tasks**: Use random hallucinations to create challenging attention tasks
5. **Disguise Testing**: Make all balls look identical to test pure tracking ability
6. **Occlusion Studies**: Use "Lift Up" to reveal true position during occlusions

## Tips

1. **Start Simple**: Begin with one key hallucination to understand the behavior
2. **Low Probability**: Start with low random hallucination probability (e.g., 0.05) to avoid clutter
3. **Visual Inspection**: Use the frame slider to scrub through and verify hallucinations appear correctly
4. **Reproducibility**: Save your random seed if you want to reproduce the exact same random hallucinations
5. **Interactive Setup**: Use drag-and-drop to visually set key hallucination directions
6. **Speed Matching**: Key hallucinations default to the regular ball's speed for consistency
7. **Max Active Control**: Adjust max active hallucinations to prevent overwhelming the scene
8. **Disguise Mode**: Use disguise mode when you want observers to focus on motion patterns rather than colors
9. **Lift Up Feature**: Use when you need to verify the ground truth position during complex scenarios

## Technical Details

### Backend (Python)

- Uses Pymunk physics engine for hallucination simulation
- Each hallucination runs in an independent physics space
- No collision stopping for key hallucinations (they can overlap with regular ball)
- Random hallucinations use NumPy's random module with seeded generation
- Max active hallucinations enforced during random generation

### Frontend (React)

- Mode switcher in top navigation with auto-switching on load
- Interactive drag-based key hallucination creation
- Real-time direction preview with visual control point
- Inline configuration panel with speed and duration controls
- Real-time rendering of all balls with distinct colors or disguised
- Frame-accurate playback and recording
- Legend and visual controls below video player
- Lift up/put down rendering with occlusion detection

## Troubleshooting

**Q: Key hallucination button is disabled**  
A: You must run a simulation first before adding hallucinations

**Q: Can't see the direction preview**  
A: Make sure you've clicked on the canvas to place the hallucination first

**Q: Random hallucinations aren't appearing**  
A: Increase the probability or reduce max active limit. Also check that valid spawn locations exist in your scene

**Q: Hallucination continues even when it touches the regular ball**  
A: This is intentional. Key hallucinations can overlap with the regular ball to allow for more flexible scenarios

**Q: Can't see hallucinations in the video**  
A: Make sure you're in Hallucination Mode when running the simulation, and check that you've actually added hallucinations

**Q: Mode keeps switching when I load files**  
A: This is intentional. The mode automatically matches the file content - files with hallucination data load in Hallucination Mode

**Q: Disguise button doesn't appear**  
A: The disguise button only appears when hallucinations exist in the simulation and you're in Hallucination Mode

**Q: Can't see target when occluded even with Lift Up enabled**  
A: Make sure the Lift Up button shows "⬇️ Put Down". The target will appear semi-transparent (gray-blue) when under occluders

## Future Enhancements

Potential improvements for future versions:
- Edit existing key hallucinations after creation
- Copy/paste hallucinations between simulations
- Hallucination templates and presets
- Different visual styles for hallucinations
- Hallucination-specific physics parameters (different mass, friction, etc.)
- Batch add multiple key hallucinations
- Hallucination groups with synchronized behavior
