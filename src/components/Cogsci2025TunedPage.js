import React from 'react';
import { Link } from 'react-router-dom';

// Get build date from process.env or use a fallback
const getBuildDate = () => {
  // Try to get from environment variable (set during build)
  if (process.env.REACT_APP_BUILD_DATE) {
    const buildDate = new Date(process.env.REACT_APP_BUILD_DATE);
    // Check if date is valid
    if (!isNaN(buildDate.getTime())) {
      return buildDate;
    }
  }
  // Fallback: use current date (for development)
  return new Date();
};

function Cogsci2025TunedPage() {
  const buildDate = getBuildDate();
  const formattedDate = buildDate.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

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
        borderBottom: '2px solid #e2e8f0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
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
        <div style={{
          fontSize: '14px',
          color: '#64748b',
          padding: '6px 12px',
          backgroundColor: '#f1f5f9',
          borderRadius: '6px',
          fontWeight: '500'
        }}>
          Last updated: {formattedDate}
        </div>
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
          Tuned Results for Cogsci 2025 Trials
        </h1>

        {/* Options Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '24px'
        }}>
          <Link
            to="/jtap/cogsci2025-tuned/trial-by-trial"
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
            <h2 style={{
              fontSize: '24px',
              fontWeight: '600',
              color: '#1e293b',
              margin: 0
            }}>
              Trial-by-Trial Plots
            </h2>
            <p style={{
              fontSize: '16px',
              color: '#64748b',
              margin: 0,
              lineHeight: '1.6'
            }}>
              Red-Green plots for model, baselines and human data for every trial.
            </p>
          </div>
          </Link>

          <Link
            to="/jtap/cogsci2025-tuned/aggregated"
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
              e.currentTarget.style.borderColor = '#8b5cf6';
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
              Aggregated Results
            </h2>
            <p style={{
              fontSize: '16px',
              color: '#64748b',
              margin: 0,
              lineHeight: '1.6'
            }}>
              Aggregated analysis plots for both targeted (occlusion frames only) and non-targeted trials.
            </p>
          </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Cogsci2025TunedPage;

