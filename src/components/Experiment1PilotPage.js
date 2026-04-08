import React from 'react';
import { Link } from 'react-router-dom';
import { ASSETS_BASE_PATH } from '../constants';
import { EXPERIMENT_1_PILOT_GROUPS } from './experiment1PilotGroups';

function Experiment1PilotPage() {
  return (
    <div style={{
      minHeight: '100vh',
      padding: '40px',
      backgroundColor: '#f8fafc',
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
    }}>
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
          Experiment 1 Pilot
        </h1>
        <p style={{
          fontSize: '20px',
          color: '#64748b',
          lineHeight: '1.6',
          marginBottom: '24px'
        }}>
          The pilot set is organized into four stimulus sets plus a remaining-trials bucket. Start with a stimulus set, then switch to all trials if you want the full set.
        </p>

        <div style={{
          display: 'flex',
          gap: '12px',
          marginBottom: '24px',
          flexWrap: 'wrap'
        }}>
          <Link
            to="/jtap/experiment-1-pilot/trial-by-trial"
            style={{
              textDecoration: 'none',
              color: 'inherit'
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
              cursor: 'pointer'
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
              All trials
            </div>
          </Link>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '24px'
        }}>
          {EXPERIMENT_1_PILOT_GROUPS.map((group) => (
            <Link
              key={group.key}
              to={`/jtap/experiment-1-pilot/trial-by-trial?group=${group.key}`}
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
                  gap: '14px',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer'
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
                  fontSize: '22px',
                  fontWeight: '700',
                  color: '#1e293b',
                  margin: 0
                }}>
                  {group.label}
                </h2>
                <p style={{
                  fontSize: '15px',
                  color: '#64748b',
                  margin: 0,
                  lineHeight: '1.6'
                }}>
                  {group.description}
                </p>
                <div style={{
                  fontSize: '14px',
                  color: '#3b82f6',
                  fontWeight: '600'
                }}>
                  {group.expectedCount} trials
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div style={{
          marginTop: '32px',
          padding: '20px',
          borderRadius: '12px',
          backgroundColor: '#ffffff',
          border: '2px solid #e2e8f0'
        }}>
          <p style={{
            margin: 0,
            fontSize: '15px',
            color: '#64748b',
            lineHeight: '1.6'
          }}>
            The underlying plots and videos are loaded from `jtap_experiment_1_pilot_v1`.
          </p>
          <div style={{ marginTop: '12px' }}>
            <img
              src={`${ASSETS_BASE_PATH}/with_occlusion.gif`}
              alt="Example stimulus trajectory GIF"
              style={{
                width: '160px',
                height: 'auto',
                borderRadius: '8px',
                border: '0.5px solid #000000'
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Experiment1PilotPage;
