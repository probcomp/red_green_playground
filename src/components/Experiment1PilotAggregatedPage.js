import React from 'react';
import AggregatedResultsPage from './AggregatedResultsPage';

function Experiment1PilotAggregatedPage() {
  return (
    <AggregatedResultsPage
      backTo="/jtap"
      backLabel="← Back to JTAP Results"
      pageTitle="Experiment 1 Pilot Aggregated Results"
      introText="These plots summarize the Experiment 1 Pilot results and mirror the same structure as the tuned JTAP analysis."
      assetFolder="jtap_experiment_1_pilot_v1"
    />
  );
}

export default Experiment1PilotAggregatedPage;
