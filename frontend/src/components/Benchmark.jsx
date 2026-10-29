import React, { useState, useEffect } from 'react';
import { Award, Clock, BarChart3, Lightbulb } from 'lucide-react';
import api from '../api/client';

export default function Benchmark() {
  const [metrics, setMetrics] = useState(null);
  const [task, setTask] = useState('task_a');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    api.getMetrics().then(data => {
      if (isMounted && data) {
        setMetrics(data);
        setLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="glass-panel" style={{ textAlign: 'center', padding: '3rem' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Loading model benchmark metrics...</p>
      </div>
    );
  }

  const currentTaskData = metrics ? (metrics[task] || {}) : {};
  const models = [
    { key: 'decision_tree', name: 'Decision Tree (Entropy)', icon: '🌳', desc: 'Recursive binary partitioning maximizing Information Gain' },
    { key: 'svm', name: 'Support Vector Machine (RBF)', icon: '⚡', desc: 'Radial Basis Function kernel with non-linear margin boundaries' },
    { key: 'naive_bayes', name: 'Gaussian Naive Bayes', icon: '📊', desc: 'Probabilistic conditional independence baseline' }
  ];

  // Maximum training and predict times for relative bar width
  const maxTrainTime = Math.max(...models.map(m => currentTaskData[m.key]?.train_time || 0.1), 0.1);
  const maxPredictTime = Math.max(...models.map(m => currentTaskData[m.key]?.predict_time || 0.1), 0.1);

  return (
    <div className="benchmark-container">
      {/* Top Banner and Task Switcher */}
      <div className="glass-panel" style={{ marginBottom: '1.25rem' }}>
        <div className="control-bar">
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
              <Award style={{ color: 'var(--brand-primary)' }} size={22} />
              Model Performance Benchmarks
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.2rem' }}>
              Empirical evaluation across all 3 trained pipelines on the official <strong>NSL-KDD Test Set (22,544 Records)</strong>.
            </p>
          </div>

          <div className="button-group">
            <button
              type="button"
              className={`btn-toggle ${task === 'task_a' ? 'active' : ''}`}
              onClick={() => setTask('task_a')}
            >
              Task A (Threat Detection)
            </button>
            <button
              type="button"
              className={`btn-toggle ${task === 'task_b' ? 'active' : ''}`}
              onClick={() => setTask('task_b')}
            >
              Task B (Protocol Classification)
            </button>
          </div>
        </div>

        {/* 3 Model Metric Cards */}
        <div className="benchmark-grid">
          {models.map(m => {
            const data = currentTaskData[m.key] || {};
            const isWinner = m.key === 'decision_tree';

            return (
              <div key={m.key} className={`model-card ${isWinner ? 'featured' : ''}`}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-primary)' }}>
                      <span>{m.icon}</span> {m.name}
                    </h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.15rem' }}>
                      {m.desc}
                    </p>
                  </div>
                  {isWinner && (
                    <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.55rem', background: 'var(--brand-primary-light)', color: 'var(--brand-primary)', borderRadius: '9999px', fontWeight: 700, border: '1px solid var(--brand-primary-border)' }}>
                      TOP PERFORMER
                    </span>
                  )}
                </div>

                <div style={{ margin: '0.4rem 0', padding: '0.75rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontSize: '2.1rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.1 }}>
                    {((data.accuracy || 0) * 100).toFixed(2)}%
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', marginTop: '0.2rem' }}>
                    Test Dataset Accuracy
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <div className="metric-row">
                    <span style={{ color: 'var(--text-secondary)' }}>Weighted F1-Score:</span>
                    <strong>{((data.f1_weighted || 0) * 100).toFixed(2)}%</strong>
                  </div>
                  <div className="metric-row">
                    <span style={{ color: 'var(--text-secondary)' }}>Weighted Precision:</span>
                    <strong>{((data.precision_weighted || 0) * 100).toFixed(2)}%</strong>
                  </div>
                  <div className="metric-row">
                    <span style={{ color: 'var(--text-secondary)' }}>Weighted Recall:</span>
                    <strong>{((data.recall_weighted || 0) * 100).toFixed(2)}%</strong>
                  </div>
                  <div className="metric-row">
                    <span style={{ color: 'var(--text-secondary)' }}>Macro F1-Score:</span>
                    <strong>{((data.f1_macro || 0) * 100).toFixed(2)}%</strong>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Execution Timing Comparison Bar Charts */}
      <div className="glass-panel" style={{ marginBottom: '1.25rem' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
          <Clock style={{ color: 'var(--brand-primary)' }} size={20} />
          Execution Timing Benchmarks
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
          Comparing model fitting duration vs inference latency per 22,544 test packets.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
          {/* Training Time Chart */}
          <div>
            <h4 style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.75rem', fontWeight: 600 }}>
              1. Training Duration (Lower is Faster)
            </h4>
            <div className="bar-chart-container">
              {models.map(m => {
                const tTime = currentTaskData[m.key]?.train_time || 0;
                const pct = Math.max((tTime / maxTrainTime) * 100, 4);
                return (
                  <div key={m.key} className="bar-row">
                    <span style={{ color: 'var(--text-secondary)' }}>{m.name.split(' ')[0]}</span>
                    <div className="bar-bg">
                      <div className="bar-fill" style={{ width: `${pct}%`, background: 'var(--brand-primary)' }} />
                    </div>
                    <span style={{ fontWeight: 700, textAlign: 'right', color: 'var(--text-primary)' }}>{tTime.toFixed(2)}s</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Inference Predict Time Chart */}
          <div>
            <h4 style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.75rem', fontWeight: 600 }}>
              2. Test Batch Inference Latency (22,544 rows)
            </h4>
            <div className="bar-chart-container">
              {models.map(m => {
                const pTime = currentTaskData[m.key]?.predict_time || 0;
                const pct = Math.max((pTime / maxPredictTime) * 100, 4);
                return (
                  <div key={m.key} className="bar-row">
                    <span style={{ color: 'var(--text-secondary)' }}>{m.name.split(' ')[0]}</span>
                    <div className="bar-bg">
                      <div className="bar-fill" style={{ width: `${pct}%`, background: 'var(--accent-purple)' }} />
                    </div>
                    <span style={{ fontWeight: 700, textAlign: 'right', color: 'var(--text-primary)' }}>{pTime.toFixed(3)}s</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Academic Lab Observations & Confusion Matrix */}
      <div style={{ display: 'grid', gridTemplateColumns: task === 'task_a' && currentTaskData.decision_tree?.confusion_matrix ? '1fr 1fr' : '1fr', gap: '1.25rem' }}>
        {/* Lab Analysis Note */}
        <div className="glass-panel">
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.45rem', color: 'var(--text-primary)' }}>
            <Lightbulb style={{ color: 'var(--brand-primary)' }} size={19} />
            Academic Comparative Analysis
          </h3>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            <p>
              <strong>Why Decision Tree Excels:</strong> Decision Tree (using Shannon Entropy) achieved highest overall accuracy ({((currentTaskData.decision_tree?.accuracy || 0) * 100).toFixed(1)}%) with negligible inference latency (sub-100ms for 22,500 records). Tabular network logs contain non-linear, threshold-driven features (e.g. <code>src_bytes == 0</code> with <code>flag == 'S0'</code>) that partition cleanly into axis-aligned hyperplanes.
            </p>
            <p style={{ marginTop: '0.6rem' }}>
              <strong>SVM Characteristics:</strong> RBF Kernel SVM achieved solid {((currentTaskData.svm?.accuracy || 0) * 100).toFixed(1)}% accuracy when trained on a 20,000-row representative sample, but required {((currentTaskData.svm?.predict_time || 0)).toFixed(1)}s for test evaluation due to quadratic kernel distance calculations against support vectors.
            </p>
            <p style={{ marginTop: '0.6rem' }}>
              <strong>Naive Bayes Limitations:</strong> Gaussian Naive Bayes had the lowest score because it assumes feature conditional independence—an assumption violated by network traffic (e.g., <code>count</code>, <code>srv_count</code>, and error rates are strongly correlated).
            </p>
          </div>
        </div>

        {/* Confusion Matrix Visualizer for Task A */}
        {task === 'task_a' && currentTaskData.decision_tree?.confusion_matrix && (
          <div className="glass-panel">
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.45rem', color: 'var(--text-primary)' }}>
              <BarChart3 style={{ color: 'var(--accent-purple)' }} size={19} />
              Decision Tree Confusion Matrix (Task A)
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '1rem' }}>
              Actual ground truth labels vs Decision Tree predictions on 22,544 test packets.
            </p>

            <div style={{ maxWidth: '420px', margin: '0 auto', background: 'var(--bg-subtle)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr 1fr', gap: '0.5rem', textAlign: 'center', fontSize: '0.825rem' }}>
                <div></div>
                <div style={{ fontWeight: 700, color: 'var(--status-normal-text)', fontSize: '0.75rem' }}>PRED: NORMAL</div>
                <div style={{ fontWeight: 700, color: 'var(--status-attack-text)', fontSize: '0.75rem' }}>PRED: ATTACK</div>

                <div style={{ textAlign: 'left', fontWeight: 700, color: 'var(--status-normal-text)', fontSize: '0.75rem', alignSelf: 'center' }}>TRUE: NORMAL</div>
                <div style={{ background: 'var(--status-normal-bg)', border: '1px solid var(--status-normal-border)', padding: '0.6rem', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--status-normal-text)' }}>
                    {currentTaskData.decision_tree.confusion_matrix[0][0].toLocaleString()}
                  </div>
                  <div style={{ fontSize: '0.675rem', color: 'var(--status-normal-text)', fontWeight: 600 }}>True Negative</div>
                </div>
                <div style={{ background: 'var(--status-attack-bg)', border: '1px solid var(--status-attack-border)', padding: '0.6rem', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--status-attack-text)' }}>
                    {currentTaskData.decision_tree.confusion_matrix[0][1].toLocaleString()}
                  </div>
                  <div style={{ fontSize: '0.675rem', color: 'var(--status-attack-text)', fontWeight: 600 }}>False Positive</div>
                </div>

                <div style={{ textAlign: 'left', fontWeight: 700, color: 'var(--status-attack-text)', fontSize: '0.75rem', alignSelf: 'center' }}>TRUE: ATTACK</div>
                <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', padding: '0.6rem', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-muted)' }}>
                    {currentTaskData.decision_tree.confusion_matrix[1][0].toLocaleString()}
                  </div>
                  <div style={{ fontSize: '0.675rem', color: 'var(--text-muted)', fontWeight: 600 }}>False Negative</div>
                </div>
                <div style={{ background: 'var(--status-attack-bg)', border: '1px solid var(--status-attack-border)', padding: '0.6rem', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--status-attack-text)' }}>
                    {currentTaskData.decision_tree.confusion_matrix[1][1].toLocaleString()}
                  </div>
                  <div style={{ fontSize: '0.675rem', color: 'var(--status-attack-text)', fontWeight: 600 }}>True Positive</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
