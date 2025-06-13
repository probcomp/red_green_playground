from flask import Flask, request, jsonify, send_from_directory
import os

# PHYSICS SIM

import pymunk
from flask import Flask, request, jsonify

app = Flask(__name__)

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
GLOBAL_RG_HIT = False

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
# Convert entities to Pymunk bodies and run simulation
def run_simulation_with_visualization(entities, simulationParams):
    frames, FRAME_INTERVAL, TIMESTEP, res_multiplier, FPS = simulationParams

    sim_data = {'barriers': [], 'occluders' : [], 'step_data' : {}, 'rg_hit_timestep' : -1, 'rg_outcome': None}

    # Pymunk simulation constants
    GRAVITY = (0, 0)  # Example gravity vector
    interval = 0.1/res_multiplier  # Pixels in the 2D visualization space
    worldWidth = 20
    worldHeight = 20
    friction = 0.0
    elasticity = 1.0
    sim_data['scene_dims'] = (worldWidth, worldHeight)
    sim_data['interval'] = interval
    sim_data['friction'] = friction
    sim_data['elasticity'] = elasticity
    sim_data['timestep'] = TIMESTEP
    sim_data['timesteps_per_frame'] = FRAME_INTERVAL
    sim_data['num_frames'] = frames+1
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
            speed, direction = entity['speed'], entity['direction']
            vx, vy = speed * np.cos(direction), speed * np.sin(direction)
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

    # Initialize the 3D NumPy array for visualization
    obs_array = np.zeros((frames, SPACE_SIZE_height, SPACE_SIZE_width, 3), dtype=np.uint8)

    frame_data_template = np.ones((SPACE_SIZE_height, SPACE_SIZE_width, 3), dtype=np.uint8) * 255  # Add color channels
    # add red, green, barriers then occs
    for entity in entities:
        if entity["type"] == "green_sensor":
            width, height = entity["width"], entity["height"]
            x, y = entity["x"], entity["y"]
            mask = np.all(
                np.array([
                    x_vals >= x,
                    y_vals >= y,
                    x_vals < x + width,
                    y_vals < y + height
                ]), axis = 0
            )
            frame_data_template[mask] = [0, 255, 0]

        elif entity["type"] == "red_sensor":
            width, height = entity["width"], entity["height"]
            x, y = entity["x"], entity["y"]
            mask = np.all(
                np.array([
                    x_vals >= x,
                    y_vals >= y,
                    x_vals < x + width,
                    y_vals < y + height
                ]), axis = 0
            )
            frame_data_template[mask] = [255, 0, 0]

        elif entity["type"] == "barrier":
            width, height = entity["width"], entity["height"]
            x, y = entity["x"], entity["y"]
            mask = np.all(
                np.array([
                    x_vals >= x,
                    y_vals >= y,
                    x_vals < x + width,
                    y_vals < y + height
                ]), axis = 0
            )
            frame_data_template[mask] = [0, 0, 0]

    has_hit_red_green = False

    # Simulate for the given number of frames
    for frame in tqdm(range(frames)):
        if frame != 0:
            for _ in range(FRAME_INTERVAL):
                space.step(TIMESTEP)

        frame_data = frame_data_template.copy()
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
                    frame_data[target_mask] = [0, 0, 255]
                    # save to metadata
                    sim_data['step_data'][frame] = { # overspecified
                        'x' : tx,
                        'y' : ty,
                        'speed' : speed,
                        'dir' : direction,
                        'vx' : vx,
                        'vy' : vy
                    }
        # Store the frame in the visualization data
        for entity in entities:
            if entity["type"] == "occluder":
                width, height = entity["width"], entity["height"]
                x, y = entity["x"], entity["y"]
                mask = np.all(
                    np.array([
                        x_vals >= x,
                        y_vals >= y,
                        x_vals < x + width,
                        y_vals < y + height
                    ]), axis = 0
                )
                frame_data[mask] = [128, 128, 128]
                
        obs_array[frame] = frame_data

        # NOTE: NEED TO PROCESS THIS IN RED AND IN GREEN!!!!!
        if 'red_sensor' in sim_data and 'green_sensor' in sim_data:
            size = sim_data['target']['size']
            in_red = tx + size >= sim_data['red_sensor']['x'] and tx <= sim_data['red_sensor']['x'] + sim_data['red_sensor']['width'] and ty + size >= sim_data['red_sensor']['y'] and ty <= sim_data['red_sensor']['y'] + sim_data['red_sensor']['height']
            in_green = tx + size >= sim_data['green_sensor']['x'] and tx <= sim_data['green_sensor']['x'] + sim_data['green_sensor']['width'] and ty + size >= sim_data['green_sensor']['y'] and ty <= sim_data['green_sensor']['y'] + sim_data['green_sensor']['height']
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
    # NOTE: setobs array to length of frames in case of early rtermination
    obs_array = obs_array[:frame+1]
    sim_data['num_frames'] = frame+1
    sim_data['obs_array'] = obs_array

    print(obs_array.shape)
    return obs_array, sim_data

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

