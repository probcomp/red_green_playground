# Red-Green Playground

A physics-based simulation playground for creating and visualizing stimuli with red and green sensors.

This site is not ready yet.

## Build instructions
This site is not meant for development from others, but in case anybody wants a 
local build of the red-green playground, here are the instructions.

Before you begin, ensure you have the following installed:
- Conda (for Python environment management)
- Git

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

#### For macOS:
1. Install Homebrew (if not already installed):
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

2. Install Node.js and npm:
```bash
brew install node
```

#### For Ubuntu/Debian:
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

#### For Windows:
1. Download the Node.js installer from [nodejs.org](https://nodejs.org/)
2. Run the installer and follow the installation wizard
3. Verify installation by opening a new terminal and running:
```bash
node --version
npm --version
```

### 4. Set Up and Run the Frontend

1. Navigate to the frontend directory:
```bash
cd create_stimuli
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
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
python create_stimuli.py
```

The backend will run on `http://localhost:5001`.