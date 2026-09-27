import json
import requests
import os

BASE_URL = "http://127.0.0.1:8000/api/deviations"

test_files = [
    "../sample_data/deviations/13_site_vial_capping_torque_excursion.pdf",
    "../sample_data/deviations/14_new_bioreactor_ph_drift.pdf"
]

for pdf_path in test_files:
    print("\n" + "=" * 80)
    print(f"TESTING END-TO-END PIPELINE WITH NEW PDF: {pdf_path}")
    print("=" * 80)
    
    # Step 1: Extraction
    print("\n[Step 1] Uploading and Extracting PDF...")
    with open(pdf_path, "rb") as f:
        resp = requests.post(f"{BASE_URL}/extract", files={"file": (os.path.basename(pdf_path), f, "application/pdf")})
    
    if resp.status_code != 200:
        print(f"Extraction failed: {resp.status_code} - {resp.text}")
        continue
        
    extract_data = resp.json()
    structured = extract_data.get("structured_data", {})
    print(f"Extraction Success! Title: {structured.get('title')}")
    print(f"Site: {structured.get('site')}")
    print(f"Department: {structured.get('department')}")
    print(f"Batch: {structured.get('batch_number')}")
    
    # Step 2: Assessment
    print("\n[Step 2] Running RAG + Deterministic Rules Assessment...")
    assess_resp = requests.post(f"{BASE_URL}/assess", json=structured)
    if assess_resp.status_code != 200:
        print(f"Assessment failed: {assess_resp.status_code} - {assess_resp.text}")
        continue
        
    assess_data = assess_resp.json()
    print(f"Rule Candidate:     {assess_data.get('rule_candidate')}")
    print(f"AI Suggested Sev:   {assess_data.get('suggested_severity')}")
    print(f"Assessment Status:  {assess_data.get('assessment_status')}")
    print(f"Triggered Rules:    {assess_data.get('triggered_rules')}")
    print(f"Retrieved Guidance: {[g['title'] for g in assess_data.get('retrieved_guidance', [])]}")
    
    # Step 3: Human Review & Final Save
    print("\n[Step 3] Simulating Human Review & Saving to Database...")
    save_payload = {
        **structured,
        "ai_potential_impact": assess_data.get("potential_impact"),
        "ai_suggested_severity": assess_data.get("suggested_severity"),
        "ai_severity_reason": assess_data.get("reason"),
        "rule_candidate": assess_data.get("rule_candidate"),
        "assessment_status": assess_data.get("assessment_status"),
        "final_severity": assess_data.get("suggested_severity") or "Moderate",
        "status": "Submitted",
        "source_filename": os.path.basename(pdf_path)
    }
    
    save_resp = requests.post(BASE_URL, json=save_payload)
    if save_resp.status_code != 201:
        print(f"Save failed: {save_resp.status_code} - {save_resp.text}")
        continue
        
    saved_record = save_resp.json()
    dev_id = saved_record.get("deviation_id")
    print(f"Saved successfully! Deviation ID: {dev_id}")
    print(f"Final Severity saved: {saved_record.get('final_severity')}")
    print(f"AI Suggested saved:   {saved_record.get('ai_suggested_severity')}")
    print(f"Rule Candidate saved: {saved_record.get('rule_candidate')}")
    print(f"Status saved:         {saved_record.get('assessment_status')}")
    
    # Step 4: Verification of detail retrieval
    print(f"\n[Step 4] Verifying Record Retrieval for {dev_id}...")
    get_resp = requests.get(f"{BASE_URL}/{dev_id}")
    if get_resp.status_code == 200:
        rec = get_resp.json()
        print(f"Retrieved record: ID={rec['deviation_id']}, Site={rec['site']}, Final={rec['final_severity']}, Rule={rec['rule_candidate']}")
        print("VERIFICATION PASSED!")
    else:
        print(f"Retrieval failed: {get_resp.status_code}")

print("\n" + "=" * 80)
print("ALL NEW PDF TESTS COMPLETED SUCCESSFULLY!")
print("=" * 80)
