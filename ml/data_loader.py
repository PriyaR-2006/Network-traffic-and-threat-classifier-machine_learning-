"""
ml/data_loader.py
-----------------
Single-source module for data loading, schema definitions, preprocessing pipelines,
and benchmark sample generation for the Network Traffic Protocol & Threat Classifier.

Dataset: NSL-KDD
- 41 traffic features
- 1 target label (normal vs specific attack name)
- 1 difficulty score (internal benchmark score, dropped from modeling)

Viva Points to Remember:
1. Task A (Threat Detection): Binary classification. 'normal' -> 0, any attack -> 1.
2. Task B (Protocol Classification): Multi-class classification into 8 categories:
   ['http', 'smtp', 'ftp', 'ftp_data', 'domain_u', 'telnet', 'daytime', 'other'].
3. Data Leakage Prevention: In Task B, the 'service' column is the target label.
   Therefore, 'service' MUST be removed from the input features (X) for Task B.
   If included, the model achieves artificial 100% accuracy by reading the answer!
4. Preprocessing: Categorical columns (protocol_type, flag, and service in Task A)
   are One-Hot Encoded. Continuous numeric features are standardized with StandardScaler.
5. Sample Benchmark Logs: data/sample_logs.csv contains 300 real test samples with
   only the 41 feature columns for testing single and batch CSV predictions.
"""

import os
from typing import Tuple, List
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder, StandardScaler

# Standard NSL-KDD column names (41 features + label + difficulty score = 43 columns)
COLUMN_NAMES = [
    "duration", "protocol_type", "service", "flag", "src_bytes",
    "dst_bytes", "land", "wrong_fragment", "urgent", "hot",
    "num_failed_logins", "logged_in", "num_compromised", "root_shell",
    "su_attempted", "num_root", "num_file_creations", "num_shells",
    "num_access_files", "num_outbound_cmds", "is_host_login",
    "is_guest_login", "count", "srv_count", "serror_rate",
    "srv_serror_rate", "rerror_rate", "srv_rerror_rate", "same_srv_rate",
    "diff_srv_rate", "srv_diff_host_rate", "dst_host_count",
    "dst_host_srv_count", "dst_host_same_srv_rate", "dst_host_diff_srv_rate",
    "dst_host_same_src_port_rate", "dst_host_srv_diff_host_rate",
    "dst_host_serror_rate", "dst_host_srv_serror_rate", "dst_host_rerror_rate",
    "dst_host_srv_rerror_rate", "label", "difficulty"
]

# The 8 target service classes for Task B (as required by project specifications)
TARGET_PROTOCOLS = [
    "http", "smtp", "ftp", "ftp_data", "domain_u", "telnet", "daytime"
]

# Feature columns for Task A (all 41 features)
FEATURES_TASK_A = [col for col in COLUMN_NAMES if col not in ["label", "difficulty"]]
CATEGORICAL_TASK_A = ["protocol_type", "service", "flag"]
NUMERICAL_TASK_A = [col for col in FEATURES_TASK_A if col not in CATEGORICAL_TASK_A]

# Feature columns for Task B (40 features - 'service' explicitly removed to prevent data leakage)
FEATURES_TASK_B = [col for col in FEATURES_TASK_A if col != "service"]
CATEGORICAL_TASK_B = ["protocol_type", "flag"]
NUMERICAL_TASK_B = [col for col in FEATURES_TASK_B if col not in CATEGORICAL_TASK_B]


def load_dataset(file_path: str, nrows: int = None) -> pd.DataFrame:
    """
    Loads raw NSL-KDD txt file into a pandas DataFrame and assigns proper column names.
    """
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"Dataset file not found at: {file_path}")

    df = pd.read_csv(file_path, header=None, names=COLUMN_NAMES, nrows=nrows)
    return df


def prepare_task_a(df: pd.DataFrame) -> Tuple[pd.DataFrame, pd.Series]:
    """
    Prepares features (X) and binary target (y) for Task A: Threat Detection.
    - Normal traffic is mapped to 0.
    - Any attack (e.g., neptune, smurf, satan, ipsweep, etc.) is mapped to 1.
    """
    X = df[FEATURES_TASK_A].copy()
    y = (df["label"] != "normal").astype(int)
    return X, y


def map_service_to_protocol(service_series: pd.Series) -> pd.Series:
    """
    Groups the 'service' column into 8 standard classes:
    ['http', 'smtp', 'ftp', 'ftp_data', 'domain_u', 'telnet', 'daytime', 'other'].
    """
    return service_series.apply(lambda s: s if s in TARGET_PROTOCOLS else "other")


