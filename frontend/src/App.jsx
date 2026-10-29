import React, { useState, useEffect } from 'react';
import { Shield, Activity, UploadCloud, BarChart2, Layers, RefreshCw, Sun, Moon, Info } from 'lucide-react';
import Playground from './components/Playground';
import BatchUpload from './components/BatchUpload';
import Benchmark from './components/Benchmark';
import FeatureImportance from './components/FeatureImportance';
import api from './api/client';

export default function App() {
  const [activeTab, setActiveTab] = useState('playground');
  const [backendStatus, setBackendStatus] = useState('connecting');
  const [isRetrying, setIsRetrying] = useState(false);
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'light';
  });

  // Apply theme to document element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Subscribe to API status changes
  useEffect(() => {
    const unsubscribe = api.onStatusChange(status => {
      setBackendStatus(status);
    });

    // Initial health check
    api.checkHealth();

    return () => unsubscribe();
  }, []);

  const handleRetryConnection = async () => {
    setIsRetrying(true);
    await api.checkHealth();
    setTimeout(() => setIsRetrying(false), 500);
  };

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <div className="app-layout">
      {/* Top Header */}
      <header className="app-header">
        <div className="header-container">
          <div className="header-logo">
            <div className="logo-icon" title="Network Intrusion Detection System">
              <Shield size={20} />
            </div>
            <div className="header-title">
              <h1>Network Traffic & Threat Classifier</h1>
              <p>REAL-TIME INTRUSION DETECTION & PROTOCOL ANALYSIS • NSL-KDD</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="header-nav">
            <button
              type="button"
              className={`nav-tab ${activeTab === 'playground' ? 'active' : ''}`}
              onClick={() => setActiveTab('playground')}
            >
              <Activity size={16} />
              <span>Playground</span>
            </button>

            <button
              type="button"
              className={`nav-tab ${activeTab === 'batch' ? 'active' : ''}`}
              onClick={() => setActiveTab('batch')}
            >
              <UploadCloud size={16} />
              <span>Batch CSV Inspector</span>
            </button>

            <button
              type="button"
              className={`nav-tab ${activeTab === 'benchmark' ? 'active' : ''}`}
              onClick={() => setActiveTab('benchmark')}
            >
              <BarChart2 size={16} />
              <span>Model Benchmarks</span>
            </button>

            <button
              type="button"
              className={`nav-tab ${activeTab === 'features' ? 'active' : ''}`}
              onClick={() => setActiveTab('features')}
            >
              <Layers size={16} />
              <span>Feature Importance</span>
            </button>
          </nav>

          {/* Controls: Health pill & Theme toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div className="status-pill">
              <span className={`status-dot ${backendStatus === 'online' ? 'online' : 'offline'}`} />
              <span>{backendStatus === 'online' ? 'API Online' : 'Demo Mode (Offline)'}</span>
              <button
                type="button"
                onClick={handleRetryConnection}
                disabled={isRetrying}
                title="Check connection to backend server (http://127.0.0.1:8000)"
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '2px',
                  display: 'flex',
                  alignItems: 'center',
                  color: 'inherit'
                }}
              >
                <RefreshCw size={12} className={isRetrying ? 'animate-spin' : ''} />
              </button>
            </div>

            <button
              type="button"
              className="theme-toggle-btn"
              onClick={toggleTheme}
              title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} theme`}
            >
              {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="main-content">
        {/* Offline Helper Notice if API is disconnected */}
        {backendStatus === 'offline' && (
          <div className="alert-banner warning">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Info size={18} style={{ flexShrink: 0 }} />
              <div>
                <strong>Demonstration Mode Active:</strong> FastAPI backend is not running on port 8000.
                To run live custom model inference, launch the backend in a terminal using:
                <code style={{ margin: '0 0.35rem', background: 'rgba(0,0,0,0.06)', padding: '0.1rem 0.35rem', borderRadius: '4px' }}>python run_backend.py</code>.
                Pre-computed NSL-KDD benchmarks and offline evaluations are active!
              </div>
            </div>
            <button
              type="button"
              onClick={handleRetryConnection}
              className="btn-secondary"
              style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem', flexShrink: 0 }}
            >
              Reconnect
            </button>
          </div>
        )}

        {activeTab === 'playground' && <Playground />}
        {activeTab === 'batch' && <BatchUpload />}
        {activeTab === 'benchmark' && <Benchmark />}
        {activeTab === 'features' && <FeatureImportance />}
      </main>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--border-subtle)',
        background: 'var(--bg-surface)',
        padding: '1.5rem',
        textAlign: 'center',
        color: 'var(--text-muted)',
        fontSize: '0.8rem',
        marginTop: 'auto'
      }}>
        <p style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>
          Network Traffic Protocol & Threat Classifier • Security Analysis Dashboard
        </p>
        <p style={{ marginTop: '0.25rem' }}>
          Trained on NSL-KDD Dataset • Decision Tree (Entropy) • Support Vector Machine (RBF) • Gaussian Naive Bayes • Zero Target Leakage Enforced
        </p>
      </footer>
    </div>
  );
}
