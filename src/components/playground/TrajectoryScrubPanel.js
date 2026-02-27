import React from 'react';

const TrajectoryScrubPanel = ({
  enabled,
  onToggleEnabled,
  simData,
  scrubFrame,
  onScrubFrameChange,
}) => {
  if (!simData || !simData.step_data) {
    return null;
  }

  const numFrames = simData.num_frames || Object.keys(simData.step_data).length || 0;
  if (numFrames === 0) {
    return null;
  }

  const handleSliderChange = (e) => {
    const value = parseInt(e.target.value, 10);
    onScrubFrameChange(value);
  };

  return (
    <div style={{
      background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
      padding: '24px',
      borderRadius: '12px',
      border: '1px solid #e2e8f0',
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
    }}>
      <h3 style={{
        margin: '0 0 12px 0',
        fontSize: '18px',
        fontWeight: '700',
        color: '#1e293b',
        letterSpacing: '-0.025em'
      }}>
        Trajectory Scrub
      </h3>

      <label style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '13px',
        fontWeight: '600',
        color: '#374151',
        marginBottom: '10px',
        cursor: 'pointer',
      }}>
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => onToggleEnabled(e.target.checked)}
          style={{
            width: '16px',
            height: '16px',
            cursor: 'pointer',
            accentColor: '#3b82f6'
          }}
        />
        Enable scrub mode (use last simulation path)
      </label>

      {enabled && (
        <>
          <input
            type="range"
            min={0}
            max={numFrames - 1}
            step={1}
            value={scrubFrame ?? 0}
            onChange={handleSliderChange}
            style={{ width: '100%' }}
          />
          <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '8px' }}>
            Frame {(scrubFrame ?? 0) + 1} / {numFrames}
          </div>
          <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '4px' }}>
            Drag to move the ball along its previous path. Click Simulate to start a new trial from this point.
          </div>
        </>
      )}
    </div>
  );
};

export default TrajectoryScrubPanel;

