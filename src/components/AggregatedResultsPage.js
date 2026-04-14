import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ASSETS_BASE_PATH } from '../constants';

// Default list of aggregated result files (excluding trial-specific files)
const DEFAULT_AGGREGATED_FILES = [
  'model_only_logfreq_all_trials.png',
  'targeted_per_trial_metrics.png',
  'non_targeted_per_trial_metrics.png',
  'non_targeted_dtw_analysis.png',
  'targeted_dtw_analysis.png',
  'targeted_decision_boundary_distribution.png',
  'targeted_P(decision)_distribution.png',
  'targeted_P(decision)_partial_correlation.png',
  'targeted_P(green|decision)_partial_correlation.png',
  'targeted_logfreq.png',
  'split_half_ecdf.png',
];

const PILOT_AGGREGATED_FILES = [
  // Per-trial metrics
  'targeted_per_trial_metrics.png',
  'non_targeted_per_trial_metrics.png',

  // Pooled absolute error
  'pooled_absolute_error_all_frames.png',
  'pooled_absolute_error_occluded_frames.png',

  // Bootstrap advantage, RMSE first
  'bootstrap_advantage_rmse_all_frames.png',
  'bootstrap_advantage_rmse_occluded_frames.png',

  // Bootstrap pair pooled plots, RMSE first
  'bootstrap_pair_pooled_rmse_histogram.png',
  'bootstrap_pair_rmse_ecdf.png',

  // Practice effects, log frequencies, and reliability
  'practice_effects_analysis.png',
  'model_only_logfreq_all_trials.png',
  'targeted_logfreq.png',
  'human_data_reliability.png',

  // JSD plots at the end
  'bootstrap_advantage_jsd_all_frames.png',
  'bootstrap_advantage_jsd_occluded_frames.png',
  'bootstrap_pair_pooled_jsd_histogram.png',
  'bootstrap_pair_jsd_ecdf.png',
];

