from flask import Flask, request, jsonify, send_from_directory
import os

# PHYSICS SIM

import pymunk
from flask import Flask, request, jsonify

import numpy as np
import pymunk
from tqdm import tqdm
import matplotlib.pyplot as plt
import numpy as np
from scipy.stats import vonmises
from IPython.display import HTML as HTML_Display
import matplotlib
import matplotlib.animation as animation
import matplotlib.pyplot as plt
import os
import copy
import json

GLOBAL_SIM_DATA = None

# Define the path to the React build folder relative to this file
build_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "build")

# Flask app initialization
app = Flask(__name__, static_folder=os.path.join(build_path, "static"))

def get_anim(frames, framerate=30, skip_t = 1):
    """
    frames: list of N np.arrays (H x W x 3)
    framerate: frames per second
    """
    height, width, _ = frames[0].shape
    dpi = 70
    # orig_backend = matplotlib.get_backend()
    matplotlib.use('Agg')  # Switch to headless 'Agg' to inhibit figure rendering.
    max_figsize_width = 6

    fig, ax = plt.subplots(1, 1, figsize=(max_figsize_width, max_figsize_width*(height/width)))
    # matplotlib.use(orig_backend)  # Switch back to the original backend.
    ax.set_axis_off()
    # ax.set_aspect('equal')
    ax.set_position([0, 0, 1, 1])
    im = ax.imshow(frames[0])
    def update(frame):
      if frame % skip_t == 0:
        im.set_data(frames[frame])
        # return [im]
    interval = 1000/framerate
    anim = animation.FuncAnimation(fig=fig, func=update, frames=np.arange(frames.shape[0]),
      interval=interval, blit=False, repeat=True)
    plt.close()
    return anim

def save_to_json(data, filename="data.json"):
    try:
        with open(filename, "w") as json_file:
            json.dump(data, json_file, indent=4)
        print(f"Data successfully saved to {filename}")
    except Exception as e:
        print(f"An error occurred while saving to JSON: {e}")

def check_collision_with_ball(x1, y1, r1, x2, y2, r2):
    """Check if two circles collide"""
    dist_sq = (x1 - x2)**2 + (y1 - y2)**2
    return dist_sq < (r1 + r2)**2

def simulate_key_hallucination(keyHalluc, sim_data, worldWidth, worldHeight, TIMESTEP, FRAME_INTERVAL, FPS, ballSpeed, elasticity, friction, space):
    """Simulate a single key hallucination"""
    startFrame = keyHalluc['startFrame']
    x = keyHalluc['x']  # Bottom-left corner x
    y = keyHalluc['y']  # Bottom-left corner y
    direction = keyHalluc['direction']
    duration = keyHalluc['duration']
    halluc_speed = keyHalluc.get('speed', ballSpeed)  # Get speed from keyHalluc, default to ballSpeed
    
    # Calculate number of frames for this hallucination
    numHallucFrames = int(duration * FPS)
    
    # Create a new pymunk space for this hallucination (to avoid interfering with main ball)
    halluc_space = pymunk.Space()
    halluc_space.gravity = (0, 0)
    
    # Add walls
    static_body = halluc_space.static_body
    walls = [
        pymunk.Segment(static_body, (0, 0), (worldWidth, 0), 0.01),
        pymunk.Segment(static_body, (0, 0), (0, worldHeight), 0.01),
        pymunk.Segment(static_body, (worldWidth, 0), (worldWidth, worldHeight), 0.01),
        pymunk.Segment(static_body, (0, worldHeight), (worldWidth, worldHeight), 0.01),
    ]
    for wall in walls:
        wall.elasticity = elasticity
        wall.friction = friction
        halluc_space.add(wall)
    
    # Add barriers from sim_data
    for barrier in sim_data['barriers']:
        body = pymunk.Body(body_type=pymunk.Body.STATIC)
        body.position = (barrier['x'] + barrier['width'] / 2, barrier['y'] + barrier['height'] / 2)
        shape = pymunk.Poly.create_box(body, (barrier['width'], barrier['height']))
        shape.elasticity = elasticity
        shape.friction = friction
        halluc_space.add(body, shape)
    
    # Create hallucination ball
    radius = sim_data['target']['size'] / 2
    mass = 1.0
    moment = pymunk.moment_for_circle(mass, 0, radius)
    body = pymunk.Body(mass, moment, body_type=pymunk.Body.DYNAMIC)
    # Convert bottom-left corner to center for pymunk body position
    body.position = (x + radius, y + radius)
    # Scale velocity based on hallucination speed relative to main ball speed
    # TIMESTEP is calibrated for ballSpeed, so velocity magnitude should be halluc_speed/ballSpeed
    velocity_scale = halluc_speed / ballSpeed
    vx, vy = velocity_scale * np.cos(direction), velocity_scale * np.sin(direction)
    body.velocity = (vx, vy)
    shape = pymunk.Circle(body, radius)
    shape.elasticity = elasticity
    shape.friction = friction
    halluc_space.add(body, shape)
    
    # Simulate and record positions
    halluc_data = {
        'startFrame': startFrame,
        'duration': duration,
        'step_data': {}
    }
    
    for frame in range(numHallucFrames):
        if frame != 0:
            for _ in range(FRAME_INTERVAL):
                halluc_space.step(TIMESTEP)
        
        tx, ty = body.position.x - radius, body.position.y - radius
        global_frame = startFrame + frame
        
        # No collision stopping for key hallucinations - they can overlap with the regular ball
        halluc_data['step_data'][global_frame] = {
            'x': tx,
            'y': ty,
            'vx': body.velocity.x,
            'vy': body.velocity.y
        }
    
    return halluc_data