# LINK TO REACT JS

# Define the absolute path to the React build folder
build_path = "/home/arijitdasgupta/Mental_Physics_2D/interactive/create_stimuli/build"

# Flask app initialization
app = Flask(__name__, static_folder=os.path.join(build_path, "static"))

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
        simulationParams = data.get("simulationParams", [])  # Default to 30 steps
        simulationParams = list(simulationParams.values())
        # Run the Pymunk simulation
        viz_array, sim_data = run_simulation_with_visualization(entities, simulationParams)  # T x M x N x 3
        global GLOBAL_SIM_DATA
        GLOBAL_SIM_DATA = copy.deepcopy(sim_data)

        # Convert the NumPy array to a list for JSON serialization
        viz_array_list = viz_array.tolist()
        print("physics done")

        return jsonify({"status": "success", "viz_array": viz_array_list})
    except Exception as e:
        print("Error during simulation:", e)
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route("/save_data", methods=["POST"])
def save_data():
    data = request.json
    trial_name = data.get("trial_name", [])
    entities = data.get("entities", [])
    # save_path = data.get("selectedDirectory", [])
    save_path = "/Users/arijitdasgupta/Desktop/projects/mental_physics_trials/pilot_final"
    override = data.get("override", [])
    print(f"save data activated for Trial: {trial_name}")
    try:
        print("saving data")

        trial_dir = os.path.join(save_path, trial_name)
        trial_exists = os.path.exists(trial_dir)

        if (not trial_exists) or (trial_exists and override):
            # Create the directory (including intermediate directories if needed)
            os.makedirs(trial_dir, exist_ok = True)
            print(f"Directory created: {trial_dir}")
        else:
            return jsonify({"status": "override_dir"})

        global GLOBAL_SIM_DATA
        if GLOBAL_SIM_DATA is None:
            raise ValueError("There is no SIMULATION data to save, press simulate")
        if GLOBAL_SIM_DATA['rg_outcome'] is None:
            raise ValueError("The simulation has not hit red or green, run for longer")
        high_res_obs_array = get_high_res_obs_array(GLOBAL_SIM_DATA)
        GLOBAL_SIM_DATA['high_res_obs_array'] = high_res_obs_array

        low_res_anim = get_anim(GLOBAL_SIM_DATA['obs_array'])
        low_res_path = os.path.join(trial_dir, 'low_res_obs.mp4')
        np.savez_compressed(os.path.join(trial_dir, 'low_res_obs.npz'), GLOBAL_SIM_DATA['obs_array'])
        low_res_anim.save(low_res_path, writer='ffmpeg', fps=GLOBAL_SIM_DATA['fps'])

        T, M, N, _ = high_res_obs_array.shape
        high_res_obs_array_border = np.zeros((T,M+4,N+4,3)).astype(np.uint8)
        high_res_obs_array_border[:,2:M+2,2:N+2,:] = high_res_obs_array

        high_res_anim = get_anim(high_res_obs_array_border)
        high_res_path = os.path.join(trial_dir, 'high_res_obs.mp4')
        np.savez_compressed(os.path.join(trial_dir, 'high_res_obs.npz'), GLOBAL_SIM_DATA['high_res_obs_array'])
        high_res_anim.save(high_res_path, writer='ffmpeg', fps=GLOBAL_SIM_DATA['fps'])

        data_path = os.path.join(trial_dir, 'data.npz')
        filtered_data = {k: v for k, v in GLOBAL_SIM_DATA.items() if k not in ['obs_array', 'high_res_obs_array']}
        np.savez_compressed(data_path, **filtered_data) # to save data

        entities_path = os.path.join(trial_dir, 'init_state_entities.json')
        save_to_json(entities, entities_path)
        print("data saved")

        return jsonify({"status": "success"})
    except Exception as e:
        print("Error during saving:", e)
        return jsonify({"status": "error", "message": str(e)}), 500


@app.route("/resolve_path", methods=["POST"])
def resolve_path():
    data = request.json
    directory_name = data.get("directory_name")
    if not directory_name:
        return jsonify({"error": "No directory name provided"}), 400
    
    # Assuming directory_name is relative, resolve the full path
    full_path = os.path.abspath(directory_name)
    return jsonify({"full_path": full_path})

@app.route('/clear_simulation', methods=['POST'])
def clear_simulation():
    # Add logic here to clear the simulation state on the server
    global GLOBAL_SIM_DATA
    GLOBAL_SIM_DATA = None
    print("Simulation cleared successfully.")
    return jsonify({"status": "success", "message": "Simulation cleared."})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001)