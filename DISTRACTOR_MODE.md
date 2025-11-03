# Distractor Mode Documentation

## Overview

The Red Green Playground now includes a **Distractor Mode** that extends the regular simulation functionality by allowing you to add distractor balls to confuse and mistrust observers. This mode includes two types of distractors: **Key Distractors** and **Random Distractors**.

## Features

### 1. Mode Switcher

At the top right of the interface, you'll find a mode switcher that toggles between:
- **Regular Mode**: Standard simulation functionality
- **Distractor Mode**: Enhanced mode with distractor capabilities

The mode automatically switches when loading JSON files:
- Loading a file with distractor data in Regular Mode → switches to Distractor Mode
- Loading a file without distractor data in Distractor Mode → switches to Regular Mode

### 2. Key Distractors

Key Distractors are fully controllable distractor balls that you can add to specific frames of your simulation.

#### How to Add a Key Distractor:

1. **Run a Simulation First**: You must run a regular simulation before adding distractors
2. **Switch to Distractor Mode**: Click the "Distractor Mode" button at the top right
3. **Click "Add Key Distractor"**: This button appears in the purple Distractor Controls panel
4. **Select Frame**: Use the video player slider to navigate to the frame where you want the distractor to start
5. **Click on Canvas**: Click anywhere on the video player canvas to place the distractor ball
6. **Set Direction**: Drag the blue control point **directly on the video player canvas** to set the direction and visually see the trajectory
7. **Configure Parameters**:
   - **Direction**: Fine-tune the direction in degrees (-180 to 180)
   - **Speed**: Set the distractor speed in diameters/second (defaults to regular ball speed)
   - **Duration**: Set how long the distractor lasts in seconds
8. **Confirm**: Click "✓ Confirm" to add the distractor
9. **Auto-Simulation**: The simulation automatically re-runs after adding the distractor

#### How to Edit a Key Distractor:

1. **Find the Distractor**: Locate it in the "Active Key Distractors" list in the Distractor Controls panel
2. **Click "Edit"**: Click the purple "Edit" button next to the distractor you want to modify
3. **Modify Settings**: The editing interface appears with the distractor's current settings pre-loaded
   - The video player will jump to the distractor's starting frame
   - The distractor ball and direction control will appear on the canvas
   - You can drag the direction control point to adjust the trajectory
   - Modify direction, speed, and duration in the configuration panel
4. **Update**: Click "✓ Update" to save your changes
5. **Auto-Simulation**: The simulation automatically re-runs after updating the distractor

#### Key Distractor Features:

- **Interactive Direction Control**: Drag the blue control point to visually set direction, similar to regular ball setup
- **Appears/Disappears**: The distractor ball appears at the specified frame and disappears after the duration ends
- **Same Physics**: Bounces off scene edges and barriers just like the regular ball
- **No Collision Stopping**: Can overlap with the original ball without disappearing or stopping
- **Adjustable Speed**: Set custom speed for each key distractor
- **Visual Distinction**: Rendered in purple/violet color (unless disguised)
- **Multiple Distractors**: You can add multiple key distractors to a single simulation
- **Editable**: Click "Edit" on any key distractor to modify its parameters
- **Deletable**: Each key distractor can be deleted from the list in the control panel
- **Auto-Simulation**: Adding, editing, or deleting a key distractor automatically re-runs the simulation

### 3. Random Distractors

Random Distractors are automatically generated based on probability parameters.

#### Parameters:

1. **Start Delay (seconds)**: 
   - Delay before first random distractor appears
   - Allows you to control when random distractors start spawning

2. **Spawn Probability (per frame)**: 
   - Range: 0.0 to 1.0
   - Probability that a new distractor will spawn at each frame
   - Example: 0.1 = 10% chance per frame

3. **Random Seed**:
   - Integer value for reproducible randomness
   - Use the same seed to get identical random distractors

4. **Duration (seconds)**:
   - How long each random distractor lasts
   - All random distractors share the same duration

5. **Max Active Distractors**:
   - Maximum number of random distractors that can be active at any frame
   - Once the limit is reached, no new distractors spawn until some expire

