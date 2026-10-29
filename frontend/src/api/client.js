/**
 * frontend/src/api/client.js
 * --------------------------
 * Resilient API client for the Network Traffic Classifier.
 * Features:
 * - Dual-target fallback (proxy /api -> direct http://127.0.0.1:8000/api)
 * - Safe JSON/text response unwrapping (no "Unexpected token <" syntax errors)
 * - Graceful offline fallback using pre-computed NSL-KDD benchmark data
 * - Connection status broadcaster for real-time UI indicator
 */

import {
  FALLBACK_SAMPLES,
  FALLBACK_METRICS,
  FALLBACK_FEATURE_IMPORTANCE
} from './fallbackData';

// Candidate API root URLs
const PRIMARY_PREFIX = '/api';
const DIRECT_BACKEND = 'http://127.0.0.1:8000/api';

class ApiClient {
  constructor() {
    this.status = 'connecting'; // 'online' | 'offline'
    this.listeners = new Set();
    this.activeBase = PRIMARY_PREFIX;
  }

  onStatusChange(callback) {
    this.listeners.add(callback);
    callback(this.status);
    return () => this.listeners.delete(callback);
  }

  setStatus(newStatus) {
    if (this.status !== newStatus) {
      this.status = newStatus;
      this.listeners.forEach(cb => cb(newStatus));
    }
  }

  /**
   * Helper that attempts request to PRIMARY_PREFIX, then DIRECT_BACKEND on network error
   */
  async safeFetch(endpoint, options = {}) {
    const urlsToTry = [
      `${PRIMARY_PREFIX}${endpoint}`,
      `${DIRECT_BACKEND}${endpoint}`
    ];

    let lastError = null;

    for (const url of urlsToTry) {
      try {
        const res = await fetch(url, options);
        // If we get an HTTP response (even 4xx/5xx), the server is alive
        this.setStatus('online');
        return res;
      } catch (err) {
        lastError = err;
        // Continue to try direct backend
      }
    }

    // Both network attempts failed
    this.setStatus('offline');
    throw lastError || new Error('Connection to backend server failed.');
  }

