# Red-Green Playground

A physics-based simulation playground for creating and visualizing stimuli with red and green sensors.

This site is not ready yet.

## Build instructions
This site is not meant for development from others, but in case anybody wants a 
local build of the red-green playground, here are the instructions.

Before you begin, ensure you have the following installed:
- Conda (for Python environment management)
- Git
- Node.js v24.12.0 (Active LTS) and npm 11.6.2 (npm comes bundled with Node.js)

### 1. Clone the Repository
```bash
git clone git@github.com:probcomp/red_green_playground.git
cd red_green_playground
```

### 2. Set Up Python Environment
```bash
conda create -n playground python=3.11
conda activate playground
pip install -r requirements.txt
```

### 3. Install Node.js and npm

Install Node.js v24.12.0 (Active LTS) from [nodejs.org](https://nodejs.org/). npm 11.6.2 comes bundled with Node.js.

Verify installation:
```bash
node --version  # Should be v24.12.0
npm --version   # Should be 11.6.2
```

### 4. Set Up and Run the Frontend

1. Install dependencies:
```bash
npm install
```

2. Run the build
```bash
npm run build
```

The website should automatically open in your default browser at `http://localhost:3000`. If it doesn't, manually open your browser and navigate to that address.

### 5. Run the Backend

In a new terminal window (while keeping the frontend running):

1. Make sure you're in the project root directory and the conda environment is activated:
```bash
conda activate playground
```

2. Start the Flask server:
```bash
python red_green_playground.py
```

The backend will run on `http://localhost:5001`.

### 6. Push to Heroku

When ready, push to Heroku (only for authenticated user --> Arijit)

```bash
git push heroku main
```