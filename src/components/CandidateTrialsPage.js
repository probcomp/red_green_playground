import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// Category definitions
const categories = [
  {
    id: 'gap-from-edge',
    name: 'Gap from Edge',
    description: 'These trials vary how far the point of collision is from a barrier edge, or how far the object\'s trajectory is from a barrier edge assuming it does not collide. In condition A, the ball is always very close to the edge of a barrier (whether or not it collides). In conditions B and C, the trajectory of the ball comes at a different angle (with the same starting point), such that the gap is larger from the barrier edge (be it a collision or a bigger miss from the barrier edge). This is a between-participants condition where each participant sees only one variant (A, B, or C).',
    trials: ['CT1', 'CT2', 'CT3', 'CT4', 'CT5'],
    hasVariants: true
  },
  {
    id: 'occlusion-window',
    name: 'Occlusion Window',
    description: 'These trials feature window or slit gaps in the occluder. In condition A, there are no windows or gaps. In condition B, there is a window or slit that may overlap with the ball trajectory before a possible collision (note: it may or may not overlap). In condition C, there is a window or slit that may overlap with the ball trajectory after a possible collision. This is a between-participants condition where each participant sees only one variant (A, B, or C).',
    trials: ['CT6', 'CT7', 'CT8', 'CT9', 'CT10', 'CT11', 'CT12', 'CT13', 'CT14', 'CT15'],
    hasVariants: true
  },
  {
    id: 'regular-occlusion',
    name: 'Regular Occlusion Trials',
    description: 'These are regular trials with occlusion. All participants will see the same trials (no variants). Some of these are adaptations from the Cogsci 2025 trials.',
    trials: ['CT16', 'CT17', 'CT18', 'CT19', 'CT20', 'CT21', 'CT22', 'CT23', 'CT24', 'CT25', 'CT26', 'CT27'],
    hasVariants: false
  },
  {
    id: 'simple-filler-occlusion',
    name: 'Simple Filler Trials (with Occlusion)',
    description: 'These are simpler filler trials with occlusion. All participants will see the same trials (no variants). In these trials, we do not expect the model to do better than the baselines.',
    trials: ['CT28', 'CT29', 'CT30', 'CT31', 'CT32'],
    hasVariants: false
  },
  {
    id: 'filler-no-occlusion',
    name: 'Filler Trials (No Occlusion)',
    description: 'These are filler trials with no occlusion. All participants will see the same trials (no variants). Note: These trials are yet to be generated.',
    trials: Array.from({ length: 18 }, (_, i) => `CT${i + 33}`),
    hasVariants: false,
    notGenerated: true
  }
];

