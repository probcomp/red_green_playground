import React from 'react';

const DistractorControlsPanel = ({
  simData,
  isAddingKeyDistractor,
  setIsAddingKeyDistractor,
  keyDistractors,
  editingDistractorIndex,
  onEditDistractor,
  onDeleteDistractor,
  randomDistractorParams,
  onRandomDistractorParamsChange,
  onShouldAutoSimulate
}) => {
  return (
    <div style={{ 
      background: "linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)", 
      padding: '24px', 
      borderRadius: '12px', 
      border: '2px solid #d8b4fe',
      boxShadow: "0 4px 6px -1px rgba(139, 92, 246, 0.2), 0 2px 4px -1px rgba(139, 92, 246, 0.1)"
    }}>
      <h3 style={{ 
        margin: '0 0 20px 0', 
        fontSize: '18px', 
        fontWeight: '700', 
        color: '#6b21a8',
        letterSpacing: '-0.025em'
      }}>
        Distractor Controls
      </h3>
      
      {/* Key Distractor Section */}
      <div style={{ marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid #e9d5ff' }}>
        <h4 style={{ 
          margin: '0 0 12px 0', 
          fontSize: '14px', 
          fontWeight: '600', 
          color: '#7c3aed'
        }}>
          Key Distractor
        </h4>
        
        <button
          onClick={() => setIsAddingKeyDistractor(!isAddingKeyDistractor)}
          disabled={!simData}
          style={{
            width: '100%',
            background: isAddingKeyDistractor 
              ? "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)"
              : "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
            color: "white",
            padding: "10px 14px",
            borderRadius: "8px",
            border: "none",
            fontSize: "13px",
            fontWeight: "600",
            cursor: simData ? "pointer" : "not-allowed",
            transition: "all 0.2s ease",
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
            marginBottom: "12px",
            opacity: simData ? 1 : 0.5
          }}
        >
          {isAddingKeyDistractor ? "❌ Cancel Adding" : "➕ Add Key Distractor"}
        </button>
        
        {keyDistractors.length > 0 && (
          <div style={{ marginTop: '12px' }}>
            <div style={{ 
              fontSize: '12px', 
              color: '#7c3aed', 
              fontWeight: '600',
              marginBottom: '8px'
            }}>
              Active Key Distractors: {keyDistractors.length}
            </div>
            {keyDistractors.map((distractor, index) => (
              <div 
                key={index}
                style={{
                  padding: '8px 10px',
                  backgroundColor: 'white',
                  borderRadius: '6px',
                  marginBottom: '6px',
                  border: editingDistractorIndex === index ? '2px solid #8b5cf6' : '1px solid #e9d5ff',
                  fontSize: '11px',
                  color: '#6b7280',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <span>
                  Frame {distractor.startFrame} • {distractor.duration}s • {distractor.speed?.toFixed(1) || '3.6'} d/s
                </span>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button
                    onClick={() => onEditDistractor(index)}
                    style={{
                      background: '#8b5cf6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '4px 8px',
                      fontSize: '10px',
                      cursor: 'pointer',
                      fontWeight: '600'
                    }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      onDeleteDistractor(index);
                      if (onShouldAutoSimulate) {
                        onShouldAutoSimulate(true);
                      }
                    }}
                    style={{
                      background: '#ef4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '4px 8px',
                      fontSize: '10px',
                      cursor: 'pointer',
                      fontWeight: '600'
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Random Distractor Parameters */}
      <div>
        <h4 style={{ 
          margin: '0 0 12px 0', 
          fontSize: '14px', 
          fontWeight: '600', 
          color: '#7c3aed'
        }}>
          Random Distractors
        </h4>
        
        <div style={{ marginBottom: '12px' }}>
          <label style={{ 
            display: 'block', 
            fontSize: '12px', 
            fontWeight: '600', 
            color: '#6b21a8', 
            marginBottom: '6px'
          }}>
            Start Delay (seconds)
          </label>
          <input
            type="number"
            value={randomDistractorParams.startDelay}
            onChange={(e) => onRandomDistractorParamsChange({
              ...randomDistractorParams,
              startDelay: parseFloat(e.target.value)
            })}
            min="0"
            step="0.1"
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '2px solid #e9d5ff',
              borderRadius: '6px',
              fontSize: '12px',
              outline: 'none',
              transition: 'all 0.2s ease',
              boxSizing: 'border-box',
              backgroundColor: '#ffffff',
              color: '#1f2937'
            }}
          />
          <div style={{ 
            fontSize: '10px', 
            color: '#9ca3af', 
            marginTop: '4px' 
          }}>
            Delay before first random distractor appears
          </div>
        </div>
        
        <div style={{ marginBottom: '12px' }}>
          <label style={{ 
            display: 'block', 
            fontSize: '12px', 
            fontWeight: '600', 
            color: '#6b21a8', 
            marginBottom: '6px'
          }}>
            Spawn Probability (per frame)
          </label>
          <input
            type="number"
            value={randomDistractorParams.probability}
            onChange={(e) => onRandomDistractorParamsChange({
              ...randomDistractorParams,
              probability: parseFloat(e.target.value)
            })}
            min="0"
            max="1"
            step="0.01"
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '2px solid #e9d5ff',
              borderRadius: '6px',
              fontSize: '12px',
              outline: 'none',
              transition: 'all 0.2s ease',
              boxSizing: 'border-box',
              backgroundColor: '#ffffff',
              color: '#1f2937'
            }}
          />
        </div>
        
        <div style={{ marginBottom: '12px' }}>
          <label style={{ 
            display: 'block', 
            fontSize: '12px', 
            fontWeight: '600', 
            color: '#6b21a8', 
            marginBottom: '6px'
          }}>
            Random Seed
          </label>
          <input
            type="number"
            value={randomDistractorParams.seed}
            onChange={(e) => onRandomDistractorParamsChange({
              ...randomDistractorParams,
              seed: parseInt(e.target.value)
            })}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '2px solid #e9d5ff',
              borderRadius: '6px',
              fontSize: '12px',
              outline: 'none',
              transition: 'all 0.2s ease',
              boxSizing: 'border-box',
              backgroundColor: '#ffffff',
              color: '#1f2937'
            }}
          />
        </div>
        
        <div style={{ marginBottom: '12px' }}>
          <label style={{ 
            display: 'block', 
            fontSize: '12px', 
            fontWeight: '600', 
            color: '#6b21a8', 
            marginBottom: '6px'
          }}>
            Duration (seconds)
          </label>
          <input
            type="number"
            value={randomDistractorParams.duration}
            onChange={(e) => onRandomDistractorParamsChange({
              ...randomDistractorParams,
              duration: parseFloat(e.target.value)
            })}
            min="0.1"
            step="0.1"
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '2px solid #e9d5ff',
              borderRadius: '6px',
              fontSize: '12px',
              outline: 'none',
              transition: 'all 0.2s ease',
              boxSizing: 'border-box',
              backgroundColor: '#ffffff',
              color: '#1f2937'
            }}
          />
        </div>
        
        <div style={{ marginBottom: '0' }}>
          <label style={{ 
            display: 'block', 
            fontSize: '12px', 
            fontWeight: '600', 
            color: '#6b21a8', 
            marginBottom: '6px'
          }}>
            Max Active Distractors
          </label>
          <input
            type="number"
            value={randomDistractorParams.maxActive}
            onChange={(e) => onRandomDistractorParamsChange({
              ...randomDistractorParams,
              maxActive: parseInt(e.target.value)
            })}
            min="1"
            step="1"
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '2px solid #e9d5ff',
              borderRadius: '6px',
              fontSize: '12px',
              outline: 'none',
              transition: 'all 0.2s ease',
              boxSizing: 'border-box',
              backgroundColor: '#ffffff',
              color: '#1f2937'
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default DistractorControlsPanel;
