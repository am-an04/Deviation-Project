import fitz  # PyMuPDF
import os

pdf_dir = "sample_data/deviations"
os.makedirs(pdf_dir, exist_ok=True)

# 1. New test PDF with site
doc1 = fitz.open()
page1 = doc1.new_page()
text1 = """PHARMACEUTICAL QUALITY MANAGEMENT SYSTEM
DEVIATION INCIDENT REPORT

Deviation ID: DEV-2026-SITE-101
Date of Occurrence: 2026-04-12
Site: Dublin Sterile Manufacturing Facility (Site IRL-04)
Department: Aseptic Fill-Finish Operations
Source / Detection: Line Inspector Visual In-Process Control

Incident Title: High-Speed Vial Capping Torque Parameter Under-Torque Excursion

Related Product: Monoclonal Antibody Solution for Infusion 100mg
Batch Number: MAB-8842

Event Description:
During primary packaging and seal crimping of Batch MAB-8842 at Dublin Site IRL-04, optical torque sensor on Capper Head #3 alerted an under-torque condition measuring 0.55 N.m (validated limit 0.80 - 1.20 N.m) for a duration of 14 minutes. Approximately 420 vials traversed through Head #3 before automated line rejection halted capping. Container closure integrity (CCI) for vials produced during the excursion window is in question, presenting a critical sterility barrier risk.

Immediate Containment Action:
Capping line stopped immediately. All 420 potentially affected vials were segregated and quarantined under physical QA yellow hold tape. Torque load-cell recalibrated and verified by validation engineer. Remaining batch processing suspended pending 100% helium leak container-closure integrity testing.
"""
page1.insert_text((50, 72), text1, fontsize=10)
doc1.save(os.path.join(pdf_dir, "13_site_vial_capping_torque_excursion.pdf"))
doc1.close()
print("Created 13_site_vial_capping_torque_excursion.pdf")

# 2. Completely new PDF not in original dataset (pH sensor drift in bioreactor)
doc2 = fitz.open()
page2 = doc2.new_page()
text2 = """PHARMACEUTICAL QUALITY MANAGEMENT SYSTEM
DEVIATION INCIDENT REPORT

Deviation ID: DEV-2026-BIO-205
Date of Occurrence: 2026-05-18
Site: Singapore Biologics Tech Park (Site SGP-02)
Department: Upstream Bioprocess Operations
Source / Detection: SCADA Online Process Analytical Technology (PAT)

Incident Title: Bioreactor pH Sensor Online Drift During Fed-Batch Fermentation

Related Product: Recombinant Factor VIII Bulk Solution
Batch Number: RF8-9901

Event Description:
During Day 7 of fed-batch cultivation in 2000L Bioreactor BR-201, inline pH probe SE-201 drifted to pH 6.72 against a validated parameter window of 6.90 - 7.20 for an estimated duration of 4 hours before automated acid/base dosing alarm alerted. Offline blood-gas/pH analyzer check confirmed broth actual pH was 6.82. Cell viability remained >94% and viable cell density (VCD) was within expected growth kinetics. No confirmed impact on critical quality attribute glycosylation pattern.

Immediate Containment Action:
Switched feedback loop control to redundant inline probe SE-202 which was within calibration. Broth sampling taken for expedited cell viability, bioburden, and SDS-PAGE protein profile. Quality hold placed on upstream harvest broth pending bioanalytical test results.
"""
page2.insert_text((50, 72), text2, fontsize=10)
doc2.save(os.path.join(pdf_dir, "14_new_bioreactor_ph_drift.pdf"))
doc2.close()
print("Created 14_new_bioreactor_ph_drift.pdf")
