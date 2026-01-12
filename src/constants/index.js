// Display and rendering constants
export const VID_RES = 400;
export const PX_SCALE = 25;
export const INTERVAL = 0.1;
export const BORDER_PX = 2;
export const ENTITY_HEIGHT = 1;
export const ENTITY_WIDTH = 1;
export const RES_MULTIPLIER = 4;

// Physics constants
export const TARGET_TIMESTEP = 0.01;
export const MAX_PHYSICS_STEPS_PER_FRAME = 50;
export const PHYSICS_WARNING_THRESHOLD = 20;

// Default simulation parameters
export const DEFAULT_VIDEO_LENGTH = 10;
export const DEFAULT_BALL_SPEED = 3.6;
export const DEFAULT_FPS = 30;
export const DEFAULT_WORLD_WIDTH = 20;
export const DEFAULT_WORLD_HEIGHT = 20;
export const DEFAULT_MOVEMENT_UNIT = 1.0;

// Default distractor parameters
export const DEFAULT_RANDOM_DISTRACTOR_PARAMS = {
  probability: 0.1,
  seed: 42,
  duration: 1.0,
  maxActive: 5,
  startDelay: 0.333
};

// Entity types
export const ENTITY_TYPES = {
  OCCLUDER: 'occluder',
  BARRIER: 'barrier',
  RED_SENSOR: 'red_sensor',
  GREEN_SENSOR: 'green_sensor',
  TARGET: 'target'
};

// Entity colors
export const ENTITY_COLORS = {
  occluder: '#6b7280',
  barrier: '#1f2937',
  red_sensor: '#ef4444',
  green_sensor: '#10b981',
  target: '#3b82f6'
};

// Modes
export const MODES = {
  REGULAR: 'regular',
  DISTRACTOR: 'distractor'
};

// Default trial name
export const DEFAULT_TRIAL_NAME = 'base';

// Do not worry, this is a public URL that is used to serve the assets from AWS S3. It is not a secret, and can be seen by anyone.
export const ASSETS_BASE_PATH = 'https://redgreenplayground.s3.us-east-2.amazonaws.com/site_static_assets';
