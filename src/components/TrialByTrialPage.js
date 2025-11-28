import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function TrialByTrialPage() {
  const [selectedTrial, setSelectedTrial] = useState(null);
  const trials = Array.from({ length: 50 }, (_, i) => `E${i + 1}`);

  const navigateTrial = (direction) => {
    if (selectedTrial === null) return;
    
    const currentIndex = trials.indexOf(selectedTrial);
    const newIndex = currentIndex + direction;
    
    if (newIndex >= 0 && newIndex < trials.length) {
      setSelectedTrial(trials[newIndex]);
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
  };

  const closeModal = () => {
    setSelectedTrial(null);
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

      {/* Trials Grid */}
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: '24px',
        paddingBottom: '40px'
      }}>
        {trials.map((trialName) => (
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
              gap: '12px'
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
              src={`/cogsci2025_tuned/${trialName}_stim_traj.png`}
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
              fontSize: '16px',
              fontWeight: '600',
              color: '#1e293b'
            }}>
              {trialName}
            </div>
          </div>
        ))}
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
              maxWidth: '90vw',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '20px'
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

            {/* Image */}
            <img
              src={`/cogsci2025_tuned/${selectedTrial}_plot.png`}
              alt={`${selectedTrial} plot`}
              style={{
                maxWidth: '100%',
                maxHeight: '80vh',
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
                    Image not found for ${selectedTrial}
                  </div>
                `;
              }}
            />

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

