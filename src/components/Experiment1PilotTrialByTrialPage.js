import React from 'react';
import TrialByTrialPage from './TrialByTrialPage';
import { EXPERIMENT_1_PILOT_GROUPS, EXPERIMENT_1_PILOT_TRIALS } from './experiment1PilotGroups';

function Experiment1PilotTrialByTrialPage() {
  return (
    <TrialByTrialPage
      backTo="/jtap"
      backLabel="← Back to JTAP Results"
      pageTitle="Experiment 1 Pilot Trial-by-Trial Plots"
      introText={"We conducted an initial pilot study with 20 participants. Using data from this pilot, we independently tuned the JTAP model and two baseline models (frozen and decaying) via Bayesian optimization, fitting each model to human responses across all pilot trials.\n\nIn the current experimental set, trials T28, T31, T33, and T34 were not included in the pilot dataset, hence they don't have any human data. These trials were introduced subsequently, with the aim of increasing the number of catch trials in the final experiment."}
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