// Fill in these captions manually when you are ready to write the pilot figure copy.
const PILOT_AGGREGATED_CAPTIONS = {
  'bootstrap_advantage_jsd_all_frames.png': 'Bootstrap distribution of model Jensen-Shannon distance (JSD) advantage over baselines on all frames (N = 3761) from all trials. We generate 5000 bootstrap resamples of the human data by sampling the 20 participant IDs from the pilot with replacement. For each resample, we compute the mean JSD (mean across all frames) for the model and each baseline, then take the difference (baseline − model). The histogram shows the distribution of these differences across bootstrap samples, where positive values indicate better model performance. The distribution is shifted above zero (median = 0.0116 against frozen and median = 0.1002 against decaying), indicating that the model consistently outperforms both baselines. However, we should note that in 2 of the 5000 boostrap samples, the frozen baseline does beat the model. Nevertheless, A paired one-sided t-test confirms that this advantage is statistically significant against both baselines.',
  'bootstrap_advantage_jsd_occluded_frames.png': 'Bootstrap distribution of model Jensen-Shannon distance (JSD) advantage over baselines on occluded frames only (N = 2162). We generate 5000 bootstrap resamples of the human data by sampling the 20 participant IDs from the pilot with replacement. For each resample, we compute the mean JSD (mean across all frames) for the model and each baseline, then take the difference (baseline − model). The histogram shows the distribution of these differences across bootstrap samples, where positive values indicate better model performance. The distribution is shifted above zero (median = 0.0256 against frozen and median = 0.1689 against decaying), indicating that the model consistently outperforms both baselines. In fact, in no boostrapped sample does any baseline ever perform better than the model. A paired one-sided t-test confirms that this advantage is statistically significant against both baselines.',
  'bootstrap_advantage_rmse_all_frames.png': 'Bootstrap distribution of model RMSE advantage over baselines on all frames (N = 3761) from all trials. We generate 5000 bootstrap resamples of the human data by sampling the 20 participant IDs from the pilot with replacement. For each resample, we compute RMSE for the model and each baseline over all frames, then take the difference (baseline − model). The histogram shows the distribution of these differences across bootstrap samples, where positive values indicate better model performance. The distribution is shifted above zero (median = 0.0290 against frozen and median = 0.0906 against decaying), indicating that the model consistently outperforms both baselines. In fact, in no boostrapped sample does any baseline ever perform better than the model. A paired one-sided t-test confirms that this advantage is statistically significant against both baselines.',
  'bootstrap_advantage_rmse_occluded_frames.png': 'Bootstrap distribution of model RMSE advantage over baselines on occluded frames (N = 2162). We generate 5000 bootstrap resamples of the human data by sampling the 20 participant IDs from the pilot with replacement. For each resample, we compute RMSE for the model and each baseline over all occluded frames, then take the difference (baseline − model). The histogram shows the distribution of these differences across bootstrap samples, where positive values indicate better model performance. The distribution is shifted above zero (median = 0.0392 against frozen and median = 0.1256 against decaying), indicating that the model consistently outperforms both baselines. In fact, in no boostrapped sample does any baseline ever perform better than the model. A paired one-sided t-test confirms that this advantage is statistically significant against both baselines.',
  'bootstrap_pair_jsd_ecdf.png': 'Human–human Jensen-Shannon distance (JSD) distributions over all frames based on bootstrap resampling, visualized on a per-trial basis (70 trials). We generate 5000 bootstrap samples of participants (sampling 20 IDs with replacement). For each comparison, two bootstrap samples are drawn independently (with replacement from the pool of 5000 samples), and JSD is computed between them across all frames. Repeating this process 5000 times yields a single distribution of human–human variability. In the grid, this same bootstrap distribution is shown for each trial for reference, while model and baseline JSD (vs. original human data) for that specific trial are overlaid as vertical lines. Trials are ordered (top-to-bottom, left-to-right) by how close the JTAP model’s JSD lies to the median of the bootstrap distribution, in percentile terms. This allows direct comparison of per-trial model performance to the overall range of variability observed between independent human samples.',
  'bootstrap_pair_pooled_jsd_histogram.png': 'Human–human Jensen-Shannon distance (JSD) distribution over all frames (N = 3761) based on bootstrap resampling. We first generate 5000 bootstrap samples of participants (sampling 20 IDs with replacement). For each comparison, we then draw two bootstrap samples independently (with replacement from the pool of 5000 samples) and compute the JSD between them. Repeating this 5000 times yields a distribution of human–human variability. Model and baseline JSD (vs. original human data) are compared against this distribution. The model lies at approximately the 92nd percentile, indicating that its error falls within the range of variability observed between independent human samples. ',
  'bootstrap_pair_pooled_rmse_histogram.png': 'Human–human RMSE distribution over all frames (N = 3761) based on bootstrap resampling. We first generate 5000 bootstrap samples of participants (sampling 20 IDs with replacement). For each comparison, we then draw two bootstrap samples independently (with replacement from the pool of 5000 samples) and compute the RMSE between them. Repeating this process 5000 times yields a distribution of human–human variability. Model and baseline RMSE (vs. original human data) are compared against this distribution. The model lies at approximately the 77th percentile, indicating that its error falls within the range of variability observed between independent human samples.',
  'bootstrap_pair_rmse_ecdf.png': 'Human–human RMSE distributions over all frames based on bootstrap resampling, visualized on a per-trial basis (70 trials). We generate 5000 bootstrap samples of participants (sampling 20 IDs with replacement). For each comparison, two bootstrap samples are drawn independently (with replacement from the pool of 5000 samples), and RMSE is computed between them across all frames. Repeating this process 5000 times yields a single distribution of human–human variability. In the grid, this same bootstrap distribution is shown for each trial for reference, while model and baseline RMSE (vs. original human data) for that specific trial are overlaid as vertical lines. Trials are ordered (top-to-bottom, left-to-right) by how close the JTAP model’s RMSE lies to the median of the bootstrap distribution, in percentile terms. This allows direct comparison of per-trial model performance to the overall range of variability observed between independent human samples.',
  'human_data_reliability.png': 'Intraclass Correlation (ICC(1,K)), where K = 20 shows good reliability of participant scores across all 70 trials, with ICC(1,K) computed at 0.8463 [0.790, 0.89]. We should aim to have this above 0.9 for the final experiment. I also measured the split half reliability by generating 2000 sets of split-halves and computing the mean Jensen-Shannon distance at 0.1915 [0.1784, 0.2137]. This is relatively high, but it is expected as we only have 20 participants.',
  'model_only_logfreq_all_trials.png': 'Joint histogram of JTAP (x-axis) and human (y-axis) decisions across all trials for each timestep. Left: probability of making a decision, either red or green. Right: probability of choosing green given a decision was made. The model appears to show strong correlation with the human data in both measures, although we should wait to confirm this once we have tested on more participants.',
  'non_targeted_per_trial_metrics.png': 'Per-trial mean metrics (each trial weighted equally) comparing the proposed model and two baseline models across all trials across RMSE, Jensen-Shannon distance (JSD) and Mutual Information. Lower RMSE and JSD values indicate better fit to human responses. The model achieves consistently lower RMSE & JSD than both baselines (mean per-trial RMSE of 0.110 for model vs 0.131 for frozen baseline). Paired one-sided t-tests, computed over trial-level metric differences (model vs. baseline) for RMSE and JSD, indicate that these improvements are statistically significant.',
  'pooled_absolute_error_all_frames.png': 'Pooled RMSE over all occluded frames (N = 3761) comparing the proposed model and baseline models. For each frame, error is computed as the mean absolute deviation between model and human responses for both red and green channels, and then averaged across frames so that each occluded frame is weighted equally. Lower values indicate better fit with the model mean at 0.080 with frozen and decaying at 0.097 and 0.135 respectively. A paired one-sided t-test over trial-level RMSE differences (model vs. baseline) confirms that these improvements are statistically significant. Moreover, when looking at all frames together, the model achieves lower RMSE (0.1165) than both baselines (e.g., Frozen: 0.1495).',
  'pooled_absolute_error_occluded_frames.png': 'Pooled RMSE over all occluded frames (N = 2162) comparing the proposed model and baseline models. For each frame, error is computed as the mean absolute deviation between model and human responses for both red and green channels, and then averaged across frames so that each occluded frame is weighted equally. Lower values indicate better fit with the model mean at 0.091 with frozen and decaying at 0.121 and 0.184 respectively. A paired one-sided t-test over trial-level RMSE differences (model vs. baseline) confirms that these improvements are statistically significant. Moreover, when looking at all frames together, the model achieves lower RMSE (0.1232) than both baselines (e.g., Frozen: 0.1684).',
  'practice_effects_analysis.png': 'This plot shows the evolution of participant scores across repetitions over each one of the three practice trials (T9, T10, T11). We fit the score of participants with a mixed-effects model via maximum likelihood to test of the scores improve over repetitions. What we see here is that T9 and T10 do not show any statistically significant increase in scores over the repetitions, but T11 does. However, the main reason for T11 showing score improvement is because participants somehow scored quite poorly in the first repetition (scoring less than 40) on average. In a previous pilot that I had run with this exact same trial (T11), with no statsitically signifant increase in score (p_one_sided = 0.452) there. One key difference is that people scored close to 50 on average on the first repetition. Hence, I believe that this is most likely noise, and we will get a better idea about these practice trials once we run it on 100 participants. Kevin also flagged that we should not be too concerened by this.',
  'targeted_logfreq.png': 'Joint histogram of JTAP (x-axis) and human (y-axis) decisions across occlusion frames only. Left: probability of making a decision, either red or green. Right: probability of choosing green given a decision was made. Plots shown for JTAP model and baselines (Frozen and Decaying). The model performs better than both baselines in both measures, although we should wait to confirm this once we have tested on more participants.',
  'targeted_per_trial_metrics.png': 'Per-trial mean metrics (each trial weighted equally) comparing the proposed model and two baseline models across occlusion trials only (55 of 70 trials) across RMSE, Jensen-Shannon distance (JSD) and Mutual Information. Lower RMSE and JSD values indicate better fit to human responses. The model achieves consistently lower RMSE & JSD than both baselines (mean per-trial RMSE of 0.115 for model vs 0.145 for frozen baseline). Paired one-sided t-tests, computed over trial-level metric differences (model vs. baseline) for RMSE and JSD, indicate that these improvements are statistically significant.',
};

