"""
backend/app/routes.py
---------------------
API route definitions for health checks, evaluation metrics, interactive samples,
single threat/protocol inference, and batch CSV predictions.
"""

import os
import sys
import io
from typing import Dict, Any, List, Optional
import pandas as pd
from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from fastapi.responses import FileResponse, JSONResponse

# Add project root and backend dir to sys.path
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
BACKEND_DIR = os.path.join(PROJECT_ROOT, "backend")
for p in [PROJECT_ROOT, BACKEND_DIR]:
    if p not in sys.path:
        sys.path.insert(0, p)

try:
    from backend.app.schemas import (
        ThreatPredictionRequest,
        ThreatPredictionResponse,
        ProtocolPredictionRequest,
        ProtocolPredictionResponse,
        BatchPredictionResponse,
        SampleItem
    )
    from backend.app.model_loader import model_manager
except ImportError:
    from app.schemas import (
        ThreatPredictionRequest,
        ThreatPredictionResponse,
        ProtocolPredictionRequest,
        ProtocolPredictionResponse,
        BatchPredictionResponse,
        SampleItem
    )
    from app.model_loader import model_manager

router = APIRouter(prefix="/api")


@router.get("/health")
def health_check() -> Dict[str, Any]:
    """
    Returns server status and a list of currently loaded model pipelines.
    """
    return {
        "status": "healthy",
        "service": "Network Traffic Classifier API",
        "loaded_pipelines": list(model_manager.pipelines.keys()),
        "has_metrics": bool(model_manager.metrics),
        "has_feature_importance": bool(model_manager.feature_importance)
    }


@router.get("/metrics")
def get_metrics() -> Dict[str, Any]:
    """
    Returns test evaluation metrics, confusion matrices, and execution timings
    (train_time and predict_time) from models/metrics.json.
    """
    if not model_manager.metrics:
        raise HTTPException(status_code=404, detail="Metrics not found. Please run ml/train.py first.")
    return model_manager.metrics


@router.get("/features/importance")
def get_feature_importance() -> Dict[str, Any]:
    """
    Returns top 15 Decision Tree feature importances for Task A and Task B
    from models/feature_importance.json.
    """
    if not model_manager.feature_importance:
        raise HTTPException(status_code=404, detail="Feature importance not found. Please run ml/train.py first.")
    return model_manager.feature_importance


@router.get("/samples", response_model=List[SampleItem])
def get_samples() -> List[Dict[str, Any]]:
    """
    Returns curated network traffic scenarios (Normal HTTP, Neptune SYN Flood,
    Port Sweep Probe, FTP Transfer) for 1-click UI testing.
    """
    return model_manager.sample_records


@router.get("/sample-csv")
def get_sample_csv(format: str = "csv"):
    """
    Returns the bundled sample_logs.csv (300 records)
    for 1-click batch inspection testing without needing to find the file manually.
    """
    csv_path = os.path.join(PROJECT_ROOT, "data", "sample_logs.csv")
    if not os.path.exists(csv_path):
        raise HTTPException(status_code=404, detail="sample_logs.csv not found in data directory.")

    if format == "json":
        df = pd.read_csv(csv_path, encoding="utf-8-sig")
        return {
            "filename": "sample_logs.csv",
            "total_rows": len(df),
            "columns": list(df.columns),
            "records": df.head(50).to_dict(orient="records")
        }

    return FileResponse(
        csv_path,
        media_type="text/csv",
        filename="sample_logs.csv"
    )


@router.post("/predict/threat", response_model=ThreatPredictionResponse)
def predict_threat(payload: ThreatPredictionRequest) -> Dict[str, Any]:
    """
    Task A: Binary Threat Detection.
    Classifies a single network log record as NORMAL or ATTACK.
    """
    try:
        record_dict = payload.record.model_dump()
        result = model_manager.predict_threat(record_dict, model_name=payload.model)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inference error: {str(e)}")


@router.post("/predict/protocol", response_model=ProtocolPredictionResponse)
def predict_protocol(payload: ProtocolPredictionRequest) -> Dict[str, Any]:
    """
    Task B: Multi-class Protocol Classification.
    Classifies network service into one of 8 classes (http, smtp, ftp, ftp_data, domain_u, telnet, daytime, other).
    RULE 3: The 'service' feature is strictly excluded from input to prevent data leakage.
    """
    try:
        record_dict = payload.record.model_dump()
        result = model_manager.predict_protocol(record_dict, model_name=payload.model)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inference error: {str(e)}")


@router.post("/predict/batch", response_model=BatchPredictionResponse)
async def predict_batch(
    file: UploadFile = File(..., description="CSV or TXT file containing network log feature columns"),
    task: str = Form(default="threat", description="Classification task: 'threat' or 'protocol'"),
    model: str = Form(default="decision_tree", description="Model: decision_tree, svm, or naive_bayes")
) -> Dict[str, Any]:
    """
    Batch Prediction via CSV/TXT Upload.
    Accepts a CSV with the 41 feature columns (such as data/sample_logs.csv or KDDTest+.txt),
    runs the chosen pipeline, and returns predictions for each row along with summary counts.
    """
    lower_name = (file.filename or "").lower()
    if not (lower_name.endswith(".csv") or lower_name.endswith(".txt")):
        raise HTTPException(status_code=400, detail="Invalid file format. Please upload a .csv or .txt file.")

    try:
        contents = await file.read()
        if not contents or len(contents.strip()) == 0:
            raise HTTPException(status_code=400, detail="Uploaded file is empty.")

        # Read CSV with encoding utf-8-sig to automatically strip BOM
        try:
            df = pd.read_csv(io.BytesIO(contents), encoding="utf-8-sig", sep=None, engine="python")
        except Exception:
            df = pd.read_csv(io.BytesIO(contents), encoding="utf-8-sig")

        if df.empty:
            raise HTTPException(status_code=400, detail="Uploaded CSV file is empty.")

        response = model_manager.predict_batch_csv(df, task=task, model_name=model)
        return response
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Batch processing error: {str(e)}")