def generate_random_hallucinations(randomParams, sim_data, worldWidth, worldHeight, TIMESTEP, FRAME_INTERVAL, FPS, ballSpeed, elasticity, friction, space):
    """Generate and simulate random hallucinations"""
    probability = randomParams['probability']
    seed = randomParams['seed']
    duration = randomParams['duration']
    maxActive = randomParams.get('maxActive', 5)  # Default to 5 if not specified
    
    np.random.seed(seed)
    
    radius = sim_data['target']['size'] / 2
    numFrames = sim_data['num_frames']
    numHallucFrames = int(duration * FPS)
    
    random_hallucs = []
    
    # For each frame, potentially spawn a hallucination
    for frame in range(numFrames):
        # Count how many hallucinations are active at this frame
        active_count = 0
        for halluc in random_hallucs:
            start = halluc['startFrame']
            end = start + len(halluc['step_data'])
            if start <= frame < end:
                active_count += 1
        
        # Skip spawning if we've reached the maximum
        if active_count >= maxActive:
            continue
        
        if np.random.random() < probability:
            # Try to find a valid spawn location
            max_attempts = 50
            valid_location = False
            
            for _ in range(max_attempts):
                # Random position
                spawn_x = np.random.uniform(radius, worldWidth - radius)
                spawn_y = np.random.uniform(radius, worldHeight - radius)
                
                # Check if position is valid (doesn't intersect with barriers, sensors, or target)
                valid = True
                
                # Check barriers
                for barrier in sim_data['barriers']:
                    if (spawn_x + radius > barrier['x'] and spawn_x - radius < barrier['x'] + barrier['width'] and
                        spawn_y + radius > barrier['y'] and spawn_y - radius < barrier['y'] + barrier['height']):
                        valid = False
                        break
                
                # Check sensors
                if valid and 'red_sensor' in sim_data:
                    sensor = sim_data['red_sensor']
                    if (spawn_x + radius > sensor['x'] and spawn_x - radius < sensor['x'] + sensor['width'] and
                        spawn_y + radius > sensor['y'] and spawn_y - radius < sensor['y'] + sensor['height']):
                        valid = False
                
                if valid and 'green_sensor' in sim_data:
                    sensor = sim_data['green_sensor']
                    if (spawn_x + radius > sensor['x'] and spawn_x - radius < sensor['x'] + sensor['width'] and
                        spawn_y + radius > sensor['y'] and spawn_y - radius < sensor['y'] + sensor['height']):
                        valid = False
                
                # Check target position at this frame
                if valid and frame in sim_data['step_data']:
                    target_data = sim_data['step_data'][frame]
                    target_x = target_data['x'] + radius
                    target_y = target_data['y'] + radius
                    if check_collision_with_ball(spawn_x, spawn_y, radius, target_x, target_y, radius):
                        valid = False
                
                if valid:
                    valid_location = True
                    break
            
            if not valid_location:
                continue  # Skip this frame if no valid location found
            
            # Random direction (uniform)
            direction = np.random.uniform(-np.pi, np.pi)
            
            # Simulate this random hallucination
            halluc_data = simulate_key_hallucination(
                {
                    'startFrame': frame,
                    'x': spawn_x,
                    'y': spawn_y,
                    'direction': direction,
                    'duration': duration,
                    'speed': ballSpeed  # Random hallucinations use the same speed as main ball
                },
                sim_data,
                worldWidth,
                worldHeight,
                TIMESTEP,
                FRAME_INTERVAL,
                FPS,
                ballSpeed,
                elasticity,
                friction,
                space
            )
            
            random_hallucs.append(halluc_data)
            print(f"Random hallucination spawned at frame {frame}")
    
    return random_hallucs

