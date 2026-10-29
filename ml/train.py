"""
ml/train.py
-----------
Comprehensive training, evaluation, and serialization script for:
1. Task A (Binary Threat Detection: Normal vs Attack)
2. Task B (Multi-class Protocol Classification: 8 Service categories)

Models Trained for both tasks:
1. Decision Tree (criterion='entropy', max_depth=15)
2. Support Vector Machine (RBF Kernel, calibrated for probabilities, trained on 20,000 samples)
3. Gaussian Naive Bayes (GaussianNB)

Key College Viva Concepts:
- scikit-learn Pipeline: Wraps the ColumnTransformer (OneHotEncoder + StandardScaler)
  and the Classifier together. This prevents data leakage and ensures raw un-encoded
  dictionaries/DataFrames can be passed directly to pipeline.predict().
- Decision Tree with Entropy: Uses Information Gain = H(parent) - H(children) where
  Entropy H(S) = - sum(p_i * log2(p_i)). Splits on attributes that maximize impurity reduction.
- SVM with RBF Kernel: Projects non-linear network traffic data into infinite-dimensional
  Hilbert space using K(x, x') = exp(-gamma * ||x - x'||^2). Uses 20,000 training samples
  (random_state=42) and calibration for fast training and probability estimation.
- Gaussian Naive Bayes: Assumes feature conditional independence given the class:
  P(y|x) proportional to P(y) * prod(P(x_i|y)), modeling continuous features with Gaussian curves.
- Zero Data Leakage for Task B: The 'service' column is strictly dropped from features.

Artifacts Generated:
- models/task_a_dt.joblib, task_a_svm.joblib, task_a_gnb.joblib
- models/task_b_dt.joblib, task_b_svm.joblib, task_b_gnb.joblib
- models/metrics.json (Accuracy, Precision, Recall, F1, train_time, predict_time, Confusion Matrix)
- models/feature_importance.json (Top 15 features for Task A and Task B from Decision Tree)
"""

import os
import json
import time
from typing import Dict, Any, List, Tuple
import joblib
import numpy as np
import pandas as pd

from sklearn.pipeline import Pipeline
from sklearn.tree import DecisionTreeClassifier
from sklearn.svm import SVC
from sklearn.calibration import CalibratedClassifierCV
from sklearn.naive_bayes import GaussianNB
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix
)

import sys

# Ensure root directory is on sys.path regardless of how script is invoked
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Single source for loading and preprocessing definitions
from ml.data_loader import (
    load_dataset,
    prepare_task_a,
    prepare_task_b,
    get_preprocessor,
    CATEGORICAL_TASK_A,
    NUMERICAL_TASK_A,
    CATEGORICAL_TASK_B,
    NUMERICAL_TASK_B
)


def build_pipeline(preprocessor, model) -> Pipeline:
    """
    Wraps preprocessor and classifier in a single scikit-learn Pipeline.
    Rule 4 Compliance: Guarantees preprocessing and model are saved together.
    """
    return Pipeline(steps=[
        ("preprocessor", preprocessor),
        ("classifier", model)
    ])


def evaluate_model(pipeline: Pipeline, X_test: pd.DataFrame, y_test: pd.Series) -> Tuple[Dict[str, Any], float]:
    """
    Evaluates a trained pipeline on test data and measures test inference time.
    Returns evaluation metrics dictionary and predict_time in seconds.
    """
    start_time = time.time()
    y_pred = pipeline.predict(X_test)
    predict_time = round(time.time() - start_time, 4)

    classes = [str(c) for c in pipeline.classes_]
    cm = confusion_matrix(y_test, y_pred, labels=pipeline.classes_).tolist()

    metrics = {
        "accuracy": round(float(accuracy_score(y_test, y_pred)), 4),
        "precision_weighted": round(float(precision_score(y_test, y_pred, average="weighted", zero_division=0)), 4),
        "recall_weighted": round(float(recall_score(y_test, y_pred, average="weighted", zero_division=0)), 4),
        "f1_weighted": round(float(f1_score(y_test, y_pred, average="weighted", zero_division=0)), 4),
        "precision_macro": round(float(precision_score(y_test, y_pred, average="macro", zero_division=0)), 4),
        "recall_macro": round(float(recall_score(y_test, y_pred, average="macro", zero_division=0)), 4),
        "f1_macro": round(float(f1_score(y_test, y_pred, average="macro", zero_division=0)), 4),
        "predict_time": predict_time,
        "classes": classes,
        "confusion_matrix": cm
    }
    return metrics, predict_time


