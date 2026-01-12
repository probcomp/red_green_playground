import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ASSETS_BASE_PATH } from '../constants';

// List of aggregated result files (excluding trial-specific files)
const aggregatedFiles = [
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
];

// Map filenames to custom titles
const getTitleFromFilename = (filename) => {
  const titleMap = {
    'model_only_logfreq_all_trials.png': 'Log Frequency Histogram (All Trials), Model Only',
    'targeted_per_trial_metrics.png': 'Per Trial Metrics (Occlusion Trials only)',
    'non_targeted_per_trial_metrics.png': 'Per Trial Metrics (All Trials)',
    'non_targeted_dtw_analysis.png': 'Dynamic Time Warping Analysis (All Trials)',
    'targeted_dtw_analysis.png': 'Dynamic Time Warping Analysis (Occlusion Trials only)',
    'targeted_decision_boundary_distribution.png': 'Decision Boundary Distributional Shape (Occlusion Trials only)',
    'targeted_P(decision)_distribution.png': 'P(Decision) Distributional Shape (Occlusion Trials only)',    
    'targeted_P(decision)_partial_correlation.png': 'P(Decision) Partial Correlation (Occlusion Trials only)',
    'targeted_P(green|decision)_partial_correlation.png': 'P(Green|Decision) Partial Correlation (Occlusion Trials only)',
    'targeted_logfreq.png': 'Log Frequency Histogram (Occlusion Trials only) w/ baselines',
  };
  
  // Return custom title if available, otherwise fall back to automatic generation
  return titleMap[filename] || filename
    .replace('.png', '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase())
    .replace('P(', 'P(')
    .replace(')', ')');
};

// Lorem ipsum captions for each figure
const getCaption = (filename) => {
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
    'targeted_per_trial_metrics.png': 'In this plot, we look at a few metrics (RMSE, KL Divergence, and Discretized Mutual Information) for JTAP and baselines against human data for occlusion trials only. This is done by comparing the Red-Green lines at every timestep. The violin plot shows the distribution across the trials for the given metric. These represent a few different ways to quantify model-human alignment.'
  };
  return captions[filename] || 'Caption not found';
};

function AggregatedResultsPage() {
  const [selectedImage, setSelectedImage] = useState(null);

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
          to="/jtap/cogsci2025-tuned" 
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
          ← Back to Cogsci 2025 Tuned Results
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
          Aggregated Results
        </h1>
        <p style={{
          fontSize: '20px',
          color: '#64748b',
          lineHeight: '1.6'
        }}>
          These plots are primarily for our internal analysis, but if we think they are appropriate for the audience, they could be candidate figures for the paper (post any improvements/clarifications we think is necessary).
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
        {aggregatedFiles.map((filename) => (
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
            <img
              src={`/${ASSETS_BASE_PATH}/cogsci2025_tuned/${filename}`}
              alt={getTitleFromFilename(filename)}
              style={{
                width: '100%',
                height: 'auto',
                borderRadius: '8px',
                display: 'block'
              }}
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.parentElement.innerHTML = `<div style="text-align: center; color: #64748b; padding: 20px;">${getTitleFromFilename(filename)}<br/>Image not found</div>`;
              }}
            />
            <div style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#1e293b',
              textAlign: 'center'
            }}>
              {getTitleFromFilename(filename)}
            </div>
          </div>
        ))}
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
              maxWidth: '90vw',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '24px',
              margin: '40px 0'
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

            {/* Image */}
            <img
              src={`/${ASSETS_BASE_PATH}/cogsci2025_tuned/${selectedImage}`}
              alt={getTitleFromFilename(selectedImage)}
              style={{
                maxWidth: '100%',
                maxHeight: '70vh',
                borderRadius: '8px',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
                backgroundColor: '#ffffff',
                padding: '8px'
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

            {/* Caption */}
            <div style={{
              color: 'rgba(255, 255, 255, 0.9)',
              fontSize: '16px',
              lineHeight: '1.6',
              textAlign: 'center',
              maxWidth: '800px',
              padding: '0 20px'
            }}>
              {getCaption(selectedImage)}
            </div>

            {/* Counter */}
            <div style={{
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: '14px',
              textAlign: 'center'
            }}>
              {aggregatedFiles.indexOf(selectedImage) + 1} / {aggregatedFiles.length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AggregatedResultsPage;
