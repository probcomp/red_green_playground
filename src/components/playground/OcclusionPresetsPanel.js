import React from 'react';

const OcclusionPresetsPanel = ({
  presets,
  onAddPreset,
  onLoadPreset,
  onDeletePreset,
  hasOcclusion,
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
        margin: '0 0 16px 0',
        fontSize: '18px',
        fontWeight: '700',
        color: '#1e293b',
        letterSpacing: '-0.025em'
      }}>
        Occlusion Presets
      </h3>

      <button
        onClick={onAddPreset}
        disabled={!hasOcclusion}
        style={{
          width: '100%',
          marginBottom: '12px',
          background: hasOcclusion
            ? "linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)"
            : "linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)",
          color: 'white',
          padding: '10px 14px',
          borderRadius: '8px',
          border: 'none',
          fontSize: '13px',
          fontWeight: '600',
          cursor: hasOcclusion ? 'pointer' : 'not-allowed',
          transition: 'all 0.2s ease',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          opacity: hasOcclusion ? 1 : 0.5
        }}
        onMouseEnter={(e) => {
          if (hasOcclusion) {
            e.target.style.transform = "translateY(-1px)";
            e.target.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.15)";
          }
        }}
        onMouseLeave={(e) => {
          if (hasOcclusion) {
            e.target.style.transform = "translateY(0)";
            e.target.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.1)";
          }
        }}
      >
        Save current occlusion as preset
      </button>

      {presets.length === 0 ? (
        <div style={{ fontSize: '12px', color: '#9ca3af' }}>
          No presets yet for this session.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto' }}>
          {presets.map((preset) => (
            <div
              key={preset.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 10px',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                backgroundColor: '#f9fafb',
                cursor: 'pointer',
              }}
            >
              <button
                onClick={() => onLoadPreset(preset.id)}
                style={{
                  flex: 1,
                  textAlign: 'left',
                  background: 'transparent',
                  border: 'none',
                  padding: 0,
                  margin: 0,
                  fontSize: '13px',
                  fontWeight: '600',
                  color: '#1f2937',
                  cursor: 'pointer',
                }}
              >
                {preset.name}
              </button>
              <button
                onClick={() => onDeletePreset(preset.id)}
                style={{
                  marginLeft: '8px',
                  background: 'transparent',
                  border: 'none',
                  color: '#9ca3af',
                  fontSize: '14px',
                  cursor: 'pointer',
                }}
                aria-label={`Delete preset ${preset.name}`}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '8px' }}>
        Presets last only for this browser session and are not cleared by “Clear All”.
      </div>
    </div>
  );
};

export default OcclusionPresetsPanel;

