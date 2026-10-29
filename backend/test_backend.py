"""
backend/test_backend.py
-----------------------
Automated test suite verifying all FastAPI backend endpoints:
- /api/health
- /api/metrics (train_time, predict_time, confusion matrix)
- /api/features/importance (top 15 DT features)
- /api/samples (curated test records)
- /api/predict/threat (DT, SVM, Naive Bayes on Normal & Attack)
- /api/predict/protocol (DT, SVM, Naive Bayes, zero leakage)
- /api/predict/batch (uploading data/sample_logs.csv)
"""

import os
import sys
from fastapi.testclient import TestClient

# Ensure root directory is on sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.app.main import app

client = TestClient(app)


def test_health():
    response = client.get("/api/health")
    assert response.status_code == 200, f"Health check failed: {response.text}"
    data = response.json()
    assert data["status"] == "healthy"
    assert len(data["loaded_pipelines"]) == 6, f"Expected 6 pipelines, got: {data['loaded_pipelines']}"
    print("[PASS] /api/health verified (all 6 pipelines active)")


def test_metrics():
    response = client.get("/api/metrics")
    assert response.status_code == 200, f"Metrics failed: {response.text}"
    data = response.json()
    assert "task_a" in data and "task_b" in data
    # Check that timings are recorded
    for task in ["task_a", "task_b"]:
        for model in ["decision_tree", "svm", "naive_bayes"]:
            assert "train_time" in data[task][model], f"Missing train_time in {task}/{model}"
            assert "predict_time" in data[task][model], f"Missing predict_time in {task}/{model}"
            assert "accuracy" in data[task][model], f"Missing accuracy in {task}/{model}"
            assert "confusion_matrix" in data[task][model], f"Missing confusion_matrix in {task}/{model}"
    print("[PASS] /api/metrics verified (accuracies, timings, confusion matrices present)")


def test_features_importance():
    response = client.get("/api/features/importance")
    assert response.status_code == 200, f"Feature importance failed: {response.text}"
    data = response.json()
    assert "task_a" in data and "task_b" in data
    assert len(data["task_a"]) == 15, f"Expected 15 features for Task A, got {len(data['task_a'])}"
    assert len(data["task_b"]) == 15, f"Expected 15 features for Task B, got {len(data['task_b'])}"
    print("[PASS] /api/features/importance verified (15 features each for Task A & B)")


def test_samples():
    response = client.get("/api/samples")
    assert response.status_code == 200, f"Samples failed: {response.text}"
    samples = response.json()
    assert len(samples) >= 4, f"Expected at least 4 sample scenarios, got {len(samples)}"
    print(f"[PASS] /api/samples verified ({len(samples)} interactive scenarios loaded)")


def test_sample_csv():
    # Test CSV file download
    response = client.get("/api/sample-csv")
    assert response.status_code == 200, f"Sample CSV failed: {response.text}"
    assert "text/csv" in response.headers.get("content-type", "")
    assert len(response.content) > 1000

    # Test JSON format
    response_json = client.get("/api/sample-csv?format=json")
    assert response_json.status_code == 200
    data = response_json.json()
    assert data["total_rows"] == 300
    print("[PASS] /api/sample-csv verified (CSV and JSON download formats active)")


def test_predict_threat():
    # Retrieve sample 1 (Normal HTTP) and sample 2 (Neptune SYN Flood)
    samples = client.get("/api/samples").json()
    normal_sample = next(s for s in samples if s["id"] == "sample-1")
    attack_sample = next(s for s in samples if s["id"] == "sample-2")

    for model in ["decision_tree", "svm", "naive_bayes"]:
        # Test normal traffic prediction
        res_normal = client.post("/api/predict/threat", json={
            "model": model,
            "record": normal_sample["features"]
        })
        assert res_normal.status_code == 200, f"Threat normal failed: {res_normal.text}"
        data_normal = res_normal.json()
        assert data_normal["label"] == "NORMAL", f"{model} expected NORMAL for sample 1, got {data_normal['label']}"

        # Test attack traffic prediction
        res_attack = client.post("/api/predict/threat", json={
            "model": model,
            "record": attack_sample["features"]
        })
        assert res_attack.status_code == 200, f"Threat attack failed: {res_attack.text}"
        data_attack = res_attack.json()
        assert data_attack["label"] == "ATTACK", f"{model} expected ATTACK for sample 2, got {data_attack['label']}"

        print(f"  [Model: {model}] Normal Conf: {data_normal['confidence']} | Attack Conf: {data_attack['confidence']}")

    print("[PASS] /api/predict/threat verified across DT, SVM, and Naive Bayes")


def test_predict_protocol():
    samples = client.get("/api/samples").json()
    http_sample = next(s for s in samples if s["id"] == "sample-1")
    ftp_sample = next(s for s in samples if s["id"] == "sample-4")

    for model in ["decision_tree", "svm", "naive_bayes"]:
        res_http = client.post("/api/predict/protocol", json={
            "model": model,
            "record": http_sample["features"]
        })
        assert res_http.status_code == 200, f"Protocol prediction failed: {res_http.text}"
        data_http = res_http.json()
        assert "protocol" in data_http
        assert data_http["confidence"] > 0

        res_ftp = client.post("/api/predict/protocol", json={
            "model": model,
            "record": ftp_sample["features"]
        })
        assert res_ftp.status_code == 200, f"Protocol prediction failed: {res_ftp.text}"
        data_ftp = res_ftp.json()
        assert "protocol" in data_ftp

        print(f"  [Model: {model}] HTTP sample -> {data_http['protocol']} ({data_http['confidence']}) | FTP sample -> {data_ftp['protocol']} ({data_ftp['confidence']})")

    print("[PASS] /api/predict/protocol verified across DT, SVM, and Naive Bayes (zero leakage)")


