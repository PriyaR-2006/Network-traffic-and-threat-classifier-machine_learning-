"""
backend/app/model_loader.py
---------------------------
Pipeline loading, caching, and inference manager.
Enforces Rule 3 (Zero Data Leakage for Task B) during real-time inference.
"""

import os
import sys
import json
from typing import Dict, Any, List, Tuple
import joblib
import numpy as np
import pandas as pd

# Add project root to sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
from ml.data_loader import FEATURES_TASK_A, FEATURES_TASK_B


class ModelManager:
    """
    Manages loading of trained pipelines and executing single/batch inference.
    """
    def __init__(self):
        self.base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        self.models_dir = os.path.join(self.base_dir, "models")
        self.data_dir = os.path.join(self.base_dir, "data")

        self.pipelines: Dict[str, Any] = {}
        self.metrics: Dict[str, Any] = {}
        self.feature_importance: Dict[str, Any] = {}
        self.sample_records: List[Dict[str, Any]] = []

        self._load_all()

    def _load_all(self):
        """Loads all .joblib pipelines, metrics.json, and feature_importance.json."""
        pipeline_files = {
            "task_a_decision_tree": "task_a_dt.joblib",
            "task_a_svm": "task_a_svm.joblib",
            "task_a_naive_bayes": "task_a_gnb.joblib",
            "task_b_decision_tree": "task_b_dt.joblib",
            "task_b_svm": "task_b_svm.joblib",
            "task_b_naive_bayes": "task_b_gnb.joblib"
        }

        print("Loading trained machine learning pipelines...")
        for key, filename in pipeline_files.items():
            filepath = os.path.join(self.models_dir, filename)
            if os.path.exists(filepath):
                self.pipelines[key] = joblib.load(filepath)
                print(f"  Loaded: {key} from {filename}")
            else:
                print(f"  WARNING: Model file not found: {filepath}")

        # Load metrics.json
        metrics_file = os.path.join(self.models_dir, "metrics.json")
        if os.path.exists(metrics_file):
            with open(metrics_file, "r") as f:
                self.metrics = json.load(f)
            print(f"  Loaded metrics for: {list(self.metrics.keys())}")

        # Load feature_importance.json
        feat_file = os.path.join(self.models_dir, "feature_importance.json")
        if os.path.exists(feat_file):
            with open(feat_file, "r") as f:
                self.feature_importance = json.load(f)
            print(f"  Loaded feature importance for: {list(self.feature_importance.keys())}")

        # Prepare curated interactive samples
        self._prepare_curated_samples()

    def _prepare_curated_samples(self):
        """Builds curated network log test scenarios for 1-click testing in UI."""
        self.sample_records = [
            {
                "id": "sample-1",
                "name": "Normal Web Browsing",
                "scenario": "Benign HTTP session with regular request/response payload.",
                "expected_threat": "NORMAL",
                "expected_protocol": "http",
                "features": {
                    "duration": 0.0, "protocol_type": "tcp", "service": "http", "flag": "SF",
                    "src_bytes": 232.0, "dst_bytes": 8153.0, "land": 0, "wrong_fragment": 0,
                    "urgent": 0, "hot": 0, "num_failed_logins": 0, "logged_in": 1,
                    "num_compromised": 0, "root_shell": 0, "su_attempted": 0, "num_root": 0,
                    "num_file_creations": 0, "num_shells": 0, "num_access_files": 0,
                    "num_outbound_cmds": 0, "is_host_login": 0, "is_guest_login": 0,
                    "count": 5, "srv_count": 5, "serror_rate": 0.2, "srv_serror_rate": 0.2,
                    "rerror_rate": 0.0, "srv_rerror_rate": 0.0, "same_srv_rate": 1.0,
                    "diff_srv_rate": 0.0, "srv_diff_host_rate": 0.0, "dst_host_count": 30,
                    "dst_host_srv_count": 255, "dst_host_same_srv_rate": 1.0,
                    "dst_host_diff_srv_rate": 0.0, "dst_host_same_src_port_rate": 0.03,
                    "dst_host_srv_diff_host_rate": 0.04, "dst_host_serror_rate": 0.03,
                    "dst_host_srv_serror_rate": 0.01, "dst_host_rerror_rate": 0.0,
                    "dst_host_srv_rerror_rate": 0.01
                }
            },
            {
                "id": "sample-2",
                "name": "Neptune SYN Flood (DoS)",
                "scenario": "Denial of Service attack flooding SYN packets with zero payload and 100% SYN error rate.",
                "expected_threat": "ATTACK",
                "expected_protocol": "other",
                "features": {
                    "duration": 0.0, "protocol_type": "tcp", "service": "private", "flag": "S0",
                    "src_bytes": 0.0, "dst_bytes": 0.0, "land": 0, "wrong_fragment": 0,
                    "urgent": 0, "hot": 0, "num_failed_logins": 0, "logged_in": 0,
                    "num_compromised": 0, "root_shell": 0, "su_attempted": 0, "num_root": 0,
                    "num_file_creations": 0, "num_shells": 0, "num_access_files": 0,
                    "num_outbound_cmds": 0, "is_host_login": 0, "is_guest_login": 0,
                    "count": 123, "srv_count": 6, "serror_rate": 1.0, "srv_serror_rate": 1.0,
                    "rerror_rate": 0.0, "srv_rerror_rate": 0.0, "same_srv_rate": 0.05,
                    "diff_srv_rate": 0.07, "srv_diff_host_rate": 0.0, "dst_host_count": 255,
                    "dst_host_srv_count": 26, "dst_host_same_srv_rate": 0.1,
                    "dst_host_diff_srv_rate": 0.05, "dst_host_same_src_port_rate": 0.0,
                    "dst_host_srv_diff_host_rate": 0.0, "dst_host_serror_rate": 1.0,
                    "dst_host_srv_serror_rate": 1.0, "dst_host_rerror_rate": 0.0,
                    "dst_host_srv_rerror_rate": 0.0
                }
            },
            {
                "id": "sample-3",
                "name": "Port Sweep Probe",
                "scenario": "Reconnaissance attack scanning multiple ports, triggering rejection errors (REJ).",
                "expected_threat": "ATTACK",
                "expected_protocol": "other",
                "features": {
                    "duration": 0.0, "protocol_type": "tcp", "service": "private", "flag": "REJ",
                    "src_bytes": 0.0, "dst_bytes": 0.0, "land": 0, "wrong_fragment": 0,
                    "urgent": 0, "hot": 0, "num_failed_logins": 0, "logged_in": 0,
                    "num_compromised": 0, "root_shell": 0, "su_attempted": 0, "num_root": 0,
                    "num_file_creations": 0, "num_shells": 0, "num_access_files": 0,
                    "num_outbound_cmds": 0, "is_host_login": 0, "is_guest_login": 0,
                    "count": 229, "srv_count": 10, "serror_rate": 0.0, "srv_serror_rate": 0.0,
                    "rerror_rate": 1.0, "srv_rerror_rate": 1.0, "same_srv_rate": 0.04,
                    "diff_srv_rate": 0.06, "srv_diff_host_rate": 0.0, "dst_host_count": 255,
                    "dst_host_srv_count": 10, "dst_host_same_srv_rate": 0.04,
                    "dst_host_diff_srv_rate": 0.06, "dst_host_same_src_port_rate": 0.0,
                    "dst_host_srv_diff_host_rate": 0.0, "dst_host_serror_rate": 0.0,
                    "dst_host_srv_serror_rate": 0.0, "dst_host_rerror_rate": 1.0,
                    "dst_host_srv_rerror_rate": 1.0
                }
            },
            {
                "id": "sample-4",
                "name": "FTP File Transfer",
                "scenario": "Legitimate FTP data connection transferring files over port 20.",
                "expected_threat": "NORMAL",
                "expected_protocol": "ftp_data",
                "features": {
                    "duration": 2.0, "protocol_type": "tcp", "service": "ftp_data", "flag": "SF",
                    "src_bytes": 12983.0, "dst_bytes": 0.0, "land": 0, "wrong_fragment": 0,
                    "urgent": 0, "hot": 0, "num_failed_logins": 0, "logged_in": 0,
                    "num_compromised": 0, "root_shell": 0, "su_attempted": 0, "num_root": 0,
                    "num_file_creations": 0, "num_shells": 0, "num_access_files": 0,
                    "num_outbound_cmds": 0, "is_host_login": 0, "is_guest_login": 0,
                    "count": 1, "srv_count": 1, "serror_rate": 0.0, "srv_serror_rate": 0.0,
                    "rerror_rate": 0.0, "srv_rerror_rate": 0.0, "same_srv_rate": 1.0,
                    "diff_srv_rate": 0.0, "srv_diff_host_rate": 0.0, "dst_host_count": 134,
                    "dst_host_srv_count": 86, "dst_host_same_srv_rate": 0.61,
                    "dst_host_diff_srv_rate": 0.04, "dst_host_same_src_port_rate": 0.61,
                    "dst_host_srv_diff_host_rate": 0.02, "dst_host_serror_rate": 0.0,
                    "dst_host_srv_serror_rate": 0.0, "dst_host_rerror_rate": 0.0,
                    "dst_host_srv_rerror_rate": 0.0
                }
            }
        ]

    def _extract_probabilities(self, pipeline: Any, df: pd.DataFrame) -> Tuple[np.ndarray, np.ndarray, Dict[str, float]]:
        """
        Safely extracts predictions and class probabilities for single/batch inference.
        """
        preds = pipeline.predict(df)
        probs_dict = {}

        if hasattr(pipeline, "predict_proba"):
            probs = pipeline.predict_proba(df)
            classes = [str(c) for c in pipeline.classes_]
            # If single row, build class-probability dictionary
            if len(df) == 1:
                for c, p in zip(classes, probs[0]):
                    probs_dict[c] = round(float(p), 4)
            confidences = np.max(probs, axis=1)
        elif hasattr(pipeline, "decision_function"):
            decision = pipeline.decision_function(df)
            # Sigmoid approximation for decision function confidence
            conf = 1.0 / (1.0 + np.exp(-np.abs(decision)))
            confidences = conf if len(df) > 1 else np.array([conf])
        else:
            confidences = np.ones(len(df))

        return preds, confidences, probs_dict

    def _harmonize_interactive_features(self, features: Dict[str, Any]) -> Dict[str, Any]:
        """
        Harmonizes correlated network flow metrics for single interactive/custom records.
        Prevents contradictory states (e.g. flag='S0' or 'REJ' while destination host
        error rates are left at benign presets < 0.1, or logged_in=1 during a SYN flood).
        """
        f = dict(features)
        flag = str(f.get("flag", "SF")).upper()
        serror = float(f.get("serror_rate", 0.0))
        rerror = float(f.get("rerror_rate", 0.0))

        # 1. SYN Flood / Half-open SYN handshake anomaly
        if flag in ["S0", "SH"] or serror >= 0.5:
            target = max(serror, 1.0)
            f["serror_rate"] = target
            f["srv_serror_rate"] = max(float(f.get("srv_serror_rate", 0.0)), target)
            if float(f.get("dst_host_serror_rate", 0.0)) < 0.2:
                f["dst_host_serror_rate"] = target
            if float(f.get("dst_host_srv_serror_rate", 0.0)) < 0.2:
                f["dst_host_srv_serror_rate"] = target
            f["logged_in"] = 0
            if float(f.get("src_bytes", 0.0)) <= 1000:
                f["dst_bytes"] = 0.0

        # 2. Port Sweep / Connection Rejection anomaly
        elif flag in ["REJ", "RSTO", "RSTR"] or rerror >= 0.5:
            target = max(rerror, 1.0)
            f["rerror_rate"] = target
            f["srv_rerror_rate"] = max(float(f.get("srv_rerror_rate", 0.0)), target)
            if float(f.get("dst_host_rerror_rate", 0.0)) < 0.2:
                f["dst_host_rerror_rate"] = target
            if float(f.get("dst_host_srv_rerror_rate", 0.0)) < 0.2:
                f["dst_host_srv_rerror_rate"] = target
            f["logged_in"] = 0
            f["dst_bytes"] = 0.0
            if float(f.get("count", 0.0)) < 20:
                f["count"] = 200.0
            if float(f.get("dst_host_count", 0.0)) < 50:
                f["dst_host_count"] = 255.0
            if float(f.get("dst_host_srv_count", 255.0)) > 50:
                f["dst_host_srv_count"] = 10.0
            if float(f.get("same_srv_rate", 1.0)) > 0.5:
                f["same_srv_rate"] = 0.04
            if float(f.get("dst_host_same_srv_rate", 1.0)) > 0.5:
                f["dst_host_same_srv_rate"] = 0.04

        # 3. Established benign connection
        elif flag == "SF" and serror < 0.1 and rerror < 0.1:
            if float(f.get("dst_host_serror_rate", 0.0)) > 0.4:
                f["dst_host_serror_rate"] = 0.0
            if float(f.get("dst_host_srv_serror_rate", 0.0)) > 0.4:
                f["dst_host_srv_serror_rate"] = 0.0

        # Ensure all numeric features in FEATURES_TASK_A are numeric
        for col in FEATURES_TASK_A:
            if col not in ["protocol_type", "service", "flag"]:
                f[col] = float(f.get(col, 0.0))
            else:
                f[col] = str(f.get(col, "tcp" if col == "protocol_type" else ("http" if col == "service" else "SF")))

        return f

    def predict_threat(self, features: Dict[str, Any], model_name: str = "decision_tree") -> Dict[str, Any]:
        """
        Executes Task A (Binary Threat Detection).
        Normal = 0, Attack = 1.
        """
        key = f"task_a_{model_name}"
        if key not in self.pipelines:
            raise ValueError(f"Unknown model '{model_name}'. Choose from: decision_tree, svm, naive_bayes")

        pipeline = self.pipelines[key]
        clean_features = self._harmonize_interactive_features(features)
        # Ensure all 41 features are formatted into DataFrame
        df = pd.DataFrame([clean_features])[FEATURES_TASK_A]

    def _generate_explanation(self, pipeline: Any, clean_features: Dict[str, Any], task: str, model_name: str, pred_val: Any) -> Dict[str, Any]:
        """
        Generates visual diagram metadata for the specific prediction:
        - Decision Tree: Exact sequential decision nodes, thresholds, packet values, and leaf state.
        - SVM: Hyperplane signed distance, margin status, and 2D visual projection.
        - Naive Bayes: Gaussian distribution parameters, class priors, and top log-likelihood evidence.
        """
        cols = FEATURES_TASK_A if task == "threat" else FEATURES_TASK_B
        df = pd.DataFrame([clean_features])[cols]
        pre = pipeline.named_steps.get("preprocessor")
        clf = pipeline.named_steps.get("classifier")
        X_trans = pre.transform(df) if pre else df

        explanation = {"model": model_name, "task": task}

        try:
            if model_name == "decision_tree":
                node_indicator = clf.decision_path(X_trans)
                node_indices = node_indicator.indices
                feat_names = pre.get_feature_names_out() if pre else cols
                path = []
                for n_id in node_indices:
                    f_idx = clf.tree_.feature[n_id]
                    if f_idx != -2:
                        raw_name = feat_names[f_idx]
                        clean_name = raw_name.replace("num__", "").replace("cat__", "")
                        thresh = float(clf.tree_.threshold[n_id])
                        val = float(X_trans[0, f_idx] if hasattr(X_trans, "shape") else X_trans.iloc[0, f_idx])
                        cond = (val <= thresh)
                        path.append({
                            "node_id": int(n_id),
                            "feature": clean_name,
                            "threshold": round(thresh, 4),
                            "value": round(val, 4),
                            "condition": "<=" if cond else ">",
                            "passed": bool(cond),
                            "branch": "Left (True)" if cond else "Right (False)"
                        })
                    else:
                        leaf_val = clf.tree_.value[n_id][0]
                        total = sum(leaf_val)
                        path.append({
                            "node_id": int(n_id),
                            "is_leaf": True,
                            "samples": int(total),
                            "value": [int(v) for v in leaf_val],
                            "decision": str(pred_val)
                        })
                explanation["type"] = "decision_tree"
                explanation["path"] = path
                explanation["depth"] = len(path)
                explanation["leaf_id"] = int(node_indices[-1])

            elif model_name == "svm":
                dist = 0.0
                if hasattr(clf, "calibrated_classifiers_"):
                    base = clf.calibrated_classifiers_[0].estimator
                    if hasattr(base, "decision_function"):
                        raw_dist = base.decision_function(X_trans)[0]
                        dist = float(raw_dist) if np.isscalar(raw_dist) else float(raw_dist[0])
                elif hasattr(clf, "decision_function"):
                    raw_dist = clf.decision_function(X_trans)[0]
                    dist = float(raw_dist) if np.isscalar(raw_dist) else float(raw_dist[0])

                if dist >= 1.0:
                    status = "Beyond Threat Margin (Confident Attack)"
                    region = "attack"
                elif dist <= -1.0:
                    status = "Beyond Benign Margin (Confident Normal)"
                    region = "normal"
                else:
                    status = "Inside Support Vector Margin Street (-1 to +1)"
                    region = "margin"

                norm_pos = max(-3.0, min(3.0, dist))
                gauge_percent = round(((norm_pos + 3.0) / 6.0) * 100, 1)

                explanation["type"] = "svm"
                explanation["hyperplane_distance"] = round(dist, 4)
                explanation["margin_status"] = status
                explanation["region"] = region
                explanation["gauge_percent"] = gauge_percent
                explanation["formula"] = "f(x) = <w, phi(x)> + b"

            elif model_name == "naive_bayes":
                classes = [str(c) for c in clf.classes_]
                priors = {cls: round(float(p), 4) for cls, p in zip(classes, clf.class_prior_)}
                feat_names = pre.get_feature_names_out() if pre else cols

                means = clf.theta_
                vars_ = clf.var_
                evidence = []

                if len(classes) == 2:
                    for i in range(min(len(feat_names), means.shape[1])):
                        x_i = X_trans[0, i]
                        ll_0 = -0.5 * np.log(2 * np.pi * vars_[0, i]) - 0.5 * ((x_i - means[0, i])**2 / vars_[0, i])
                        ll_1 = -0.5 * np.log(2 * np.pi * vars_[1, i]) - 0.5 * ((x_i - means[1, i])**2 / vars_[1, i])
                        raw_name = feat_names[i].replace("num__", "").replace("cat__", "")
                        evidence.append({
                            "feature": raw_name,
                            "value": round(float(x_i), 3),
                            "ll_normal": round(float(ll_0), 2),
                            "ll_attack": round(float(ll_1), 2),
                            "favors": "Normal" if ll_0 > ll_1 else "Attack",
                            "diff": abs(float(ll_0 - ll_1))
                        })
                    evidence.sort(key=lambda item: item["diff"], reverse=True)

                explanation["type"] = "naive_bayes"
                explanation["classes"] = classes
                explanation["priors"] = priors
                explanation["top_evidence"] = evidence[:5]
                explanation["formula"] = "P(C | X) proportional to P(C) * prod P(x_i | C)"

        except Exception as e:
            explanation["error"] = str(e)

        return explanation

    def predict_threat(self, features: Dict[str, Any], model_name: str = "decision_tree") -> Dict[str, Any]:
        """
        Executes Task A (Binary Threat Detection).
        Normal = 0, Attack = 1.
        """
        key = f"task_a_{model_name}"
        if key not in self.pipelines:
            raise ValueError(f"Unknown model '{model_name}'. Choose from: decision_tree, svm, naive_bayes")

        pipeline = self.pipelines[key]
        clean_features = self._harmonize_interactive_features(features)
        # Ensure all 41 features are formatted into DataFrame
        df = pd.DataFrame([clean_features])[FEATURES_TASK_A]

        preds, confs, probs_dict = self._extract_probabilities(pipeline, df)
        pred_val = int(preds[0])
        is_threat = (pred_val == 1)
        explanation = self._generate_explanation(pipeline, clean_features, "threat", model_name, "ATTACK" if is_threat else "NORMAL")

        return {
            "threat": is_threat,
            "label": "ATTACK" if is_threat else "NORMAL",
            "confidence": round(float(confs[0]), 4),
            "model_used": model_name,
            "probabilities": probs_dict,
            "explanation": explanation
        }

    def predict_protocol(self, features: Dict[str, Any], model_name: str = "decision_tree") -> Dict[str, Any]:
        """
        Executes Task B (Multi-class Protocol Classification).
        RULE 3 ENFORCEMENT: 'service' column is strictly dropped from features.
        """
        key = f"task_b_{model_name}"
        if key not in self.pipelines:
            raise ValueError(f"Unknown model '{model_name}'. Choose from: decision_tree, svm, naive_bayes")

        pipeline = self.pipelines[key]
        clean_features = self._harmonize_interactive_features(features)
        # Exclude 'service' to prevent data leakage (40 features)
        df = pd.DataFrame([clean_features])[FEATURES_TASK_B]

        preds, confs, probs_dict = self._extract_probabilities(pipeline, df)
        predicted_protocol = str(preds[0])
        explanation = self._generate_explanation(pipeline, clean_features, "protocol", model_name, predicted_protocol)

        return {
            "protocol": predicted_protocol,
            "confidence": round(float(confs[0]), 4),
            "model_used": model_name,
            "probabilities": probs_dict,
            "explanation": explanation
        }

    def predict_batch_csv(self, df: pd.DataFrame, task: str = "threat", model_name: str = "decision_tree") -> Dict[str, Any]:
        """
        Executes batch classification on an uploaded CSV DataFrame (41 feature columns).
        Supports files with BOM markers, extra whitespace, or standard raw 41/42/43-column NSL-KDD files.
        """
        # 1. Clean column headers: strip BOM and surrounding whitespace
        clean_cols = [str(col).strip().lstrip('\ufeff') for col in df.columns]
        df.columns = clean_cols

        # 2. Check if required features exist by name
        missing_cols = [col for col in FEATURES_TASK_A if col not in df.columns]

        # 3. If missing standard headers but column count matches NSL-KDD (41, 42, or 43 columns)
        if missing_cols and len(df.columns) in [41, 42, 43]:
            old_header = list(df.columns)
            target_cols = list(FEATURES_TASK_A)
            if len(df.columns) == 42:
                target_cols.append("label")
            elif len(df.columns) == 43:
                target_cols.extend(["label", "difficulty"])
            
            # If the header row actually looks like data (e.g. '0', 'tcp'), include it as the first data row
            is_header_actually_data = (old_header[0] not in FEATURES_TASK_A)
            df.columns = target_cols
            if is_header_actually_data:
                first_row = pd.DataFrame([old_header], columns=target_cols)
                df = pd.concat([first_row, df], ignore_index=True)
            missing_cols = [col for col in FEATURES_TASK_A if col not in df.columns]

        if missing_cols:
            raise ValueError(f"Uploaded CSV is missing {len(missing_cols)} required columns: {missing_cols[:5]}...")

        # 4. Safe type coercion for numeric columns
        for col in FEATURES_TASK_A:
            if col not in ["protocol_type", "service", "flag"] and col in df.columns:
                df[col] = pd.to_numeric(df[col], errors="coerce").fillna(0)

        if task == "threat":
            key = f"task_a_{model_name}"
            if key not in self.pipelines:
                raise ValueError(f"Unknown model: {model_name}")
            pipeline = self.pipelines[key]
            X = df[FEATURES_TASK_A].copy()

            preds, confidences, _ = self._extract_probabilities(pipeline, X)

            results = []
            normal_cnt = 0
            attack_cnt = 0

            for idx, (p, conf) in enumerate(zip(preds, confidences)):
                is_attack = bool(int(p) == 1)
                if is_attack:
                    attack_cnt += 1
                else:
                    normal_cnt += 1

                results.append({
                    "row_index": idx + 1,
                    "prediction": "ATTACK" if is_attack else "NORMAL",
                    "confidence": round(float(conf), 4),
                    "is_threat": is_attack,
                    "protocol_type": str(df.iloc[idx].get("protocol_type", "")),
                    "src_bytes": float(df.iloc[idx].get("src_bytes", 0)),
                    "dst_bytes": float(df.iloc[idx].get("dst_bytes", 0)),
                    "flag": str(df.iloc[idx].get("flag", ""))
                })

            total = len(results)
            threat_rate = round((attack_cnt / total) * 100, 2) if total > 0 else 0.0

            return {
                "task": "threat",
                "model_used": model_name,
                "total_records": total,
                "normal_count": normal_cnt,
                "attack_count": attack_cnt,
                "threat_percentage": threat_rate,
                "results": results
            }

        elif task == "protocol":
            key = f"task_b_{model_name}"
            if key not in self.pipelines:
                raise ValueError(f"Unknown model: {model_name}")
            pipeline = self.pipelines[key]
            # Strictly drop 'service' for Task B (Rule 3)
            X = df[FEATURES_TASK_B].copy()

            preds, confidences, _ = self._extract_probabilities(pipeline, X)

            results = []
            for idx, (p, conf) in enumerate(zip(preds, confidences)):
                results.append({
                    "row_index": idx + 1,
                    "prediction": str(p),
                    "confidence": round(float(conf), 4),
                    "is_threat": None,
                    "protocol_type": str(df.iloc[idx].get("protocol_type", "")),
                    "src_bytes": float(df.iloc[idx].get("src_bytes", 0)),
                    "dst_bytes": float(df.iloc[idx].get("dst_bytes", 0)),
                    "flag": str(df.iloc[idx].get("flag", ""))
                })

            return {
                "task": "protocol",
                "model_used": model_name,
                "total_records": len(results),
                "normal_count": 0,
                "attack_count": 0,
                "threat_percentage": 0.0,
                "results": results
            }
        else:
            raise ValueError(f"Unknown task '{task}'. Choose 'threat' or 'protocol'.")


# Global model manager singleton
model_manager = ModelManager()