# Convert entities to Pymunk bodies and run simulation
def run_simulation_with_visualization(entities, simulationParams, hallucinationParams=None):
    videoLength, ballSpeed, fps, physicsStepsPerFrame, res_multiplier, timestep, worldWidth, worldHeight = simulationParams

    # Calculate derived values
    numFrames = int(videoLength * fps)
    FRAME_INTERVAL = physicsStepsPerFrame
    TIMESTEP = timestep
    print(f"TIMESTEP: {TIMESTEP}")
    print(f"FRAME_INTERVAL: {FRAME_INTERVAL}")
    FPS = fps

    sim_data = {
        'barriers': [], 
        'occluders': [], 
        'step_data': {}, 
        'rg_hit_timestep': -1, 
        'rg_outcome': None,
        'key_hallucinations': [],
        'random_hallucinations': []
    }

    # Pymunk simulation constants
    GRAVITY = (0, 0)  # Example gravity vector
    interval = 0.1/res_multiplier  # Pixels in the 2D visualization space
    friction = 0.0
    elasticity = 1.0
    sim_data['scene_dims'] = (worldWidth, worldHeight)
    sim_data['interval'] = interval
    sim_data['friction'] = friction
    sim_data['elasticity'] = elasticity
    sim_data['timestep'] = TIMESTEP
    sim_data['timesteps_per_frame'] = FRAME_INTERVAL
    sim_data['num_frames'] = numFrames
    sim_data['fps'] = FPS
    SPACE_SIZE_width = worldWidth * int(1/interval)
    SPACE_SIZE_height = worldHeight * int(1/interval)
    pix_x = np.arange(0, worldWidth, interval)
    pix_y = np.arange(0, worldHeight, interval)
    y_vals, x_vals = np.meshgrid(pix_x, pix_y, indexing='ij')
    y_vals = np.flip(y_vals)

    # Initialize Pymunk space
    space = pymunk.Space()

    static_body = space.static_body
    walls = [
        pymunk.Segment(static_body, (0, 0), (worldWidth, 0), 0.01),  # Bottom
        pymunk.Segment(static_body, (0, 0), (0, worldHeight), 0.01),  # Left
        pymunk.Segment(static_body, (worldWidth, 0), (worldWidth, worldHeight), 0.01),  # Right
        pymunk.Segment(static_body, (0, worldHeight), (worldWidth, worldHeight), 0.01),  # Top
    ]
    for wall in walls:
        wall.elasticity = elasticity
        wall.friction = friction
        space.add(wall)


    space.gravity = GRAVITY

    # Map for storing Pymunk bodies and shapes
    body_map = {}

    # Add entities as Pymunk bodies and shapes
    for entity in entities:
        valid_physics_entity = False
        x, y, width, height = entity["x"], entity["y"], entity["width"], entity["height"]
        if entity["type"] == "target":
            valid_physics_entity = True
            direction = entity['direction']
            # The ball speed is controlled by physics parameters (timestep and physicsStepsPerFrame)
            # not by the initial velocity magnitude
            vx, vy = np.cos(direction), np.sin(direction)
            # Circle for the target
            radius = width / 2
            mass = 1.0  # Assign a reasonable mass
            moment = pymunk.moment_for_circle(mass, 0, radius)  # Calculate moment of inertia
            body = pymunk.Body(mass, moment, body_type=pymunk.Body.DYNAMIC)
            body.position = (x + radius, y + radius)
            body.velocity = (vx, vy)
            shape = pymunk.Circle(body, radius)
            sim_data['target'] = {'size' : width, 'shape' : 1} # 0 for square and 1 for circle
        elif entity["type"] == "barrier":
            valid_physics_entity = True
            # Rectangles for other entities
            body = pymunk.Body(body_type=pymunk.Body.STATIC)
            body.position = (x + width / 2, y + height / 2)
            shape = pymunk.Poly.create_box(body, (width, height))
            sim_data['barriers'].append({'x' : x,
                                        'y' : y,
                                        'width' : width,
                                        'height' : height})
        elif entity["type"] == 'occluder':
            sim_data['occluders'].append({'x' : x,
                                        'y' : y,
                                        'width' : width,
                                        'height' : height})
        elif entity["type"] == 'green_sensor':
            sim_data['green_sensor'] = {'x' : x,
                                        'y' : y,
                                        'width' : width,
                                        'height' : height}
        elif entity["type"] == 'red_sensor':
            sim_data['red_sensor'] = {'x' : x,
                                        'y' : y,
                                        'width' : width,
                                        'height' : height}
        if valid_physics_entity:
            # Add shape to space
            shape.elasticity = elasticity  # Example elasticity
            shape.friction = friction  # Example friction
            space.add(body, shape)
            body_map[entity["id"]] = (body, shape)

    sim_data['num_barriers'] = len(sim_data['barriers'])
    sim_data['num_occs'] = len(sim_data['occluders'])

    has_hit_red_green = False

    # Simulate for the given number of frames
    for frame in tqdm(range(numFrames)):
        if frame != 0:
            for _ in range(FRAME_INTERVAL):
                space.step(TIMESTEP)

        # frame_data = frame_data_template.copy()
        # Draw the entities in the frame
        for entity in entities:
            if entity['id'] in list(body_map.keys()):
                body, shape = body_map[entity["id"]]
                if isinstance(shape, pymunk.Circle):
                    r = shape.radius
                    tx, ty  = body.position.x - r, body.position.y - r
                    vx, vy  = body.velocity.x, body.velocity.y
                    speed = np.sqrt(vx**2 + vy**2)
                    direction = np.atan2(vy,vx)
                    # x_vals_discrete = np.arange(0, worldWidth, interval)
                    # y_vals_discrete = np.arange(0, worldHeight, interval)
                    
                    # x = x_vals_discrete[np.argmin(np.abs(x_vals_discrete - body.position.x))]
                    # y = y_vals_discrete[np.argmin(np.abs(y_vals_discrete - body.position.y))]
                    target_mask = np.square(x_vals + interval/2 - (tx + r)) + np.square(y_vals + interval/2 - (ty + r)) <= np.square(r)
                    # save to metadata
                    sim_data['step_data'][frame] = { # overspecified
                        'x' : tx,
                        'y' : ty,
                        'speed' : speed,
                        'dir' : direction,
                        'vx' : vx,
                        'vy' : vy
                    }

        # NOTE: NEED TO PROCESS THIS IN RED AND IN GREEN!!!!!
        if 'red_sensor' in sim_data or 'green_sensor' in sim_data:
            if 'red_sensor' in sim_data:
                radius = sim_data['target']['size'] / 2
                center_x = tx + radius
                center_y = ty + radius
                red_sensor = sim_data['red_sensor']
                # Check if circle overlaps with rectangle
                closest_x = max(red_sensor['x'], min(center_x, red_sensor['x'] + red_sensor['width']))
                closest_y = max(red_sensor['y'], min(center_y, red_sensor['y'] + red_sensor['height']))
                distance_sq = (center_x - closest_x)**2 + (center_y - closest_y)**2
                in_red = distance_sq <= radius**2
            else:
                in_red = False
            if 'green_sensor' in sim_data:
                radius = sim_data['target']['size'] / 2
                center_x = tx + radius
                center_y = ty + radius
                green_sensor = sim_data['green_sensor']
                # Check if circle overlaps with rectangle
                closest_x = max(green_sensor['x'], min(center_x, green_sensor['x'] + green_sensor['width']))
                closest_y = max(green_sensor['y'], min(center_y, green_sensor['y'] + green_sensor['height']))
                distance_sq = (center_x - closest_x)**2 + (center_y - closest_y)**2
                in_green = distance_sq <= radius**2
            else:
                in_green = False
        else:
            in_red = False
            in_green = False

        if not has_hit_red_green:
            if in_red:
                sim_data['rg_outcome'] = 'red'
                has_hit_red_green = True
                sim_data['rg_hit_timestep'] = frame
            elif in_green:
                sim_data['rg_outcome'] = 'green'
                has_hit_red_green = True
                sim_data['rg_hit_timestep'] = frame

        if has_hit_red_green:
            break

    sim_data['num_frames'] = frame+1 # this cannot be frames, because ball may hit red or green before the 
    
    # Process hallucinations if provided
    if hallucinationParams:
        print("Processing hallucinations...")
        
        # Process key hallucinations
        keyHallucinations = hallucinationParams.get('keyHallucinations', [])
        for i, keyHalluc in enumerate(keyHallucinations):
            print(f"Processing key hallucination {i+1}/{len(keyHallucinations)}")
            halluc_data = simulate_key_hallucination(
                keyHalluc, 
                sim_data, 
                worldWidth, 
                worldHeight,
                TIMESTEP,
                FRAME_INTERVAL,
                FPS,
                ballSpeed,
                elasticity,
                friction,
                space  # Reuse the space for collision detection with barriers
            )
            sim_data['key_hallucinations'].append(halluc_data)
        
        # Process random hallucinations
        randomParams = hallucinationParams.get('randomHallucinationParams', {})
        if randomParams and randomParams.get('probability', 0) > 0:
            print("Generating random hallucinations...")
            random_hallucs = generate_random_hallucinations(
                randomParams,
                sim_data,
                worldWidth,
                worldHeight,
                TIMESTEP,
                FRAME_INTERVAL,
                FPS,
                ballSpeed,
                elasticity,
                friction,
                space
            )
            sim_data['random_hallucinations'] = random_hallucs
    
    return sim_data