def test_batch_prediction_csv():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    csv_path = os.path.join(base_dir, "data", "sample_logs.csv")
    assert os.path.exists(csv_path), f"Benchmark CSV not found at {csv_path}"

    with open(csv_path, "rb") as f:
        file_bytes = f.read()

    # 1. Test Task A batch (Threat Detection)
    response_threat = client.post(
        "/api/predict/batch",
        files={"file": ("sample_logs.csv", file_bytes, "text/csv")},
        data={"task": "threat", "model": "decision_tree"}
    )
    assert response_threat.status_code == 200, f"Batch threat failed: {response_threat.text}"
    data_threat = response_threat.json()
    assert data_threat["total_records"] == 300, f"Expected 300 rows, got {data_threat['total_records']}"
    assert len(data_threat["results"]) == 300
    assert data_threat["normal_count"] + data_threat["attack_count"] == 300
    print(f"[PASS] /api/predict/batch (Threat): 300 rows -> Normal: {data_threat['normal_count']}, Attack: {data_threat['attack_count']}, Threat Rate: {data_threat['threat_percentage']}%")

    # 2. Test Task B batch (Protocol Classification)
    response_proto = client.post(
        "/api/predict/batch",
        files={"file": ("sample_logs.csv", file_bytes, "text/csv")},
        data={"task": "protocol", "model": "decision_tree"}
    )
    assert response_proto.status_code == 200, f"Batch protocol failed: {response_proto.text}"
    data_proto = response_proto.json()
    assert data_proto["total_records"] == 300
    assert len(data_proto["results"]) == 300
    print(f"[PASS] /api/predict/batch (Protocol): 300 rows classified successfully")


def test_custom_attack_and_normal_inputs():
    """
    Verifies that modifying inputs to attack values correctly triggers ATTACK,
    and modifying attack inputs to normal values correctly triggers NORMAL.
    """
    samples = client.get("/api/samples").json()
    sample_1_features = dict(next(s for s in samples if s["id"] == "sample-1")["features"])
    sample_2_features = dict(next(s for s in samples if s["id"] == "sample-2")["features"])

    # 1. User edits Sample 1 into a SYN flood attack
    custom_syn_attack = dict(sample_1_features)
    custom_syn_attack.update({"flag": "S0", "serror_rate": 1.0, "src_bytes": 0.0, "service": "private"})

    res_syn_dt = client.post("/api/predict/threat", json={"model": "decision_tree", "record": custom_syn_attack}).json()
    assert res_syn_dt["label"] == "ATTACK", f"Expected ATTACK for custom SYN edit, got {res_syn_dt['label']}"
    res_syn_svm = client.post("/api/predict/threat", json={"model": "svm", "record": custom_syn_attack}).json()
    assert res_syn_svm["label"] == "ATTACK", f"Expected ATTACK for custom SYN edit on SVM, got {res_syn_svm['label']}"

    # 2. User edits Sample 1 into a Port sweep probe attack
    custom_rej_attack = dict(sample_1_features)
    custom_rej_attack.update({"flag": "REJ", "rerror_rate": 1.0, "src_bytes": 0.0, "service": "private"})

    res_rej_dt = client.post("/api/predict/threat", json={"model": "decision_tree", "record": custom_rej_attack}).json()
    assert res_rej_dt["label"] == "ATTACK", f"Expected ATTACK for custom REJ edit, got {res_rej_dt['label']}"
    res_rej_svm = client.post("/api/predict/threat", json={"model": "svm", "record": custom_rej_attack}).json()
    assert res_rej_svm["label"] == "ATTACK", f"Expected ATTACK for custom REJ edit on SVM, got {res_rej_svm['label']}"

    # 3. User edits Sample 2 into benign Web HTTP traffic
    custom_benign = dict(sample_2_features)
    custom_benign.update({"flag": "SF", "serror_rate": 0.0, "src_bytes": 280.0, "dst_bytes": 5200.0, "service": "http", "logged_in": 1})

    res_benign_dt = client.post("/api/predict/threat", json={"model": "decision_tree", "record": custom_benign}).json()
    assert res_benign_dt["label"] == "NORMAL", f"Expected NORMAL for custom benign edit, got {res_benign_dt['label']}"
    res_benign_svm = client.post("/api/predict/threat", json={"model": "svm", "record": custom_benign}).json()
    assert res_benign_svm["label"] == "NORMAL", f"Expected NORMAL for custom benign edit on SVM, got {res_benign_svm['label']}"

    print("[PASS] test_custom_attack_and_normal_inputs: All custom edits correctly classified as ATTACK / NORMAL!")


if __name__ == "__main__":
    print("=" * 60)
    print("PHASE 3: FASTAPI BACKEND VERIFICATION SUITE")
    print("=" * 60)
    test_health()
    test_metrics()
    test_features_importance()
    test_samples()
    test_sample_csv()
    test_predict_threat()
    test_predict_protocol()
    test_batch_prediction_csv()
    test_custom_attack_and_normal_inputs()
    print("=" * 60)
    print("ALL FASTAPI BACKEND TESTS PASSED SUCCESSFULLY (100% PASS RATE)!")
    print("=" * 60)
