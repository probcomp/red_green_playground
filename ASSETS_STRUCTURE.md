# Static Assets Structure

This document describes the structure of static assets stored in AWS S3. All assets are accessible via the base URL:

```
https://redgreenplayground.s3.us-east-2.amazonaws.com/site_static_assets/
```

## Base Path Constant

The application uses a constant `ASSETS_BASE_PATH` defined in `src/constants/index.js`:

```javascript
export const ASSETS_BASE_PATH = 'https://redgreenplayground.s3.us-east-2.amazonaws.com/site_static_assets';
```

**Important:** When constructing asset paths in code, use `${ASSETS_BASE_PATH}/...` (without a leading slash) since the constant already contains the full URL.

## Directory Structure

```
site_static_assets/
├── with_occlusion.gif                    # Example GIF (root level)
├── CandidateTrialsNov29_Plots/            # Candidate trial plots and videos
│   ├── {trialName}_trajectory.png        # Trajectory visualization
│   ├── {trialName}_plot.png              # Analysis plot
│   └── {trialName}_stimulus.webm         # Stimulus video (WebM format)
├── cogsci_2025_trials_tuned_Jan102026/                      # Cogsci 2025 trial data
│   ├── {aggregated_file}.png             # Aggregated analysis files
│   ├── {trialName}_trajectory.png        # Trial trajectory visualization
│   ├── {trialName}_plot.png              # Trial analysis plot
│   └── {trialName}_stimulus.mp4          # Stimulus video (MP4 format)
└── diameter_{diameter}/                   # Diameter-specific trial data
    └── cogsci_2025_trials/
        ├── {trialName}_trajectory.png    # Trajectory visualization
        └── {trialName}_plot.png          # Analysis plot
```

## Directory Details

### 1. Root Level Files

**Location:** `site_static_assets/`

**Files:**
- `with_occlusion.gif` - Example stimulus trajectory GIF

**Usage Example:**
```javascript
src={`${ASSETS_BASE_PATH}/with_occlusion.gif`}
```

---

### 2. CandidateTrialsNov29_Plots/

**Location:** `site_static_assets/CandidateTrialsNov29_Plots/`

**Purpose:** Contains plots and videos for candidate trials (proposed experimental trials).

**File Naming Convention:**
- `{trialName}_trajectory.png` - Trajectory visualization for a trial
- `{trialName}_plot.png` - Analysis plot for a trial
- `{trialName}_stimulus.webm` - Stimulus video in WebM format

**Trial Naming:**
- Trials are named with format: `CT{number}{variant}`
- Variants: `A`, `B`, `C` (for trials with variants)
- Examples: `CT1A`, `CT1B`, `CT1C`, `CT14A`, `CT16` (no variant)

**Usage Examples:**
```javascript
// Trajectory image
src={`${ASSETS_BASE_PATH}/CandidateTrialsNov29_Plots/CT14A_trajectory.png`}

// Analysis plot
src={`${ASSETS_BASE_PATH}/CandidateTrialsNov29_Plots/CT1A_plot.png`}

// Stimulus video
src={`${ASSETS_BASE_PATH}/CandidateTrialsNov29_Plots/CT1A_stimulus.webm`}
```

**Component:** `src/components/CandidateTrialsPage.js`

---

### 3. cogsci_2025_trials_tuned_Jan102026/

**Location:** `site_static_assets/cogsci_2025_trials_tuned_Jan102026/`

**Purpose:** Contains aggregated analysis files and trial-specific data for Cogsci 2025 experiments.

#### Aggregated Files

These are analysis files that aggregate data across multiple trials:

- `model_only_logfreq_all_trials.png`
- `targeted_per_trial_metrics.png`
- `non_targeted_per_trial_metrics.png`
- `non_targeted_dtw_analysis.png`
- `targeted_dtw_analysis.png`
- `targeted_decision_boundary_distribution.png`
- `targeted_P(decision)_distribution.png`
- `targeted_P(decision)_partial_correlation.png`
- `targeted_P(green|decision)_partial_correlation.png`
- `targeted_logfreq.png`

**Usage Example:**
```javascript
src={`${ASSETS_BASE_PATH}/cogsci_2025_trials_tuned_Jan102026/targeted_logfreq.png`}
```

#### Trial-Specific Files

**File Naming Convention:**
- `{trialName}_trajectory.png` - Trajectory visualization
- `{trialName}_plot.png` - Analysis plot
- `{trialName}_stimulus.mp4` - Stimulus video in MP4 format

**Trial Naming:**
- Trials are named: `E{number}` (e.g., `E1`, `E2`, ..., `E50`)

**Usage Examples:**
```javascript
// Trajectory image
src={`${ASSETS_BASE_PATH}/cogsci_2025_trials_tuned_Jan102026/E1_trajectory.png`}

// Analysis plot
src={`${ASSETS_BASE_PATH}/cogsci_2025_trials_tuned_Jan102026/E1_plot.png`}

// Stimulus video
src={`${ASSETS_BASE_PATH}/cogsci_2025_trials_tuned_Jan102026/E1_stimulus.mp4`}
```