def get_high_res_obs_array(sim_data):

    # params
    interval = 0.02
    worldWidth = 20
    worldHeight = 20
    SPACE_SIZE_width = worldWidth * int(1/interval)
    SPACE_SIZE_height = worldHeight * int(1/interval)
    pix_x = np.arange(0, worldWidth, interval)
    pix_y = np.arange(0, worldHeight, interval)
    y_vals, x_vals = np.meshgrid(pix_x, pix_y, indexing='ij')
    y_vals = np.flip(y_vals)

    # Initialize the 3D NumPy array for visualization
    high_res_obs_array = np.zeros((sim_data['num_frames'], SPACE_SIZE_height, SPACE_SIZE_width, 3), dtype=np.uint8)

    frame_data_template = np.ones((SPACE_SIZE_height, SPACE_SIZE_width, 3), dtype=np.uint8) * 255  # Add color channels
    # add red, green, barriers then occs

    if 'green_sensor' in sim_data:
        green_sensor = sim_data['green_sensor']
        x, y, width, height = list(green_sensor.values())
        mask = np.all(
            np.array([
                x_vals >= x,
                y_vals >= y,
                x_vals < x + width,
                y_vals < y + height
            ]), axis = 0
        )
        frame_data_template[mask] = [0, 255, 0]

    if 'red_sensor' in sim_data:
        red_sensor = sim_data['red_sensor']
        x, y, width, height = list(red_sensor.values())
        mask = np.all(
            np.array([
                x_vals >= x,
                y_vals >= y,
                x_vals < x + width,
                y_vals < y + height
            ]), axis = 0
        )
        frame_data_template[mask] = [255, 0, 0]

    # get occ_masks
    occ_masks = []
    for occluder in sim_data['occluders']:
        x, y, width, height = list(occluder.values())
        mask = np.all(
            np.array([
                x_vals >= x,
                y_vals >= y,
                x_vals < x + width,
                y_vals < y + height
            ]), axis = 0
        )
        occ_masks.append(mask)

    for barrier in sim_data['barriers']:
        x, y, width, height = list(barrier.values())
        mask = np.all(
            np.array([
                x_vals >= x,
                y_vals >= y,
                x_vals < x + width,
                y_vals < y + height
            ]), axis = 0
        )
        frame_data_template[mask] = [0, 0, 0]

    # Simulate for the given number of frames
    for frame in tqdm(range(sim_data['num_frames'])):

        frame_data = frame_data_template.copy()
        if frame in sim_data['step_data']:
            target_data = sim_data['step_data'][frame]
            x, y  = target_data['x'], target_data['y']
            r = sim_data['target']['size']/2
            target_mask = np.square(x_vals + interval/2 - (x + r)) + np.square(y_vals + interval/2 - (y + r)) <= np.square(r)
            frame_data[target_mask] = [0, 0, 255]

        for occ_mask in occ_masks:
            frame_data[occ_mask] = [128, 128, 128]
        # Store the frame in the visualization data
        high_res_obs_array[frame] = frame_data

    return high_res_obs_array

