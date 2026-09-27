import os
import sys
import requests
import json

BASE_URL = "http://127.0.0.1:8000"
SAMPLE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "sample_data", "deviations"))

def test_health():
    print("\n--- 1. Testing Health Endpoint ---")
    resp = requests.get(f"{BASE_URL}/api/health")
    assert resp.status_code == 200, f"Expected 200, got {resp.status_code}"
    data = resp.json()
    print("Health Status:", data)
    assert data["status"] == "healthy"

def test_samples_list():
    print("\n--- 2. Testing Sample PDFs List Endpoint ---")
    resp = requests.get(f"{BASE_URL}/api/deviations/samples")
    assert resp.status_code == 200
    samples = resp.json().get("samples", [])
    print(f"Discovered {len(samples)} synthetic sample PDFs.")
    assert len(samples) == 12, f"Expected 12 sample PDFs, got {len(samples)}"

def test_all_12_pdfs_extraction():
    print("\n--- 3. Testing Extraction Workflow for All 12 PDFs ---")
    sample_files = sorted([f for f in os.listdir(SAMPLE_DIR) if f.endswith(".pdf")])
    assert len(sample_files) == 12, "Sample files count mismatch"

    extraction_results = []

    for idx, fname in enumerate(sample_files, start=1):
        fpath = os.path.join(SAMPLE_DIR, fname)
        print(f"\n[{idx}/12] Testing extraction on: {fname}")
        with open(fpath, "rb") as f:
            files = {"file": (fname, f, "application/pdf")}
            resp = requests.post(f"{BASE_URL}/api/deviations/extract", files=files)

        assert resp.status_code == 200, f"Extraction failed for {fname}: {resp.text}"
        res = resp.json()
        assert res["success"] is True
        assert len(res["extracted_text"]) > 50
        data = res["structured_data"]
        trace = res["traceability"]

        print(f"  Title: {data.get('title')}")
        print(f"  Date: {data.get('date_of_occurrence')} | Dept: {data.get('department')}")
        print(f"  Batch: {data.get('batch_number')} | Product: {data.get('related_product')}")
        print(f"  Traceability statuses: {', '.join([f'{k}: {v['status']}' for k, v in list(trace.items())[:4]])}")

        assert data["description"] is not None and len(data["description"]) > 10
        extraction_results.append((fname, data))

    return extraction_results

def test_ai_assessment_and_save(sample_data):
    print("\n--- 4. Testing AI Assessment Workflow ---")
    fname, extracted = sample_data[0] # Test with 01_temperature_excursion
    print(f"Assessing extracted data from: {fname}")

    # Assess
    assess_resp = requests.post(f"{BASE_URL}/api/deviations/assess", json=extracted)
    assert assess_resp.status_code == 200, f"Assessment failed: {assess_resp.text}"
    assessment = assess_resp.json()
    print("Assessment Result:")
    print(f"  Suggested Severity: {assessment['suggested_severity']}")
    print(f"  Reason: {assessment['reason']}")
    print(f"  Impact: {assessment['potential_impact']}")
    print(f"  Key Factors: {assessment['key_factors']}")

    assert assessment["suggested_severity"] in ["Minor", "Moderate", "Major", "Critical"]
    assert len(assessment["key_factors"]) > 0

    print("\n--- 5. Testing Save to Database with Human Confirmation ---")
    save_payload = {
        **extracted,
        "ai_potential_impact": assessment["potential_impact"],
        "ai_suggested_severity": assessment["suggested_severity"],
        "ai_severity_reason": assessment["reason"],
        "final_severity": assessment["suggested_severity"], # Human confirms
        "status": "Submitted",
        "source_filename": fname
    }

    save_resp = requests.post(f"{BASE_URL}/api/deviations", json=save_payload)
    assert save_resp.status_code == 201, f"Save failed: {save_resp.text}"
    saved = save_resp.json()
    print(f"Saved Record ID: {saved['id']} | Deviation ID: {saved['deviation_id']}")
    assert saved["deviation_id"].startswith("DEV-")
    assert saved["final_severity"] == assessment["suggested_severity"]

    # Save a second record to verify sequential ID generation
    fname2, extracted2 = sample_data[1]
    save_payload2 = {
        **extracted2,
        "ai_suggested_severity": "Major",
        "final_severity": "Critical", # Human edited severity
        "status": "Submitted",
        "source_filename": fname2
    }
    save_resp2 = requests.post(f"{BASE_URL}/api/deviations", json=save_payload2)
    saved2 = save_resp2.json()
    print(f"Saved Second Record: {saved2['deviation_id']} (Verified sequential numbering!)")
    assert saved2["deviation_id"] > saved["deviation_id"]

    return saved["deviation_id"]

def test_list_and_detail(saved_dev_id):
    print("\n--- 6. Testing List Deviations & Filters ---")
    list_resp = requests.get(f"{BASE_URL}/api/deviations")
    assert list_resp.status_code == 200
    items = list_resp.json()["items"]
    print(f"Total deviations in database: {len(items)}")
    assert len(items) >= 2

    # Filter by search
    search_resp = requests.get(f"{BASE_URL}/api/deviations?search=DEV-0001")
    assert search_resp.status_code == 200
    assert len(search_resp.json()["items"]) == 1

    # Filter by severity
    sev_resp = requests.get(f"{BASE_URL}/api/deviations?severity=Major")
    assert sev_resp.status_code == 200

    print("\n--- 7. Testing Get Deviation Detail ---")
    detail_resp = requests.get(f"{BASE_URL}/api/deviations/{saved_dev_id}")
    assert detail_resp.status_code == 200
    detail = detail_resp.json()
    print(f"Retrieved Detail for: {detail['deviation_id']} - {detail['title']}")
    assert detail["deviation_id"] == saved_dev_id

    # Test 404
    not_found = requests.get(f"{BASE_URL}/api/deviations/DEV-999999")
    assert not_found.status_code == 404

def test_negative_cases():
    print("\n--- 8. Testing Negative Cases & Error Handling ---")
    # Empty file
    resp_empty = requests.post(
        f"{BASE_URL}/api/deviations/extract",
        files={"file": ("empty.pdf", b"", "application/pdf")}
    )
    print("Empty PDF response status:", resp_empty.status_code, resp_empty.json())
    assert resp_empty.status_code == 400

    # Non-PDF file
    resp_txt = requests.post(
        f"{BASE_URL}/api/deviations/extract",
        files={"file": ("report.txt", b"Some text content", "text/plain")}
    )
    print("Non-PDF response status:", resp_txt.status_code, resp_txt.json())
    assert resp_txt.status_code == 400

    # Corrupt PDF
    resp_corrupt = requests.post(
        f"{BASE_URL}/api/deviations/extract",
        files={"file": ("corrupt.pdf", b"NOT_A_VALID_PDF_HEADER_12345", "application/pdf")}
    )
    print("Corrupt PDF response status:", resp_corrupt.status_code, resp_corrupt.json())
    assert resp_corrupt.status_code == 400

def main():
    print("==================================================")
    print("STARTING FULL END-TO-END AUTOMATED TEST SUITE")
    print("==================================================")
    test_health()
    test_samples_list()
    sample_data = test_all_12_pdfs_extraction()
    saved_id = test_ai_assessment_and_save(sample_data)
    test_list_and_detail(saved_id)
    test_negative_cases()
    print("\n==================================================")
    print("ALL TESTS PASSED SUCCESSFULLY! (100% PASS RATE)")
    print("==================================================")

if __name__ == "__main__":
    main()
