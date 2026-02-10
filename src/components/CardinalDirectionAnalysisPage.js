import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  metricNameMap,
  metricsEnabled,
  fetchAndParseMetricsCsv,
  computeSortedTrials
} from '../utils/jtapMetrics';

const ALL_TRIALS = Array.from({ length: 50 }, (_, i) => `E${i + 1}`);

function CardinalDirectionAnalysisPage() {
  const [selectedTrial, setSelectedTrial] = useState(null);
  const [showResultPlot, setShowResultPlot] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState(null);
  const [metricsData, setMetricsData] = useState(null);
  const [metricsLoading, setMetricsLoading] = useState(true);
  const [metricsError, setMetricsError] = useState(null);

  // Load metrics from CSV on component mount
  useEffect(() => {
    const loadMetrics = async () => {
      try {
        setMetricsLoading(true);
        setMetricsError(null);
        const parsedData = await fetchAndParseMetricsCsv('/metrics_csv');
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
  const { sortedTrials, trialRankings, trialLosses } = useMemo(
    () => computeSortedTrials({ metricsData, selectedMetric, allTrials: ALL_TRIALS }),
    [metricsData, selectedMetric]
  );

  const trials = sortedTrials;

  const navigateTrial = (direction) => {
    if (selectedTrial === null) return;
    const currentIndex = trials.indexOf(selectedTrial);
    const newIndex = currentIndex + direction;
    if (newIndex >= 0 && newIndex < trials.length) {
      setSelectedTrial(trials[newIndex]);
      setShowResultPlot(false);
    }
  };

  // Handle keyboard navigation for the modal
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
  }, [selectedTrial, trials]);

  const closeModal = () => {
    setSelectedTrial(null);
    setShowResultPlot(false);
  };

  const handleModalClick = (e) => {
    if (e.target.id === 'modal-backdrop') {
      closeModal();
    }
  };

  const selectedIndex =
    selectedTrial && selectedTrial.startsWith('E')
      ? parseInt(selectedTrial.slice(1), 10)
      : null;
  const selectedCardinalImageUrl =
    selectedIndex != null
      ? `https://redgreenplayground.s3.us-east-2.amazonaws.com/site_static_assets/cardinal_direction_analyses/E${selectedIndex}_directional_analysis.png`
      : null;

  return (
    <div
      style={{
        minHeight: '100vh',
        padding: '40px',
        backgroundColor: '#f8fafc',
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
      }}
    >
      {/* Navigation */}
      <div
        style={{
          marginBottom: '40px',
          paddingBottom: '20px',
          borderBottom: '2px solid #e2e8f0'
        }}
      >
        <Link
          to="/jtap"
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
          ← Back to JTAP Results
        </Link>
      </div>

      {/* Header */}
      <div
        style={{
          maxWidth: '1400px',
          margin: '0 auto 40px auto'
        }}
      >
        <h1
          style={{
            fontSize: '48px',
            fontWeight: '700',
            color: '#1e293b',
            marginBottom: '16px',
            letterSpacing: '-0.025em'
          }}
        >
          Cardinal Direction Analysis
        </h1>
        <p
          style={{
            fontSize: '20px',
            color: '#64748b',
            lineHeight: '1.6'
          }}
        >
          Explore 50 cardinal-direction summaries (E1–E50). Each card shows a directional analysis
          plot, and you can sort directions by the same loss/fit metrics used on the trial-by-trial
          page.
        </p>
      </div>

      {/* Sort by Metric Dropdown */}
      <div
        style={{
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
        }}
      >
        <label
          style={{
            fontSize: '16px',
            fontWeight: '500',
            color: '#1e293b',
            userSelect: 'none'
          }}
        >
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
          <option value="">No sorting (default E1–E50)</option>
          {metricsData &&
            Object.entries(metricsData)
              .filter(([key]) => metricsEnabled[key] !== false)
              .map(([key, metric]) => (
                <option key={key} value={key}>
                  {metric.name}
                </option>
              ))}
        </select>
        {metricsLoading && (
          <div
            style={{
              fontSize: '14px',
              color: '#64748b',
              marginLeft: 'auto'
            }}
          >
            Loading metrics...
          </div>
        )}
        {metricsError && (
          <div
            style={{
              fontSize: '14px',
              color: '#dc2626',
              marginLeft: 'auto'
            }}
          >
            Error loading metrics: {metricsError}
          </div>
        )}
        {selectedMetric && (
          <div
            style={{
              fontSize: '14px',
              color: '#64748b',
              marginLeft: 'auto'
            }}
          >
            Sorted from best to worst
          </div>
        )}
      </div>

      {/* Grid of 50 directional plots */}
      <div
        style={{
          maxWidth: '1400px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '24px',
          paddingBottom: '40px'
        }}
      >
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

          const index = parseInt(trialName.slice(1), 10);
          const cardinalImageUrl = `https://redgreenplayground.s3.us-east-2.amazonaws.com/site_static_assets/cardinal_direction_analyses/E${index}_directional_analysis.png`;

          return (
            <div
              key={trialName}
              onClick={() => setSelectedTrial(trialName)}
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
                <div
                  style={{
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
                  }}
                >
                  {ranking}
                </div>
              )}
              <img
                src={cardinalImageUrl}
                alt={`${trialName} directional analysis`}
                style={{
                  width: '100%',
                  height: 'auto',
                  borderRadius: '8px',
                  display: 'block'
                }}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentElement.innerHTML = `<div style="text-align: center; color: #64748b; padding: 20px;">${trialName}<br/>Directional analysis image not found</div>`;
                }}
              />
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                  width: '100%'
                }}
              >
                <div
                  style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#1e293b'
                  }}
                >
                  {trialName}
                </div>
                {selectedMetric && metricsData && (
                  metricIsInvalid ? (
                    <div
                      style={{
                        fontSize: '12px',
                        color: '#b91c1c',
                        fontWeight: '500',
                        textAlign: 'center'
                      }}
                    >
                      Metric invalid for this direction
                    </div>
                  ) : (
                    showRanking &&
                    loss !== undefined && (
                      <div
                        style={{
                          fontSize: '12px',
                          color: '#64748b',
                          fontWeight: '500'
                        }}
                      >
                        Loss/value: {loss.toFixed(6)}
                      </div>
                    )
                  )
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal for cardinal image with option to view underlying trial-by-trial plot (no video) */}
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
            <div
              style={{
                color: '#ffffff',
                fontSize: '24px',
                fontWeight: '600',
                textAlign: 'center'
              }}
            >
              {selectedTrial}{' '}
              {showResultPlot ? 'trial-by-trial plot' : 'cardinal-direction analysis'}
            </div>
            <button
              type="button"
              onClick={() => setShowResultPlot((prev) => !prev)}
              style={{
                marginTop: '4px',
                marginBottom: '8px',
                padding: '8px 16px',
                fontSize: '14px',
                fontWeight: '600',
                borderRadius: '999px',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: '#3b82f6',
                color: '#ffffff',
                boxShadow: '0 2px 8px rgba(59, 130, 246, 0.4)',
                transition: 'all 0.2s ease'
              }}
            >
              {showResultPlot ? 'Back to cardinal-direction image' : 'View trial-by-trial result plot'}
            </button>
            {showResultPlot ? (
              <img
                src={`https://redgreenplayground.s3.us-east-2.amazonaws.com/site_static_assets/cogsci_2025_trials_tuned_Jan102026/${selectedTrial}_plot.png`}
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
            ) : (
              <img
                src={selectedCardinalImageUrl}
                alt={`${selectedTrial} directional analysis`}
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
                  errorDiv.textContent = `Directional analysis image not found for ${selectedTrial}`;
                  e.target.parentElement.appendChild(errorDiv);
                }}
              />
            )}
            <div
              style={{
                color: 'rgba(255, 255, 255, 0.8)',
                fontSize: '16px',
                textAlign: 'center'
              }}
            >
              {trials.indexOf(selectedTrial) + 1} / {trials.length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CardinalDirectionAnalysisPage;

