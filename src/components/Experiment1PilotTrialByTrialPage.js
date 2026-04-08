import React from 'react';
import TrialByTrialPage from './TrialByTrialPage';
import { EXPERIMENT_1_PILOT_GROUPS, EXPERIMENT_1_PILOT_TRIALS } from './experiment1PilotGroups';

function Experiment1PilotTrialByTrialPage() {
  return (
    <TrialByTrialPage
      backTo="/jtap"
      backLabel="← Back to JTAP Results"
      pageTitle="Experiment 1 Pilot Trial-by-Trial Plots"
      introText="In each plot, you will see a dark gray and light gray region. The dark gray region means that the ball if fully occluded, while the light gray region means that the ball is partially occluded. Any other region implies that the ball is fully visible."
      assetFolder="jtap_experiment_1_pilot_v1"
      metricsEndpoint="/metrics_csv?asset_folder=jtap_experiment_1_pilot_v1"
      trialSeedTrials={EXPERIMENT_1_PILOT_TRIALS}
      trialGroups={EXPERIMENT_1_PILOT_GROUPS}
      defaultGroup="all"
      groupPanelTitle="Pilot stimulus sets"
      groupPanelIntro="Start with one of the stimulus sets below, or switch to all trials when you want the full pilot set."
    />
  );
}

export default Experiment1PilotTrialByTrialPage;