def extract_top_features(pipeline: Pipeline, top_n: int = 15) -> List[Dict[str, Any]]:
    """
    Extracts feature importances from a trained Decision Tree pipeline.
    Maps encoded column names back to understandable feature names.
    """
    preprocessor = pipeline.named_steps["preprocessor"]
    dt_model = pipeline.named_steps["classifier"]

    # Retrieve all output feature names from the ColumnTransformer
    feature_names = preprocessor.get_feature_names_out()
    importances = dt_model.feature_importances_

    # Clean up prefixes ('cat__' and 'num__') for clean visual presentation
    clean_pairs = []
    for name, imp in zip(feature_names, importances):
        clean_name = name.replace("cat__", "").replace("num__", "")
        clean_pairs.append({"feature": clean_name, "importance": round(float(imp), 4)})

    # Sort descending by importance score
    sorted_pairs = sorted(clean_pairs, key=lambda x: x["importance"], reverse=True)
    return sorted_pairs[:top_n]


def main():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    train_path = os.path.join(base_dir, "data", "KDDTrain+.txt")
    test_path = os.path.join(base_dir, "data", "KDDTest+.txt")
    models_dir = os.path.join(base_dir, "models")
    os.makedirs(models_dir, exist_ok=True)

    print("=" * 70)
    print("PHASE 2: MACHINE LEARNING PIPELINE TRAINING & EVALUATION")
    print("=" * 70)

    # 1. Load full datasets
    print("Loading train and test datasets via ml/data_loader.py...")
    train_df = load_dataset(train_path)
    test_df = load_dataset(test_path)
    print(f"Train samples: {len(train_df):,}, Test samples: {len(test_df):,}")

    # 2. Fixed 20,000-row sample for SVM (Rule 3 in user request)
    print("Extracting fixed 20,000-row sample for SVM (random_state=42)...")
    train_df_svm = train_df.sample(n=20000, random_state=42)

    all_metrics = {"task_a": {}, "task_b": {}}
    feature_importance_dict = {}

    # =========================================================================
    # TASK A: BINARY THREAT DETECTION (Normal vs Attack)
    # =========================================================================
    print("\n" + "#" * 70)
    print("TRAINING TASK A: BINARY THREAT DETECTION (Normal = 0, Attack = 1)")
    print("#" * 70)

    X_train_A, y_train_A = prepare_task_a(train_df)
    X_test_A, y_test_A = prepare_task_a(test_df)
    X_train_A_svm, y_train_A_svm = prepare_task_a(train_df_svm)

    models_task_a = {
        "decision_tree": {
            "name": "Decision Tree (Entropy)",
            "model": DecisionTreeClassifier(criterion="entropy", max_depth=15, random_state=42),
            "use_svm_sample": False,
            "filename": "task_a_dt.joblib"
        },
        "svm": {
            "name": "Support Vector Machine (RBF)",
            # CalibratedClassifierCV wraps RBF SVC with 2-fold cross-validation
            # to output calibrated probabilities via .predict_proba() in fast runtime.
            "model": CalibratedClassifierCV(
                estimator=SVC(kernel="rbf", random_state=42),
                cv=2
            ),
            "use_svm_sample": True,
            "filename": "task_a_svm.joblib"
        },
        "naive_bayes": {
            "name": "Gaussian Naive Bayes",
            "model": GaussianNB(),
            "use_svm_sample": False,
            "filename": "task_a_gnb.joblib"
        }
    }

    for key, config in models_task_a.items():
        print(f"\n--- Training Task A: {config['name']} ---")
        preprocessor_A = get_preprocessor(CATEGORICAL_TASK_A, NUMERICAL_TASK_A)
        pipeline = build_pipeline(preprocessor_A, config["model"])

        # Select data subset (20k for SVM, full set for DT and GNB)
        X_tr = X_train_A_svm if config["use_svm_sample"] else X_train_A
        y_tr = y_train_A_svm if config["use_svm_sample"] else y_train_A
        print(f"Training on {len(X_tr):,} samples...")

        t_start = time.time()
        pipeline.fit(X_tr, y_tr)
        train_time = round(time.time() - t_start, 4)
        print(f"Fit completed in {train_time:.2f} seconds.")

        # Evaluate on test set
        print("Evaluating on test set (22,544 samples)...")
        eval_metrics, predict_time = evaluate_model(pipeline, X_test_A, y_test_A)
        eval_metrics["train_time"] = train_time
        all_metrics["task_a"][key] = eval_metrics

        print(f"Test Accuracy: {eval_metrics['accuracy']:.4f} | F1 (weighted): {eval_metrics['f1_weighted']:.4f} | Inference: {predict_time:.3f}s")

        # Save pipeline
        save_path = os.path.join(models_dir, config["filename"])
        joblib.dump(pipeline, save_path)
        print(f"Saved pipeline to: {save_path}")

        # Capture top 15 features from Decision Tree
        if key == "decision_tree":
            top15 = extract_top_features(pipeline, top_n=15)
            feature_importance_dict["task_a"] = top15
            print("Extracted top 15 Decision Tree features for Task A.")

    # =========================================================================
    # TASK B: MULTI-CLASS PROTOCOL CLASSIFICATION (8 Classes)
    # =========================================================================
    print("\n" + "#" * 70)
    print("TRAINING TASK B: PROTOCOL CLASSIFICATION (8 Classes, Zero Data Leakage)")
    print("#" * 70)

    X_train_B, y_train_B = prepare_task_b(train_df)
    X_test_B, y_test_B = prepare_task_b(test_df)
    X_train_B_svm, y_train_B_svm = prepare_task_b(train_df_svm)

    # Double check zero data leakage
    assert "service" not in X_train_B.columns, "DATA LEAKAGE ERROR: 'service' present in Task B features!"
    assert "service" not in X_test_B.columns, "DATA LEAKAGE ERROR: 'service' present in Task B features!"
    print("Verified zero data leakage: 'service' column is absent from Task B input features.")

    models_task_b = {
        "decision_tree": {
            "name": "Decision Tree (Entropy)",
            "model": DecisionTreeClassifier(criterion="entropy", max_depth=15, random_state=42),
            "use_svm_sample": False,
            "filename": "task_b_dt.joblib"
        },
        "svm": {
            "name": "Support Vector Machine (RBF)",
            "model": CalibratedClassifierCV(
                estimator=SVC(kernel="rbf", random_state=42),
                cv=2
            ),
            "use_svm_sample": True,
            "filename": "task_b_svm.joblib"
        },
        "naive_bayes": {
            "name": "Gaussian Naive Bayes",
            "model": GaussianNB(),
            "use_svm_sample": False,
            "filename": "task_b_gnb.joblib"
        }
    }

    for key, config in models_task_b.items():
        print(f"\n--- Training Task B: {config['name']} ---")
        preprocessor_B = get_preprocessor(CATEGORICAL_TASK_B, NUMERICAL_TASK_B)
        pipeline = build_pipeline(preprocessor_B, config["model"])

        # Select data subset (20k for SVM, full set for DT and GNB)
        X_tr = X_train_B_svm if config["use_svm_sample"] else X_train_B
        y_tr = y_train_B_svm if config["use_svm_sample"] else y_train_B
        print(f"Training on {len(X_tr):,} samples...")

        t_start = time.time()
        pipeline.fit(X_tr, y_tr)
        train_time = round(time.time() - t_start, 4)
        print(f"Fit completed in {train_time:.2f} seconds.")

        # Evaluate on test set
        print("Evaluating on test set (22,544 samples)...")
        eval_metrics, predict_time = evaluate_model(pipeline, X_test_B, y_test_B)
        eval_metrics["train_time"] = train_time
        all_metrics["task_b"][key] = eval_metrics

        print(f"Test Accuracy: {eval_metrics['accuracy']:.4f} | F1 (weighted): {eval_metrics['f1_weighted']:.4f} | Inference: {predict_time:.3f}s")

        # Save pipeline
        save_path = os.path.join(models_dir, config["filename"])
        joblib.dump(pipeline, save_path)
        print(f"Saved pipeline to: {save_path}")

        # Capture top 15 features from Decision Tree
        if key == "decision_tree":
            top15 = extract_top_features(pipeline, top_n=15)
            feature_importance_dict["task_b"] = top15
            print("Extracted top 15 Decision Tree features for Task B.")

    # 3. Save metrics.json
    metrics_path = os.path.join(models_dir, "metrics.json")
    with open(metrics_path, "w") as f:
        json.dump(all_metrics, f, indent=2)
    print(f"\nSuccessfully saved evaluation metrics to: {metrics_path}")

    # 4. Save feature_importance.json
    feat_imp_path = os.path.join(models_dir, "feature_importance.json")
    with open(feat_imp_path, "w") as f:
        json.dump(feature_importance_dict, f, indent=2)
    print(f"Successfully saved feature importance to: {feat_imp_path}")

    print("\n" + "=" * 70)
    print("PHASE 2 MODEL TRAINING AND SERIALIZATION COMPLETED SUCCESSFULLY!")
    print("=" * 70)


if __name__ == "__main__":
    main()
