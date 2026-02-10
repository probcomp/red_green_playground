import React from 'react';
import { Link } from 'react-router-dom';
import { ASSETS_BASE_PATH } from '../constants';
import { DIAMETERS, formatDiameter } from '../utils/diameterUtils';

const JTAP_LAST_DIAMETER_KEY = 'jtap_last_diameter';

function JTAPResultsPage() {
  // Last viewed diameter (session only: default 100%, persists until tab/window closes)
  const lastDiameter = (() => {
    try {
      const stored = sessionStorage.getItem(JTAP_LAST_DIAMETER_KEY);
      if (stored && DIAMETERS.includes(stored)) return stored;
    } catch (_) { /* ignore */ }
    return '100';
  })();

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
          to="/" 
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
          ← Back to Red-Green Playground
        </Link>
      </div>

      {/* Content */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <h1 style={{
          fontSize: '48px',
          fontWeight: '700',
          color: '#1e293b',
          marginBottom: '16px',
          letterSpacing: '-0.025em'
        }}>
          JTAP Results
        </h1>

        {/* Options Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '24px'
        }}>
          <Link
            to="/jtap/cogsci2025-tuned"
            style={{
              textDecoration: 'none',
              color: 'inherit'
            }}
          >
            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              padding: '32px',
              border: '2px solid #e2e8f0',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
              transition: 'all 0.2s ease',
              cursor: 'pointer',
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
            <img
              src={`${ASSETS_BASE_PATH}/with_occlusion.gif`}
              alt="Example stimulus trajectory GIF"
              style={{
                width: '192px',
                height: 'auto',
                marginBottom: '8px',
                borderRadius: '8px',
                border: '0.5px solid #000000'
              }}
            />
            <h2 style={{
              fontSize: '24px',
              fontWeight: '600',
              color: '#1e293b',
              margin: 0
            }}>
              Tuned Results for Cogsci 2025 Trials
            </h2>
            <p style={{
              fontSize: '16px',
              color: '#64748b',
              margin: 0,
              lineHeight: '1.6'
            }}>
              Trial-by-trial plots and aggregated results.
            </p>
          </div>
          </Link>

          <Link
            to="/jtap/candidate-trials"
            style={{
              textDecoration: 'none',
              color: 'inherit'
            }}
          >
            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              padding: '32px',
              border: '2px solid #e2e8f0',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
              transition: 'all 0.2s ease',
              cursor: 'pointer',
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
            <img
              src={`${ASSETS_BASE_PATH}/CandidateTrialsNov29_Plots/CT14A_trajectory.png`}
              alt="CT14A trajectory"
              style={{
                width: '192px',
                height: 'auto',
                marginBottom: '8px',
                borderRadius: '8px',
                border: '0.5px solid #000000'
              }}
            />
            <h2 style={{
              fontSize: '24px',
              fontWeight: '600',
              color: '#1e293b',
              margin: 0
            }}>
              New Candidate Trials
            </h2>
            <p style={{
              fontSize: '16px',
              color: '#64748b',
              margin: 0,
              lineHeight: '1.6'
            }}>
              Proposed experimental trials organized by category, including between-participants variants and single-variant trials.
            </p>
          </div>
          </Link>
        </div>

        {/* Extra Results Section – diameter and other analyses */}
        <h2 style={{
          fontSize: '36px',
          fontWeight: '700',
          color: '#1e293b',
          marginTop: '60px',
          marginBottom: '24px',
          letterSpacing: '-0.025em'
        }}>
          Extra Results
        </h2>
        <p style={{
          fontSize: '18px',
          color: '#64748b',
          marginBottom: '24px',
          lineHeight: '1.6'
        }}>
          Additional analyses beyond the main tuned and candidate trial results, including diameter variations and cardinal direction analyses.
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '24px',
          marginBottom: '40px'
        }}>
          {/* Diameter variation card */}
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              padding: '28px',
              border: '2px solid #e2e8f0',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
              e.currentTarget.style.borderColor = '#cbd5e1';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.05)';
              e.currentTarget.style.borderColor = '#e2e8f0';
            }}
          >
            <h3 style={{
              fontSize: '20px',
              fontWeight: '700',
              color: '#1e293b',
              margin: 0,
              lineHeight: '1.2'
            }}>
              Diameter variation
            </h3>
            {lastDiameter !== '100' && (
              <p style={{
                fontSize: '14px',
                color: '#64748b',
                margin: 0
              }}>
                Resuming at {formatDiameter(lastDiameter)}
              </p>
            )}
            <div style={{
              display: 'flex',
              gap: '12px',
              marginTop: '4px'
            }}>
              <Link
                to={`/jtap/diameter/${lastDiameter}/trial-by-trial`}
                style={{
                  flex: 1,
                  textDecoration: 'none',
                  color: 'inherit',
                  minWidth: 0
                }}
              >
                <div style={{
                  padding: '12px 16px',
                  backgroundColor: '#eff6ff',
                  borderRadius: '8px',
                  textAlign: 'center',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#3b82f6',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#dbeafe';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#eff6ff';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
                >
                  Trial-by-Trial
                </div>
              </Link>
              <Link
                to={`/jtap/diameter/${lastDiameter}/aggregated`}
                style={{
                  flex: 1,
                  textDecoration: 'none',
                  color: 'inherit',
                  minWidth: 0
                }}
              >
                <div style={{
                  padding: '12px 16px',
                  backgroundColor: '#f3e8ff',
                  borderRadius: '8px',
                  textAlign: 'center',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#8b5cf6',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#e9d5ff';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#f3e8ff';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
                >
                  Aggregated
                </div>
              </Link>
            </div>
          </div>

          {/* Cardinal direction analysis card */}
          <Link
            to="/jtap/cardinal-direction-analysis"
            style={{
              textDecoration: 'none',
              color: 'inherit'
            }}
          >
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                padding: '28px',
                border: '2px solid #e2e8f0',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                transition: 'all 0.2s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
                e.currentTarget.style.borderColor = '#cbd5e1';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.05)';
                e.currentTarget.style.borderColor = '#e2e8f0';
              }}
            >
              <h3
                style={{
                  fontSize: '20px',
                  fontWeight: '700',
                  color: '#1e293b',
                  margin: 0,
                  lineHeight: '1.2'
                }}
              >
                Cardinal direction analysis
              </h3>
              <p
                style={{
                  fontSize: '14px',
                  color: '#64748b',
                  margin: 0,
                  lineHeight: '1.6'
                }}
              >
                Explore 50 cardinal-direction plots (E1–E50), sorted by your chosen loss metric,
                and inspect the underlying trial-by-trial result for each direction.
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default JTAPResultsPage;

