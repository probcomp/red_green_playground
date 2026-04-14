import React from 'react';
import AggregatedResultsPage from './AggregatedResultsPage';

function Experiment1PilotAggregatedPage() {
  return (
    <AggregatedResultsPage
      backTo="/jtap"
      backLabel="← Back to JTAP Results"
      pageTitle="Experiment 1 Pilot Aggregated Results"
      introText={"We conducted an initial pilot study with 20 participants. Using data from this pilot, we independently tuned the JTAP model and two baseline models (frozen and decaying) via Bayesian optimization, fitting each model to human responses across all pilot trials.\n\nIn the current experimental set, trials T28, T31, T33, and T34 were not included in the pilot dataset, hence they don't have any human data. These trials were introduced subsequently, with the aim of increasing the number of catch trials in the final experiment."}
      assetFolder="jtap_experiment_1_pilot_v1"
    />
  );
}

export default Experiment1PilotAggregatedPage;