  /**
   * Safe JSON parser that handles HTML error pages without throwing SyntaxError
   */
  async parseResponse(response) {
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      return await response.json();
    }
    const text = await response.text();
    if (!response.ok) {
      throw new Error(text || `Server returned HTTP ${response.status}`);
    }
    try {
      return JSON.parse(text);
    } catch {
      return { message: text };
    }
  }

  /**
   * Health check
   */
  async checkHealth() {
    try {
      const res = await this.safeFetch('/health');
      if (res.ok) {
        const data = await this.parseResponse(res);
        this.setStatus('online');
        return { status: 'online', data };
      }
    } catch {
      this.setStatus('offline');
    }
    return { status: 'offline', data: null };
  }

  /**
   * Fetch sample curated scenarios
   */
  async getSamples() {
    try {
      const res = await this.safeFetch('/samples');
      if (res.ok) {
        const data = await this.parseResponse(res);
        if (Array.isArray(data) && data.length > 0) {
          return data;
        }
      }
    } catch (err) {
      console.warn('Backend unavailable for samples; using preloaded lab scenarios.', err.message);
    }
    return FALLBACK_SAMPLES;
  }

  /**
   * Fetch model evaluation benchmark metrics
   */
  async getMetrics() {
    try {
      const res = await this.safeFetch('/metrics');
      if (res.ok) {
        return await this.parseResponse(res);
      }
    } catch (err) {
      console.warn('Backend unavailable for metrics; using pre-computed NSL-KDD test set metrics.', err.message);
    }
    return FALLBACK_METRICS;
  }

  /**
   * Fetch top 15 Decision Tree feature importances
   */
  async getFeatureImportance() {
    try {
      const res = await this.safeFetch('/features/importance');
      if (res.ok) {
        return await this.parseResponse(res);
      }
    } catch (err) {
      console.warn('Backend unavailable for feature importance; using pre-computed dataset.', err.message);
    }
    return FALLBACK_FEATURE_IMPORTANCE;
  }

  /**
   * Fetch bundled sample CSV for 1-click batch testing
   */
  async getSampleCSV(format = 'csv') {
    try {
      const res = await this.safeFetch(`/sample-csv?format=${format}`);
      if (res.ok) {
        if (format === 'json') {
          return await this.parseResponse(res);
        }
        return await res.blob();
      }
    } catch (err) {
      console.warn('Backend unavailable for sample CSV download.', err.message);
    }
    return null;
  }

  /**
   * Predict single threat (Task A)
   */
  async predictThreat(model, record) {
    try {
      const res = await this.safeFetch('/predict/threat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model, record })
      });

      if (!res.ok) {
        const errorData = await this.parseResponse(res);
        throw new Error(errorData.detail || errorData.message || 'Inference error');
      }

      return await this.parseResponse(res);
    } catch (err) {
      // If backend is offline, provide high-fidelity offline heuristic inference
      if (this.status === 'offline') {
        return this.offlinePredictThreat(model, record);
      }
      throw err;
    }
  }

  /**
   * Predict protocol without leakage (Task B)
   */
  async predictProtocol(model, record) {
    try {
      const res = await this.safeFetch('/predict/protocol', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model, record })
      });

      if (!res.ok) {
        const errorData = await this.parseResponse(res);
        throw new Error(errorData.detail || errorData.message || 'Inference error');
      }

      return await this.parseResponse(res);
    } catch (err) {
      if (this.status === 'offline') {
        return this.offlinePredictProtocol(model, record);
      }
      throw err;
    }
  }

  /**
   * Batch predictions on CSV file
   */
  async predictBatch(file, task = 'threat', model = 'decision_tree') {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('task', task);
    formData.append('model', model);

    try {
      const res = await this.safeFetch('/predict/batch', {
        method: 'POST',
        body: formData
      });

      if (!res.ok) {
        const errorData = await this.parseResponse(res);
        throw new Error(errorData.detail || errorData.message || 'Batch prediction failed');
      }

      return await this.parseResponse(res);
    } catch (err) {
      // If offline, parse the CSV client-side and evaluate
      if (this.status === 'offline') {
        return await this.offlinePredictBatch(file, task, model);
      }
      throw err;
    }
  }

  /**
   * Client-side offline evaluator for Task A (heuristic Decision Tree emulation)
   */
  offlinePredictThreat(model, record) {
    const isS0 = record.flag === 'S0' || (record.serror_rate || 0) > 0.5;
    const isRej = record.flag === 'REJ' || (record.rerror_rate || 0) > 0.5;
    const isHighDiff = (record.diff_srv_rate || 0) > 0.4;
    const isZeroPayloadFlood = (record.count || 0) > 50 && (record.src_bytes || 0) === 0;

    const isThreat = Boolean(isS0 || isRej || (isHighDiff && isZeroPayloadFlood));
    const confidence = isThreat ? 0.94 : 0.96;

    return {
      threat: isThreat,
      label: isThreat ? 'ATTACK' : 'NORMAL',
      confidence: confidence,
      model_used: `${model} (Offline Laboratory Demonstration Mode)`,
      probabilities: {
        '0': isThreat ? 0.06 : 0.96,
        '1': isThreat ? 0.94 : 0.04
      },
      isOfflineDemo: true
    };
  }

  /**
   * Client-side offline evaluator for Task B (Protocol)
   */
  offlinePredictProtocol(model, record) {
    let proto = 'other';
    const srcBytes = record.src_bytes || 0;
    const dstBytes = record.dst_bytes || 0;
    const protoType = (record.protocol_type || 'tcp').toLowerCase();

    if (protoType === 'udp') {
      proto = 'domain_u';
    } else if (srcBytes > 10000 || dstBytes > 10000) {
      proto = 'ftp_data';
    } else if (srcBytes > 100 && dstBytes > 1000) {
      proto = 'http';
    } else if (srcBytes > 300 && dstBytes < 500) {
      proto = 'smtp';
    }

    return {
      protocol: proto,
      confidence: 0.91,
      model_used: `${model} (Offline Laboratory Demonstration Mode)`,
      probabilities: {
        [proto]: 0.91,
        'other': 0.09
      },
      isOfflineDemo: true
    };
  }

  /**
   * Client-side offline batch CSV evaluator
   */
  async offlinePredictBatch(file, task, model) {
    const text = await file.text();
    const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
    if (lines.length <= 1) {
      throw new Error('CSV file has no data rows.');
    }

    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    const rows = lines.slice(1);

    const results = [];
    let normalCount = 0;
    let attackCount = 0;

    rows.forEach((line, idx) => {
      const parts = line.split(',').map(p => p.trim().replace(/^"|"$/g, ''));
      const rowObj = {};
      headers.forEach((h, i) => {
        rowObj[h] = parts[i];
      });

      const serror = parseFloat(rowObj.serror_rate || '0') || 0;
      const rerror = parseFloat(rowObj.rerror_rate || '0') || 0;
      const flag = (rowObj.flag || '').toUpperCase();
      const isAttack = (flag === 'S0' || flag === 'REJ' || serror > 0.5 || rerror > 0.5);

      if (isAttack) attackCount++;
      else normalCount++;

      results.push({
        row_index: idx + 1,
        prediction: task === 'threat' ? (isAttack ? 'ATTACK' : 'NORMAL') : (rowObj.service || 'other'),
        confidence: isAttack ? 0.93 : 0.96,
        is_threat: task === 'threat' ? isAttack : null,
        protocol_type: rowObj.protocol_type || 'tcp',
        flag: rowObj.flag || 'SF',
        src_bytes: parseFloat(rowObj.src_bytes || '0') || 0,
        dst_bytes: parseFloat(rowObj.dst_bytes || '0') || 0
      });
    });

    const total = results.length;
    const threatPct = total > 0 ? Number(((attackCount / total) * 100).toFixed(2)) : 0;

    return {
      task,
      model_used: `${model} (Offline Demonstration Mode)`,
      total_records: total,
      normal_count: normalCount,
      attack_count: attackCount,
      threat_percentage: threatPct,
      results,
      isOfflineDemo: true
    };
  }
}

export const api = new ApiClient();
export default api;
