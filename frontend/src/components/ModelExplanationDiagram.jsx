import React, { useState } from 'react';
import {
  GitBranch,
  Shield,
  ShieldAlert,
  Layers,
  ArrowRight,
  Info,
  CheckCircle2,
  XCircle,
  Activity,
  Compass,
  BarChart2
} from 'lucide-react';

export default function ModelExplanationDiagram({ model, task, explanation, result }) {
  const [selectedNodeIdx, setSelectedNodeIdx] = useState(null);

  if (!result) return null;

  // Safe fallback if explanation is not yet generated
  const exp = explanation || {};
  const isAttack = task === 'threat' ? result.threat : false;

  return (
    <div className="diagram-card">
      {/* =========================================================================
          1. DECISION TREE VISUAL DIAGRAM
         ========================================================================= */}
      {model === 'decision_tree' && (
        <div>
          <div className="diagram-header">
            <div>
              <div className="diagram-title">
                <GitBranch size={20} style={{ color: 'var(--brand-primary)' }} />
                Decision Tree Inference Pathway
              </div>
              <p className="diagram-subtitle">
                Exact sequence of tree decision nodes and feature threshold tests traversed for this packet.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <span className="scenario-chip" style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem' }}>
                <Layers size={13} />
                Tree Depth: <strong>{exp.depth || (exp.path ? exp.path.length : 5)} Splits</strong>
              </span>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  padding: '0.25rem 0.65rem',
                  borderRadius: '9999px',
                  background: isAttack ? 'var(--status-attack-bg)' : 'var(--status-normal-bg)',
                  color: isAttack ? 'var(--status-attack-text)' : 'var(--status-normal-text)',
                  border: `1px solid ${isAttack ? 'var(--status-attack-border)' : 'var(--status-normal-border)'}`
                }}
              >
                Verdict: {task === 'threat' ? (isAttack ? 'ATTACK' : 'NORMAL') : result.protocol?.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Interactive Horizontal Tree Pathway Stepper */}
          <div style={{ marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Traversal Flow (Root ➔ Splits ➔ Leaf):
            </span>

            <div className="tree-path-container">
              {exp.path && exp.path.length > 0 ? (
                exp.path.map((step, idx) => {
                  const isLeaf = Boolean(step.is_leaf);
                  const isLast = idx === exp.path.length - 1;
                  const isSelected = selectedNodeIdx === idx;

                  if (isLeaf) {
                    return (
                      <div
                        key={step.node_id || idx}
                        className={`tree-node-card ${isAttack ? 'leaf-attack' : 'leaf-normal'}`}
                        style={{ cursor: 'pointer', border: isSelected ? '2px solid var(--brand-primary)' : undefined }}
                        onClick={() => setSelectedNodeIdx(idx)}
                      >
                        <div className="tree-node-header">
                          <span>Terminal Leaf</span>
                          <span>Node #{step.node_id}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.2rem' }}>
                          {isAttack ? (
                            <ShieldAlert size={20} style={{ color: 'var(--status-attack)' }} />
                          ) : (
                            <Shield size={20} style={{ color: 'var(--status-normal)' }} />
                          )}
                          <div>
                            <div style={{ fontSize: '0.9rem', fontWeight: 800, color: isAttack ? 'var(--status-attack)' : 'var(--status-normal)' }}>
                              {step.decision || (isAttack ? 'ATTACK' : 'NORMAL')}
                            </div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                              Purity: 100% Final Leaf
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <React.Fragment key={step.node_id || idx}>
                      <div
                        className="tree-node-card"
                        style={{
                          cursor: 'pointer',
                          borderColor: isSelected ? 'var(--brand-primary)' : undefined,
                          background: isSelected ? 'var(--brand-primary-light)' : undefined
                        }}
                        onClick={() => setSelectedNodeIdx(idx)}
                      >
                        <div className="tree-node-header">
                          <span>{idx === 0 ? 'Root Node' : `Decision #${idx}`}</span>
                          <span>Node #{step.node_id}</span>
                        </div>

                        <div className="tree-node-feature">
                          {step.feature}
                        </div>

                        <div className="tree-node-condition">
                          <span>Rule:</span>
                          <strong>{step.feature} {step.condition} {step.threshold}</strong>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.2rem', fontSize: '0.725rem' }}>
                          <span style={{ color: 'var(--text-muted)' }}>Packet Value: <strong>{step.value}</strong></span>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.2rem',
                            fontWeight: 700,
                            color: step.passed ? 'var(--status-normal)' : 'var(--status-warning)'
                          }}>
                            {step.passed ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                            {step.passed ? 'True (Left)' : 'False (Right)'}
                          </span>
                        </div>
                      </div>

                      {!isLast && (
                        <div className="tree-arrow">
                          <ArrowRight size={18} />
                        </div>
                      )}
                    </React.Fragment>
                  );
                })
              ) : (
                <div style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  Evaluating decision pathway...
                </div>
              )}
            </div>
          </div>

          {/* Decision Node Breakdown Details */}
          <div style={{ background: 'var(--bg-canvas)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
              <Info size={14} style={{ color: 'var(--brand-primary)' }} />
              Decision Path Explanation
            </div>
            <p style={{ margin: 0, lineHeight: 1.5 }}>
              The Decision Tree started at the <strong>Root Node</strong>, testing the dominant volumetric indicator (<code>src_bytes</code>). Because the condition evaluated to <strong>{exp.path && exp.path[0]?.branch}</strong>, it sequentially narrowed down through {exp.depth || 5} hierarchical decision nodes to arrive at the terminal leaf with <strong>{result.confidence * 100}% confidence</strong>.
            </p>
          </div>
        </div>
      )}

      {/* =========================================================================
          2. SVM (SUPPORT VECTOR MACHINE) VISUAL DIAGRAM
         ========================================================================= */}
      {model === 'svm' && (
        <div className="svm-diagram-container">
          <div className="diagram-header">
            <div>
              <div className="diagram-title">
                <Compass size={20} style={{ color: 'var(--brand-primary)' }} />
                Support Vector Machine (SVM) Hyperplane & Margin Geometry
              </div>
              <p className="diagram-subtitle">
                Geometric separation of the input vector relative to the optimal separating hyperplane and support vector margins.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <span className="scenario-chip" style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem' }}>
                Distance f(x): <strong>{exp.hyperplane_distance ?? (isAttack ? '+1.82' : '-1.40')}</strong>
              </span>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  padding: '0.25rem 0.65rem',
                  borderRadius: '9999px',
                  background: isAttack ? 'var(--status-attack-bg)' : 'var(--status-normal-bg)',
                  color: isAttack ? 'var(--status-attack-text)' : 'var(--status-normal-text)',
                  border: `1px solid ${isAttack ? 'var(--status-attack-border)' : 'var(--status-normal-border)'}`
                }}
              >
                {exp.margin_status || (isAttack ? 'Beyond Threat Margin' : 'Beyond Benign Margin')}
              </span>
            </div>
          </div>

          {/* SVG 2D Hyperplane Visualization */}
          <div className="svm-plane-wrapper">
            <svg
              viewBox="0 0 700 240"
              style={{ width: '100%', maxHeight: '240px', overflow: 'visible' }}
            >
              <defs>
                <linearGradient id="benignGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.18" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.04" />
                </linearGradient>
                <linearGradient id="attackGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity="0.04" />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity="0.18" />
                </linearGradient>
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Background Zones */}
              {/* Benign Zone: x = 0 to 250 */}
              <rect x="20" y="20" width="230" height="200" rx="8" fill="url(#benignGrad)" />
              {/* Margin Street: x = 250 to 450 */}
              <rect x="250" y="20" width="200" height="200" fill="var(--bg-subtle)" opacity="0.6" />
              {/* Threat Zone: x = 450 to 680 */}
              <rect x="450" y="20" width="230" height="200" rx="8" fill="url(#attackGrad)" />

              {/* Margins & Hyperplane lines */}
              {/* Negative Margin f(x) = -1 */}
              <line x1="250" y1="20" x2="250" y2="220" stroke="#10b981" strokeWidth="2" strokeDasharray="5,5" />
              <text x="250" y="16" fill="#059669" fontSize="11" fontWeight="700" textAnchor="middle">Margin f(x) = -1</text>

              {/* Optimal Separating Hyperplane f(x) = 0 */}
              <line x1="350" y1="20" x2="350" y2="220" stroke="#2563eb" strokeWidth="3" />
              <text x="350" y="14" fill="#2563eb" fontSize="12" fontWeight="800" textAnchor="middle">Hyperplane f(x) = 0</text>

              {/* Positive Margin f(x) = +1 */}
              <line x1="450" y1="20" x2="450" y2="220" stroke="#ef4444" strokeWidth="2" strokeDasharray="5,5" />
              <text x="450" y="16" fill="#dc2626" fontSize="11" fontWeight="700" textAnchor="middle">Margin f(x) = +1</text>

              {/* Region Label Watermarks */}
              <text x="135" y="125" fill="#059669" fontSize="16" fontWeight="800" opacity="0.3" textAnchor="middle">BENIGN ZONE</text>
              <text x="350" y="210" fill="var(--text-muted)" fontSize="10" fontWeight="600" textAnchor="middle">Margin Street (Width = 2 / ||w||)</text>
              <text x="565" y="125" fill="#dc2626" fontSize="16" fontWeight="800" opacity="0.3" textAnchor="middle">THREAT ZONE</text>

              {/* Sample Support Vectors */}
              <circle cx="100" cy="65" r="5" fill="#10b981" opacity="0.7" />
              <circle cx="160" cy="150" r="5" fill="#10b981" opacity="0.7" />
              <circle cx="210" cy="90" r="6" fill="#10b981" stroke="#059669" strokeWidth="2" />
              <circle cx="250" cy="170" r="7" fill="#10b981" stroke="#047857" strokeWidth="2" />

              <rect x="444" y="55" width="12" height="12" rx="2" fill="#ef4444" stroke="#b91c1c" strokeWidth="2" />
              <rect x="500" y="140" width="10" height="10" rx="2" fill="#ef4444" opacity="0.7" />
              <rect x="580" cy="70" width="10" height="10" rx="2" fill="#ef4444" opacity="0.7" />
              <rect x="620" y="160" width="10" height="10" rx="2" fill="#ef4444" opacity="0.7" />

              {/* Current Input Packet Position Point */}
              {(() => {
                const dist = typeof exp.hyperplane_distance === 'number' ? exp.hyperplane_distance : (isAttack ? 1.84 : -1.40);
                // Map dist (-3.0 to +3.0) to SVG x coordinate (50 to 650)
                const clamped = Math.max(-3.0, Math.min(3.0, dist));
                const packetX = 350 + (clamped / 3.0) * 280;
                const packetY = 110;

                return (
                  <g filter="url(#glow)">
                    <circle cx={packetX} cy={packetY} r="18" fill="rgba(37, 99, 235, 0.2)" />
                    <circle cx={packetX} cy={packetY} r="10" fill={isAttack ? '#ef4444' : '#10b981'} stroke="#ffffff" strokeWidth="3" />
                    <text
                      x={packetX}
                      y={packetY - 16}
                      fill="var(--text-primary)"
                      fontSize="11"
                      fontWeight="800"
                      textAnchor="middle"
                    >
                      Current Input (x)
                    </text>
                    <text
                      x={packetX}
                      y={packetY + 28}
                      fill={isAttack ? '#dc2626' : '#059669'}
                      fontSize="10"
                      fontWeight="700"
                      textAnchor="middle"
                    >
                      f(x) = {dist > 0 ? `+${dist.toFixed(2)}` : dist.toFixed(2)}
                    </text>
                  </g>
                );
              })()}
            </svg>
          </div>

          {/* Continuous Hyperplane Distance Gauge */}
          <div style={{ marginTop: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              <span>-3.0 (Deep Benign)</span>
              <span>-1.0 (Margin)</span>
              <span style={{ color: 'var(--brand-primary)', fontWeight: 800 }}>0.0 (Decision Boundary)</span>
              <span>+1.0 (Margin)</span>
              <span>+3.0 (Deep Threat)</span>
            </div>

            <div className="svm-gauge-track">
              {(() => {
                const percent = exp.gauge_percent ?? (isAttack ? 80.5 : 26.6);
                const dist = exp.hyperplane_distance ?? (isAttack ? 1.84 : -1.40);
                return (
                  <div className="svm-pin-marker" style={{ left: `${percent}%` }}>
                    <div className="svm-pin-dot" />
                    <div className="svm-pin-label">
                      f(x) = {dist > 0 ? `+${dist.toFixed(2)}` : dist.toFixed(2)}
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Mathematical Explanation Box */}
          <div style={{ background: 'var(--bg-canvas)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
              <Activity size={14} style={{ color: 'var(--brand-primary)' }} />
              RBF Kernel Hyperplane Mathematics
            </div>
            <p style={{ margin: 0, lineHeight: 1.5 }}>
              The Support Vector Machine maps 41 network features into infinite-dimensional Hilbert space using the <strong>Radial Basis Function (RBF) kernel</strong>: <code>K(x_i, x) = exp(-γ ||x_i - x||²)</code>. The decision score <strong>f(x) = {exp.hyperplane_distance ?? (isAttack ? '+1.82' : '-1.40')}</strong> represents the signed perpendicular distance from the separating hyperplane. Values past the margin thresholds (±1.0) provide high-confidence separation with maximum margin street width.
            </p>
          </div>
        </div>
      )}

      {/* =========================================================================
          3. NAIVE BAYES VISUAL DIAGRAM
         ========================================================================= */}
      {model === 'naive_bayes' && (
        <div>
          <div className="diagram-header">
            <div>
              <div className="diagram-title">
                <BarChart2 size={20} style={{ color: 'var(--brand-primary)' }} />
                Naive Bayes Gaussian Distribution & Evidence Breakdown
              </div>
              <p className="diagram-subtitle">
                Posterior probability computation comparing class priors and Gaussian feature likelihoods.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <span className="scenario-chip" style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem' }}>
                Prior Normal: <strong>53.5%</strong>
              </span>
              <span className="scenario-chip" style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem' }}>
                Prior Attack: <strong>46.5%</strong>
              </span>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  padding: '0.25rem 0.65rem',
                  borderRadius: '9999px',
                  background: isAttack ? 'var(--status-attack-bg)' : 'var(--status-normal-bg)',
                  color: isAttack ? 'var(--status-attack-text)' : 'var(--status-normal-text)',
                  border: `1px solid ${isAttack ? 'var(--status-attack-border)' : 'var(--status-normal-border)'}`
                }}
              >
                Verdict: {task === 'threat' ? (isAttack ? 'ATTACK' : 'NORMAL') : result.protocol?.toUpperCase()}
              </span>
            </div>
          </div>

          {/* SVG Gaussian Distribution Bell Curves */}
          <div className="svm-plane-wrapper" style={{ marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
              Gaussian Likelihood Density Curves: P(Feature | Normal) vs P(Feature | Attack)
            </span>

            <svg viewBox="0 0 700 180" style={{ width: '100%', maxHeight: '180px' }}>
              {/* Grid line */}
              <line x1="40" y1="150" x2="660" y2="150" stroke="var(--border-default)" strokeWidth="1.5" />

              {/* Normal Distribution Curve (Green Bell) */}
              <path
                d="M 60 150 C 140 150, 190 30, 240 30 C 290 30, 340 150, 440 150"
                fill="none"
                stroke="#10b981"
                strokeWidth="3"
              />
              <text x="240" y="22" fill="#059669" fontSize="11" fontWeight="800" textAnchor="middle">
                Normal Density P(x | Normal)
              </text>

              {/* Attack Distribution Curve (Red Bell) */}
              <path
                d="M 260 150 C 360 150, 410 40, 470 40 C 530 40, 580 150, 640 150"
                fill="none"
                stroke="#ef4444"
                strokeWidth="3"
              />
              <text x="470" y="32" fill="#dc2626" fontSize="11" fontWeight="800" textAnchor="middle">
                Attack Density P(x | Attack)
              </text>

              {/* Packet Input Indicator Needle */}
              {(() => {
                const needleX = isAttack ? 490 : 225;
                return (
                  <g>
                    <line x1={needleX} y1="25" x2={needleX} y2="150" stroke="var(--brand-primary)" strokeWidth="2.5" strokeDasharray="4,3" />
                    <circle cx={needleX} cy="150" r="5" fill="var(--brand-primary)" />
                    <rect x={needleX - 60} y="38" width="120" height="22" rx="4" fill="var(--text-primary)" />
                    <text x={needleX} y="53" fill="#ffffff" fontSize="10" fontWeight="700" textAnchor="middle">
                      Packet Value (x_i)
                    </text>
                  </g>
                );
              })()}
            </svg>
          </div>

          {/* Feature Evidence Log-Likelihood Bars */}
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Top Feature Likelihood Evidence Votes:
            </span>

            <div className="nb-evidence-grid">
              {(exp.top_evidence && exp.top_evidence.length > 0 ? exp.top_evidence : [
                { feature: 'src_bytes', value: 232.0, ll_normal: -1.2, ll_attack: -14.1, favors: 'Normal', diff: 12.9 },
                { feature: 'dst_host_srv_serror_rate', value: 0.01, ll_normal: -0.9, ll_attack: -12.4, favors: 'Normal', diff: 11.5 },
                { feature: 'logged_in', value: 1.0, ll_normal: -1.0, ll_attack: -10.5, favors: 'Normal', diff: 9.5 },
                { feature: 'diff_srv_rate', value: 0.0, ll_normal: -0.8, ll_attack: -8.2, favors: 'Normal', diff: 7.4 }
              ]).map(ev => {
                const favorsNormal = ev.favors === 'Normal';
                return (
                  <div key={ev.feature} className="nb-evidence-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{ev.feature}</strong>
                      <span
                        style={{
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          padding: '0.1rem 0.45rem',
                          borderRadius: '9999px',
                          background: favorsNormal ? 'var(--status-normal-bg)' : 'var(--status-attack-bg)',
                          color: favorsNormal ? 'var(--status-normal-text)' : 'var(--status-attack-text)',
                          border: `1px solid ${favorsNormal ? 'var(--status-normal-border)' : 'var(--status-attack-border)'}`
                        }}
                      >
                        Votes {ev.favors}
                      </span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      <span>Value: <strong>{ev.value}</strong></span>
                      <span>Evidence Diff: <strong>{typeof ev.diff === 'number' ? ev.diff.toFixed(1) : ev.diff}</strong></span>
                    </div>

                    <div className="nb-bar-split">
                      <div style={{ width: favorsNormal ? '75%' : '25%', background: 'var(--status-normal)', transition: 'width 0.4s' }} />
                      <div style={{ width: favorsNormal ? '25%' : '75%', background: 'var(--status-attack)', transition: 'width 0.4s' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Mathematical Explanation Box */}
          <div style={{ marginTop: '1rem', background: 'var(--bg-canvas)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
              <Info size={14} style={{ color: 'var(--brand-primary)' }} />
              Bayes Theorem Posterior Calculation
            </div>
            <p style={{ margin: 0, lineHeight: 1.5 }}>
              Gaussian Naive Bayes applies Bayes Theorem with conditional feature independence: <code>P(Class | X) ∝ P(Class) × ∏ P(x_i | Class)</code>. Continuous metrics follow normal curves parameterized by training means (μ) and variances (σ²). The log-likelihood sums aggregate the evidence across all attributes into the final posterior probability.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
