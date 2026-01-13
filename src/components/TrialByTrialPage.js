import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ASSETS_BASE_PATH } from '../constants';

// Metric name mappings from CSV column names to display names and keys
const metricNameMap = {
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
const higherBetterMetrics = new Set([
  'discrete_mutual_information',
  'red_green_ordering',
  'decision_prob_correlation',
  'green_given_decision_correlation'
]);

// Enable/disable metrics - set to false to hide a metric from the dropdown
const metricsEnabled = {
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

// Parse CSV text into structured data
const parseCSV = (csvText) => {
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
          value = isNaN(parsed) ? NaN : parsed;
        }
        
        data[metricInfo.key].data[trialName] = value;
      }
    }
  }

  return data;
};

function TrialByTrialPage() {
  const [selectedTrial, setSelectedTrial] = useState(null);
  const [hidePlotInitially, setHidePlotInitially] = useState(false);
  const [plotRevealed, setPlotRevealed] = useState(false);
  const [hideVideo, setHideVideo] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState(null);
  const [metricsData, setMetricsData] = useState(null);
  const [metricsLoading, setMetricsLoading] = useState(true);
  const [metricsError, setMetricsError] = useState(null);
  const allTrials = Array.from({ length: 50 }, (_, i) => `E${i + 1}`);

  // Load metrics from CSV on component mount
  useEffect(() => {
    const loadMetrics = async () => {
      try {
        setMetricsLoading(true);
        setMetricsError(null);
        
        // Use backend proxy endpoint to avoid CORS issues
        const response = await fetch('/metrics_csv');
        
        if (!response.ok) {
          throw new Error(`Failed to load metrics CSV: ${response.status} ${response.statusText}`);
        }
        
        const csvText = await response.text();
        const parsedData = parseCSV(csvText);
        
        if (!parsedData) {
          throw new Error('Failed to parse CSV data');
        }
        
        setMetricsData(parsedData);
      } catch (error) {
        console.error('Error loading metrics:', error);
        setMetricsError(error.message);
      } finally {
        setMetricsLoading(false);
      }
    };

    loadMetrics();
  }, []);

  // Compute sorted trials based on selected metric
  const { sortedTrials, trialRankings, trialLosses } = useMemo(() => {
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
      .sort((a, b) => isHigherBetter ? b.loss - a.loss : a.loss - b.loss); // Sort from best to worst

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
  }, [selectedMetric, allTrials, metricsData]);

  const trials = sortedTrials;

  const navigateTrial = (direction) => {
    if (selectedTrial === null) return;
    
    const currentIndex = trials.indexOf(selectedTrial);
    const newIndex = currentIndex + direction;
    
    if (newIndex >= 0 && newIndex < trials.length) {
      setSelectedTrial(trials[newIndex]);
      setPlotRevealed(false); // Reset plot reveal when navigating
    }
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (selectedTrial === null) return;

      if (e.key === 'Escape') {
        setSelectedTrial(null);
      } else if (e.key === 'ArrowLeft') {
        navigateTrial(-1);
      } else if (e.key === 'ArrowRight') {
        navigateTrial(1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTrial]);

  const openModal = (trialName) => {
    setSelectedTrial(trialName);
    setPlotRevealed(false); // Reset plot reveal when opening a new trial
  };

  const closeModal = () => {
    setSelectedTrial(null);
    setPlotRevealed(false); // Reset plot reveal when closing
  };

  const handleModalClick = (e) => {
    // Close modal if clicking on the backdrop (not the image)
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
          Trial-by-Trial Plots
        </h1>
        <p style={{
          fontSize: '20px',
          color: '#64748b',
          lineHeight: '1.6'
        }}>
          In each plot, you will see a dark gray and light gray region. The dark gray region means that the ball if fully occluded, while the light gray region means that the ball is partially occluded. Any other region implies that the ball is fully visible.
        </p>
      </div>

      {/* Toggle for Hide Plot Initially */}
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto 40px auto',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '16px 24px',
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        border: '2px solid #e2e8f0',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
      }}>
        <label style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          cursor: 'pointer',
          fontSize: '16px',
          fontWeight: '500',
          color: '#1e293b',
          userSelect: 'none'
        }}>
          {/* Custom Toggle Switch */}
          <div
            onClick={() => setHidePlotInitially(!hidePlotInitially)}
            style={{
              position: 'relative',
              width: '56px',
              height: '32px',
              borderRadius: '16px',
              backgroundColor: hidePlotInitially ? '#3b82f6' : '#e2e8f0',
              transition: 'background-color 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              cursor: 'pointer',
              flexShrink: 0,
              boxShadow: hidePlotInitially 
                ? '0 2px 8px rgba(59, 130, 246, 0.4)' 
                : 'inset 0 2px 4px rgba(0, 0, 0, 0.1)'
            }}
            onMouseEnter={(e) => {
              if (!hidePlotInitially) {
                e.currentTarget.style.backgroundColor = '#cbd5e1';
              }
            }}
            onMouseLeave={(e) => {
              if (!hidePlotInitially) {
                e.currentTarget.style.backgroundColor = '#e2e8f0';
              }
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: '3px',
                left: hidePlotInitially ? '27px' : '3px',
                width: '26px',
                height: '26px',
                borderRadius: '50%',
                backgroundColor: '#ffffff',
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.25), 0 1px 2px rgba(0, 0, 0, 0.15)',
                transition: 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {hidePlotInitially && (
                <span style={{ fontSize: '14px', lineHeight: '1' }}>👁️</span>
              )}
            </div>
          </div>
          <span>Hide results plot initially (click plot to reveal)</span>
        </label>
        
        {/* Toggle for Hide Video */}
        <label style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          cursor: 'pointer',
          fontSize: '16px',
          fontWeight: '500',
          color: '#1e293b',
          userSelect: 'none',
          marginLeft: '32px',
          paddingLeft: '32px',
          borderLeft: '1px solid #e2e8f0'
        }}>
          {/* Custom Toggle Switch */}
          <div
            onClick={() => setHideVideo(!hideVideo)}
            style={{
              position: 'relative',
              width: '56px',
              height: '32px',
              borderRadius: '16px',
              backgroundColor: hideVideo ? '#3b82f6' : '#e2e8f0',
              transition: 'background-color 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              cursor: 'pointer',
              flexShrink: 0,
              boxShadow: hideVideo 
                ? '0 2px 8px rgba(59, 130, 246, 0.4)' 
                : 'inset 0 2px 4px rgba(0, 0, 0, 0.1)'
            }}
            onMouseEnter={(e) => {
              if (!hideVideo) {
                e.currentTarget.style.backgroundColor = '#cbd5e1';
              }
            }}
            onMouseLeave={(e) => {
              if (!hideVideo) {
                e.currentTarget.style.backgroundColor = '#e2e8f0';
              }
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: '3px',
                left: hideVideo ? '27px' : '3px',
                width: '26px',
                height: '26px',
                borderRadius: '50%',
                backgroundColor: '#ffffff',
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.25), 0 1px 2px rgba(0, 0, 0, 0.15)',
                transition: 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {hideVideo && (
                <span style={{ fontSize: '14px', lineHeight: '1' }}>🎥</span>
              )}
            </div>
          </div>
          <span>Hide video</span>
        </label>
        
        <div style={{
          fontSize: '14px',
          color: '#64748b',
          marginLeft: 'auto'
        }}>
          {hidePlotInitially 
            ? 'Video will show first, click plot area to reveal results' 
            : hideVideo
            ? 'Only results plot will show'
            : 'Both results plot and video will show together'}
        </div>
      </div>

      {/* Sort by Metric Dropdown */}
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto 40px auto',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        padding: '16px 24px',
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        border: '2px solid #e2e8f0',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
      }}>
        <label style={{
          fontSize: '16px',
          fontWeight: '500',
          color: '#1e293b',
          userSelect: 'none'
        }}>
          Sort by metric:
        </label>
        <select
          value={selectedMetric || ''}
          onChange={(e) => setSelectedMetric(e.target.value || null)}
          style={{
            padding: '8px 16px',
            fontSize: '16px',
            borderRadius: '8px',
            border: '2px solid #e2e8f0',
            backgroundColor: '#ffffff',
            color: '#1e293b',
            cursor: 'pointer',
            outline: 'none',
            transition: 'all 0.2s ease',
            minWidth: '300px'
          }}
          onFocus={(e) => {
            e.target.style.borderColor = '#3b82f6';
            e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = '#e2e8f0';
            e.target.style.boxShadow = 'none';
          }}
        >
          <option value="">No sorting (default)</option>
          {metricsData && Object.entries(metricsData)
            .filter(([key]) => metricsEnabled[key] !== false)
            .map(([key, metric]) => (
              <option key={key} value={key}>
                {metric.name}
              </option>
            ))}
        </select>
        {metricsLoading && (
          <div style={{
            fontSize: '14px',
            color: '#64748b',
            marginLeft: 'auto'
          }}>
            Loading metrics...
          </div>
        )}
        {metricsError && (
          <div style={{
            fontSize: '14px',
            color: '#dc2626',
            marginLeft: 'auto'
          }}>
            Error loading metrics: {metricsError}
          </div>
        )}
        {selectedMetric && (
          <div style={{
            fontSize: '14px',
            color: '#64748b',
            marginLeft: 'auto'
          }}>
            Sorted from best to worst
          </div>
        )}
      </div>

      {/* Trials Grid */}
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: '24px',
        paddingBottom: '40px'
      }}>
        {trials.map((trialName) => {
          const ranking = trialRankings[trialName];
          const loss = trialLosses[trialName];
          const showRanking = selectedMetric && ranking !== undefined;
          const metricValue =
            selectedMetric && metricsData && metricsData[selectedMetric]
              ? metricsData[selectedMetric].data[trialName]
              : undefined;
          const metricIsInvalid =
            !!selectedMetric &&
            (typeof metricValue !== 'number' || Number.isNaN(metricValue));
          
          return (
            <div
              key={trialName}
              onClick={() => openModal(trialName)}
              style={{
                cursor: 'pointer',
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                padding: '16px',
                border: '2px solid #e2e8f0',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                transition: 'all 0.2s ease',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px',
                position: 'relative'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.1)';
                e.currentTarget.style.borderColor = '#3b82f6';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.05)';
                e.currentTarget.style.borderColor = '#e2e8f0';
              }}
            >
              {showRanking && (
                <div style={{
                  position: 'absolute',
                  top: '8px',
                  left: '8px',
                  backgroundColor: '#3b82f6',
                  color: '#ffffff',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                  fontWeight: '700',
                  boxShadow: '0 2px 8px rgba(59, 130, 246, 0.4)',
                  zIndex: 1
                }}>
                  {ranking}
                </div>
              )}
              <img
                src={`${ASSETS_BASE_PATH}/cogsci_2025_trials_tuned_Jan102026/${trialName}_trajectory.png`}
                alt={`${trialName} trajectory`}
                style={{
                  width: '100%',
                  height: 'auto',
                  borderRadius: '8px',
                  display: 'block'
                }}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentElement.innerHTML = `<div style="text-align: center; color: #64748b; padding: 20px;">${trialName}<br/>Image not found</div>`;
                }}
              />
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                width: '100%'
              }}>
                <div style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#1e293b'
                }}>
                  {trialName}
                </div>
                {selectedMetric && metricsData && (
                  metricIsInvalid ? (
                    <div style={{
                      fontSize: '12px',
                      color: '#b91c1c',
                      fontWeight: '500',
                      textAlign: 'center'
                    }}>
                      Metric invalid for this trial
                    </div>
                  ) : (
                    showRanking && loss !== undefined && (
                      <div style={{
                        fontSize: '12px',
                        color: '#64748b',
                        fontWeight: '500'
                      }}>
                        {(selectedMetric === 'discrete_mutual_information' ||
                          selectedMetric === 'red_green_ordering' ||
                          selectedMetric === 'decision_prob_correlation' ||
                          selectedMetric === 'green_given_decision_correlation')
                          ? 'Value'
                          : 'Loss'}: {loss.toFixed(6)}
                      </div>
                    )
                  )
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {selectedTrial && (
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
            padding: '40px'
          }}
        >
          {/* Close Button */}
          <button
            onClick={closeModal}
            style={{
              position: 'absolute',
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
          {trials.indexOf(selectedTrial) > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigateTrial(-1);
              }}
              style={{
                position: 'absolute',
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
          {trials.indexOf(selectedTrial) < trials.length - 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigateTrial(1);
              }}
              style={{
                position: 'absolute',
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
              maxWidth: '95vw',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '20px',
              width: '100%',
              overflow: 'auto'
            }}
          >
            {/* Trial Name */}
            <div style={{
              color: '#ffffff',
              fontSize: '24px',
              fontWeight: '600',
              textAlign: 'center'
            }}>
              {selectedTrial}
            </div>

            {/* Plot and Video Container */}
            <div style={{
              display: 'flex',
              flexDirection: 'row',
              gap: '24px',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              maxHeight: '75vh',
              flexWrap: 'wrap'
            }}>
              {/* Plot Image */}
              <div 
                style={{
                  flex: hideVideo ? '1 1 100%' : '1 1 50%',
                  minWidth: hideVideo ? 'min(600px, 100%)' : 'min(400px, 100%)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '12px'
                }}
                onClick={() => {
                  if (hidePlotInitially && !plotRevealed) {
                    setPlotRevealed(true);
                  }
                }}
              >
                {hidePlotInitially && !plotRevealed ? (
                  <div style={{
                    width: '100%',
                    minHeight: '400px',
                    maxHeight: '75vh',
                    borderRadius: '8px',
                    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    border: '2px dashed rgba(255, 255, 255, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.5)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                  }}
                  >
                    <div style={{
                      textAlign: 'center',
                      color: 'rgba(255, 255, 255, 0.8)',
                      fontSize: '18px',
                      fontWeight: '500',
                      padding: '20px'
                    }}>
                      <div>Click to see results</div>
                    </div>
                  </div>
                ) : (
                  <img
                    src={`${ASSETS_BASE_PATH}/cogsci_2025_trials_tuned_Jan102026/${selectedTrial}_plot.png`}
                    alt={`${selectedTrial} plot`}
                    style={{
                      width: '100%',
                      height: 'auto',
                      maxHeight: '75vh',
                      borderRadius: '8px',
                      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
                      backgroundColor: '#ffffff',
                      padding: '8px',
                      objectFit: 'contain'
                    }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      const errorDiv = document.createElement('div');
                      errorDiv.style.cssText = `
                        color: #ffffff; 
                        text-align: center; 
                        padding: 40px;
                        font-size: 18px;
                      `;
                      errorDiv.textContent = `Image not found for ${selectedTrial}`;
                      e.target.parentElement.appendChild(errorDiv);
                    }}
                  />
                )}
              </div>

              {/* Video Player */}
              {!hideVideo && (
                <div style={{
                  flex: '1 1 40%',
                  minWidth: 'min(300px, 100%)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <video
                    key={selectedTrial} // Force re-render when trial changes
                    src={`${ASSETS_BASE_PATH}/cogsci_2025_trials_tuned_Jan102026/${selectedTrial}_stimulus.mp4`}
                    controls
                    style={{
                      width: '100%',
                      height: 'auto',
                      maxHeight: '75vh',
                      borderRadius: '8px',
                      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
                      backgroundColor: '#000000'
                    }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      const errorDiv = document.createElement('div');
                      errorDiv.style.cssText = `
                        color: #ffffff; 
                        text-align: center; 
                        padding: 40px;
                        font-size: 18px;
                        background: rgba(255, 255, 255, 0.1);
                        border-radius: 8px;
                      `;
                      errorDiv.textContent = `Video not found for ${selectedTrial}`;
                      e.target.parentElement.appendChild(errorDiv);
                    }}
                  >
                    Your browser does not support the video tag.
                  </video>
                </div>
              )}
            </div>

            {/* Trial Counter */}
            <div style={{
              color: 'rgba(255, 255, 255, 0.8)',
              fontSize: '16px',
              textAlign: 'center'
            }}>
              {trials.indexOf(selectedTrial) + 1} / {trials.length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TrialByTrialPage;

