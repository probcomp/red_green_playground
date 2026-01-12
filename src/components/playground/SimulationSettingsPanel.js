import React from 'react';

const SimulationSettingsPanel = ({
  videoLength,
  ballSpeed,
  fps,
  worldWidth,
  worldHeight,
  directionInput,
  onVideoLengthChange,
  onBallSpeedChange,
  onFpsChange,
  onWorldWidthChange,
  onWorldHeightChange,
  onDirectionInputChange,
  physicsWarning,
  ballMovementPerFrame
}) => {
  return (
    <div style={{ 
      background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)", 
      padding: '24px', 
      borderRadius: '12px', 
      border: '1px solid #e2e8f0',
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
    }}>
      <h3 style={{ 
        margin: '0 0 20px 0', 
        fontSize: '18px', 
        fontWeight: '700', 
        color: '#1e293b',
        letterSpacing: '-0.025em'
      }}>
        Simulation Settings
      </h3>
      
      <div style={{ marginBottom: '20px' }}>
        <label style={{ 
          display: 'block', 
          fontSize: '14px', 
          fontWeight: '600', 
          color: '#374151', 
          marginBottom: '8px',
          letterSpacing: '0.025em'
        }}>
          Video Length (seconds)
        </label>
        <input
          type="number"
          value={videoLength}
          onChange={(e) => onVideoLengthChange(Number(e.target.value))}
          style={{
            width: '100%',
            padding: '12px 16px',
            border: '2px solid #e5e7eb',
            borderRadius: '8px',
            fontSize: '14px',
            outline: 'none',
            transition: 'all 0.2s ease',
            boxSizing: 'border-box',
            WebkitAppearance: 'none',
            MozAppearance: 'textfield',
            backgroundColor: '#ffffff',
            color: '#1f2937'
          }}
          onFocus={(e) => {
            e.target.style.borderColor = '#3b82f6';
            e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = '#e5e7eb';
            e.target.style.boxShadow = 'none';
          }}
        />
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <label style={{ 
          display: 'block', 
          fontSize: '14px', 
          fontWeight: '600', 
          color: '#374151', 
          marginBottom: '8px',
          letterSpacing: '0.025em'
        }}>
          Ball Speed (diameter/s)
        </label>
        <input
          type="number"
          value={ballSpeed}
          onChange={(e) => onBallSpeedChange(Number(e.target.value))}
          style={{
            width: '100%',
            padding: '12px 16px',
            border: '2px solid #e5e7eb',
            borderRadius: '8px',
            fontSize: '14px',
            outline: 'none',
            transition: 'all 0.2s ease',
            boxSizing: 'border-box',
            WebkitAppearance: 'none',
            MozAppearance: 'textfield',
            backgroundColor: '#ffffff',
            color: '#1f2937'
          }}
          onFocus={(e) => {
            e.target.style.borderColor = '#3b82f6';
            e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = '#e5e7eb';
            e.target.style.boxShadow = 'none';
          }}
        />
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <label style={{ 
          display: 'block', 
          fontSize: '14px', 
          fontWeight: '600', 
          color: '#374151', 
          marginBottom: '8px',
          letterSpacing: '0.025em'
        }}>
          FPS
        </label>
        <input
          type="number"
          value={fps}
          onChange={(e) => onFpsChange(Number(e.target.value))}
          style={{
            width: '100%',
            padding: '12px 16px',
            border: '2px solid #e5e7eb',
            borderRadius: '8px',
            fontSize: '14px',
            outline: 'none',
            transition: 'all 0.2s ease',
            boxSizing: 'border-box',
            WebkitAppearance: 'none',
            MozAppearance: 'textfield',
            backgroundColor: '#ffffff',
            color: '#1f2937'
          }}
          onFocus={(e) => {
            e.target.style.borderColor = '#3b82f6';
            e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = '#e5e7eb';
            e.target.style.boxShadow = 'none';
          }}
        />
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <label style={{ 
          display: 'block', 
          fontSize: '14px', 
          fontWeight: '600', 
          color: '#374151', 
          marginBottom: '8px',
          letterSpacing: '0.025em'
        }}>
          Ball Direction (degrees)
        </label>
        <input
          type="number"
          value={directionInput}
          onChange={(e) => onDirectionInputChange(e.target.value)}
          min="-180"
          max="179.9"
          step="0.1"
          style={{
            width: '100%',
            padding: '12px 16px',
            border: '2px solid #e5e7eb',
            borderRadius: '8px',
            fontSize: '14px',
            outline: 'none',
            transition: 'all 0.2s ease',
            boxSizing: 'border-box',
            WebkitAppearance: 'none',
            MozAppearance: 'textfield',
            backgroundColor: '#ffffff',
            color: '#1f2937'
          }}
          onFocus={(e) => {
            e.target.style.borderColor = '#3b82f6';
            e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = '#e5e7eb';
            e.target.style.boxShadow = 'none';
          }}
        />
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <label style={{ 
          display: 'block', 
          fontSize: '14px', 
          fontWeight: '600', 
          color: '#374151', 
          marginBottom: '8px',
          letterSpacing: '0.025em'
        }}>
          Scene Dimensions
        </label>
        <div style={{ 
          display: 'flex', 
          gap: '12px', 
          alignItems: 'center'
        }}>
          <div style={{ flex: 1 }}>
            <label style={{ 
              display: 'block', 
              fontSize: '12px', 
              fontWeight: '500', 
              color: '#6b7280', 
              marginBottom: '4px'
            }}>
              Width
            </label>
            <input
              type="number"
              value={worldWidth}
              onChange={(e) => onWorldWidthChange(Number(e.target.value))}
              min="5"
              max="50"
              step="1"
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none',
                transition: 'all 0.2s ease',
                boxSizing: 'border-box',
                WebkitAppearance: 'none',
                MozAppearance: 'textfield',
                backgroundColor: '#ffffff',
                color: '#1f2937'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#3b82f6';
                e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e5e7eb';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>
          <div style={{ 
            fontSize: '16px', 
            color: '#9ca3af', 
            fontWeight: '600',
            marginTop: '20px'
          }}>
            ×
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ 
              display: 'block', 
              fontSize: '12px', 
              fontWeight: '500', 
              color: '#6b7280', 
              marginBottom: '4px'
            }}>
              Height
            </label>
            <input
              type="number"
              value={worldHeight}
              onChange={(e) => onWorldHeightChange(Number(e.target.value))}
              min="5"
              max="50"
              step="1"
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none',
                transition: 'all 0.2s ease',
                boxSizing: 'border-box',
                WebkitAppearance: 'none',
                MozAppearance: 'textfield',
                backgroundColor: '#ffffff',
                color: '#1f2937'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#3b82f6';
                e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e5e7eb';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>
        </div>
      </div>
      
      <div style={{ 
        fontSize: '13px', 
        color: '#6b7280', 
        padding: '16px',
        backgroundColor: 'linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)',
        borderRadius: '8px',
        border: '1px solid #e5e7eb',
        background: 'linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)',
        fontWeight: '500'
      }}>
        Ball moves {ballMovementPerFrame.toFixed(3)} diameters per frame
        {physicsWarning && (
          <div style={{ 
            color: '#dc2626', 
            marginTop: '8px', 
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <span style={{ fontSize: '16px' }}>⚠️</span> {physicsWarning}
          </div>
        )}
      </div>
    </div>
  );
};

export default SimulationSettingsPanel;
