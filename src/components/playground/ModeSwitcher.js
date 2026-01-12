import React from 'react';
import { MODES } from '../../constants';

const ModeSwitcher = ({ mode, setMode }) => {
  return (
    <div style={{
      display: "flex",
      gap: "8px",
      alignItems: "center"
    }}>
      <span style={{
        fontSize: "14px",
        fontWeight: "600",
        color: "#64748b",
        marginRight: "8px"
      }}>
        Mode:
      </span>
      <button
        onClick={() => setMode(MODES.REGULAR)}
        style={{
          background: mode === MODES.REGULAR
            ? "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)"
            : "linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%)",
          color: mode === MODES.REGULAR ? "white" : "#6b7280",
          padding: "8px 16px",
          borderRadius: "6px",
          border: "none",
          fontSize: "13px",
          fontWeight: "600",
          cursor: "pointer",
          transition: "all 0.2s ease",
          boxShadow: mode === MODES.REGULAR
            ? "0 2px 8px rgba(59, 130, 246, 0.3)"
            : "0 2px 4px rgba(0, 0, 0, 0.1)"
        }}
      >
        Regular Mode
      </button>
      <button
        onClick={() => setMode(MODES.DISTRACTOR)}
        style={{
          background: mode === MODES.DISTRACTOR
            ? "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)"
            : "linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%)",
          color: mode === MODES.DISTRACTOR ? "white" : "#6b7280",
          padding: "8px 16px",
          borderRadius: "6px",
          border: "none",
          fontSize: "13px",
          fontWeight: "600",
          cursor: "pointer",
          transition: "all 0.2s ease",
          boxShadow: mode === MODES.DISTRACTOR
            ? "0 2px 8px rgba(139, 92, 246, 0.3)"
            : "0 2px 4px rgba(0, 0, 0, 0.1)"
        }}
      >
        Distractor Mode
      </button>
    </div>
  );
};

export default ModeSwitcher;