function CandidateTrialsPage() {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedTrial, setSelectedTrial] = useState(null);
  const [hidePlotInitially, setHidePlotInitially] = useState(false);
  const [plotRevealed, setPlotRevealed] = useState(new Set()); // Track which variants are revealed
  const [hideVideo, setHideVideo] = useState(false);
  const [showAllVariants, setShowAllVariants] = useState(false);
  const [expandedVariant, setExpandedVariant] = useState(null); // Track which variant is expanded in all-3 view

  const getTrialsForCategory = (category) => {
    if (category.hasVariants) {
      // For variant categories, group by base trial name
      const grouped = {};
      category.trials.forEach(baseTrial => {
        grouped[baseTrial] = [`${baseTrial}A`, `${baseTrial}B`, `${baseTrial}C`];
      });
      return grouped;
    } else {
      // For non-variant categories, return as array
      return category.trials;
    }
  };

  const getAllTrialsFlat = (category) => {
    if (category.hasVariants) {
      const allTrials = [];
      category.trials.forEach(baseTrial => {
        allTrials.push(`${baseTrial}A`, `${baseTrial}B`, `${baseTrial}C`);
      });
      return allTrials;
    } else {
      return category.trials;
    }
  };

  const navigateTrial = (direction) => {
    if (selectedTrial === null || selectedCategory === null) return;
    
    const allTrials = getAllTrialsFlat(selectedCategory);
    const currentIndex = allTrials.indexOf(selectedTrial);
    const newIndex = currentIndex + direction;
    
    if (newIndex >= 0 && newIndex < allTrials.length) {
      setSelectedTrial(allTrials[newIndex]);
      setPlotRevealed(new Set());
      setExpandedVariant(null);
    }
  };

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
  }, [selectedTrial, selectedCategory]);

  const openModal = (trialName) => {
    setSelectedTrial(trialName);
    setPlotRevealed(new Set());
    setExpandedVariant(null);
  };

  const closeModal = () => {
    setSelectedTrial(null);
    setPlotRevealed(new Set());
    setExpandedVariant(null);
  };

  const handleModalClick = (e) => {
    if (e.target.id === 'modal-backdrop') {
      closeModal();
    }
  };

  // If no category selected, show category selection
  if (selectedCategory === null) {
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
            Proposed Candidate Trials
          </h1>
          <p style={{
            fontSize: '20px',
            color: '#64748b',
            lineHeight: '1.6'
          }}>
            Here are some new experimental trials I am proposing, which I have divided up into 5 categories. For the first 2 categories, each trial has 3 variants, and each participant will only see one of the three variants. The other categories are just single-variant trials, where every participant will see the same trial. The goal of having a subset of trials with variants is to pick apart possible interesting differences in human judgments, which we hope our model will also capture. <strong>Note that since these are proposed trials, we only have model + baseline results and no human results yet. The model results use the tuned fit hyperparameters from the <Link to="/jtap/cogsci2025-tuned" style={{ color: '#3b82f6', textDecoration: 'underline' }}>Cogsci 2025 trials</Link></strong>. The current composition of trials is as follows:
            <ul>
              <li>Gap from Edge: 5 trials</li>
              <li>Occlusion Window: 10 trials</li>
              <li>Regular Occlusion Trials: 12 trials</li>
              <li>Simple Filler Trials (with Occlusion): 5 trials</li>
              <li>Filler Trials (No Occlusion): 18 trials (yet to be generated)</li>
            </ul>
            <strong>Total: 50 trials</strong>
          </p>
        </div>

        {/* Categories Grid */}
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
          gap: '24px'
        }}>
          {categories.map((category) => (
            <div
              key={category.id}
              onClick={() => setSelectedCategory(category)}
              style={{
                cursor: 'pointer',
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                padding: '32px',
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
                e.currentTarget.style.borderColor = '#3b82f6';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.05)';
                e.currentTarget.style.borderColor = '#e2e8f0';
              }}
            >
              <h2 style={{
                fontSize: '24px',
                fontWeight: '600',
                color: '#1e293b',
                margin: 0
              }}>
                {category.name}
              </h2>
              <p style={{
                fontSize: '16px',
                color: '#64748b',
                margin: 0,
                lineHeight: '1.6'
              }}>
                {category.description}
              </p>
              <div style={{
                fontSize: '14px',
                color: '#3b82f6',
                fontWeight: '500',
                marginTop: '8px'
              }}>
                {category.hasVariants 
                  ? `${category.trials.length} trials × 3 variants = ${category.trials.length * 3} total`
                  : `${category.trials.length} trials`}
                {category.notGenerated && ' (Not yet generated)'}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Category view with trials
  const category = selectedCategory; // selectedCategory is already the category object
  if (!category) {
    return null; // Safety check
  }
  const trialsData = getTrialsForCategory(category);
  const allTrials = getAllTrialsFlat(category);

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
        <button
          onClick={() => setSelectedCategory(null)}
          style={{ 
            color: '#3b82f6',
            textDecoration: 'none',
            fontSize: '16px',
            fontWeight: '600',
            padding: '8px 16px',
            borderRadius: '6px',
            backgroundColor: '#eff6ff',
            border: 'none',
            cursor: 'pointer',
            display: 'inline-block',
            transition: 'all 0.2s ease',
            marginRight: '16px',
            fontFamily: 'inherit'
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
          ← Back to Categories
        </button>
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
          {category.name}
        </h1>
        <p style={{
          fontSize: '20px',
          color: '#64748b',
          lineHeight: '1.6',
          marginBottom: '24px'
        }}>
          {category.description}
        </p>
      </div>

      {/* Toggles */}
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
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
        flexWrap: 'wrap'
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
          <span>Hide results plot initially</span>
        </label>

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

        {category.hasVariants && (
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
            <div
              onClick={() => setShowAllVariants(!showAllVariants)}
              style={{
                position: 'relative',
                width: '56px',
                height: '32px',
                borderRadius: '16px',
                backgroundColor: showAllVariants ? '#3b82f6' : '#e2e8f0',
                transition: 'background-color 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                cursor: 'pointer',
                flexShrink: 0,
                boxShadow: showAllVariants 
                  ? '0 2px 8px rgba(59, 130, 246, 0.4)' 
                  : 'inset 0 2px 4px rgba(0, 0, 0, 0.1)'
              }}
              onMouseEnter={(e) => {
                if (!showAllVariants) {
                  e.currentTarget.style.backgroundColor = '#cbd5e1';
                }
              }}
              onMouseLeave={(e) => {
                if (!showAllVariants) {
                  e.currentTarget.style.backgroundColor = '#e2e8f0';
                }
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: '3px',
                  left: showAllVariants ? '27px' : '3px',
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
                {showAllVariants && (
                  <span style={{ fontSize: '14px', lineHeight: '1' }}>📊</span>
                )}
              </div>
            </div>
            <span>Show all 3 variants' plots</span>
          </label>
        )}
      </div>

      {/* Trials Grid */}
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: category.hasVariants 
          ? 'repeat(auto-fill, minmax(600px, 1fr))' 
          : 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: '24px',
        paddingBottom: '40px'
      }}>
        {category.hasVariants ? (
          // Render grouped variants
          Object.entries(trialsData).map(([baseTrial, variants]) => (
            <div
              key={baseTrial}
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                padding: '20px',
                border: '2px solid #e2e8f0',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
              }}
            >
              <div style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#1e293b',
                textAlign: 'center',
                marginBottom: '8px'
              }}>
                {baseTrial} (Variants A, B, C)
              </div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '12px'
              }}>
                {variants.map((variant) => {
                  const isGenerated = parseInt(variant.replace('CT', '').replace(/[ABC]/, '')) <= 32;
                  return (
                    <div
                      key={variant}
                      data-base-trial={baseTrial}
                      onClick={() => isGenerated && openModal(variant)}
                      style={{
                        cursor: isGenerated ? 'pointer' : 'default',
                        opacity: isGenerated ? 1 : 0.5,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '8px',
                        transition: 'all 0.2s ease',
                        padding: '8px',
                        borderRadius: '8px',
                        border: '2px solid transparent'
                      }}
                      onMouseEnter={(e) => {
                        if (isGenerated) {
                          if (showAllVariants) {
                            // Highlight all variants in the same group
                            const baseTrialValue = e.currentTarget.getAttribute('data-base-trial');
                            const allVariants = document.querySelectorAll(`[data-base-trial="${baseTrialValue}"]`);
                            allVariants.forEach((el) => {
                              el.style.transform = 'translateY(-4px)';
                              el.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.1)';
                              el.style.borderColor = '#3b82f6';
                            });
                          } else {
                            e.currentTarget.style.transform = 'translateY(-4px)';
                          }
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (isGenerated) {
                          if (showAllVariants) {
                            // Reset all variants in the same group
                            const baseTrialValue = e.currentTarget.getAttribute('data-base-trial');
                            const allVariants = document.querySelectorAll(`[data-base-trial="${baseTrialValue}"]`);
                            allVariants.forEach((el) => {
                              el.style.transform = 'translateY(0)';
                              el.style.boxShadow = 'none';
                              el.style.borderColor = 'transparent';
                            });
                          } else {
                            e.currentTarget.style.transform = 'translateY(0)';
                          }
                        }
                      }}
                    >
                      <img
                        src={`/CandidateTrialsNov29_Plots/${variant}_trajectory.png`}
                        alt={`${variant} trajectory`}
                        style={{
                          width: '100%',
                          height: 'auto',
                          borderRadius: '8px',
                          border: '2px solid #e2e8f0',
                          display: 'block'
                        }}
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                      <div style={{
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#1e293b'
                      }}>
                        {variant}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        ) : (
          // Render single trials
          category.trials.map((trialName) => {
            const trialNum = parseInt(trialName.replace('CT', ''));
            const isGenerated = trialNum <= 32;
            return (
              <div
                key={trialName}
                onClick={() => isGenerated && openModal(trialName)}
                style={{
                  cursor: isGenerated ? 'pointer' : 'default',
                  opacity: isGenerated ? 1 : 0.5,
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  padding: '16px',
                  border: '2px solid #e2e8f0',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '12px'
                }}
                onMouseEnter={(e) => {
                  if (isGenerated) {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.1)';
                    e.currentTarget.style.borderColor = '#3b82f6';
                  }
                }}
                onMouseLeave={(e) => {
                  if (isGenerated) {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.05)';
                    e.currentTarget.style.borderColor = '#e2e8f0';
                  }
                }}
              >
                {isGenerated ? (
                  <img
                    src={`/CandidateTrialsNov29_Plots/${trialName}_trajectory.png`}
                    alt={`${trialName} trajectory`}
                    style={{
                      width: '100%',
                      height: 'auto',
                      borderRadius: '8px',
                      display: 'block'
                    }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                ) : (
                  <div style={{
                    width: '100%',
                    aspectRatio: '1',
                    backgroundColor: '#f1f5f9',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#64748b',
                    fontSize: '14px'
                  }}>
                    Not yet generated
                  </div>
                )}
                <div style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#1e293b'
                }}>
                  {trialName}
                </div>
              </div>
            );
          })
        )}
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
          {allTrials.indexOf(selectedTrial) > 0 && (
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
          {allTrials.indexOf(selectedTrial) < allTrials.length - 1 && (
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
              {category.hasVariants && showAllVariants && selectedTrial.match(/^CT\d+[ABC]$/)
                ? selectedTrial.replace(/[ABC]$/, '') + ' (All Variants)'
                : selectedTrial}
            </div>

            {/* Check if showing all variants for this trial */}
            {category.hasVariants && showAllVariants && selectedTrial.match(/^CT\d+[ABC]$/) && (() => {
              const baseTrial = selectedTrial.replace(/[ABC]$/, '');
              const variants = [`${baseTrial}A`, `${baseTrial}B`, `${baseTrial}C`];
              
              return (
                <div style={{
                  width: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '24px'
                }}>
                  {/* Hint text */}
                  <div style={{
                    color: '#ffffff',
                    fontSize: '16px',
                    textAlign: 'center',
                    fontWeight: '500',
                    marginBottom: '8px',
                    padding: '12px',
                    backgroundColor: 'rgba(59, 130, 246, 0.2)',
                    borderRadius: '8px',
                    border: '1px solid rgba(59, 130, 246, 0.4)'
                  }}>
                    💡 Double-click any plot or video to expand it
                  </div>

                  {/* Videos on top if not hidden */}
                  {!hideVideo && (
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: expandedVariant && expandedVariant.startsWith('video-')
                        ? variants.map(v => expandedVariant === `video-${v}` ? '2fr' : '1fr').join(' ')
                        : 'repeat(3, 1fr)',
                      gap: '16px',
                      width: '100%',
                      transition: 'grid-template-columns 0.3s ease'
                    }}>
                      {variants.map((variant) => {
                        const isExpanded = expandedVariant === `video-${variant}`;
                        return (
                          <div 
                            key={variant} 
                            onDoubleClick={() => setExpandedVariant(isExpanded ? null : `video-${variant}`)}
                            style={{
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              gap: '8px',
                              cursor: 'pointer',
                              transition: 'all 0.3s ease',
                              transform: isExpanded ? 'scale(1.05)' : 'scale(1)',
                              zIndex: isExpanded ? 10 : 1
                            }}
                          >
                            <div style={{
                              color: '#ffffff',
                              fontSize: '16px',
                              fontWeight: '500',
                              marginBottom: '8px'
                            }}>
                              {variant}
                            </div>
                            <video
                              key={variant}
                              src={`/CandidateTrialsNov29_Plots/${variant}_stimulus.webm`}
                              controls
                              onDoubleClick={(e) => {
                                e.stopPropagation();
                                setExpandedVariant(isExpanded ? null : `video-${variant}`);
                              }}
                              style={{
                                width: '100%',
                                height: 'auto',
                                maxHeight: isExpanded ? '50vh' : '40vh',
                                borderRadius: '8px',
                                boxShadow: isExpanded 
                                  ? '0 20px 60px rgba(59, 130, 246, 0.5)' 
                                  : '0 20px 60px rgba(0, 0, 0, 0.3)',
                                backgroundColor: '#000000',
                                transition: 'all 0.3s ease',
                                border: isExpanded ? '2px solid #3b82f6' : '2px solid transparent'
                              }}
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            >
                              Your browser does not support the video tag.
                            </video>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Plots on bottom */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: expandedVariant && expandedVariant.startsWith('plot-')
                      ? variants.map(v => expandedVariant === `plot-${v}` ? '4fr' : '1fr').join(' ')
                      : 'repeat(3, 1fr)',
                    gap: '16px',
                    width: '100%',
                    transition: 'grid-template-columns 0.3s ease'
                  }}>
                    {variants.map((variant) => {
                      const isRevealed = plotRevealed.has(variant);
                      const isExpanded = expandedVariant === `plot-${variant}`;
                      return (
                        <div 
                          key={variant} 
                          onDoubleClick={() => setExpandedVariant(isExpanded ? null : `plot-${variant}`)}
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '8px',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            transform: isExpanded ? 'scale(1.05)' : 'scale(1)',
                            zIndex: isExpanded ? 10 : 1,
                            padding: isExpanded ? '0' : '0',
                            margin: '0'
                          }}
                        >
                          <div style={{
                            color: '#ffffff',
                            fontSize: '16px',
                            fontWeight: '500',
                            marginBottom: '8px'
                          }}>
                            {variant}
                          </div>
                          {hidePlotInitially && !isRevealed ? (
                            <div style={{
                              width: '100%',
                              minHeight: '300px',
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
                            onClick={(e) => {
                              e.stopPropagation();
                              setPlotRevealed(new Set([...plotRevealed, variant]));
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
                                fontSize: '16px',
                                fontWeight: '500',
                                padding: '20px'
                              }}>
                                Click to see results
                              </div>
                            </div>
                          ) : (
                            <img
                              src={`/CandidateTrialsNov29_Plots/${variant}_plot.png`}
                              alt={`${variant} plot`}
                              onDoubleClick={(e) => {
                                e.stopPropagation();
                                setExpandedVariant(isExpanded ? null : `plot-${variant}`);
                              }}
                              style={{
                                width: '100%',
                                height: 'auto',
                                maxHeight: isExpanded ? '60vh' : '50vh',
                                borderRadius: '8px',
                                boxShadow: isExpanded 
                                  ? '0 20px 60px rgba(59, 130, 246, 0.5)' 
                                  : '0 20px 60px rgba(0, 0, 0, 0.3)',
                                backgroundColor: isExpanded ? 'transparent' : '#ffffff',
                                padding: isExpanded ? '0' : '8px',
                                objectFit: 'contain',
                                transition: 'all 0.3s ease',
                                border: isExpanded ? '2px solid #3b82f6' : '2px solid transparent',
                                display: 'block'
                              }}
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

            {/* Regular single trial view */}
            {!(category.hasVariants && showAllVariants && selectedTrial.match(/^CT\d+[ABC]$/)) && (
              <div style={{
                display: 'flex',
                flexDirection: hideVideo ? 'column' : 'row',
                gap: '24px',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                maxHeight: '75vh',
                flexWrap: 'wrap'
              }}>
                {/* Plot */}
                <div 
                  style={{
                    flex: hideVideo ? '1 1 100%' : '1 1 50%',
                    minWidth: hideVideo ? 'min(600px, 100%)' : 'min(400px, 100%)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '12px',
                    padding: 0
                  }}
                  onClick={() => {
                    if (hidePlotInitially && !plotRevealed.has(selectedTrial)) {
                      setPlotRevealed(new Set([...plotRevealed, selectedTrial]));
                    }
                  }}
                >
                  {hidePlotInitially && !plotRevealed.has(selectedTrial) ? (
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
                        Click to see results
                      </div>
                    </div>
                  ) : (
                    <img
                      src={`/CandidateTrialsNov29_Plots/${selectedTrial}_plot.png`}
                      alt={`${selectedTrial} plot`}
                      style={{
                        width: '100%',
                        height: 'auto',
                        maxHeight: '75vh',
                        borderRadius: '8px',
                        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
                        backgroundColor: '#ffffff',
                        padding: 0,
                        objectFit: 'contain'
                      }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  )}
                </div>

                {/* Video */}
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
                      key={selectedTrial}
                      src={`/CandidateTrialsNov29_Plots/${selectedTrial}_stimulus.webm`}
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
                      }}
                    >
                      Your browser does not support the video tag.
                    </video>
                  </div>
                )}
              </div>
            )}

            {/* Trial Counter */}
            <div style={{
              color: 'rgba(255, 255, 255, 0.8)',
              fontSize: '16px',
              textAlign: 'center'
            }}>
              {allTrials.indexOf(selectedTrial) + 1} / {allTrials.length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CandidateTrialsPage;