@app.route("/")
def index():
    """
    Serve the React index.html file.
    """
    try:
        return send_from_directory(build_path, "index.html")
    except Exception as e:
        print(f"Error serving index.html: {e}")
        return "React app not found", 500

@app.route("/<path:path>")
def serve_static_files(path):
    """
    Serve static files such as JS, CSS, and assets.
    """
    file_path = os.path.join(build_path, path)
    try:
        if os.path.exists(file_path):
            return send_from_directory(build_path, path)
        else:
            # Serve index.html for React Router paths
            return send_from_directory(build_path, "index.html")
    except Exception as e:
        print(f"Error serving static file {path}: {e}")
        return "File not found", 404

@app.route("/simulate", methods=["POST"])
def simulate():
    print("simulate activated")
    try:
        print("Running physics")
        data = request.json
        entities = data.get("entities", [])
        simulationParams = data.get("simulationParams", [])
        hallucinationParams = data.get("hallucinationParams", None)  # Optional hallucination params
        simulationParams = list(simulationParams.values())
        
        # Run the Pymunk simulation
        sim_data = run_simulation_with_visualization(entities, simulationParams, hallucinationParams)
        
        global GLOBAL_SIM_DATA
        GLOBAL_SIM_DATA = copy.deepcopy(sim_data)

        print("physics done")

        return jsonify({"status": "success", "sim_data": sim_data})
    except Exception as e:
        print("Error during simulation:", e)
        import traceback
        traceback.print_exc()
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/clear_simulation', methods=['POST'])
def clear_simulation():
    # Add logic here to clear the simulation state on the server
    global GLOBAL_SIM_DATA
    GLOBAL_SIM_DATA = None
    print("Simulation cleared successfully.")
    return jsonify({"status": "success", "message": "Simulation cleared."})

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    app.run(host='0.0.0.0', port=port)