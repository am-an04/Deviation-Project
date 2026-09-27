import json
import requests

API_URL = "http://127.0.0.1:8000/api/deviations/assess"

scenarios = [
    {
        "name": "1. Temperature excursion (Autoclave critical sterilization failure)",
        "payload": {
            "title": "Autoclave Sterilization Cycle Temperature Excursion",
            "description": "During terminal sterilization of injectable Batch INJ-901, autoclave temperature dropped to 114C for 8 minutes (minimum parameter is 121C for 15 minutes). Batch was quarantined. Critical quality attribute sterility may be compromised, presenting direct potential patient safety impact.",
            "immediate_action": "Autoclave halted. Batch INJ-901 placed on physical and electronic quality hold pending sterility and bioburden investigation.",
            "related_product": "Injectable Solution",
            "batch_number": "INJ-901"
        }
    },
    {
        "name": "2. Pressure excursion (Compression machine pressure drift, effectively contained)",
        "payload": {
            "title": "Tablet Compression Main Pressure Out of Spec",
            "description": "Main compression roller pressure momentarily spiked to 38 kN (target 25-32 kN) for 45 seconds during compression of Paracetamol 500mg Batch TAB-441. Automatic tablet reject gate diverted all out-of-spec tablets. Subsequent in-process hardness and friability testing conformed to specifications.",
            "immediate_action": "Compression halted, sensor recalibrated, rejected tablets isolated and weighed, line restarted with in-process checks every 15 minutes.",
            "related_product": "Paracetamol 500mg",
            "batch_number": "TAB-441"
        }
    },
    {
        "name": "3. Missing documentation (Minor logbook sign-off omitted, verified by audit trail)",
        "payload": {
            "title": "Missing Operator Signature on Granulator Cleaning Log",
            "description": "During batch record review, operator initial on equipment cleaning log sheet was missing for second-person verification. Electronic audit trail confirms the wash cycle completed and passed all rinse conductivity checks.",
            "immediate_action": "Logged deviation, reviewed audit trail logs, supervisor interview conducted and completed contemporaneous cross-reference note.",
            "related_product": "Metformin 850mg",
            "batch_number": "MET-202"
        }
    },
    {
        "name": "4. Equipment issue (WFI loop pump seal leak, water quality within spec)",
        "payload": {
            "title": "WFI Loop Secondary Pump Mechanical Seal Leak",
            "description": "Routine daily inspection identified slow drip from mechanical seal of secondary WFI circulation pump P-102. Loop pressure and TOC/conductivity remained within validated limits throughout the period.",
            "immediate_action": "Switched to primary duty pump P-101. Isolated P-102 for mechanical seal replacement. TOC and bioburden sampling initiated at all downstream loop points.",
            "related_product": "Facility Utility",
            "batch_number": "N/A"
        }
    },
    {
        "name": "5. Storage excursion (Cold room temperature spike above 8C for 3 hours)",
        "payload": {
            "title": "Cold Room Storage Excursion Above 8C",
            "description": "Cold Room CR-03 temperature reached 10.5C for 3.2 hours due to evaporator fan coil defrost malfunction. Storage specification is 2C to 8C. Three commercial batches of biologic bulk drug substance were stored in the room.",
            "immediate_action": "Material transferred to backup cold room CR-01 immediately upon alarm acknowledgement. Refrigeration technician called. Quality hold placed on all stored batches.",
            "related_product": "Biologic Bulk Substance",
            "batch_number": "BDS-550, BDS-551"
        }
    },
    {
        "name": "6. Blending overrun (Approved 45m, actual 62m, on hold, no confirmed product impact)",
        "payload": {
            "title": "Blending Duration Parameter Overrun",
            "description": "Approved blending time is 45 minutes. Actual blending time was 62 minutes for Batch APIX-7419 due to timer switch failure. Batch placed on hold. No confirmed product impact.",
            "immediate_action": "Batch placed on QA hold. Blend uniformity sample protocol initiated.",
            "related_product": "Apixaban 5mg",
            "batch_number": "APIX-7419"
        }
    }
]

print("=" * 80)
print("RUNNING RAG + DETERMINISTIC SEVERITY RULES ASSESSMENT VERIFICATION")
print("=" * 80)

for s in scenarios:
    print(f"\n--- Scenario: {s['name']} ---")
    try:
        resp = requests.post(API_URL, json=s["payload"], timeout=45)
        if resp.status_code == 200:
            data = resp.json()
            print(f"Rule Candidate:     {data.get('rule_candidate')}")
            print(f"AI Suggested Sev:   {data.get('suggested_severity')}")
            print(f"Assessment Status:  {data.get('assessment_status')}")
            print(f"Triggered Rules:    {len(data.get('triggered_rules', []))} rules")
            for r in data.get('triggered_rules', []):
                print(f"   * {r}")
            print(f"Retrieved Guidance: {len(data.get('retrieved_guidance', []))} chunks")
            for g in data.get('retrieved_guidance', []):
                print(f"   [RAG] {g.get('title')}")
            print(f"Reason:             {data.get('reason')[:120]}...")
            print(f"Key Factors:        {data.get('key_factors')}")
        else:
            print(f"Error {resp.status_code}: {resp.text}")
    except Exception as e:
        print(f"Exception: {e}")

print("\n" + "=" * 80)
print("COMPLETED SCENARIO TESTING")
print("=" * 80)
