import React, { useState, useEffect, useCallback } from 'react';
import {
  Shield,
  ShieldAlert,
  Cpu,
  Sparkles,
  RefreshCw,
  Send,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Globe,
  Activity,
  Lock,
  Sliders,
  Play,
  ArrowRight
} from 'lucide-react';
import api from '../api/client';
import ModelExplanationDiagram from './ModelExplanationDiagram';

// Standard Archetypes for Custom Testing
const ARCHETYPES = {
  syn_flood: {
    id: 'syn_flood',
    name: 'DoS / SYN Flood (S0)',
    icon: '🔴',
    expected: 'ATTACK',
    features: {
      duration: 0.0,
      protocol_type: 'tcp',
      service: 'private',
      flag: 'S0',
      src_bytes: 0.0,
      dst_bytes: 0.0,
      land: 0,
      wrong_fragment: 0,
      urgent: 0,
      hot: 0,
      num_failed_logins: 0,
      logged_in: 0,
      num_compromised: 0,
      root_shell: 0,
      su_attempted: 0,
      num_root: 0,
      num_file_creations: 0,
      num_shells: 0,
      num_access_files: 0,
      num_outbound_cmds: 0,
      is_host_login: 0,
      is_guest_login: 0,
      count: 150,
      srv_count: 6,
      serror_rate: 1.0,
      srv_serror_rate: 1.0,
      rerror_rate: 0.0,
      srv_rerror_rate: 0.0,
      same_srv_rate: 0.05,
      diff_srv_rate: 0.07,
      srv_diff_host_rate: 0.0,
      dst_host_count: 255,
      dst_host_srv_count: 26,
      dst_host_same_srv_rate: 0.1,
      dst_host_diff_srv_rate: 0.05,
      dst_host_same_src_port_rate: 0.0,
      dst_host_srv_diff_host_rate: 0.0,
      dst_host_serror_rate: 1.0,
      dst_host_srv_serror_rate: 1.0,
      dst_host_rerror_rate: 0.0,
      dst_host_srv_rerror_rate: 0.0
    }
  },
  port_sweep: {
    id: 'port_sweep',
    name: 'Port Sweep Probe (REJ)',
    icon: '🟠',
    expected: 'ATTACK',
    features: {
      duration: 0.0,
      protocol_type: 'tcp',
      service: 'private',
      flag: 'REJ',
      src_bytes: 0.0,
      dst_bytes: 0.0,
      land: 0,
      wrong_fragment: 0,
      urgent: 0,
      hot: 0,
      num_failed_logins: 0,
      logged_in: 0,
      num_compromised: 0,
      root_shell: 0,
      su_attempted: 0,
      num_root: 0,
      num_file_creations: 0,
      num_shells: 0,
      num_access_files: 0,
      num_outbound_cmds: 0,
      is_host_login: 0,
      is_guest_login: 0,
      count: 220,
      srv_count: 10,
      serror_rate: 0.0,
      srv_serror_rate: 0.0,
      rerror_rate: 1.0,
      srv_rerror_rate: 1.0,
      same_srv_rate: 0.04,
      diff_srv_rate: 0.06,
      srv_diff_host_rate: 0.0,
      dst_host_count: 255,
      dst_host_srv_count: 10,
      dst_host_same_srv_rate: 0.04,
      dst_host_diff_srv_rate: 0.06,
      dst_host_same_src_port_rate: 0.0,
      dst_host_srv_diff_host_rate: 0.0,
      dst_host_serror_rate: 0.0,
      dst_host_srv_serror_rate: 0.0,
      dst_host_rerror_rate: 1.0,
      dst_host_srv_rerror_rate: 1.0
    }
  },
  benign_web: {
    id: 'benign_web',
    name: 'Benign Web Browsing (SF)',
    icon: '🟢',
    expected: 'NORMAL',
    features: {
      duration: 0.0,
      protocol_type: 'tcp',
      service: 'http',
      flag: 'SF',
      src_bytes: 280.0,
      dst_bytes: 6500.0,
      land: 0,
      wrong_fragment: 0,
      urgent: 0,
      hot: 0,
      num_failed_logins: 0,
      logged_in: 1,
      num_compromised: 0,
      root_shell: 0,
      su_attempted: 0,
      num_root: 0,
      num_file_creations: 0,
      num_shells: 0,
      num_access_files: 0,
      num_outbound_cmds: 0,
      is_host_login: 0,
      is_guest_login: 0,
      count: 6,
      srv_count: 6,
      serror_rate: 0.0,
      srv_serror_rate: 0.0,
      rerror_rate: 0.0,
      srv_rerror_rate: 0.0,
      same_srv_rate: 1.0,
      diff_srv_rate: 0.0,
      srv_diff_host_rate: 0.0,
      dst_host_count: 35,
      dst_host_srv_count: 255,
      dst_host_same_srv_rate: 1.0,
      dst_host_diff_srv_rate: 0.0,
      dst_host_same_src_port_rate: 0.03,
      dst_host_srv_diff_host_rate: 0.04,
      dst_host_serror_rate: 0.0,
      dst_host_srv_serror_rate: 0.0,
      dst_host_rerror_rate: 0.0,
      dst_host_srv_rerror_rate: 0.0
    }
  },
  priv_escalation: {
    id: 'priv_escalation',
    name: 'Privilege Escalation (U2R)',
    icon: '🟣',
    expected: 'ATTACK',
    features: {
      duration: 12.0,
      protocol_type: 'tcp',
      service: 'telnet',
      flag: 'SF',
      src_bytes: 2500.0,
      dst_bytes: 4200.0,
      land: 0,
      wrong_fragment: 0,
      urgent: 0,
      hot: 3,
      num_failed_logins: 0,
      logged_in: 1,
      num_compromised: 2,
      root_shell: 1,
      su_attempted: 1,
      num_root: 5,
      num_file_creations: 2,
      num_shells: 0,
      num_access_files: 1,
      num_outbound_cmds: 0,
      is_host_login: 0,
      is_guest_login: 0,
      count: 2,
      srv_count: 2,
      serror_rate: 0.0,
      srv_serror_rate: 0.0,
      rerror_rate: 0.0,
      srv_rerror_rate: 0.0,
      same_srv_rate: 1.0,
      diff_srv_rate: 0.0,
      srv_diff_host_rate: 0.0,
      dst_host_count: 10,
      dst_host_srv_count: 10,
      dst_host_same_srv_rate: 1.0,
      dst_host_diff_srv_rate: 0.0,
      dst_host_same_src_port_rate: 0.1,
      dst_host_srv_diff_host_rate: 0.0,
      dst_host_serror_rate: 0.0,
      dst_host_srv_serror_rate: 0.0,
      dst_host_rerror_rate: 0.0,
      dst_host_srv_rerror_rate: 0.0
    }
  },
  blank: {
    id: 'blank',
    name: 'Blank Clean Flow',
    icon: '⚪',
    expected: 'CUSTOM',
    features: {
      duration: 0.0,
      protocol_type: 'tcp',
      service: 'http',
      flag: 'SF',
      src_bytes: 0.0,
      dst_bytes: 0.0,
      land: 0,
      wrong_fragment: 0,
      urgent: 0,
      hot: 0,
      num_failed_logins: 0,
      logged_in: 0,
      num_compromised: 0,
      root_shell: 0,
      su_attempted: 0,
      num_root: 0,
      num_file_creations: 0,
      num_shells: 0,
      num_access_files: 0,
      num_outbound_cmds: 0,
      is_host_login: 0,
      is_guest_login: 0,
      count: 1,
      srv_count: 1,
      serror_rate: 0.0,
      srv_serror_rate: 0.0,
      rerror_rate: 0.0,
      srv_rerror_rate: 0.0,
      same_srv_rate: 1.0,
      diff_srv_rate: 0.0,
      srv_diff_host_rate: 0.0,
      dst_host_count: 1,
      dst_host_srv_count: 1,
      dst_host_same_srv_rate: 1.0,
      dst_host_diff_srv_rate: 0.0,
      dst_host_same_src_port_rate: 0.0,
      dst_host_srv_diff_host_rate: 0.0,
      dst_host_serror_rate: 0.0,
      dst_host_srv_serror_rate: 0.0,
      dst_host_rerror_rate: 0.0,
      dst_host_srv_rerror_rate: 0.0
    }
  }
};

