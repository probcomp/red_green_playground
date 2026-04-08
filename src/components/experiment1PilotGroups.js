const parseTrialNumber = (trialName) => {
  const match = String(trialName || '').match(/^T(\d+)/i);
  return match ? parseInt(match[1], 10) : null;
};

const expandVariants = (baseTrials, variants) => {
  return baseTrials.flatMap((trial) => variants.map((variant) => `${trial}${variant}`));
};

const repeatTrials = (baseTrials, repeats) => {
  return baseTrials.flatMap((trial) => repeats.map((repeat) => `${trial}_rep${repeat}`));
};

export const EXPERIMENT_1_PILOT_GROUPS = [
  {
    key: 'initial-direction',
    label: 'Initial Direction Variation',
    expectedCount: 12,
    description: 'The ball’s starting angle is varied to compare clearer bounces against clearer misses near the barrier edge.',
    matchTrial: (trialName) => {
      const n = parseTrialNumber(trialName);
      return n !== null && n >= 1 && n <= 3;
    }
  },
  {
    key: 'path-visibility',
    label: 'Path Visibility Configuration',
    expectedCount: 12,
    description: 'The occlusion layout changes which path is visible, letting us compare how available evidence shifts certainty.',
    matchTrial: (trialName) => {
      const n = parseTrialNumber(trialName);
      return n !== null && n >= 4 && n <= 5;
    }
  },
  {
    key: 'occlusion-window',
    label: 'Occlusion Window Position',
    expectedCount: 12,
    description: 'A window in the occluder reveals part of the trajectory, and the window position is varied across scenes.',
    matchTrial: (trialName) => {
      const n = parseTrialNumber(trialName);
      return n !== null && n >= 6 && n <= 8;
    }
  },
  {
    key: 'practice-control',
    label: 'Practice Effects Control',
    expectedCount: 15,
    description: 'The same underlying scene is repeated with flips and rotations to check for practice effects over time.',
    matchTrial: (trialName) => {
      const n = parseTrialNumber(trialName);
      return n === 17 || n === 20 || n === 28;
    }
  },
  {
    key: 'remaining',
    label: 'Remaining Trials',
    expectedCount: 19,
    description: 'The remaining pilot trials that do not fall into the four primary analysis groups.',
    matchTrial: () => true
  }
];

export const getExperiment1PilotGroupKey = (trialName) => {
  for (const group of EXPERIMENT_1_PILOT_GROUPS) {
    if (group.key === 'remaining') continue;
    if (group.matchTrial(trialName)) {
      return group.key;
    }
  }
  return 'remaining';
};

export const getExperiment1PilotGroup = (trialName) => {
  const key = getExperiment1PilotGroupKey(trialName);
  return EXPERIMENT_1_PILOT_GROUPS.find((group) => group.key === key) || null;
};

export const EXPERIMENT_1_PILOT_TRIALS = [
  ...expandVariants(['T1', 'T2', 'T3'], ['A', 'B', 'C', 'D']),
  ...expandVariants(['T4', 'T5'], ['A', 'B', 'C', 'D', 'E', 'F']),
  ...expandVariants(['T6', 'T7', 'T8'], ['A', 'B', 'C', 'D']),
  ...repeatTrials(['T17', 'T20', 'T28'], [0, 1, 2, 3, 4]),
  'T31',
  'T32',
  'T33',
  'T34'
];
