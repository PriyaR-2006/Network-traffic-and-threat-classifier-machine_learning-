import React, { useState, useEffect } from 'react';
import { Layers, Lightbulb, CheckCircle2 } from 'lucide-react';
import api from '../api/client';

export default function FeatureImportance() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTask, setActiveTask] = useState('task_a');

  useEffect(() => {
    let isMounted = true;
    api.getFeatureImportance().then(d => {
      if (isMounted && d) {
        setData(d);
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
        <p style={{ color: 'var(--text-secondary)' }}>Loading feature importance data...</p>
      </div>
    );
  }

  const featuresList = data ? (data[activeTask] || []) : [];
  const maxImportance = Math.max(...featuresList.map(f => f.importance), 0.01);

  // Friendly descriptions of key features
  const descriptions = {
    src_bytes: "Payload bytes sent from client to server. Zero in SYN floods; massive in data exfiltration.",
    dst_bytes: "Payload bytes returned from server. Key indicator of protocol payload profile (e.g. web pages vs FTP).",
    diff_srv_rate: "Percentage of connections to different services. Spikes when an attacker is port scanning.",
    service_ecr_i: "ICMP Echo Reply indicator (Ping flood / Smurf volumetric attack signature).",
    service_http: "Standard web browsing traffic indicator (port 80).",
    hot: "Number of hot indicators (accessing system directories or sensitive scripts).",
    protocol_type_udp: "UDP datagram protocol indicator (DNS lookups, audio/video streaming).",
    protocol_type_tcp: "TCP connection-oriented protocol indicator (handshake-based sessions).",
    protocol_type_icmp: "ICMP control messaging indicator (echo requests, ping diagnostics).",
    flag_SF: "Established normal 3-way handshake completion.",
    dst_host_same_srv_rate: "Ratio of connections to the same service on destination host.",
    dst_host_srv_count: "Number of connections to the same destination host and service."
  };

  return (
    <div className="feature-importance-container">
      {/* Header and Task Switcher */}
      <div className="glass-panel" style={{ marginBottom: '1.25rem' }}>
        <div className="control-bar">
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
              <Layers style={{ color: 'var(--brand-primary)' }} size={22} />
              Decision Tree Feature Importance (Top 15)
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.2rem' }}>
              Ranked by <strong>Information Gain (Shannon Entropy reduction)</strong> across 125,973 NSL-KDD training flows.
            </p>
          </div>

          <div className="button-group">
            <button
              type="button"
              className={`btn-toggle ${activeTask === 'task_a' ? 'active' : ''}`}
              onClick={() => setActiveTask('task_a')}
            >
              Task A: Threat Detection
            </button>
            <button
              type="button"
              className={`btn-toggle ${activeTask === 'task_b' ? 'active' : ''}`}
              onClick={() => setActiveTask('task_b')}
            >
              Task B: Protocol Classification
            </button>
          </div>
        </div>

        {/* Security Architecture Insight */}
        <div style={{
          padding: '0.9rem 1.1rem',
          borderRadius: 'var(--radius-md)',
          background: activeTask === 'task_a' ? 'var(--brand-primary-light)' : 'var(--accent-purple-bg)',
          border: `1px solid ${activeTask === 'task_a' ? 'var(--brand-primary-border)' : 'var(--accent-purple-border)'}`,
          marginBottom: '1.25rem',
          fontSize: '0.85rem',
          lineHeight: 1.6,
          color: activeTask === 'task_a' ? 'var(--brand-primary)' : 'var(--accent-purple)'
        }}>
          {activeTask === 'task_a' ? (
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
              <Lightbulb size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong>Key Insight for Task A:</strong> <code>src_bytes</code> accounts for over <strong>64.0%</strong> of the total tree split criteria! SYN flood attacks (Neptune) generate 0 source payload bytes with repeated connection requests, allowing the Decision Tree to identify attacks in the very first split.
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
              <CheckCircle2 size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong>Rule 3 Enforced for Task B:</strong> Notice that the <code>service</code> column is completely absent from this chart! Even without <code>service</code>, payload metrics (<code>src_bytes</code> 44.9% + <code>dst_bytes</code> 17.6%) allow the tree to distinguish HTTP (high download), FTP-data (bulk upload), and Domain_U (UDP) with <strong>84.1% accuracy</strong>.
              </div>
            </div>
          )}
        </div>

        {/* Feature Importance Bars */}
        <div className="bar-chart-container">
          {featuresList.map((item, idx) => {
            const pct = (item.importance / maxImportance) * 100;
            const explanation = descriptions[item.feature] || "Network traffic behavioral flow metric.";

            return (
              <div key={item.feature} style={{ padding: '0.6rem 0', borderBottom: '1px solid var(--border-subtle)' }}>
                <div className="bar-row">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', width: '22px' }}>#{idx + 1}</span>
                    <strong style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{item.feature}</strong>
                  </div>

                  <div className="bar-bg">
                    <div
                      className="bar-fill"
                      style={{
                        width: `${Math.max(pct, 2)}%`,
                        background: activeTask === 'task_a' ? 'var(--brand-primary)' : 'var(--accent-purple)'
                      }}
                    />
                  </div>

                  <span style={{ fontWeight: 700, color: 'var(--text-primary)', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                    {(item.importance * 100).toFixed(2)}%
                  </span>
                </div>

                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem', paddingLeft: '28px' }}>
                  {explanation}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