export default function Playground() {
  // Top-level View Mode: 'presets' vs 'custom'
  const [viewMode, setViewMode] = useState('presets');

  // Curated preset scenarios
  const [samples, setSamples] = useState([]);
  const [activeSampleId, setActiveSampleId] = useState('sample-1');

  // Active Task & Model
  const [model, setModel] = useState('decision_tree');
  const [task, setTask] = useState('threat');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // Custom Mode State
  const [activeFeatureTab, setActiveFeatureTab] = useState('fundamentals');
  const [autoHarmonize, setAutoHarmonize] = useState(true);
  const [customData, setCustomData] = useState(ARCHETYPES.benign_web.features);
  const [activeArchetype, setActiveArchetype] = useState('benign_web');

  // Fetch sample scenarios via resilient api client
  useEffect(() => {
    let isMounted = true;
    api.getSamples().then(data => {
      if (isMounted && data && data.length > 0) {
        setSamples(data);
        setActiveSampleId(data[0].id);
        api.predictThreat('decision_tree', data[0].features)
          .then(res => {
            if (isMounted) setResult(res);
          })
          .catch(() => {});
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Run prediction on curated sample
  const handleRunPreset = useCallback(async (sample, targetModel = model, targetTask = task) => {
    setActiveSampleId(sample.id);
    setLoading(true);
    setError(null);
    try {
      let responseData;
      if (targetTask === 'threat') {
        responseData = await api.predictThreat(targetModel, sample.features);
      } else {
        responseData = await api.predictProtocol(targetModel, sample.features);
      }
      setResult(responseData);
    } catch (err) {
      setError(err.message || 'Classification request failed. Please check backend connection.');
    } finally {
      setLoading(false);
    }
  }, [model, task]);

  // Switch a preset into the Custom Inspector
  const handleCustomizePreset = (sample) => {
    setCustomData({ ...sample.features });
    setActiveArchetype('');
    setViewMode('custom');
    setResult(null);
    setError(null);
  };

  // Apply an archetype to custom inputs
  const handleApplyArchetype = (archetypeKey) => {
    const arch = ARCHETYPES[archetypeKey];
    if (arch) {
      setActiveArchetype(archetypeKey);
      setCustomData({ ...arch.features });
      setResult(null);
      setError(null);
    }
  };

  // Handle input change in Custom Mode with Smart Harmonization
  const handleCustomInputChange = (e) => {
    const { name, value, type } = e.target;
    const numVal = type === 'number' ? (parseFloat(value) || 0) : value;

    setCustomData(prev => {
      const next = { ...prev, [name]: numVal };

      // Smart Correlation / Harmonization
      if (autoHarmonize) {
        if (name === 'flag') {
          const flagVal = String(value).toUpperCase();
          if (flagVal === 'S0' || flagVal === 'SH') {
            next.serror_rate = 1.0;
            next.srv_serror_rate = 1.0;
            next.dst_host_serror_rate = 1.0;
            next.dst_host_srv_serror_rate = 1.0;
            next.logged_in = 0;
            if (next.src_bytes <= 1000) next.dst_bytes = 0.0;
          } else if (flagVal === 'REJ' || flagVal === 'RSTO') {
            next.rerror_rate = 1.0;
            next.srv_rerror_rate = 1.0;
            next.dst_host_rerror_rate = 1.0;
            next.dst_host_srv_rerror_rate = 1.0;
            next.logged_in = 0;
            next.dst_bytes = 0.0;
            if (next.count < 20) next.count = 200;
            if (next.dst_host_count < 50) next.dst_host_count = 255;
            if (next.dst_host_srv_count > 50) next.dst_host_srv_count = 10;
          } else if (flagVal === 'SF') {
            next.serror_rate = 0.0;
            next.srv_serror_rate = 0.0;
            next.rerror_rate = 0.0;
            next.srv_rerror_rate = 0.0;
            next.dst_host_serror_rate = 0.0;
            next.dst_host_srv_serror_rate = 0.0;
            next.dst_host_rerror_rate = 0.0;
            next.dst_host_srv_rerror_rate = 0.0;
          }
        } else if (name === 'serror_rate' && parseFloat(value) >= 0.5) {
          const rate = parseFloat(value);
          next.srv_serror_rate = rate;
          next.dst_host_serror_rate = rate;
          next.dst_host_srv_serror_rate = rate;
          next.logged_in = 0;
          if (next.src_bytes <= 1000) next.dst_bytes = 0.0;
        } else if (name === 'rerror_rate' && parseFloat(value) >= 0.5) {
          const rate = parseFloat(value);
          next.srv_rerror_rate = rate;
          next.dst_host_rerror_rate = rate;
          next.dst_host_srv_rerror_rate = rate;
          next.logged_in = 0;
          next.dst_bytes = 0.0;
        }
      }

      return next;
    });

    setActiveArchetype('');
  };

  // Run Custom Packet Prediction
  const handlePredictCustom = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let responseData;
      if (task === 'threat') {
        responseData = await api.predictThreat(model, customData);
      } else {
        responseData = await api.predictProtocol(model, customData);
      }
      setResult(responseData);
    } catch (err) {
      setError(err.message || 'Classification request failed. Please check backend connection.');
    } finally {
      setLoading(false);
    }
  };

  const activePreset = samples.find(s => s.id === activeSampleId) || samples[0];

  const handleModelChange = (newModel) => {
    setModel(newModel);
    if (viewMode === 'presets' && activePreset) {
      handleRunPreset(activePreset, newModel, task);
    } else {
      setResult(null);
    }
  };

  const handleTaskChange = (newTask) => {
    setTask(newTask);
    if (viewMode === 'presets' && activePreset) {
      handleRunPreset(activePreset, model, newTask);
    } else {
      setResult(null);
    }
  };

  return (
    <div className="playground-container">
      {/* Top Header Card */}
      <div className="glass-panel" style={{ marginBottom: '1.25rem' }}>
        <div className="control-bar">
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
              <Cpu style={{ color: 'var(--brand-primary)' }} size={24} />
              Traffic Classifier & Network Security Lab
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.2rem' }}>
              Evaluate threats and classify application protocols using trained Decision Tree, SVM, and Naive Bayes models.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap', alignItems: 'center' }}>
            {/* Task Selector */}
            <div className="button-group">
              <button
                type="button"
                className={`btn-toggle ${task === 'threat' ? 'active' : ''}`}
                onClick={() => handleTaskChange('threat')}
              >
                Task A: Threat Detection
              </button>
              <button
                type="button"
                className={`btn-toggle ${task === 'protocol' ? 'active' : ''}`}
                onClick={() => handleTaskChange('protocol')}
              >
                Task B: Protocol (Zero Leakage)
              </button>
            </div>

            {/* Model Selector */}
            <div className="button-group">
              <button
                type="button"
                className={`btn-toggle ${model === 'decision_tree' ? 'active' : ''}`}
                onClick={() => handleModelChange('decision_tree')}
              >
                Decision Tree
              </button>
              <button
                type="button"
                className={`btn-toggle ${model === 'svm' ? 'active' : ''}`}
                onClick={() => handleModelChange('svm')}
              >
                SVM (RBF)
              </button>
              <button
                type="button"
                className={`btn-toggle ${model === 'naive_bayes' ? 'active' : ''}`}
                onClick={() => handleModelChange('naive_bayes')}
              >
                Naive Bayes
              </button>
            </div>
          </div>
        </div>

        {/* Mode Switcher: Curated Scenarios vs Custom Packet Inspector */}
        <div className="mode-switcher-container">
          <button
            type="button"
            className={`mode-switcher-btn ${viewMode === 'presets' ? 'active' : ''}`}
            onClick={() => { setViewMode('presets'); setError(null); }}
          >
            <Sparkles size={16} />
            <span>Mode 1: Curated Lab Scenarios (4 Presets)</span>
          </button>
          <button
            type="button"
            className={`mode-switcher-btn ${viewMode === 'custom' ? 'active' : ''}`}
            onClick={() => { setViewMode('custom'); setError(null); }}
          >
            <Sliders size={16} />
            <span>Mode 2: Custom Packet Inspector (Interactive Testing)</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          VIEW MODE 1: CURATED LAB SCENARIOS (4 PRESETS)
         ========================================================================= */}
      {viewMode === 'presets' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
              Select a benchmark traffic scenario to test how {model.replace('_', ' ').toUpperCase()} evaluates standard network signatures:
            </span>
            <button
              type="button"
              className="btn-toggle"
              onClick={() => activePreset && handleCustomizePreset(activePreset)}
              style={{ fontSize: '0.8rem', color: 'var(--brand-primary)' }}
            >
              Open Active in Custom Inspector <ArrowRight size={14} />
            </button>
          </div>

          {/* 4 Scenario Cards Grid */}
          <div className="scenario-deck">
            {samples.map((s, idx) => {
              const isSelected = activeSampleId === s.id;
              const isAttack = s.expected_threat === 'ATTACK';
              return (
                <div
                  key={s.id}
                  className={`scenario-card ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleRunPreset(s)}
                >
                  <div>
                    <div className="scenario-card-header">
                      <span style={{
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        padding: '0.15rem 0.5rem',
                        borderRadius: '9999px',
                        background: isAttack ? 'var(--status-attack-bg)' : 'var(--status-normal-bg)',
                        color: isAttack ? 'var(--status-attack-text)' : 'var(--status-normal-text)',
                        border: `1px solid ${isAttack ? 'var(--status-attack-border)' : 'var(--status-normal-border)'}`
                      }}>
                        {s.expected_threat}
                      </span>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                        Preset #{idx + 1}
                      </span>
                    </div>

                    <h4 className="scenario-card-title">{s.name}</h4>
                    <p className="scenario-card-desc">{s.scenario}</p>

                    <div className="scenario-meta-list">
                      <div className="scenario-meta-item">
                        <span>Flag / Protocol:</span>
                        <strong>{s.features.flag} / {s.features.protocol_type}</strong>
                      </div>
                      <div className="scenario-meta-item">
                        <span>Service:</span>
                        <strong>{s.features.service}</strong>
                      </div>
                      <div className="scenario-meta-item">
                        <span>Payload (Src / Dst):</span>
                        <strong>{s.features.src_bytes}B / {s.features.dst_bytes}B</strong>
                      </div>
                      <div className="scenario-meta-item">
                        <span>SYN / REJ Error:</span>
                        <strong>{s.features.serror_rate * 100}% / {s.features.rerror_rate * 100}%</strong>
                      </div>
                    </div>
                  </div>

                  <div className="scenario-card-actions">
                    <button
                      type="button"
                      className="btn-primary"
                      style={{ flex: 1, padding: '0.45rem 0.75rem', fontSize: '0.8rem' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRunPreset(s);
                      }}
                    >
                      <Play size={13} /> Run Scenario
                    </button>
                    <button
                      type="button"
                      className="btn-toggle"
                      style={{ padding: '0.45rem 0.65rem', fontSize: '0.8rem' }}
                      title="Inspect & edit these values in Custom Inspector"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCustomizePreset(s);
                      }}
                    >
                      Customize
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Preset Evaluation Output */}
          {result && (
            <div className="glass-panel" style={{ marginTop: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.45rem', color: 'var(--text-primary)' }}>
                  <CheckCircle2 style={{ color: 'var(--brand-primary)' }} size={20} />
                  Evaluation Result for: {activePreset?.name || 'Selected Scenario'}
                </h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  Classifier: <strong>{model.replace('_', ' ').toUpperCase()}</strong>
                </span>
              </div>

              <div className={`result-card ${task === 'threat' ? (result.threat ? 'danger' : 'safe') : 'safe'}`}>
                <div className="result-header">
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                      {task === 'threat' ? 'Threat Status' : 'Identified Protocol'}
                    </span>
                    <div style={{ fontSize: '1.35rem', fontWeight: 800, marginTop: '0.15rem', color: task === 'threat' ? (result.threat ? 'var(--status-attack)' : 'var(--status-normal)') : 'var(--brand-primary)' }}>
                      {task === 'threat' ? (result.threat ? 'ATTACK DETECTED' : 'NORMAL TRAFFIC') : result.protocol.toUpperCase()}
                    </div>
                  </div>

                  <span className={`badge-tag ${task === 'threat' ? (result.threat ? 'attack' : 'normal') : 'protocol'}`}>
                    {task === 'threat' ? (
                      result.threat ? <><ShieldAlert size={16} /> Malicious Flow</> : <><Shield size={16} /> Benign Flow</>
                    ) : (
                      <><Cpu size={16} /> {result.protocol}</>
                    )}
                  </span>
                </div>

                {/* Confidence Bar */}
                <div className="confidence-container">
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Model Confidence</span>
                    <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{(result.confidence * 100).toFixed(1)}%</span>
                  </div>
                  <div className="confidence-bar-bg">
                    <div
                      className={`confidence-bar-fill ${task === 'threat' ? (result.threat ? 'attack' : 'normal') : 'protocol'}`}
                      style={{ width: `${Math.max(result.confidence * 100, 5)}%` }}
                    />
                  </div>
                </div>

                {/* Humanized Explanation */}
                <div style={{ background: 'var(--bg-surface)', padding: '0.75rem 0.9rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {task === 'threat' ? (
                    result.threat ? (
                      <p>
                        <strong>Malicious Signature Analysis:</strong> Flow exhibits volumetric flood or port scan patterns with elevated error rates and abnormal handshake flags. Flagged as an active threat by the {model.replace('_', ' ')} classifier.
                      </p>
                    ) : (
                      <p>
                        <strong>Benign Traffic Analysis:</strong> Connection parameters follow legitimate protocol standards with normal handshake completion (SF flag), balanced payloads, and minimal error rates. Classified as clean normal traffic.
                      </p>
                    )
                  ) : (
                    <p>
                      <strong>Rule 3 Enforced:</strong> The raw <code>service</code> feature was strictly dropped to ensure zero data leakage. The classifier identified this protocol purely from behavioral metadata.
                    </p>
                  )}
                </div>

                {/* Probabilities Breakdown */}
                {result.probabilities && Object.keys(result.probabilities).length > 0 && (
                  <div style={{ fontSize: '0.775rem' }}>
                    <span style={{ color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Class Probabilities:</span>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '0.4rem', marginTop: '0.35rem' }}>
                      {Object.entries(result.probabilities).map(([cls, prob]) => (
                        <div key={cls} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', padding: '0.35rem 0.5rem', borderRadius: '4px', display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: 'var(--text-secondary)' }}>{cls === '0' ? 'Normal' : cls === '1' ? 'Attack' : cls}:</span>
                          <strong style={{ color: 'var(--text-primary)' }}>{(prob * 100).toFixed(1)}%</strong>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Model Explanation Diagram (Decision Tree, SVM, Naive Bayes) */}
          {result && (
            <ModelExplanationDiagram
              model={model}
              task={task}
              explanation={result.explanation}
              result={result}
            />
          )}
        </div>
      )}

      {/* =========================================================================
          VIEW MODE 2: CUSTOM PACKET INSPECTOR (INTERACTIVE TESTING)
         ========================================================================= */}
      {viewMode === 'custom' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: result ? '1.4fr 1fr' : '1fr', gap: '1.25rem', transition: 'all 0.3s ease' }}>
            <form onSubmit={handlePredictCustom} className="glass-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <Sliders size={20} style={{ color: 'var(--brand-primary)' }} />
                  Custom Packet Inspector
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                  Define custom network traffic flow attributes to test zero-day payloads, simulated attacks, or benign sessions.
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleApplyArchetype('blank')}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--brand-primary)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  fontSize: '0.825rem',
                  fontWeight: 500
                }}
              >
                <RefreshCw size={13} /> Reset to Blank
              </button>
            </div>

            {/* Quick Starter Archetypes Strip */}
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Quick Starter Templates:
              </span>
              <div className="archetype-strip" style={{ marginTop: '0.35rem' }}>
                {Object.values(ARCHETYPES).map(arch => (
                  <button
                    key={arch.id}
                    type="button"
                    className={`archetype-pill ${activeArchetype === arch.id ? 'active' : ''}`}
                    onClick={() => handleApplyArchetype(arch.id)}
                  >
                    <span>{arch.icon}</span>
                    <span>{arch.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Smart Harmonization Toggle Card */}
            <div className="harmonize-banner">
              <div>
                <div style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Activity size={15} style={{ color: 'var(--brand-primary)' }} />
                  Smart Network Metric Correlation
                </div>
                <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
                  Automatically synchronizes destination host error rates and session state when you change handshake flags or error rates.
                </div>
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                <input
                  type="checkbox"
                  checked={autoHarmonize}
                  onChange={(e) => setAutoHarmonize(e.target.checked)}
                  style={{ width: '16px', height: '16px', accentColor: 'var(--brand-primary)', cursor: 'pointer' }}
                />
                Auto-Sync
              </label>
            </div>

            {/* Feature Sub-Tabs */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                className={`btn-toggle ${activeFeatureTab === 'fundamentals' ? 'active' : ''}`}
                onClick={() => setActiveFeatureTab('fundamentals')}
              >
                <Globe size={14} /> 1. Fundamentals & Payload
              </button>
              <button
                type="button"
                className={`btn-toggle ${activeFeatureTab === 'traffic' ? 'active' : ''}`}
                onClick={() => setActiveFeatureTab('traffic')}
              >
                <Activity size={14} /> 2. Error Rates & Host Counts
              </button>
              <button
                type="button"
                className={`btn-toggle ${activeFeatureTab === 'security' ? 'active' : ''}`}
                onClick={() => setActiveFeatureTab('security')}
              >
                <Lock size={14} /> 3. Access & System Flags
              </button>
            </div>

            {/* Tab 1: Connection Fundamentals & Payload */}
            {activeFeatureTab === 'fundamentals' && (
              <div className="features-grid" style={{ marginBottom: '1.25rem' }}>
                <div className="form-group">
                  <label className="form-label">Protocol Type</label>
                  <select name="protocol_type" value={customData.protocol_type} onChange={handleCustomInputChange} className="form-select">
                    <option value="tcp">TCP (Transmission Control)</option>
                    <option value="udp">UDP (User Datagram)</option>
                    <option value="icmp">ICMP (Internet Control)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    Service (Port)
                    <HelpCircle size={13} style={{ color: 'var(--text-muted)' }} title="Rule 3: Strictly dropped in Task B to prevent artificial target leakage!" />
                  </label>
                  <input
                    type="text"
                    name="service"
                    value={customData.service}
                    onChange={handleCustomInputChange}
                    className="form-input"
                    placeholder="http, ftp, smtp, private..."
                  />
                  <span className="form-hint">
                    {task === 'protocol' ? "(Excluded in Task B for zero data leakage)" : "Target port service identifier"}
                  </span>
                </div>

                <div className="form-group">
                  <label className="form-label">Connection Flag</label>
                  <select name="flag" value={customData.flag} onChange={handleCustomInputChange} className="form-select">
                    <option value="SF">SF (Normal Established)</option>
                    <option value="S0">S0 (SYN flood - No response)</option>
                    <option value="REJ">REJ (Connection rejected / scan)</option>
                    <option value="RSTO">RSTO (Reset by originator)</option>
                    <option value="RSTR">RSTR (Reset by responder)</option>
                    <option value="SH">SH (Half-open SYN)</option>
                  </select>
                  <span className="form-hint">Select S0 or REJ to simulate attack handshakes</span>
                </div>

                <div className="form-group">
                  <label className="form-label">Duration (seconds)</label>
                  <input type="number" step="0.1" name="duration" value={customData.duration} onChange={handleCustomInputChange} className="form-input" />
                </div>

                <div className="form-group">
                  <label className="form-label">Source Bytes (Client -&gt; Server)</label>
                  <input type="number" name="src_bytes" value={customData.src_bytes} onChange={handleCustomInputChange} className="form-input" />
                  <span className="form-hint">0 for SYN floods / port scans</span>
                </div>

                <div className="form-group">
                  <label className="form-label">Destination Bytes (Server -&gt; Client)</label>
                  <input type="number" name="dst_bytes" value={customData.dst_bytes} onChange={handleCustomInputChange} className="form-input" />
                  <span className="form-hint">Response payload size</span>
                </div>
              </div>
            )}

            {/* Tab 2: Error Rates & Host Counts */}
            {activeFeatureTab === 'traffic' && (
              <div className="features-grid" style={{ marginBottom: '1.25rem' }}>
                <div className="form-group">
                  <label className="form-label">SYN Error Rate (0.0 to 1.0)</label>
                  <input type="number" step="0.01" min="0" max="1" name="serror_rate" value={customData.serror_rate} onChange={handleCustomInputChange} className="form-input" />
                  <span className="form-hint">1.0 = High SYN flood attack</span>
                </div>

                <div className="form-group">
                  <label className="form-label">REJ Error Rate (0.0 to 1.0)</label>
                  <input type="number" step="0.01" min="0" max="1" name="rerror_rate" value={customData.rerror_rate} onChange={handleCustomInputChange} className="form-input" />
                  <span className="form-hint">1.0 = High Port sweep probe</span>
                </div>

                <div className="form-group">
                  <label className="form-label">Destination Host SYN Error Rate</label>
                  <input type="number" step="0.01" min="0" max="1" name="dst_host_serror_rate" value={customData.dst_host_serror_rate} onChange={handleCustomInputChange} className="form-input" />
                  <span className="form-hint">Key Decision Tree feature</span>
                </div>

                <div className="form-group">
                  <label className="form-label">Destination Host REJ Error Rate</label>
                  <input type="number" step="0.01" min="0" max="1" name="dst_host_rerror_rate" value={customData.dst_host_rerror_rate} onChange={handleCustomInputChange} className="form-input" />
                  <span className="form-hint">Destination probe rejection rate</span>
                </div>

                <div className="form-group">
                  <label className="form-label">Same Host Count (past 2s)</label>
                  <input type="number" name="count" value={customData.count} onChange={handleCustomInputChange} className="form-input" />
                </div>

                <div className="form-group">
                  <label className="form-label">Destination Host Total Count</label>
                  <input type="number" name="dst_host_count" value={customData.dst_host_count} onChange={handleCustomInputChange} className="form-input" />
                </div>

                <div className="form-group">
                  <label className="form-label">Destination Host Srv Count</label>
                  <input type="number" name="dst_host_srv_count" value={customData.dst_host_srv_count} onChange={handleCustomInputChange} className="form-input" />
                </div>

                <div className="form-group">
                  <label className="form-label">Same Service Rate (0.0 to 1.0)</label>
                  <input type="number" step="0.01" min="0" max="1" name="same_srv_rate" value={customData.same_srv_rate} onChange={handleCustomInputChange} className="form-input" />
                </div>
              </div>
            )}

            {/* Tab 3: Security & Access Flags */}
            {activeFeatureTab === 'security' && (
              <div className="features-grid" style={{ marginBottom: '1.25rem' }}>
                <div className="form-group">
                  <label className="form-label">Logged In Successfully</label>
                  <select name="logged_in" value={customData.logged_in} onChange={handleCustomInputChange} className="form-select">
                    <option value={1}>1 (Yes, logged in)</option>
                    <option value={0}>0 (No login / pre-auth)</option>
                  </select>
                  <span className="form-hint">Unfinished handshakes = 0</span>
                </div>

                <div className="form-group">
                  <label className="form-label">Failed Login Attempts</label>
                  <input type="number" name="num_failed_logins" value={customData.num_failed_logins} onChange={handleCustomInputChange} className="form-input" />
                </div>

                <div className="form-group">
                  <label className="form-label">Root Shell Obtained</label>
                  <select name="root_shell" value={customData.root_shell} onChange={handleCustomInputChange} className="form-select">
                    <option value={0}>0 (No root shell)</option>
                    <option value={1}>1 (Root privilege gained)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">SU Attempted ('su root')</label>
                  <select name="su_attempted" value={customData.su_attempted} onChange={handleCustomInputChange} className="form-select">
                    <option value={0}>0 (No su attempt)</option>
                    <option value={1}>1 (su root attempted)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Hot Indicators (Sensitive dirs)</label>
                  <input type="number" name="hot" value={customData.hot} onChange={handleCustomInputChange} className="form-input" />
                </div>

                <div className="form-group">
                  <label className="form-label">Is Guest Login</label>
                  <select name="is_guest_login" value={customData.is_guest_login} onChange={handleCustomInputChange} className="form-select">
                    <option value={0}>0 (Regular account)</option>
                    <option value={1}>1 (Guest session)</option>
                  </select>
                </div>
              </div>
            )}

            {error && (
              <div style={{ padding: '0.75rem 1rem', background: 'var(--status-attack-bg)', border: '1px solid var(--status-attack-border)', borderRadius: 'var(--radius-sm)', color: 'var(--status-attack-text)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                <AlertTriangle size={18} style={{ flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', padding: '0.8rem' }}>
              {loading ? <RefreshCw className="animate-spin" size={18} /> : <Send size={18} />}
              {loading ? 'Evaluating Model Inference...' : `Classify Custom Input with ${model.replace('_', ' ').toUpperCase()}`}
            </button>
          </form>

          {/* Custom Inference Result Panel */}
          {result && (
            <div className="glass-panel" style={{ height: 'fit-content' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.45rem', color: 'var(--text-primary)' }}>
                  <CheckCircle2 style={{ color: 'var(--brand-primary)' }} size={20} />
                  Custom Inference Result
                </h3>
                {result.isOfflineDemo && (
                  <span style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem', borderRadius: '4px', background: 'var(--status-warning-bg)', color: 'var(--status-warning-text)', border: '1px solid var(--status-warning-border)', fontWeight: 600 }}>
                    Offline Demo Mode
                  </span>
                )}
              </div>

              <div className={`result-card ${task === 'threat' ? (result.threat ? 'danger' : 'safe') : 'safe'}`}>
                <div className="result-header">
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                      {task === 'threat' ? 'Threat Status' : 'Identified Protocol'}
                    </span>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: '0.15rem', color: task === 'threat' ? (result.threat ? 'var(--status-attack)' : 'var(--status-normal)') : 'var(--brand-primary)' }}>
                      {task === 'threat' ? (result.threat ? 'ATTACK DETECTED' : 'NORMAL TRAFFIC') : result.protocol.toUpperCase()}
                    </div>
                  </div>

                  <span className={`badge-tag ${task === 'threat' ? (result.threat ? 'attack' : 'normal') : 'protocol'}`}>
                    {task === 'threat' ? (
                      result.threat ? <><ShieldAlert size={16} /> Malicious Flow</> : <><Shield size={16} /> Benign Flow</>
                    ) : (
                      <><Cpu size={16} /> {result.protocol}</>
                    )}
                  </span>
                </div>

                {/* Confidence Gauge */}
                <div className="confidence-container">
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Model Confidence</span>
                    <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{(result.confidence * 100).toFixed(1)}%</span>
                  </div>
                  <div className="confidence-bar-bg">
                    <div
                      className={`confidence-bar-fill ${task === 'threat' ? (result.threat ? 'attack' : 'normal') : 'protocol'}`}
                      style={{ width: `${Math.max(result.confidence * 100, 5)}%` }}
                    />
                  </div>
                </div>

                {/* Explanation */}
                <div style={{ background: 'var(--bg-surface)', padding: '0.75rem 0.9rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {task === 'threat' ? (
                    result.threat ? (
                      <p>
                        <strong>Custom Flow Analysis:</strong> Traffic inputs match attack signatures (elevated error rates, incomplete handshake flag, or anomaly indicators). Flagged as malicious by {model.replace('_', ' ')}.
                      </p>
                    ) : (
                      <p>
                        <strong>Custom Flow Analysis:</strong> Connection parameters follow established standards (SF flag, low error rates, or standard data exchange). Classified as clean normal traffic by {model.replace('_', ' ')}.
                      </p>
                    )
                  ) : (
                    <p>
                      <strong>Zero Leakage Check:</strong> In Task B, port service was dropped from inference. The model classified protocol behavior based on packet sizes and transmission patterns.
                    </p>
                  )}
                </div>

                {/* Pipeline details */}
                <div style={{ paddingTop: '0.6rem', borderTop: '1px solid var(--border-subtle)', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Pipeline Evaluated:</span>
                    <strong style={{ color: 'var(--text-primary)' }}>{result.model_used}</strong>
                  </div>
                </div>

                {/* Class probabilities */}
                {result.probabilities && Object.keys(result.probabilities).length > 0 && (
                  <div style={{ fontSize: '0.775rem' }}>
                    <span style={{ color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Class Probabilities:</span>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '0.4rem', marginTop: '0.35rem' }}>
                      {Object.entries(result.probabilities).map(([cls, prob]) => (
                        <div key={cls} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', padding: '0.35rem 0.5rem', borderRadius: '4px', display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: 'var(--text-secondary)' }}>{cls === '0' ? 'Normal' : cls === '1' ? 'Attack' : cls}:</span>
                          <strong style={{ color: 'var(--text-primary)' }}>{(prob * 100).toFixed(1)}%</strong>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Custom Mode Explanation Diagram */}
        {result && (
          <ModelExplanationDiagram
            model={model}
            task={task}
            explanation={result.explanation}
            result={result}
          />
        )}
      </div>
      )}
    </div>
  );
}
