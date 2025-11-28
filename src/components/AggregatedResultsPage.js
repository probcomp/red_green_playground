import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// List of aggregated result files (excluding trial-specific files)
const aggregatedFiles = [
  'model_only_logfreq_all_trials.png',
  'non_targeted_dtw_analysis.png',
  'non_targeted_per_trial_metrics.png',
  'targeted_decision_boundary_distribution.png',
  'targeted_dtw_analysis.png',
  'targeted_logfreq.png',
  'targeted_P(decision)_distribution.png',
  'targeted_P(decision)_partial_correlation.png',
  'targeted_P(green|decision)_partial_correlation.png',
  'targeted_per_trial_metrics.png'
];

// Generate a nice title from filename
const getTitleFromFilename = (filename) => {
  return filename
    .replace('.png', '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase())
    .replace('P(', 'P(')
    .replace(')', ')');
};

// Lorem ipsum captions for each figure
const getCaption = (filename) => {
  const captions = {
    'model_only_logfreq_all_trials.png': 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.',
    'non_targeted_dtw_analysis.png': 'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
    'non_targeted_per_trial_metrics.png': 'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.',
    'targeted_decision_boundary_distribution.png': 'Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet.',
    'targeted_dtw_analysis.png': 'At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident.',
    'targeted_logfreq.png': 'Similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio. Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus.',
    'targeted_P(decision)_distribution.png': 'Quo porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem.',
    'targeted_P(decision)_partial_correlation.png': 'Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur.',
    'targeted_P(green|decision)_partial_correlation.png': 'Vel illum qui dolorem eum fugiat quo voluptas nulla pariatur? At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores.',
    'targeted_per_trial_metrics.png': 'Et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio.'
  };
  return captions[filename] || 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.';
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
          Click on any figure to view it in detail with caption. Use arrow keys or navigation buttons to browse.
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
              src={`/cogsci2025_tuned/${filename}`}
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
              src={`/cogsci2025_tuned/${selectedImage}`}
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