#### Random Distractor Features:

- **Automatic Spawning**: Spawns at random valid locations
- **Valid Locations**: Never spawns inside barriers, sensors, or on top of the regular ball
- **Random Direction**: Each distractor moves in a uniformly random direction
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
- **Purple circle**: Key Distractors (only shown when not disguised and distractors exist)
- **Pink circle**: Random Distractors (only shown when not disguised and distractors exist)

#### Disguise/Reveal Distractors Button

- **🎭 Disguise**: Makes all distractors appear in the same blue color as the regular ball
  - Use this to create scenarios where all balls look identical
  - Perfect for testing observer confusion
- **👁️ Reveal**: Returns distractors to their distinct colors (purple and pink)
- Only appears when distractors exist in Distractor Mode

#### Lift Up/Put Down Target Button

- **⬆️ Lift Up**: Adds special rendering to the regular target ball
  - Adds a thin black border around the ball
  - Makes the ball visible even when occluded
  - When under an occluder, the ball appears semi-transparent (gray-ish blue)
  - Useful for tracking the true ball's position at all times
- **⬇️ Put Down**: Returns to normal rendering where occluders fully hide the ball
- Available in both Regular and Distractor modes

### 5. Simulation with Distractors

When you click "Simulate" in Distractor Mode:

1. The regular ball simulation runs first
2. Each key distractor is simulated independently with the specified parameters
3. Random distractors are generated and simulated based on your parameters
4. All distractors respect the max active limit
5. Results are displayed in the video player with color-coded balls (unless disguised)

### 6. Saving and Loading

#### Saving Data

When you save data (using "💾 Save Data"), the system saves:
- `init_state_entities.json`: Contains entities AND distractor parameters if in Distractor Mode
  - Entities array
  - Distractor data (if present):
    - Key distractors with their full configuration
    - Random distractor parameters
- `simulation_data.json`: Contains the full simulation results including all distractor trajectories

#### Loading Data

When you load an `init_state_entities.json` file:
- The mode automatically switches based on the file contents
- If the file contains distractor data → switches to Distractor Mode and loads the distractor parameters
- If the file doesn't contain distractor data → switches to Regular Mode
- Maintains backward compatibility with old format (arrays of entities only)
- **Auto-Simulation**: The simulation automatically runs after successfully loading a file

#### JSON Format

