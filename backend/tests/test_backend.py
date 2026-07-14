import sys
import os
from fastapi.testclient import TestClient

# Mock data directory path fix for test runtime context
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.main import app

client = TestClient(app)

def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_get_roles():
    response = client.get("/api/roles")
    assert response.status_code == 200
    assert isinstance(response.json(), list)
    assert "cro" in response.json()
    assert "cto" in response.json()
    assert "engineer" in response.json()
    assert "investor" in response.json()

def test_get_experience_success():
    response = client.get("/api/experience/cro")
    assert response.status_code == 200
    data = response.json()
    assert data["role"] == "cro"
    assert "hero" in data
    assert "features" in data
    assert len(data["features"]) > 0

def test_get_experience_not_found():
    response = client.get("/api/experience/invalidrole")
    assert response.status_code == 404

def test_get_timeline():
    response = client.get("/api/timeline")
    assert response.status_code == 200
    timeline = response.json()
    assert isinstance(timeline, list)
    assert len(timeline) > 0
    assert timeline[0]["title"] == "Loan Application Uploaded"

def test_decision_diff():
    response = client.get("/api/decision-diff")
    assert response.status_code == 200
    diff = response.json()
    assert "before" in diff
    assert "after" in diff
    assert "changes" in diff
    assert diff["before"]["decision"] == "Approved"
    assert diff["after"]["decision"] == "Rejected"

def test_get_architecture():
    response = client.get("/api/architecture")
    assert response.status_code == 200
    arch = response.json()
    assert "nodes" in arch
    assert "connections" in arch

def test_get_dashboard():
    response = client.get("/api/dashboard")
    assert response.status_code == 200
    dash = response.json()
    assert "metrics" in dash
    assert "comparisons" in dash
    assert "manualReviewReduction" in dash["metrics"]

def test_get_playground():
    response = client.get("/api/playground")
    assert response.status_code == 200
    play = response.json()
    assert isinstance(play, list)
    assert len(play) > 0

def test_rule_engine_approved():
    payload = {
        "income": 100000,
        "creditScore": 750,
        "employment": "Employed",
        "loanAmount": 20000
    }
    response = client.post("/api/rule-engine", json=payload)
    assert response.status_code == 200
    res = response.json()
    assert res["decision"] == "Approved"
    assert len(res["matchedRules"]) > 0
    assert res["evidenceUsed"]["income"] == 100000

def test_rule_engine_declined_credit():
    payload = {
        "income": 100000,
        "creditScore": 600,
        "employment": "Employed",
        "loanAmount": 20000
    }
    response = client.post("/api/rule-engine", json=payload)
    assert response.status_code == 200
    res = response.json()
    assert res["decision"] == "Declined"

def test_rule_engine_declined_employment():
    payload = {
        "income": 100000,
        "creditScore": 720,
        "employment": "Unemployed",
        "loanAmount": 10000
    }
    response = client.post("/api/rule-engine", json=payload)
    assert response.status_code == 200
    res = response.json()
    assert res["decision"] == "Declined"

def test_rule_engine_escalated_high_debt():
    payload = {
        "income": 50000,
        "creditScore": 750,
        "employment": "Employed",
        "loanAmount": 250000  # > 4x income
    }
    response = client.post("/api/rule-engine", json=payload)
    assert response.status_code == 200
    res = response.json()
    assert res["decision"] == "Escalated for Human Review"

def test_rule_engine_escalated_super_high_loan():
    payload = {
        "income": 500000,
        "creditScore": 820,
        "employment": "Employed",
        "loanAmount": 1200000  # Exceeds 1M absolute limit
    }
    response = client.post("/api/rule-engine", json=payload)
    assert response.status_code == 200
    res = response.json()
    assert res["decision"] == "Escalated for Human Review"

def test_rule_engine_invalid_inputs():
    payload = {
        "income": -120202,  # Invalid negative
        "creditScore": 700,
        "employment": "Employed",
        "loanAmount": 10000
    }
    response = client.post("/api/rule-engine", json=payload)
    assert response.status_code == 422

def test_upload_document():
    file_content = b"Mock loan application document bytes"
    response = client.post(
        "/api/upload",
        files={"file": ("test_loan_app.pdf", file_content, "application/pdf")}
    )
    assert response.status_code == 200
    timeline = response.json()
    assert isinstance(timeline, list)
    event_1 = next(event for event in timeline if event["step"] == 1)
    assert "test_loan_app.pdf" in event_1["title"]
    assert "sha256:" in event_1["details"]["sha256"]
