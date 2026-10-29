import React, { useState } from 'react';
import { UploadCloud, FileText, CheckCircle, AlertOctagon, Filter, Search, Zap, Download, RefreshCw, FileCheck } from 'lucide-react';
import api from '../api/client';

export default function BatchUpload() {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [task, setTask] = useState('threat');
  const [model, setModel] = useState('decision_tree');
  const [loading, setLoading] = useState(false);
  const [batchResult, setBatchResult] = useState(null);
  const [error, setError] = useState(null);

  // Table filtering and search
  const [filterType, setFilterType] = useState('ALL'); // 'ALL', 'ATTACK', 'NORMAL'
  const [searchQuery, setSearchQuery] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(50);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setFileName(selectedFile.name);
      setError(null);
    }
  };

  const uploadAndPredict = async (fileToUpload) => {
    setLoading(true);
    setError(null);

    try {
      const data = await api.predictBatch(fileToUpload, task, model);
      setBatchResult(data);
    } catch (err) {
      setError(err.message || 'Batch classification failed. Please verify the CSV columns.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!file) {
      setError("Please select or drop a CSV file first, or click 'Load Bundled Benchmark CSV'.");
      return;
    }
    uploadAndPredict(file);
  };

  // 1-Click quick test using the bundled data/sample_logs.csv
  const handleLoadSampleBenchmark = async () => {
    setLoading(true);
    setError(null);
    setFileName('sample_logs.csv (300 Benchmark Records)');

    try {
      const blob = await api.getSampleCSV('csv');
      let sampleFile;
      if (blob) {
        sampleFile = new File([blob], 'sample_logs.csv', { type: 'text/csv' });
      } else {
        // Fallback to fetch data
        const res = await fetch('/api/sample-csv');
        const b = await res.blob();
        sampleFile = new File([b], 'sample_logs.csv', { type: 'text/csv' });
      }
      setFile(sampleFile);
      await uploadAndPredict(sampleFile);
    } catch (err) {
      setError(`Could not load benchmark sample: ${err.message}`);
      setLoading(false);
    }
  };

  // Export results table to CSV
  const handleExportCSV = () => {
    if (!batchResult || !batchResult.results) return;

    const headers = ['Row', 'Prediction', 'Confidence', 'Protocol', 'Flag', 'Source Bytes', 'Destination Bytes'];
    const csvRows = [headers.join(',')];

    batchResult.results.forEach(r => {
      csvRows.push([
        r.row_index,
        `"${r.prediction}"`,
        (r.confidence * 100).toFixed(1) + '%',
        `"${r.protocol_type || ''}"`,
        `"${r.flag || ''}"`,
        r.src_bytes || 0,
        r.dst_bytes || 0
      ].join(','));
    });

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `inspection_results_${task}_${model}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered rows
  const filteredRows = batchResult ? batchResult.results.filter(row => {
    const matchesFilter =
      filterType === 'ALL' ||
      (filterType === 'ATTACK' && row.prediction === 'ATTACK') ||
      (filterType === 'NORMAL' && row.prediction === 'NORMAL');

    const matchesSearch =
      searchQuery === '' ||
      row.row_index.toString().includes(searchQuery) ||
      (row.protocol_type && row.protocol_type.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (row.flag && row.flag.toLowerCase().includes(searchQuery.toLowerCase())) ||
      row.prediction.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  }) : [];

  return (
    <div className="batch-container">
      {/* Upload and Configuration Panel */}
      <div className="glass-panel" style={{ marginBottom: '1.25rem' }}>
        <div className="control-bar">
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
              <UploadCloud style={{ color: 'var(--brand-primary)' }} size={22} />
              Batch Network Log Inspector
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.2rem' }}>
              Upload any CSV with NSL-KDD features, or load the pre-loaded 300-record benchmark dataset in 1 click.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap', alignItems: 'center' }}>
            {/* Task selector */}
            <div className="button-group">
              <button
                type="button"
                className={`btn-toggle ${task === 'threat' ? 'active' : ''}`}
                onClick={() => setTask('threat')}
              >
                Task A: Threat Detection
              </button>
              <button
                type="button"
                className={`btn-toggle ${task === 'protocol' ? 'active' : ''}`}
                onClick={() => setTask('protocol')}
              >
                Task B: Protocol (Zero Leakage)
              </button>
            </div>

            {/* Model selector */}
            <div className="button-group">
              <button
                type="button"
                className={`btn-toggle ${model === 'decision_tree' ? 'active' : ''}`}
                onClick={() => setModel('decision_tree')}
              >
                Decision Tree
              </button>
              <button
                type="button"
                className={`btn-toggle ${model === 'svm' ? 'active' : ''}`}
                onClick={() => setModel('svm')}
              >
                SVM (RBF)
              </button>
              <button
                type="button"
                className={`btn-toggle ${model === 'naive_bayes' ? 'active' : ''}`}
                onClick={() => setModel('naive_bayes')}
              >
                Naive Bayes
              </button>
            </div>
          </div>
        </div>

        {/* Dropzone & File Input */}
        <form onSubmit={handleSubmit}>
          <div className="upload-zone" onClick={() => document.getElementById('csvFileInput').click()}>
            <input
              id="csvFileInput"
              type="file"
              accept=".csv,.txt"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
            <FileText size={38} style={{ color: 'var(--brand-primary)', margin: '0 auto 0.6rem auto' }} />
            <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
              {fileName ? fileName : "Click to browse or Drag & Drop Network Log CSV / TXT"}
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
              Accepts 41-feature NSL-KDD CSV (such as <code>data/sample_logs.csv</code> or raw <code>KDDTest+.txt</code>)
            </p>
          </div>

          {error && (
            <div style={{ marginTop: '0.85rem', padding: '0.75rem 1rem', background: 'var(--status-attack-bg)', border: '1px solid var(--status-attack-border)', borderRadius: 'var(--radius-sm)', color: 'var(--status-attack-text)', fontSize: '0.85rem' }}>
              {error}
            </div>
          )}

          <div style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              type="submit"
              disabled={loading || !file}
              className="btn-primary"
              style={{ flex: 1, minWidth: '220px' }}
            >
              {loading ? <RefreshCw className="animate-spin" size={17} /> : <Zap size={17} />}
              {loading ? "Processing Batch Records..." : "Analyze Uploaded File"}
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={handleLoadSampleBenchmark}
              className="btn-secondary"
              style={{ minWidth: '220px' }}
              title="Loads the 300 test records from data/sample_logs.csv and classifies them immediately"
            >
              <FileCheck size={16} style={{ color: 'var(--brand-primary)' }} />
              1-Click Test: Load Bundled Benchmark (300 logs)
            </button>
          </div>
        </form>
      </div>

      {/* Batch Results Overview */}
      {batchResult && (
        <div className="glass-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>Batch Inspection Results</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Evaluated with <strong>{batchResult.model_used}</strong> on {task === 'threat' ? 'Binary Threat Detection' : 'Multi-Class Protocol Classification'}
              </p>
            </div>

            <button
              type="button"
              onClick={handleExportCSV}
              className="btn-secondary"
              style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
            >
              <Download size={14} /> Export Results to CSV
            </button>
          </div>

          {/* Summary Cards */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-label">Total Records Evaluated</div>
              <div className="stat-value">{batchResult.total_records}</div>
            </div>

            {batchResult.task === 'threat' ? (
              <>
                <div className="stat-card" style={{ background: 'var(--status-normal-bg)', borderColor: 'var(--status-normal-border)' }}>
                  <div className="stat-label" style={{ color: 'var(--status-normal-text)' }}>Normal Traffic (Benign)</div>
                  <div className="stat-value" style={{ color: 'var(--status-normal)' }}>{batchResult.normal_count}</div>
                </div>

                <div className="stat-card" style={{ background: 'var(--status-attack-bg)', borderColor: 'var(--status-attack-border)' }}>
                  <div className="stat-label" style={{ color: 'var(--status-attack-text)' }}>Attacks Detected (Threat)</div>
                  <div className="stat-value" style={{ color: 'var(--status-attack)' }}>{batchResult.attack_count}</div>
                </div>

                <div className="stat-card">
                  <div className="stat-label">Threat Percentage</div>
                  <div className="stat-value" style={{ color: batchResult.threat_percentage > 30 ? 'var(--status-attack)' : 'var(--status-normal)' }}>
                    {batchResult.threat_percentage}%
                  </div>
                </div>
              </>
            ) : (
              <div className="stat-card" style={{ borderColor: 'var(--accent-purple-border)', background: 'var(--accent-purple-bg)' }}>
                <div className="stat-label" style={{ color: 'var(--accent-purple)' }}>Classification Mode</div>
                <div className="stat-value" style={{ color: 'var(--accent-purple)', fontSize: '1.25rem', marginTop: '0.3rem' }}>
                  8 Protocol Groups (Zero Leakage)
                </div>
              </div>
            )}
          </div>

          {/* Table Filter Controls */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
              <Filter size={15} style={{ color: 'var(--text-muted)' }} />
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Filter:</span>
              <button
                type="button"
                className={`btn-toggle ${filterType === 'ALL' ? 'active' : ''}`}
                onClick={() => setFilterType('ALL')}
              >
                All ({batchResult.results.length})
              </button>
              {batchResult.task === 'threat' && (
                <>
                  <button
                    type="button"
                    className={`btn-toggle ${filterType === 'ATTACK' ? 'active' : ''}`}
                    onClick={() => setFilterType('ATTACK')}
                    style={{ color: filterType === 'ATTACK' ? '#ffffff' : 'var(--status-attack)' }}
                  >
                    Attacks ({batchResult.attack_count})
                  </button>
                  <button
                    type="button"
                    className={`btn-toggle ${filterType === 'NORMAL' ? 'active' : ''}`}
                    onClick={() => setFilterType('NORMAL')}
                    style={{ color: filterType === 'NORMAL' ? '#ffffff' : 'var(--status-normal)' }}
                  >
                    Normal ({batchResult.normal_count})
                  </button>
                </>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Search size={15} style={{ color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search row, protocol, flag..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="form-input"
                style={{ width: '210px', padding: '0.35rem 0.6rem', fontSize: '0.8rem' }}
              />
            </div>
          </div>

          {/* Color-coded Results Table: Red for Attack, Green for Normal */}
          <div className="table-wrapper">
            <table className="results-table">
              <thead>
                <tr>
                  <th style={{ width: '65px' }}>Row #</th>
                  <th>Classification</th>
                  <th>Confidence</th>
                  <th>Protocol</th>
                  <th>Flag</th>
                  <th>Source Bytes</th>
                  <th>Dest Bytes</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.slice(0, rowsPerPage).map((row) => {
                  const isThreat = row.is_threat === true;
                  const isNormal = row.is_threat === false;
                  const rowClass = isThreat ? 'row-attack' : isNormal ? 'row-normal' : 'row-protocol';

                  return (
                    <tr key={row.row_index} className={rowClass}>
                      <td style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>#{row.row_index}</td>
                      <td>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                          padding: '0.2rem 0.5rem',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          background: isThreat ? 'var(--status-attack)' : isNormal ? 'var(--status-normal)' : 'var(--accent-purple)',
                          color: '#ffffff'
                        }}>
                          {isThreat ? <AlertOctagon size={12} /> : <CheckCircle size={12} />}
                          {row.prediction.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ fontWeight: 600 }}>
                        {(row.confidence * 100).toFixed(1)}%
                      </td>
                      <td>{(row.protocol_type || '').toUpperCase()}</td>
                      <td><code>{row.flag}</code></td>
                      <td>{(row.src_bytes || 0).toLocaleString()}</td>
                      <td>{(row.dst_bytes || 0).toLocaleString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.85rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            <span>Showing {Math.min(filteredRows.length, rowsPerPage)} of {filteredRows.length} matching records</span>
            {filteredRows.length > rowsPerPage && (
              <button
                type="button"
                className="btn-secondary"
                style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}
                onClick={() => setRowsPerPage(prev => prev + 50)}
              >
                Load Next 50 Rows...
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