**Init State Format** (new format with distractors):
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
  "distractorData": {
    "keyDistractors": [
      {
        "startFrame": 30,
        "x": 5.5,
        "y": 8.3,
        "direction": 1.57,
        "duration": 2.0,
        "speed": 3.6
      }
    ],
    "randomDistractorParams": {
      "startDelay": 0.333,
      "probability": 0.1,
      "seed": 42,
      "duration": 1.0,
      "maxActive": 5
    }
  }
}
```

**Simulation Data Format** (includes distractor trajectories):
```json
{
  "barriers": [...],
  "occluders": [...],
  "target": {...},
  "step_data": {...},
  "key_distractors": [
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
  "random_distractors": [
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
- All distractors are rendered in the video
- Respects the current Disguise/Reveal state
- Respects the current Lift Up/Put Down state
- Color-coded for easy identification (unless disguised)
- Appears and disappears according to their defined durations
- Target shows through occluders if lifted

### 8. Clear All

The "🗑️ Clear All" button now clears:
- All entities
- All simulation data
- All key distractors
- Resets random distractor parameters to defaults
- Exits key distractor addition mode

## Use Cases

1. **Observer Confusion**: Add distractors that mislead observers about the true path
2. **Perceptual Studies**: Test how distractors affect perception and prediction
3. **Multiple Hypotheses**: Show alternative paths the ball could have taken
4. **Distractor Tasks**: Use random distractors to create challenging attention tasks
5. **Disguise Testing**: Make all balls look identical to test pure tracking ability
6. **Occlusion Studies**: Use "Lift Up" to reveal true position during occlusions

## Tips

1. **Start Simple**: Begin with one key distractor to understand the behavior
2. **Low Probability**: Start with low random distractor probability (e.g., 0.05) to avoid clutter
3. **Visual Inspection**: Use the frame slider to scrub through and verify distractors appear correctly
4. **Reproducibility**: Save your random seed if you want to reproduce the exact same random distractors
5. **Interactive Setup**: Use drag-and-drop **directly on the video player canvas** to visually set key distractor directions
6. **Speed Matching**: Key distractors default to the regular ball's speed for consistency
7. **Max Active Control**: Adjust max active distractors to prevent overwhelming the scene
8. **Disguise Mode**: Use disguise mode when you want observers to focus on motion patterns rather than colors
9. **Lift Up Feature**: Use when you need to verify the ground truth position during complex scenarios
10. **Quick Iteration**: Auto-simulation makes it fast to add, edit, and test distractors
11. **Edit Mode**: The currently edited distractor is highlighted with a purple border in the list
12. **Load and Go**: Loading a JSON file automatically runs the simulation - no need to click simulate

## Technical Details

### Backend (Python)

- Uses Pymunk physics engine for distractor simulation
- Each distractor runs in an independent physics space
- No collision stopping for key distractors (they can overlap with regular ball)
- Random distractors use NumPy's random module with seeded generation
- Max active distractors enforced during random generation

### Frontend (React)

- Mode switcher in top navigation with auto-switching on load
- Interactive drag-based key distractor creation **directly on the video player canvas**
- Real-time direction preview with visual control point overlaid on canvas
- Inline configuration panel with speed and duration controls
- Edit existing key distractors with pre-populated settings
- Visual highlighting of currently edited distractor
- Auto-simulation on add, edit, delete, and load operations
- Real-time rendering of all balls with distinct colors or disguised
- Frame-accurate playback and recording
- Legend and visual controls below video player
- Lift up/put down rendering with occlusion detection

## Troubleshooting

**Q: Key distractor button is disabled**  
A: You must run a simulation first before adding distractors

**Q: Can't see the direction preview**  
A: Make sure you've clicked on the canvas to place the distractor first

**Q: Random distractors aren't appearing**  
A: Increase the probability or reduce max active limit. Also check that valid spawn locations exist in your scene. Check the start delay setting.

**Q: Distractor continues even when it touches the regular ball**  
A: This is intentional. Key distractors can overlap with the regular ball to allow for more flexible scenarios

**Q: Can't see distractors in the video**  
A: Make sure you're in Distractor Mode when running the simulation, and check that you've actually added distractors

**Q: Mode keeps switching when I load files**  
A: This is intentional. The mode automatically matches the file content - files with distractor data load in Distractor Mode

**Q: Disguise button doesn't appear**  
A: The disguise button only appears when distractors exist in the simulation and you're in Distractor Mode

**Q: Can't see target when occluded even with Lift Up enabled**  
A: Make sure the Lift Up button shows "⬇️ Put Down". The target will appear semi-transparent (gray-blue) when under occluders

**Q: The direction control appears in the wrong place on screen**  
A: This was fixed in the latest version. The direction control now appears directly on the video player canvas where you clicked

**Q: How do I edit a distractor after adding it?**  
A: Click the purple "Edit" button next to the distractor in the Active Key Distractors list. The editing interface will appear with all settings pre-loaded

**Q: Simulation doesn't update after I add a distractor**  
A: The simulation should run automatically. If it doesn't, click the "🚀 Simulate" button manually to refresh

**Q: Can I change the position of an existing distractor?**  
A: Currently, you can edit the direction, speed, and duration of a distractor, but not its starting position. To change the position, delete the distractor and create a new one at the desired location

## Future Enhancements

Potential improvements for future versions:
- Edit distractor starting position (currently only direction, speed, and duration are editable)
- Copy/paste distractors between simulations
- Distractor templates and presets
- Different visual styles for distractors
- Distractor-specific physics parameters (different mass, friction, etc.)
- Batch add multiple key distractors
- Distractor groups with synchronized behavior
- Undo/redo for distractor operations

