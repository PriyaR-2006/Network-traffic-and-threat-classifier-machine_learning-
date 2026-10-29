"""
backend/app/schemas.py
----------------------
Pydantic schemas for single and batch predictions, metrics, and test samples.
"""

from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field


class NetworkLogRecord(BaseModel):
    """
    Schema for a single network log record containing all 41 NSL-KDD features.
    Sensible defaults provided for quick testing and UI prototyping.
    """
    duration: float = Field(default=0.0, description="Length (seconds) of the connection")
    protocol_type: str = Field(default="tcp", description="Protocol: tcp, udp, or icmp")
    service: str = Field(default="http", description="Network service on destination (e.g. http, ftp, smtp)")
    flag: str = Field(default="SF", description="Normal or error status of the connection")
    src_bytes: float = Field(default=200.0, description="Bytes sent from source to destination")
    dst_bytes: float = Field(default=400.0, description="Bytes sent from destination to source")
    land: int = Field(default=0, description="1 if connection is from/to same host/port; else 0")
    wrong_fragment: int = Field(default=0, description="Number of wrong fragments")
    urgent: int = Field(default=0, description="Number of urgent packets")
    hot: int = Field(default=0, description="Number of hot indicators (e.g., entering system directory)")
    num_failed_logins: int = Field(default=0, description="Number of failed login attempts")
    logged_in: int = Field(default=1, description="1 if successfully logged in; else 0")
    num_compromised: int = Field(default=0, description="Number of compromised conditions")
    root_shell: int = Field(default=0, description="1 if root shell is obtained; else 0")
    su_attempted: int = Field(default=0, description="1 if 'su root' command attempted; else 0")
    num_root: int = Field(default=0, description="Number of 'root' accesses")
    num_file_creations: int = Field(default=0, description="Number of file creation operations")
    num_shells: int = Field(default=0, description="Number of shell prompts")
    num_access_files: int = Field(default=0, description="Number of operations on access control files")
    num_outbound_cmds: int = Field(default=0, description="Number of outbound commands in an ftp session")
    is_host_login: int = Field(default=0, description="1 if the login belongs to the 'hot' list; else 0")
    is_guest_login: int = Field(default=0, description="1 if the login is a 'guest' login; else 0")
    count: int = Field(default=1, description="Number of connections to the same host as current in past 2s")
    srv_count: int = Field(default=1, description="Number of connections to the same service in past 2s")
    serror_rate: float = Field(default=0.0, description="% of connections that have 'SYN' errors")
    srv_serror_rate: float = Field(default=0.0, description="% of connections to same service with SYN errors")
    rerror_rate: float = Field(default=0.0, description="% of connections that have 'REJ' errors")
    srv_rerror_rate: float = Field(default=0.0, description="% of connections to same service with REJ errors")
    same_srv_rate: float = Field(default=1.0, description="% of connections to the same service")
    diff_srv_rate: float = Field(default=0.0, description="% of connections to different services")
    srv_diff_host_rate: float = Field(default=0.0, description="% of connections to different hosts")
    dst_host_count: int = Field(default=255, description="Count of connections to same destination host")
    dst_host_srv_count: int = Field(default=255, description="Count of connections to same dest host and service")
    dst_host_same_srv_rate: float = Field(default=1.0, description="% of connections to same service on dest host")
    dst_host_diff_srv_rate: float = Field(default=0.0, description="% of connections to different services on dest")
    dst_host_same_src_port_rate: float = Field(default=0.0, description="% of connections to same src port on dest")
    dst_host_srv_diff_host_rate: float = Field(default=0.0, description="% of connections to different hosts on dest")
    dst_host_serror_rate: float = Field(default=0.0, description="% of connections to dest host with SYN errors")
    dst_host_srv_serror_rate: float = Field(default=0.0, description="% of connections to dest service with SYN errors")
    dst_host_rerror_rate: float = Field(default=0.0, description="% of connections to dest host with REJ errors")
    dst_host_srv_rerror_rate: float = Field(default=0.0, description="% of connections to dest service with REJ errors")

    model_config = {
        "extra": "ignore"
    }


class ThreatPredictionRequest(BaseModel):
    model: str = Field(default="decision_tree", description="Model: decision_tree, svm, or naive_bayes")
    record: NetworkLogRecord


class ThreatPredictionResponse(BaseModel):
    threat: bool
    label: str  # "NORMAL" or "ATTACK"
    confidence: float
    model_used: str
    probabilities: Optional[Dict[str, float]] = None
    explanation: Optional[Dict[str, Any]] = None


class ProtocolPredictionRequest(BaseModel):
    model: str = Field(default="decision_tree", description="Model: decision_tree, svm, or naive_bayes")
    record: NetworkLogRecord


class ProtocolPredictionResponse(BaseModel):
    protocol: str
    confidence: float
    model_used: str
    probabilities: Optional[Dict[str, float]] = None
    explanation: Optional[Dict[str, Any]] = None


class BatchPredictionRow(BaseModel):
    row_index: int
    prediction: str
    confidence: float
    is_threat: Optional[bool] = None
    protocol_type: Optional[str] = None
    src_bytes: Optional[float] = None
    dst_bytes: Optional[float] = None
    flag: Optional[str] = None


class BatchPredictionResponse(BaseModel):
    task: str
    model_used: str
    total_records: int
    normal_count: int
    attack_count: int
    threat_percentage: float
    results: List[BatchPredictionRow]


class SampleItem(BaseModel):
    id: str
    name: str
    scenario: str
    expected_threat: str
    expected_protocol: str
    features: Dict[str, Any]
