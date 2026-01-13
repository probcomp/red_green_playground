import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ASSETS_BASE_PATH } from '../constants';
import { DIAMETERS, formatDiameter } from '../utils/diameterUtils';

function JTAPResultsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAll, setShowAll] = useState(false);

  // Filter diameters based on search term
  const filteredDiameters = DIAMETERS.filter(d => {
    if (!searchTerm) return true;
    const diameterInt = parseInt(d, 10);
    return diameterInt.toString().includes(searchTerm) || formatDiameter(d).includes(searchTerm);
  });

  // Show first 20 by default, or all if showAll is true
  const displayedDiameters = showAll ? filteredDiameters : filteredDiameters.slice(0, 20);

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

        {/* Diameter Results Section */}
        <h2 style={{
          fontSize: '36px',
          fontWeight: '700',
          color: '#1e293b',
          marginTop: '60px',
          marginBottom: '24px',
          letterSpacing: '-0.025em'
        }}>
          Diameter Variations
        </h2>
        <p style={{
          fontSize: '18px',
          color: '#64748b',
          marginBottom: '24px',
          lineHeight: '1.6'
        }}>
          Results for different simulation diameters (0% to 100% of original diameter, in 1% increments).
        </p>

        {/* Search and Filter Controls */}
        <div style={{
          display: 'flex',
          gap: '16px',
          alignItems: 'center',
          marginBottom: '24px',
          flexWrap: 'wrap'
        }}>
          <input
            type="text"
            placeholder="Search diameter (e.g., 50, 75%)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              padding: '10px 16px',
              fontSize: '16px',
              borderRadius: '8px',
              border: '2px solid #e2e8f0',
              backgroundColor: '#ffffff',
              color: '#1e293b',
              outline: 'none',
              transition: 'all 0.2s ease',
              minWidth: '250px',
              flex: '1 1 300px'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#3b82f6';
              e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#e2e8f0';
              e.target.style.boxShadow = 'none';
            }}
          />
          {!showAll && filteredDiameters.length > 20 && (
            <button
              onClick={() => setShowAll(true)}
              style={{
                padding: '10px 20px',
                fontSize: '16px',
                fontWeight: '600',
                borderRadius: '8px',
                border: '2px solid #3b82f6',
                backgroundColor: '#3b82f6',
                color: '#ffffff',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#2563eb';
                e.target.style.borderColor = '#2563eb';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#3b82f6';
                e.target.style.borderColor = '#3b82f6';
              }}
            >
              Show All ({filteredDiameters.length})
            </button>
          )}
          {showAll && (
            <button
              onClick={() => setShowAll(false)}
              style={{
                padding: '10px 20px',
                fontSize: '16px',
                fontWeight: '600',
                borderRadius: '8px',
                border: '2px solid #64748b',
                backgroundColor: '#ffffff',
                color: '#64748b',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#f1f5f9';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#ffffff';
              }}
            >
              Show Less
            </button>
          )}
        </div>

        {filteredDiameters.length === 0 ? (
          <div style={{
            padding: '40px',
            textAlign: 'center',
            color: '#64748b',
            fontSize: '18px'
          }}>
            No diameters found matching "{searchTerm}"
          </div>
        ) : (
          <>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '20px',
              marginBottom: '40px'
            }}>
              {displayedDiameters.map((diameter) => (
            <div
              key={diameter}
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                padding: '24px',
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
                {formatDiameter(diameter)} Diameter
              </h3>
              <div style={{
                display: 'flex',
                gap: '10px',
                marginTop: '4px'
              }}>
                <Link
                  to={`/jtap/diameter/${diameter}/trial-by-trial`}
                  style={{
                    flex: 1,
                    textDecoration: 'none',
                    color: 'inherit',
                    minWidth: 0
                  }}
                >
                  <div style={{
                    padding: '10px 14px',
                    backgroundColor: '#eff6ff',
                    borderRadius: '8px',
                    textAlign: 'center',
                    fontSize: '13px',
                    fontWeight: '600',
                    color: '#3b82f6',
                    transition: 'all 0.2s ease',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
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
                  to={`/jtap/diameter/${diameter}/aggregated`}
                  style={{
                    flex: 1,
                    textDecoration: 'none',
                    color: 'inherit',
                    minWidth: 0
                  }}
                >
                  <div style={{
                    padding: '10px 14px',
                    backgroundColor: '#f3e8ff',
                    borderRadius: '8px',
                    textAlign: 'center',
                    fontSize: '13px',
                    fontWeight: '600',
                    color: '#8b5cf6',
                    transition: 'all 0.2s ease',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
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
              ))}
            </div>
            {!showAll && filteredDiameters.length > 20 && (
              <div style={{
                textAlign: 'center',
                marginTop: '24px',
                color: '#64748b',
                fontSize: '14px'
              }}>
                Showing 20 of {filteredDiameters.length} diameters. Use search or click "Show All" to see more.
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default JTAPResultsPage;

