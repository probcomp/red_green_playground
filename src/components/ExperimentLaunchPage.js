import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const EXPERIMENT_BASE_URL = 'https://redgreen-exp-5c7f14931f81.herokuapp.com/march2026v0/';

function formatProlificPid(name, date) {
  const trimmed = String(name || '').trim();
  const sanitized = (trimmed === '' ? 'Anonymous' : trimmed)
    .replace(/\s+/g, '_')
    .replace(/[^a-zA-Z0-9_\-']/g, '') || 'Anonymous';
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const dateStr = '' +
    date.getFullYear() +
    monthNames[date.getMonth()] +
    String(date.getDate()).padStart(2, '0');
  const timeStr = '' +
    String(date.getHours()).padStart(2, '0') +
    String(date.getMinutes()).padStart(2, '0') +
    String(date.getSeconds()).padStart(2, '0');
  return `${sanitized}_${dateStr}_${timeStr}`;
}

function ExperimentLaunchPage() {
  const [name, setName] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    const pid = formatProlificPid(name, new Date());
    const url = `${EXPERIMENT_BASE_URL}?PROLIFIC_PID=${encodeURIComponent(pid)}`;
    setSubmitted(true);
    window.location.href = url;
  };

  // Reset form when page is restored from back-forward cache (e.g. user hit Back from experiment)
  useEffect(() => {
    const onPageShow = (e) => {
      if (e.persisted) {
        setSubmitted(false);
        setName('');
      }
    };
    window.addEventListener('pageshow', onPageShow);
    return () => window.removeEventListener('pageshow', onPageShow);
  }, []);

  const handleBack = () => {
    setSubmitted(false);
    setName('');
  };

  return (
    <div style={{
      minHeight: '100vh',
      padding: '40px',
      backgroundColor: '#f8fafc',
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-start'
    }}>
      {/* Navigation */}
      <div style={{
        alignSelf: 'flex-start',
        marginBottom: '32px',
        paddingBottom: '20px',
        borderBottom: '2px solid #e2e8f0',
        width: '100%',
        maxWidth: '480px'
      }}>
        <Link
          to="/"
          onClick={handleBack}
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

      <div style={{
        maxWidth: '480px',
        width: '100%',
        background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
        border: '2px solid #e2e8f0',
        borderRadius: '12px',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        padding: '32px'
      }}>
        <h1 style={{
          fontSize: '28px',
          fontWeight: '700',
          color: '#1e293b',
          marginBottom: '8px',
          letterSpacing: '-0.025em'
        }}>
          Try the Red-Green Experiment
        </h1>
        <p style={{
          fontSize: '14px',
          color: '#64748b',
          marginBottom: '24px'
        }}>
          You will be redirected to the behavioral experiment. Enter a name to continue.
        </p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="experiment-name" style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '600',
            color: '#374151',
            marginBottom: '8px'
          }}>
            Name
          </label>
          <input
            id="experiment-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Lord Arijit"
            required
            autoFocus
            style={{
              width: '100%',
              boxSizing: 'border-box',
              padding: '12px 16px',
              fontSize: '16px',
              border: '2px solid #e2e8f0',
              borderRadius: '8px',
              marginBottom: '20px',
              outline: 'none',
              transition: 'border-color 0.2s ease'
            }}
            onFocus={(e) => { e.target.style.borderColor = '#3b82f6'; }}
            onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; }}
          />

          <p style={{
            fontSize: '13px',
            color: '#64748b',
            marginBottom: '24px',
            padding: '12px',
            backgroundColor: '#f1f5f9',
            borderRadius: '8px',
            borderLeft: '4px solid #94a3b8'
          }}>
            Your data for the experiment will be collected, but not used for any scientific study.
          </p>

          <button
            type="submit"
            disabled={submitted || !name.trim()}
            style={{
              width: '100%',
              padding: '14px 24px',
              fontSize: '16px',
              fontWeight: '600',
              color: 'white',
              background: submitted
                ? '#94a3b8'
                : 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
              border: 'none',
              borderRadius: '8px',
              cursor: submitted ? 'not-allowed' : 'pointer',
              boxShadow: submitted ? 'none' : '0 2px 8px rgba(34, 197, 94, 0.3)',
              transition: 'all 0.2s ease'
            }}
          >
            {submitted ? 'Redirecting…' : 'Start experiment'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ExperimentLaunchPage;