def prepare_task_b(df: pd.DataFrame) -> Tuple[pd.DataFrame, pd.Series]:
    """
    Prepares features (X) and multi-class target (y) for Task B: Protocol Classification.
    CRITICAL VIVA RULE:
    The 'service' column is strictly DROPPED from X.
    The target y is created by grouping 'service' into 8 protocol categories.
    """
    X = df[FEATURES_TASK_B].copy()
    y = map_service_to_protocol(df["service"])
    return X, y


def get_preprocessor(categorical_cols: List[str], numerical_cols: List[str]) -> ColumnTransformer:
    """
    Builds a scikit-learn ColumnTransformer:
    - Categorical columns are converted to numbers using OneHotEncoder.
      (handle_unknown='ignore' ensures new unseen categories in production do not crash the pipeline).
    - Numerical columns are normalized using StandardScaler (zero mean, unit variance).
    """
    preprocessor = ColumnTransformer(
        transformers=[
            ("cat", OneHotEncoder(handle_unknown="ignore", sparse_output=False), categorical_cols),
            ("num", StandardScaler(), numerical_cols)
        ]
    )
    return preprocessor


def create_sample_logs_csv(test_file_path: str, output_csv_path: str, n_rows: int = 300) -> pd.DataFrame:
    """
    Extracts the first n_rows from KDDTest+.txt containing ONLY the 41 feature columns,
    attaches proper headers, and saves as a clean CSV for batch testing and demo.
    """
    print(f"Creating sample benchmark logs ({n_rows} rows) at: {output_csv_path}")
    test_df = load_dataset(test_file_path, nrows=n_rows)
    sample_df = test_df[FEATURES_TASK_A].copy()
    sample_df.to_csv(output_csv_path, index=False)
    print(f"Successfully generated {output_csv_path} with shape {sample_df.shape}")
    return sample_df


if __name__ == "__main__":
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    train_path = os.path.join(base_dir, "data", "KDDTrain+.txt")
    test_path = os.path.join(base_dir, "data", "KDDTest+.txt")
    sample_csv_path = os.path.join(base_dir, "data", "sample_logs.csv")

    print("=" * 60)
    print("PHASE 1: NSL-KDD DATASET EXPLORATION & SAMPLE GENERATION")
    print("=" * 60)

    print(f"Loading training data from: {train_path}")
    train_df = load_dataset(train_path)
    print(f"Train Shape: {train_df.shape} (Expected: 125973 rows, 43 columns)")

    print(f"Loading testing data from: {test_path}")
    test_df = load_dataset(test_path)
    print(f"Test Shape:  {test_df.shape} (Expected: 22544 rows, 43 columns)")

    print("\n--- Checking Missing Values ---")
    train_nulls = train_df.isnull().sum().sum()
    test_nulls = test_df.isnull().sum().sum()
    print(f"Train Missing Values: {train_nulls}")
    print(f"Test Missing Values:  {test_nulls}")

    print("\n--- Task A (Threat Detection - Binary) ---")
    X_train_A, y_train_A = prepare_task_a(train_df)
    X_test_A, y_test_A = prepare_task_a(test_df)
    print(f"Task A Features (Train): {X_train_A.shape[1]} columns")
    print(f"Task A Target Distribution (Train):")
    print(f"  Normal (0): {sum(y_train_A == 0)} ({sum(y_train_A == 0)/len(y_train_A):.2%})")
    print(f"  Attack (1): {sum(y_train_A == 1)} ({sum(y_train_A == 1)/len(y_train_A):.2%})")

    print("\n--- Task B (Protocol Classification - Multi-class) ---")
    X_train_B, y_train_B = prepare_task_b(train_df)
    X_test_B, y_test_B = prepare_task_b(test_df)
    print(f"Task B Features (Train): {X_train_B.shape[1]} columns")
    print(f"VERIFICATION: Is 'service' in Task B features? -> {'service' in X_train_B.columns} (Must be False!)")
    print("Task B Target Distribution (Train):")
    for protocol, count in y_train_B.value_counts().items():
        print(f"  {protocol:<10}: {count:>6} ({count/len(y_train_B):.2%})")

    print("\n--- Generating Sample Benchmark CSV for Batch Upload ---")
    sample_df = create_sample_logs_csv(test_path, sample_csv_path, n_rows=300)
    print(f"sample_logs.csv columns count: {len(sample_df.columns)} (Expected: 41 feature columns)")

    print("\nPreprocessors successfully configured:")
    print(f"  Task A: {len(CATEGORICAL_TASK_A)} categorical + {len(NUMERICAL_TASK_A)} numerical = {len(FEATURES_TASK_A)} total features")
    print(f"  Task B: {len(CATEGORICAL_TASK_B)} categorical + {len(NUMERICAL_TASK_B)} numerical = {len(FEATURES_TASK_B)} total features (zero leakage)")
    print("=" * 60)
