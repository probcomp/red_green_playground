import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { DIAMETERS, getNextDiameter, getPrevDiameter, formatDiameter } from '../utils/diameterUtils';

/**
 * Persistent floating card for diameter navigation
 * Appears at bottom-right of the page
 */
const DiameterNavigationCard = ({ currentDiameter, selectedTrial = null, selectedImage = null }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isDragging, setIsDragging] = useState(false);
  const sliderRef = useRef(null);
  const currentDiameterInt = Math.max(10, Math.min(100, parseInt(currentDiameter, 10) || 10));

  const navigateToDiameter = (newDiameter) => {
    if (!newDiameter || newDiameter === currentDiameter) return;

    // Determine route type from current path
    const isTrialByTrial = location.pathname.includes('/trial-by-trial');
    const isAggregated = location.pathname.includes('/aggregated');

    // Build new path
    let newPath;
    if (isTrialByTrial) {
      newPath = `/jtap/diameter/${newDiameter}/trial-by-trial`;
      // Preserve selected trial in URL if modal is open
      if (selectedTrial) {
        newPath += `?trial=${selectedTrial}`;
      }
    } else if (isAggregated) {
      newPath = `/jtap/diameter/${newDiameter}/aggregated`;
      // Preserve selected image in URL if modal is open
      if (selectedImage) {
        newPath += `?image=${encodeURIComponent(selectedImage)}`;
      }
    } else {
      // Fallback - shouldn't happen but handle gracefully
      newPath = `/jtap/diameter/${newDiameter}/trial-by-trial`;
    }

    navigate(newPath);
  };

  const handlePrevDiameter = () => {
    const prevDiameter = getPrevDiameter(currentDiameter);
    if (prevDiameter) {
      navigateToDiameter(prevDiameter);
    }
  };

  const handleNextDiameter = () => {
    const nextDiameter = getNextDiameter(currentDiameter);
    if (nextDiameter) {
      navigateToDiameter(nextDiameter);
    }
  };

  const handleDropdownChange = (e) => {
    navigateToDiameter(e.target.value);
  };

  const handleSliderChange = (e) => {
    const newDiameter = e.target.value;
    navigateToDiameter(newDiameter);
  };

  const handleSliderMouseDown = () => {
    setIsDragging(true);
  };

  const handleSliderMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      const handleMouseUp = () => setIsDragging(false);
      window.addEventListener('mouseup', handleMouseUp);
      return () => window.removeEventListener('mouseup', handleMouseUp);
    }
  }, [isDragging]);

  const prevDiameter = getPrevDiameter(currentDiameter);
  const nextDiameter = getNextDiameter(currentDiameter);

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '12px',
        padding: '16px 20px',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2), 0 4px 6px -2px rgba(0, 0, 0, 0.1)',
        border: '2px solid #e2e8f0',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        minWidth: '320px',
        backdropFilter: 'blur(10px)'
      }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          flex: 1
        }}>
          <div style={{
            fontSize: '12px',
            fontWeight: '600',
            color: '#64748b',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            Diameter
          </div>
          <div style={{
            fontSize: '18px',
            fontWeight: '700',
            color: '#1e293b'
          }}>
            {formatDiameter(currentDiameter)}
          </div>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
        <button
          onClick={handlePrevDiameter}
          disabled={!prevDiameter}
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            border: '2px solid #e2e8f0',
            backgroundColor: prevDiameter ? '#ffffff' : '#f1f5f9',
            color: prevDiameter ? '#1e293b' : '#94a3b8',
            fontSize: '18px',
            fontWeight: '600',
            cursor: prevDiameter ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease',
            boxShadow: prevDiameter ? '0 2px 4px rgba(0, 0, 0, 0.1)' : 'none'
          }}
          onMouseEnter={(e) => {
            if (prevDiameter) {
              e.target.style.backgroundColor = '#f8fafc';
              e.target.style.borderColor = '#3b82f6';
              e.target.style.transform = 'scale(1.05)';
            }
          }}
          onMouseLeave={(e) => {
            if (prevDiameter) {
              e.target.style.backgroundColor = '#ffffff';
              e.target.style.borderColor = '#e2e8f0';
              e.target.style.transform = 'scale(1)';
            }
          }}
        >
          ←
        </button>

        <select
          value={currentDiameter}
          onChange={handleDropdownChange}
          style={{
            padding: '8px 12px',
            borderRadius: '8px',
            border: '2px solid #e2e8f0',
            backgroundColor: '#ffffff',
            color: '#1e293b',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            outline: 'none',
            transition: 'all 0.2s ease',
            minWidth: '100px'
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
          {DIAMETERS.map((d) => (
            <option key={d} value={d}>
              {formatDiameter(d)}
            </option>
          ))}
        </select>

        <button
          onClick={handleNextDiameter}
          disabled={!nextDiameter}
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            border: '2px solid #e2e8f0',
            backgroundColor: nextDiameter ? '#ffffff' : '#f1f5f9',
            color: nextDiameter ? '#1e293b' : '#94a3b8',
            fontSize: '18px',
            fontWeight: '600',
            cursor: nextDiameter ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease',
            boxShadow: nextDiameter ? '0 2px 4px rgba(0, 0, 0, 0.1)' : 'none'
          }}
          onMouseEnter={(e) => {
            if (nextDiameter) {
              e.target.style.backgroundColor = '#f8fafc';
              e.target.style.borderColor = '#3b82f6';
              e.target.style.transform = 'scale(1.05)';
            }
          }}
          onMouseLeave={(e) => {
            if (nextDiameter) {
              e.target.style.backgroundColor = '#ffffff';
              e.target.style.borderColor = '#e2e8f0';
              e.target.style.transform = 'scale(1)';
            }
          }}
        >
          →
        </button>
        </div>
      </div>

      {/* Draggable Slider */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        width: '100%'
      }}>
        <span style={{
          fontSize: '12px',
          fontWeight: '600',
          color: '#64748b',
          minWidth: '30px'
        }}>
          10%
        </span>
        <input
          ref={sliderRef}
          type="range"
          min="10"
          max="100"
          value={currentDiameterInt}
          onChange={handleSliderChange}
          onMouseDown={handleSliderMouseDown}
          onMouseUp={handleSliderMouseUp}
          style={{
            flex: 1,
            height: '8px',
            borderRadius: '4px',
            background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${((currentDiameterInt - 10) / 90) * 100}%, #e2e8f0 ${((currentDiameterInt - 10) / 90) * 100}%, #e2e8f0 100%)`,
            outline: 'none',
            cursor: isDragging ? 'grabbing' : 'grab',
            WebkitAppearance: 'none',
            appearance: 'none'
          }}
          onMouseMove={(e) => {
            if (isDragging && e.buttons === 1 && sliderRef.current) {
              const rect = sliderRef.current.getBoundingClientRect();
              const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
              const newDiameter = Math.round(10 + percent * 90).toString();
              if (newDiameter !== currentDiameter) {
                navigateToDiameter(newDiameter);
              }
            }
          }}
        />
        <span style={{
          fontSize: '12px',
          fontWeight: '600',
          color: '#64748b',
          minWidth: '35px',
          textAlign: 'right'
        }}>
          100%
        </span>
      </div>

      {/* Dropdown (compact) */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        width: '100%'
      }}>
        <label style={{
          fontSize: '11px',
          fontWeight: '600',
          color: '#64748b',
          textTransform: 'uppercase',
          letterSpacing: '0.05em'
        }}>
          Jump to:
        </label>
        <select
          value={currentDiameter}
          onChange={handleDropdownChange}
          style={{
            flex: 1,
            padding: '6px 10px',
            borderRadius: '6px',
            border: '2px solid #e2e8f0',
            backgroundColor: '#ffffff',
            color: '#1e293b',
            fontSize: '12px',
            fontWeight: '600',
            cursor: 'pointer',
            outline: 'none',
            transition: 'all 0.2s ease'
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
          {DIAMETERS.map((d) => (
            <option key={d} value={d}>
              {formatDiameter(d)}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default DiameterNavigationCard;