// Map filenames to custom titles
const getTitleFromFilename = (filename) => {
  const titleMap = {
    'bootstrap_advantage_jsd_all_frames.png': 'Bootstrap Advantage JSD (All Frames)',
    'bootstrap_advantage_jsd_occluded_frames.png': 'Bootstrap Advantage JSD (Occluded Frames)',
    'bootstrap_advantage_rmse_all_frames.png': 'Bootstrap Advantage RMSE (All Frames)',
    'bootstrap_advantage_rmse_occluded_frames.png': 'Bootstrap Advantage RMSE (Occluded Frames)',
    'bootstrap_pair_jsd_ecdf.png': 'Bootstrap Pair JSD ECDF',
    'bootstrap_pair_pooled_jsd_histogram.png': 'Bootstrap Pair Pooled JSD Histogram',
    'bootstrap_pair_pooled_rmse_histogram.png': 'Bootstrap Pair Pooled RMSE Histogram',
    'bootstrap_pair_rmse_ecdf.png': 'Bootstrap Pair RMSE ECDF',
    'human_data_reliability.png': 'Human Data Reliability',
    'model_only_logfreq_all_trials.png': 'Log Frequency Histogram (All Trials), Model Only',
    'targeted_per_trial_metrics.png': 'Per Trial Metrics (Occlusion Trials only)',
    'non_targeted_per_trial_metrics.png': 'Per Trial Metrics (All Trials)',
    'non_targeted_dtw_analysis.png': 'Dynamic Time Warping Analysis (All Trials)',
    'targeted_dtw_analysis.png': 'Dynamic Time Warping Analysis (Occlusion Trials only)',
    'targeted_decision_boundary_distribution.png': 'Decision Boundary Distributional Shape (Occlusion Trials only)',
    'targeted_P(decision)_distribution.png': 'P(Decision) Distributional Shape (Occlusion Trials only)',    
    'targeted_P(decision)_partial_correlation.png': 'P(Decision) Partial Correlation (Occlusion Trials only)',
    'targeted_P(green|decision)_partial_correlation.png': 'P(Green|Decision) Partial Correlation (Occlusion Trials only)',
    'targeted_logfreq.png': 'Log Frequency Histogram (Occlusion Frames) w/ baselines',
    'pooled_absolute_error_all_frames.png': 'Pooled Absolute Error (All Frames)',
    'pooled_absolute_error_occluded_frames.png': 'Pooled Absolute Error (Occluded Frames)',
    'split_half_ecdf.png': 'Split Half ECDF',
    'practice_effects_analysis.png': 'Practice Effects Analysis',
  };
  
  // Return custom title if available, otherwise fall back to automatic generation
  return titleMap[filename] || filename
    .replace('.png', '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase())
    .replace('P(', 'P(')
    .replace(')', ')');
};

const getCaption = (filename, assetFolder) => {
  if (assetFolder === 'jtap_experiment_1_pilot_v1') {
    return PILOT_AGGREGATED_CAPTIONS[filename] || `Caption placeholder. Edit src/components/AggregatedResultsPage.js -> PILOT_AGGREGATED_CAPTIONS to add your custom caption for ${filename}.`;
  }

  const captions = {
    'model_only_logfreq_all_trials.png': 'Joint histogram of JTAP (x-axis) and human (y-axis) decisions across all trials for each timestep. Left: probability of making a decision, either red or green. Right: probability of choosing green given a decision was made',
    'non_targeted_dtw_analysis.png': '(All trials and frames) Dynamic Time Warping (DTW) distance represents how similar model predictions are to human data (per trial) if we are allowed to stretch, and warp the time axis to get the best alignment (per model/baseline). Naturally, the DTW distance is in itself a bad measure for the red-green task because we want the model predictions to also time-align, but what this tells us is how good the "shape/levels" of the curves are. So the fact that the DTW distance is lower for the JTAP model compared to the baselines shows that the better performance of the JTAP model cannot be purely attributed to temporal differences, but also the level of red & green during occlusion. I think this is a positive finding for what we see visually.',
    'non_targeted_per_trial_metrics.png': 'In this plot, we look at a few metrics (RMSE, KL Divergence, and Discretized Mutual Information) for JTAP and baselines against human data for all trials. This is done by comparing the Red-Green lines at every timestep. These represent a few different ways to quantify model-human alignment. The violin plot shows the distribution across the trials for the given metric.',
    'targeted_decision_boundary_distribution.png': 'This plot shows the shape of the decision boundary distribution: |P(Green) - P(Red)| across all occluded timesteps. The lower the value, the closer the red & green lines are to each other, and the higher the value, the more confidence there is in one option over the other. Note that this plot merely visualizes the distributional shape, but it does not imply alignment, because that requires a direct frame-by-frame comparison, as is done for the Log Frequency Histogram plots.',
    'targeted_dtw_analysis.png': '(Occlusion trials & frames only) Dynamic Time Warping (DTW) distance represents how similar model predictions are to human data (per trial) if we are allowed to stretch, and warp the time axis to get the best alignment (per model/baseline). Naturally, the DTW distance is in itself a bad measure for the red-green task because we want the model predictions to also time-align, but what this tells us is how good the "shape/levels" of the curves are. So the fact that the DTW distance is lower for the JTAP model compared to the baselines shows that the better performance of the JTAP model cannot be purely attributed to temporal differences, but also the level of red & green during occlusion. I think this is a positive finding for what we see visually.',
    'targeted_logfreq.png': 'Joint histogram of JTAP (x-axis) and human (y-axis) decisions across all occluded timesteps. Left: probability of making a decision, either red or green. Right: probability of choosing green given a decision was made. Plots shown for JTAP model and baselines (Frozen and Decaying).',
    'targeted_P(decision)_distribution.png': 'This plot shows the shape of the decision distribution: P(Decision) = P(Green) + P(Red) across all occluded timesteps. Note that this plot merely visualizes the distributional shape, but it does not imply alignment, because that requires a direct frame-by-frame comparison, which is shown on the left column of the targeted log frequency histogram plot.',
    'targeted_P(decision)_partial_correlation.png': 'The partial correlation here is a measure of the linear relationship between the JTAP Model and Humans for their respective P(Decision) across all occluded timesteps while controlling for the effects of a baseline model (Frozen or Decaying). Generally, this measure is used to remove confounders for correlation analysis, but we can think of this as how much the JTAP model additionally captures the patterns of human reasoning, while accounting for any shared explanatory power from a baseline model. I do not know if this is appropriate/accepted in the cognitive science field, but I thought this was an interesting and positive finding to share. Each dot in the violin plot indicates a trial.',
    'targeted_P(green|decision)_partial_correlation.png': 'The partial correlation here is a measure of the linear relationship between the JTAP Model and Humans for their respective P(Green|Decision) across all occluded timesteps while controlling for the effects of a baseline model (Frozen or Decaying). Generally, this measure is used to remove confounders for correlation analysis, but we can think of this as how much the JTAP model additionally captures the patterns of human reasoning, while accounting for any shared explanatory power from a baseline model. I do not know if this is appropriate/accepted in the cognitive science field, but I thought this was an interesting and positive finding to share. Each dot in the violin plot indicates a trial.',
    'targeted_per_trial_metrics.png': 'In this plot, we look at a few metrics (RMSE, KL Divergence, and Discretized Mutual Information) for JTAP and baselines against human data for occlusion trials only. This is done by comparing the Red-Green lines at every timestep. The violin plot shows the distribution across the trials for the given metric. These represent a few different ways to quantify model-human alignment.',
    'practice_effects_analysis.png': 'This plot summarizes the practice-effects subset for Experiment 1 Pilot and highlights how the repeated T9-T11 trials evolve over time.',
    'split_half_ecdf.png': ''
  };
  return captions[filename] || 'Caption not found';
};

const DEFAULT_ASSET_FOLDER = 'cogsci_2025_trials_tuned_Jan102026';

function AggregatedResultsPage({
  backTo = '/jtap/cogsci2025-tuned',
  backLabel = '← Back to Cogsci 2025 Tuned Results',
  pageTitle = 'Aggregated Results',
  introText = 'These plots are primarily for our internal analysis, but if we think they are appropriate for the audience, they could be candidate figures for the paper (post any improvements/clarifications we think is necessary).',
  assetFolder = DEFAULT_ASSET_FOLDER
} = {}) {
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageSizes, setImageSizes] = useState({});
  const aggregatedFiles = assetFolder === 'jtap_experiment_1_pilot_v1'
    ? PILOT_AGGREGATED_FILES
    : DEFAULT_AGGREGATED_FILES;

  const handleImageLoad = (filename, event) => {
    const { naturalWidth, naturalHeight } = event.currentTarget;
    if (!naturalWidth || !naturalHeight) return;

    setImageSizes((current) => {
      const previous = current[filename];
      if (previous && previous.width === naturalWidth && previous.height === naturalHeight) {
        return current;
      }

      return {
        ...current,
        [filename]: { width: naturalWidth, height: naturalHeight }
      };
    });
  };

  const isTallImage = (filename) => {
    const size = imageSizes[filename];
    if (!size) return false;
    return size.height / size.width > 1.15;
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (selectedImage === null) return;

      if (e.key === 'Escape') {
        setSelectedImage(null);
      } else if (e.key === 'ArrowLeft') {
        navigateImage(-1);
      } else if (e.key === 'ArrowRight') {
        navigateImage(1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedImage]);

  const navigateImage = (direction) => {
    if (selectedImage === null) return;
    
    const currentIndex = aggregatedFiles.indexOf(selectedImage);
    const newIndex = currentIndex + direction;
    
    if (newIndex >= 0 && newIndex < aggregatedFiles.length) {
      setSelectedImage(aggregatedFiles[newIndex]);
    }
  };

  const openModal = (filename) => {
    setSelectedImage(filename);
  };

  const closeModal = () => {
    setSelectedImage(null);
  };

  const handleModalClick = (e) => {
    if (e.target.id === 'modal-backdrop') {
      closeModal();
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      padding: '40px',
      backgroundColor: '#f8fafc',
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
    }}>
      {/* Navigation */}
      <div style={{
        marginBottom: '40px',
        paddingBottom: '20px',
        borderBottom: '2px solid #e2e8f0'
      }}>
        <Link 
          to={backTo} 
          style={{ 
            color: '#3b82f6',
            textDecoration: 'none',
            fontSize: '16px',
            fontWeight: '600',
            padding: '8px 16px',
            borderRadius: '6px',
            backgroundColor: '#eff6ff',
            display: 'inline-block',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = '#dbeafe';
            e.target.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = '#eff6ff';
            e.target.style.transform = 'translateY(0)';
          }}
        >
          {backLabel}
        </Link>
      </div>

      {/* Header */}
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto 40px auto'
      }}>
        <h1 style={{
          fontSize: '48px',
          fontWeight: '700',
          color: '#1e293b',
          marginBottom: '16px',
          letterSpacing: '-0.025em'
        }}>
          {pageTitle}
        </h1>
        <p style={{
          fontSize: '20px',
          color: '#64748b',
          lineHeight: '1.6',
          whiteSpace: 'pre-line'
        }}>
          {introText}
        </p>
      </div>

      {/* Results Grid */}
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '24px',
        paddingBottom: '40px'
      }}>
        {aggregatedFiles.map((filename) => {
          const tall = isTallImage(filename);

          return (
          <div
            key={filename}
            onClick={() => openModal(filename)}
            style={{
              cursor: 'pointer',
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              padding: '20px',
              border: '2px solid #e2e8f0',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
              transition: 'all 0.2s ease',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.1)';
              e.currentTarget.style.borderColor = '#8b5cf6';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.05)';
              e.currentTarget.style.borderColor = '#e2e8f0';
            }}
          >
            <div style={{
              width: '100%',
              height: tall ? '260px' : 'auto',
              overflow: tall ? 'hidden' : 'visible',
              borderRadius: '8px',
              backgroundColor: '#f8fafc'
            }}>
              <img
                src={`${ASSETS_BASE_PATH}/${assetFolder}/${filename}`}
                alt={getTitleFromFilename(filename)}
                onLoad={(e) => handleImageLoad(filename, e)}
                style={{
                  width: '100%',
                  height: tall ? '100%' : 'auto',
                  objectFit: tall ? 'cover' : 'contain',
                  objectPosition: tall ? 'top center' : 'center',
                  borderRadius: '8px',
                  display: 'block'
                }}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentElement.innerHTML = `<div style="text-align: center; color: #64748b; padding: 20px;">${getTitleFromFilename(filename)}<br/>Image not found</div>`;
                }}
              />
            </div>
            <div style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#1e293b',
              textAlign: 'center'
            }}>
              {getTitleFromFilename(filename)}
            </div>
          </div>
          );
        })}
      </div>

      {/* Modal */}
      {selectedImage && (
        <div
          id="modal-backdrop"
          onClick={handleModalClick}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '40px',
            overflowY: 'auto'
          }}
        >
          {/* Close Button */}
          <button
            onClick={closeModal}
            style={{
              position: 'fixed',
              top: '20px',
              right: '20px',
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              border: 'none',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              fontSize: '24px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#1e293b',
              fontWeight: 'bold',
              transition: 'all 0.2s ease',
              zIndex: 1001
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#ffffff';
              e.target.style.transform = 'scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
              e.target.style.transform = 'scale(1)';
            }}
          >
            ×
          </button>

          {/* Left Arrow */}
          {aggregatedFiles.indexOf(selectedImage) > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigateImage(-1);
              }}
              style={{
                position: 'fixed',
                left: '20px',
                top: '50%',
                transform: 'translateY(-50%)',
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                border: 'none',
                borderRadius: '50%',
                width: '50px',
                height: '50px',
                fontSize: '24px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#1e293b',
                fontWeight: 'bold',
                transition: 'all 0.2s ease',
                zIndex: 1001
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#ffffff';
                e.target.style.transform = 'translateY(-50%) scale(1.1)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
                e.target.style.transform = 'translateY(-50%) scale(1)';
              }}
            >
              ←
            </button>
          )}

          {/* Right Arrow */}
          {aggregatedFiles.indexOf(selectedImage) < aggregatedFiles.length - 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigateImage(1);
              }}
              style={{
                position: 'fixed',
                right: '20px',
                top: '50%',
                transform: 'translateY(-50%)',
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                border: 'none',
                borderRadius: '50%',
                width: '50px',
                height: '50px',
                fontSize: '24px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#1e293b',
                fontWeight: 'bold',
                transition: 'all 0.2s ease',
                zIndex: 1001
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#ffffff';
                e.target.style.transform = 'translateY(-50%) scale(1.1)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
                e.target.style.transform = 'translateY(-50%) scale(1)';
              }}
            >
              →
            </button>
          )}

          {/* Modal Content */}
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'relative',
              width: 'min(100%, 1100px)',
              maxWidth: '1100px',
              height: '90vh',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '16px',
              margin: '40px 0',
              overflow: 'hidden',
              minHeight: 0
            }}
          >
            {/* Title */}
            <div style={{
              color: '#ffffff',
              fontSize: '28px',
              fontWeight: '600',
              textAlign: 'center'
            }}>
              {getTitleFromFilename(selectedImage)}
            </div>

            {/* Plot Pane */}
            <div style={{
              width: '100%',
              flex: '1 1 auto',
              overflowY: 'auto',
              paddingRight: '8px',
              paddingBottom: '8px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'flex-start',
              minHeight: 0
            }}>
              <img
                src={`${ASSETS_BASE_PATH}/${assetFolder}/${selectedImage}`}
                alt={getTitleFromFilename(selectedImage)}
                onLoad={(e) => handleImageLoad(selectedImage, e)}
                style={{
                  width: '100%',
                  maxWidth: '100%',
                  height: 'auto',
                  borderRadius: '8px',
                  boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
                  backgroundColor: '#ffffff',
                  padding: '8px',
                  objectFit: 'contain'
                }}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentElement.innerHTML = `
                    <div style="
                      color: #ffffff; 
                      text-align: center; 
                      padding: 40px;
                      font-size: 18px;
                    ">
                      Image not found
                    </div>
                  `;
                }}
              />
            </div>

            {/* Caption Pane */}
            <div style={{
              width: '100%',
              flex: '0 0 auto',
              maxHeight: '28vh',
              overflowY: 'auto',
              paddingRight: '8px',
              minHeight: 0
            }}>
              <div style={{
                width: '100%',
                backgroundColor: '#ffffff',
                color: '#0f172a',
                borderRadius: '12px',
                padding: '18px 22px',
                boxShadow: '0 12px 30px rgba(0, 0, 0, 0.18)',
                border: '1px solid rgba(148, 163, 184, 0.35)',
                fontSize: '16px',
                lineHeight: '1.6',
                textAlign: 'left',
                maxWidth: '900px'
              }}>
                <div style={{
                  fontSize: '13px',
                  fontWeight: '700',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: '#475569',
                  marginBottom: '8px'
                }}>
                  Caption
                </div>
                <div style={{ whiteSpace: 'pre-line' }}>
                  {getCaption(selectedImage, assetFolder)}
                </div>
                <div style={{
                  color: '#64748b',
                  fontSize: '14px',
                  marginTop: '10px',
                  textAlign: 'right'
                }}>
                  {aggregatedFiles.indexOf(selectedImage) + 1} / {aggregatedFiles.length}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AggregatedResultsPage;
