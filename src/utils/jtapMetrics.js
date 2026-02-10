// Shared JTAP metrics utilities: metric metadata, CSV parsing, and sorting helpers

// Metric name mappings from CSV column names to display names and keys
export const metricNameMap = {
  'KL_divergence': { key: 'KL_divergence', name: 'KL Divergence' },
  'decision_prob_correlation': { key: 'decision_prob_correlation', name: 'P(Decision) Correlation' },
  'decision_prob_rmse': { key: 'decision_prob_rmse', name: 'P(Decision) RMSE' },
  'discrete_mutual_information': { key: 'discrete_mutual_information', name: 'Discrete Mutual Information' },
  'green_given_decision_correlation': { key: 'green_given_decision_correlation', name: 'Weighted P(Green|Decision) Correlation' },
  'green_given_decision_rmse': { key: 'green_given_decision_rmse', name: 'Weighted P(Green|Decision) RMSE' },
  'red_green_ordering': { key: 'red_green_ordering', name: 'Red vs Green Ordering' },
  'rmse_(R-G)': { key: 'rmse_(R-G)', name: 'RMSE (Red - Green)' },
  'rmse_(|R-G|)': { key: 'rmse_(|R-G|)', name: 'RMSE (|Red - Green|)' },
  'rmse_RG': { key: 'rmse_RG', name: 'RMSE' },
  'rmse_RGU': { key: 'rmse_RGU', name: 'RMSE (Red, Green, Uncertain)' }
};

// Metrics where higher values are better (sorted descending)
export const higherBetterMetrics = new Set([
  'discrete_mutual_information',
  'red_green_ordering',
  'decision_prob_correlation',
  'green_given_decision_correlation'
]);

// Enable/disable metrics - set to false to hide a metric from the dropdown
export const metricsEnabled = {
  'rmse_RGU': false,
  'rmse_RG': true,
  'rmse_(|R-G|)': true,
  'rmse_(R-G)': true,
  'KL_divergence': true,
  'discrete_mutual_information': true,
  'red_green_ordering': true,
  'decision_prob_rmse': true,
  'green_given_decision_rmse': true,
  'decision_prob_correlation': true,
  'green_given_decision_correlation': true
};

// Parse CSV text into structured metrics data
export const parseCSV = (csvText) => {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) return null;

  const headers = lines[0].split(',');
  const data = {};

  // Initialize metric data structures
  Object.keys(metricNameMap).forEach(metricKey => {
    data[metricKey] = {
      name: metricNameMap[metricKey].name,
      data: {}
    };
  });

  // Parse each data row
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',');
    if (values.length !== headers.length) continue;

    const trialName = values[0].trim();

    // Process each metric column
    for (let j = 1; j < headers.length; j++) {
      const columnName = headers[j].trim();
      const metricInfo = metricNameMap[columnName];

      if (metricInfo) {
        const valueStr = values[j].trim().toLowerCase();
        let value = null;

        // Handle NaN, nan, empty strings, etc.
        if (valueStr === '' || valueStr === 'nan' || valueStr === 'none') {
          value = NaN;
        } else {
          const parsed = parseFloat(valueStr);
          value = Number.isNaN(parsed) ? NaN : parsed;
        }

        data[metricInfo.key].data[trialName] = value;
      }
    }
  }

  return data;
};

// Fetch and parse metrics CSV from backend proxy endpoint
export async function fetchAndParseMetricsCsv(endpoint = '/metrics_csv') {
  const response = await fetch(endpoint);
  if (!response.ok) {
    throw new Error(`Failed to load metrics CSV: ${response.status} ${response.statusText}`);
  }
  const csvText = await response.text();
  const parsedData = parseCSV(csvText);
  if (!parsedData) {
    throw new Error('Failed to parse CSV data');
  }
  return parsedData;
}

// Compute sorted trials, rankings and losses for a selected metric
export function computeSortedTrials({ metricsData, selectedMetric, allTrials }) {
  if (!selectedMetric || !metricsData || !metricsData[selectedMetric]) {
    return {
      sortedTrials: allTrials,
      trialRankings: {},
      trialLosses: {}
    };
  }

  const metricData = metricsData[selectedMetric].data;
  const isHigherBetter = higherBetterMetrics.has(selectedMetric);

  // Build list with possible NaNs/undefined marked as null, then:
  // - sort only valid values
  // - append invalid ones at the end with no ranking
  const trialsWithLoss = allTrials.map(trial => {
    const raw = metricData[trial];
    const isValidNumber = typeof raw === 'number' && !Number.isNaN(raw);
    return {
      trial,
      loss: isValidNumber ? raw : null
    };
  });

  const validTrials = trialsWithLoss
    .filter(item => item.loss !== null)
    .sort((a, b) => (isHigherBetter ? b.loss - a.loss : a.loss - b.loss)); // Sort from best to worst

  const invalidTrials = trialsWithLoss.filter(item => item.loss === null);

  const sorted = [
    ...validTrials.map(item => item.trial),
    ...invalidTrials.map(item => item.trial)
  ];
  const rankings = {};
  const losses = {};

  validTrials.forEach((item, index) => {
    rankings[item.trial] = index + 1;
    losses[item.trial] = item.loss;
  });

  return {
    sortedTrials: sorted,
    trialRankings: rankings,
    trialLosses: losses
  };
}

