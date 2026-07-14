import os
import json
import hashlib
from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, List, Any
from app.engine import run_policy_evaluation, RuleInput, EngineOutput

app = FastAPI(
    title="GroundSet Core API Server",
    description="Deterministic policy checking and server-driven adaptive UI content",
    version="1.0.0"
)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Since it's a local prototype, allow all origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATA_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data")

def load_json_file(filename: str) -> Any:
    filepath = os.path.join(DATA_DIR, filename)
    if not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail=f"Data file '{filename}' not found.")
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to load mock data: {str(e)}")

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "groundset-backend-api"}

@app.get("/api/roles", response_model=List[str])
def get_roles():
    """Returns available role experiences."""
    # Deterministic roles
    return ["cro", "cto", "engineer", "investor"]

@app.get("/api/experience/{role}")
def get_experience(role: str):
    """Returns adaptive marketing layout and messaging structured for a specific persona."""
    experiences = load_json_file("experiences.json")
    role_lower = role.lower()
    if role_lower not in experiences:
        raise HTTPException(status_code=404, detail=f"Experience for role '{role}' not configured.")
    return experiences[role_lower]

@app.get("/api/timeline")
def get_timeline():
    """Returns step-by-step decision replay events (CRO focus)."""
    return [
        {
            "id": 1,
            "time": "09:31",
            "title": "Loan Application Uploaded",
            "description": "Customer uploads required documents.",
            "actor": "Customer",
            "status": "completed"
        },
        {
            "id": 2,
            "time": "09:33",
            "title": "Evidence Extracted",
            "description": "GroundSet extracted structured data.",
            "actor": "GroundSet",
            "status": "completed"
        },
        {
            "id": 3,
            "time": "09:35",
            "title": "Business Rule Triggered",
            "description": "Rule #18 matched.",
            "actor": "Rules Engine",
            "status": "completed"
        },
        {
            "id": 4,
            "time": "09:37",
            "title": "Human Review",
            "description": "Reviewed by Risk Officer.",
            "actor": "Risk Officer",
            "status": "completed"
        },
        {
            "id": 5,
            "time": "09:40",
            "title": "Decision Approved",
            "description": "Decision finalized.",
            "actor": "GroundSet",
            "status": "completed"
        },
        {
            "id": 6,
            "time": "09:41",
            "title": "Audit Trail Saved",
            "description": "Immutable audit record created.",
            "actor": "System",
            "status": "completed"
        }
    ]

@app.get("/api/decision-diff")
def get_decision_diff():
    """Returns the comparison metrics of before vs after decision changes (CRO focus)."""
    return {
        "before": {
            "income": 82000,
            "creditScore": 742,
            "employment": "Verified",
            "decision": "Approved"
        },
        "after": {
            "income": 82000,
            "creditScore": 690,
            "employment": "Verified",
            "decision": "Rejected"
        },
        "changes": [
            {
                "field": "Credit Score",
                "before": "742",
                "after": "690"
            }
        ],
        "rules": [
            {
                "id": "Rule 18",
                "status": "Passed"
            },
            {
                "id": "Rule 27",
                "status": "Failed"
            }
        ],
        "reason": "Credit score below minimum threshold."
    }

@app.post("/api/upload")
async def upload_document(file: UploadFile = File(...)):
    """Receives document uploads and returns a custom decision replay timeline context."""
    try:
        contents = await file.read()
        sha256 = hashlib.sha256(contents).hexdigest()
        
        # Read the standard base timeline JSON content
        base_timeline = load_json_file("timeline.json")
        
        # Customize the timeline list based on this document upload
        for event in base_timeline:
            if event["step"] == 1:
                event["details"] = {
                    "source": f"Multipart Form Upload (binary/{file.filename.split('.')[-1]})",
                    "sha256": f"sha256:{sha256[:16]}...",
                    "extractedFields": {
                        "annualIncome": 125000,
                        "creditScore": 710,
                        "yearsEstablished": 4,
                        "employmentStatus": "Employed",
                        "loanAmountRequest": 50000
                    }
                }
                event["title"] = f"Document Ingestion Successful: {file.filename}"
                event["status"] = "Parsed Layout & Bounding Coordinates"
            
            # Let's customize step 5 to record this file's output context
            if event["step"] == 5:
                event["details"]["payload"]["approvedBy"] = "GroundSet Auto-Extractor v1.2"
                event["details"]["payload"]["auditLogHash"] = f"audit:{sha256[:8]}-sign"
        
        return base_timeline
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inbound processing failed: {str(e)}")

@app.get("/api/architecture")
def get_architecture():
    """Returns node and connection graph configuration (CTO focus)."""
    return load_json_file("architecture.json")

@app.get("/api/dashboard")
def get_dashboard():
    """Returns business value metric summary cards and before/after comparisons (Investor focus)."""
    return load_json_file("dashboard.json")

@app.get("/api/playground")
def get_playground():
    """Returns standard developer scenarios for the rules engine playground (Engineer focus)."""
    return load_json_file("playground.json")

@app.post("/api/rule-engine", response_model=EngineOutput)
def evaluate_rule_engine(payload: RuleInput):
    """Evaluates the loan application criteria against deterministic rules (Engineer focus)."""
    try:
        return run_policy_evaluation(payload)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Evaluation failed: {str(e)}")