**Components:**
- `src/components/TrialByTrialPage.js` - Trial-specific files
- `src/components/AggregatedResultsPage.js` - Aggregated files

---

### 4. diameter_{diameter}/cogsci_2025_trials/

**Location:** `site_static_assets/diameter_{diameter}/cogsci_2025_trials/`

**Purpose:** Contains diameter-specific trial plots for different ball diameter configurations.

**Diameter Values:**
- `0_5` (0.5)
- `0_8` (0.8)
- `0_9` (0.9)
- `0_925` (0.925)
- `0_95` (0.95)
- `0_99` (0.99)

**File Naming Convention:**
- `{trialName}_trajectory.png` - Trajectory visualization
- `{trialName}_plot.png` - Analysis plot

**Trial Naming:**
- Trials are named: `E{number}` (e.g., `E1`, `E2`, ..., `E50`)

**Path Construction:**
```javascript
const diameterPath = `${ASSETS_BASE_PATH}/diameter_${diameter}/cogsci_2025_trials`;
// Example: diameterPath = "https://redgreenplayground.s3.us-east-2.amazonaws.com/site_static_assets/diameter_0_8/cogsci_2025_trials"
```

**Usage Examples:**
```javascript
// Using diameterPath variable
const diameterPath = `${ASSETS_BASE_PATH}/diameter_0_8/cogsci_2025_trials`;

// Trajectory image
src={`${diameterPath}/E26_trajectory.png`}

// Analysis plot
src={`${diameterPath}/E26_plot.png`}
```

**Note:** Videos for diameter trials come from `cogsci_2025_trials_tuned_Jan102026/` directory, not from the diameter-specific directory.

**Components:**
- `src/components/DiameterAggregatedPage.js` - Aggregated plots
- `src/components/DiameterTrialByTrialPage.js` - Trial-specific plots and videos

---

## Path Construction Guidelines

### ✅ Correct Path Construction

```javascript
// Using the constant (recommended)
import { ASSETS_BASE_PATH } from '../constants';

// Direct usage
src={`${ASSETS_BASE_PATH}/cogsci_2025_trials_tuned_Jan102026/E1_trajectory.png`}

// With variable construction
const diameterPath = `${ASSETS_BASE_PATH}/diameter_0_8/cogsci_2025_trials`;
src={`${diameterPath}/E26_plot.png`}
```

### ❌ Incorrect Path Construction

```javascript
// DON'T add leading slash - ASSETS_BASE_PATH already contains full URL
src={`/${ASSETS_BASE_PATH}/cogsci_2025_trials_tuned_Jan102026/E1_trajectory.png`}  // ❌ Wrong

// DON'T hardcode the URL
src={`https://redgreenplayground.s3.us-east-2.amazonaws.com/site_static_assets/...`}  // ❌ Wrong
```

---

## Adding New Assets

When adding new assets to S3:

1. **Upload to the correct directory** based on the asset type:
   - Candidate trials → `CandidateTrialsNov29_Plots/`
   - Cogsci 2025 trials → `cogsci_2025_trials_tuned_Jan102026/`
   - Diameter-specific trials → `diameter_{diameter}/cogsci_2025_trials/`

2. **Follow the naming convention:**
   - Trajectory images: `{trialName}_trajectory.png`
   - Analysis plots: `{trialName}_plot.png`
   - Videos: `{trialName}_stimulus.{webm|mp4}`

3. **Update code references** using `${ASSETS_BASE_PATH}/...` pattern

4. **Verify the path** by checking the component that uses the asset

---

## File Format Guidelines

- **Images:** PNG format (`.png`)
- **Videos:** 
  - Candidate trials: WebM format (`.webm`)
  - Cogsci 2025 trials: MP4 format (`.mp4`)
- **GIFs:** GIF format (`.gif`) for example/demo files

---

## Component Reference

| Component | Asset Directory | File Types |
|-----------|----------------|------------|
| `CandidateTrialsPage.js` | `CandidateTrialsNov29_Plots/` | `.png`, `.webm` |
| `TrialByTrialPage.js` | `cogsci_2025_trials_tuned_Jan102026/` | `.png`, `.mp4` |
| `AggregatedResultsPage.js` | `cogsci_2025_trials_tuned_Jan102026/` | `.png` (aggregated) |
| `DiameterTrialByTrialPage.js` | `diameter_{d}/cogsci_2025_trials/` | `.png` |
| `DiameterAggregatedPage.js` | `diameter_{d}/cogsci_2025_trials/` | `.png` |
| `JTAPResultsPage.js` | Root, `CandidateTrialsNov29_Plots/` | `.gif`, `.png` |

---

## Notes

- All assets are publicly accessible via the S3 bucket URL
- The `assets/site_static_assets/` folder in the local repository is excluded from Heroku deployments (see `.slugignore`)
- Assets are not version-controlled in the repository; they are managed separately in S3
- When updating asset paths in code, always use the `ASSETS_BASE_PATH` constant to ensure consistency
