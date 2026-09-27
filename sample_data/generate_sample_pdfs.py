import os
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors

SAMPLE_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "deviations")
os.makedirs(SAMPLE_DIR, exist_ok=True)

DEVIATIONS = [
    {
        "filename": "01_temperature_excursion.pdf",
        "doc_id": "SYN-DEV-2026-001",
        "date": "2026-09-14",
        "site": "Building 4, Lexington Biopharma Facility",
        "department": "Bioprocess Manufacturing",
        "title": "Bioreactor Temperature Excursion during Batch Incubation",
        "source": "SCADA Automated Alarm System",
        "product": "Monoclonal Antibody Intermediate mAb-402",
        "batch": "B-1024",
        "description": "During standard cell culture growth phase at 03:15, Bioreactor BIO-400 temperature drifted from setpoint 37.0 °C up to 39.4 °C for approximately 42 minutes before cooling loop recalibration stabilized the vessel back to 37.0 °C. Validated allowable excursion limit is ±0.5 °C for maximum 15 minutes.",
        "action": "Operations team immediately engaged auxiliary chilled glycol loop to bring temperature to 37.0 °C. Batch B-1024 was placed on physical and electronic quality quarantine pending cell viability and glycosylation profile testing.",
    },
    {
        "filename": "02_pressure_excursion.pdf",
        "doc_id": "SYN-DEV-2026-002",
        "date": "2026-09-16",
        "site": "API Synthesis Suite, Cork Manufacturing Plant",
        "department": "Chemical Manufacturing",
        "title": "Hydrogenation Reactor Pressure Excursion Exceeding Operating Limits",
        "source": "Process Historian / In-Line Transducer PT-302",
        "product": "Active Pharmaceutical Ingredient (API-709)",
        "batch": "LOT-88219",
        "description": "During catalytic hydrogenation of API-709 in Reactor R-201, nitrogen blanket pressure spiked to 4.8 bar for 18 minutes against the validated operating limit of 2.0 to 3.2 bar due to a malfunctioning exhaust back-pressure regulator valve (PRV-104).",
        "action": "Emergency manual depressurization valve was opened by the shift technician to safely vent excess nitrogen to the scrubber line, restoring reactor pressure to 2.5 bar. Reactor R-201 was locked out and maintenance was notified.",
    },
    {
        "filename": "03_missing_documentation.pdf",
        "doc_id": "SYN-DEV-2026-003",
        "date": "2026-09-18",
        "site": "Oral Solid Dosage Facility, Basel Campus",
        "department": "Packaging & Quality Assurance",
        "title": "Missing In-Process Weight Check Documentation during Blister Packaging",
        "source": "Batch Record Review by QA Auditor",
        "product": "Metformin Hydrochloride 500mg Tablets",
        "batch": "MTH-4401",
        "description": "During post-packaging batch record reconciliation for Metformin 500mg Batch MTH-4401, Page 14 of 28 (Form PKG-092) was discovered missing required operator signature and witness verification for the 10:00 AM blister tablet weight and seal integrity checks.",
        "action": "Packaging line 2 was paused. QA initiated an immediate deviation record and interviewed the shift operators. Physical retains from the 10:00 AM run were pulled and sent for independent gravimetric verification.",
    },
    {
        "filename": "04_equipment_failure.pdf",
        "doc_id": "SYN-DEV-2026-004",
        "date": "2026-09-19",
        "site": "Formulation & Filling Suite C, Raleigh Plant",
        "department": "Aseptic Fill-Finish Operations",
        "title": "Peristaltic Pump Mechanical Breakdown during Sterile Vial Filling",
        "source": "Filling Line Operator Visual & Acoustic Inspection",
        "product": "Sterile Saline Diluent (50 mL Vials)",
        "batch": "LOT-99201",
        "description": "Peristaltic dosing pump P-102 suffered mechanical bearing seizure at vial fill count 4,120 of 10,000 scheduled units, causing uneven fill volumes and hose pinching in Grade A filling cabinet.",
        "action": "The sterile filling line was stopped immediately. The operator quarantined 150 vials filled immediately prior to pump failure and discarded the damaged silicone tubing set.",
    },
    {
        "filename": "05_material_seal_issue.pdf",
        "doc_id": "SYN-DEV-2026-005",
        "date": "2026-09-20",
        "site": "Granulation Suite 1, Hyderabad API Center",
        "department": "Oral Solid Dosage Manufacturing",
        "title": "High Shear Mixer Lid Silicone Gasket Degradation and Seal Breach",
        "source": "Pre-Cleaning Swab Inspection by QC Technician",
        "product": "Ciprofloxacin 250mg Granulate",
        "batch": "CIP-7712",
        "description": "During post-granulation inspection of High Shear Granulator HSM-05, the food-grade silicone lid gasket was found to have a 12 mm partial tear along the interior lip with missing particulate matter totaling approximately 0.15 grams.",
        "action": "Granulate batch CIP-7712 (total weight 185.0 kg) was held in stainless steel drums with red QA quarantine tags. Optical sorting and metal/foreign particulate sieve analysis requested.",
    },
    {
        "filename": "06_calibration_issue.pdf",
        "doc_id": "SYN-DEV-2026-006",
        "date": "2026-09-21",
        "site": "Analytical QC Testing Lab 3, Cambridge Center",
        "department": "Quality Control Laboratory",
        "title": "Analytical Balance Calibration Out-of-Tolerance during Potency Assay",
        "source": "Routine Daily QC Balance Check (SOP-QC-011)",
        "product": "Atorvastatin Calcium Standard Solution",
        "batch": "QC-STD-2026-09",
        "description": "Analytical balance BAL-004 failed routine 100 mg calibration check, displaying 104.8 mg (tolerance ±0.5 mg). Balance had been used earlier that morning to weigh active standards for release assay of commercial batch ATOR-3301.",
        "action": "Balance BAL-004 was immediately tagged Out of Service. All HPLC potency testing performed on September 21 utilizing standards weighed on BAL-004 was invalidated.",
    },
    {
        "filename": "07_storage_temperature_excursion.pdf",
        "doc_id": "SYN-DEV-2026-007",
        "date": "2026-09-22",
        "site": "Cold Chain Logistics Depot, Amsterdam Warehouse",
        "department": "Supply Chain & Materials Management",
        "title": "Cold Storage Unit 2-8 °C Excursion in Primary Quarantine Vault",
        "source": "Building Management System (BMS) Alert",
        "product": "Recombinant Insulin Bulk Drug Substance",
        "batch": "INS-B09",
        "description": "Walk-in cold room CR-02 temperature rose to 11.2 °C for 3 hours and 25 minutes due to compressor defrost cycle relay failure. Storage specification for recombinant insulin bulk substance is strictly 2.0 °C to 8.0 °C.",
        "action": "Materials were immediately transferred to backup cold room CR-03. Continuous data logger temperature traces were downloaded for stability evaluation.",
    },
    {
        "filename": "08_quantity_discrepancy.pdf",
        "doc_id": "SYN-DEV-2026-008",
        "date": "2026-09-23",
        "site": "Warehouse Dispensary, Singapore Plant",
        "department": "Dispensing & Raw Materials",
        "title": "Weight Discrepancy during Raw Material Dispensing of Microcrystalline Cellulose",
        "source": "Electronic Batch Record Automated Reconciliation Error",
        "product": "Microcrystalline Cellulose PH-101 (Excipient)",
        "batch": "MCC-RAW-9011",
        "description": "During dispensing for Tablet Formulation Batch TAB-552, gross dispensed weight recorded was 48.2 kg against batch sheet requirement of 52.0 kg, representing a 3.8 kg shortfall (7.3% discrepancy beyond ±1.0% limit).",
        "action": "Dispensing process was aborted. Dispensed container was sealed and re-weighed on a secondary verified scale, confirming 48.2 kg actual net weight. Raw material inventory audit initiated.",
    },
    {
        "filename": "09_procedure_availability_issue.pdf",
        "doc_id": "SYN-DEV-2026-009",
        "date": "2026-09-24",
        "site": "Packaging Line 4, Dublin Operations",
        "department": "Commercial Packaging",
        "title": "Unapproved Obsolete SOP Version Found at Cartoning Workstation",
        "source": "Routine Floor QA Walkthrough / Gemba Audit",
        "product": "Ibuprofen Pediatric Suspension 100 mL",
        "batch": "IBU-2026-081",
        "description": "During line clearance inspection, cartoner operator was observed referencing SOP-PKG-401 Rev 02. Master Document Control records show Rev 03 was made effective 30 days prior with updated tamper-evident seal inspection instructions.",
        "action": "Obsolete copy Rev 02 was confiscated and destroyed. Verified current Rev 03 was printed and issued by Document Control. 500 completed cartons from the current shift were quarantined for 100% seal re-inspection.",
    },
    {
        "filename": "10_environmental_monitoring.pdf",
        "doc_id": "SYN-DEV-2026-010",
        "date": "2026-09-25",
        "site": "Aseptic Core Cleanroom Suite 2, RTP Biotech Center",
        "department": "Microbiology & Environmental Monitoring",
        "title": "Viable Particle Action Limit Excursion on Settle Plate in Grade B Cleanroom",
        "source": "Microbiology Lab 5-Day Incubation Readout",
        "product": "Injectable Monoclonal Antibody Solution",
        "batch": "MAB-8802",
        "description": "Grade B cleanroom airlock settle plate SP-B-14 recovered 8 CFU against the action limit of > 5 CFU/plate following the 5-day incubation at 30-35 °C. Organism preliminarily identified as Staphylococcus epidermidis.",
        "action": "Airlock Suite 2 was placed in restricted access. Full sanitization with sporicidal disinfectant (VHP / hydrogen peroxide fogging) performed. Batch MAB-8802 held pending Grade A surrounding settle plate results.",
    },
    {
        "filename": "11_power_interruption.pdf",
        "doc_id": "SYN-DEV-2026-011",
        "date": "2026-09-25",
        "site": "Lyophilization Facility, Boulder Complex",
        "department": "Sterile Freeze-Drying Operations",
        "title": "Emergency Generator Transfer Delay during Lyophilization Primary Drying Phase",
        "source": "Central Facility SCADA Power Monitoring System",
        "product": "Lyophilized Vaccine Antigen VAX-09",
        "batch": "VAX-LOT-7703",
        "description": "Municipal electrical grid disturbance caused facility power drop. Uninterruptible Power Supply (UPS) engaged, but automatic transfer switch to diesel generator delayed by 4 minutes and 30 seconds. Chamber vacuum degraded from 0.08 mbar to 0.42 mbar during primary drying.",
        "action": "Vacuum pumps were manually re-engaged upon generator start. Lyophilizer condenser and shelf temperature curves were logged. Batch VAX-LOT-7703 was segregated for moisture and reconstitution analytics.",
    },
    {
        "filename": "12_equipment_identification_mismatch.pdf",
        "doc_id": "SYN-DEV-2026-012",
        "date": "2026-09-26",
        "site": "Filtration Suite 3, Toronto Biologics",
        "department": "Downstream Purification",
        "title": "Filter Housing Equipment ID Mismatch in Ultrafiltration Batch Record",
        "source": "Pre-Execution Verification by Quality Assurance Specialist",
        "product": "Enzyme Replacement Therapy Bulk Intermediate",
        "batch": "ERT-BATCH-109",
        "description": "Operator staged 0.22 µm sterile filter housing UF-HSG-02 for tangential flow filtration, whereas the executed Master Batch Record specified dedicated housing UF-HSG-01. Both housings are qualified for the process but have distinct cleaning validation logs.",
        "action": "Process execution was halted prior to product transfer. Product remained in sealed hold tank T-101 at 4 °C. Housing UF-HSG-01 was verified clean and swapped into the skid.",
    }
]

def generate_pdf(dev):
    filepath = os.path.join(SAMPLE_DIR, dev["filename"])
    doc = SimpleDocTemplate(
        filepath,
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()
    
    # Custom styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontSize=15,
        leading=18,
        textColor=colors.HexColor('#123A63'),
        spaceAfter=6
    )
    
    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontSize=8,
        leading=10,
        textColor=colors.HexColor('#B42318'),
        spaceAfter=12
    )
    
    section_heading = ParagraphStyle(
        'SecHeading',
        parent=styles['Heading2'],
        fontSize=11,
        leading=13,
        textColor=colors.HexColor('#174A7E'),
        spaceBefore=10,
        spaceAfter=4
    )
    
    body_style = ParagraphStyle(
        'DocBody',
        parent=styles['Normal'],
        fontSize=9,
        leading=12,
        textColor=colors.HexColor('#17212B')
    )
    
    cell_bold = ParagraphStyle(
        'CellBold',
        parent=styles['Normal'],
        fontSize=8.5,
        leading=11,
        textColor=colors.HexColor('#17212B'),
        fontName='Helvetica-Bold'
    )
    
    cell_regular = ParagraphStyle(
        'CellRegular',
        parent=styles['Normal'],
        fontSize=8.5,
        leading=11,
        textColor=colors.HexColor('#17212B')
    )

    elements = []

    # Header Banner
    header_data = [
        [
            Paragraph("<b>PHARMACEUTICAL QUALITY MANAGEMENT SYSTEM</b><br/>DEVIATION INTAKE & INITIAL EVENT REPORT", cell_bold),
            Paragraph(f"<b>Doc ID:</b> {dev['doc_id']}<br/><b>Status:</b> Initial Incident Logged", cell_regular)
        ]
    ]
    t_header = Table(header_data, colWidths=[360, 180])
    t_header.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#EEF4FF')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#174A7E')),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('PADDING', (0,0), (-1,-1), 6),
    ]))
    elements.append(t_header)
    elements.append(Spacer(1, 6))

    # Synthetic Document Notice
    elements.append(Paragraph("SYNTHETIC TEST DOCUMENT — LIFE SCIENCES QUALITY ASSURANCE TEST DATASET — STRICTLY FOR DEMONSTRATION & VALIDATION", subtitle_style))
    
    # Title
    elements.append(Paragraph(dev["title"], title_style))
    elements.append(Spacer(1, 4))

    # General Information Table
    elements.append(Paragraph("1. GENERAL INCIDENT INFORMATION", section_heading))
    info_data = [
        [Paragraph("Date of Occurrence:", cell_bold), Paragraph(dev["date"], cell_regular), Paragraph("Discovery Source:", cell_bold), Paragraph(dev["source"], cell_regular)],
        [Paragraph("Manufacturing Site:", cell_bold), Paragraph(dev["site"], cell_regular), Paragraph("Department / Area:", cell_bold), Paragraph(dev["department"], cell_regular)],
        [Paragraph("Related Product / Material:", cell_bold), Paragraph(dev["product"], cell_regular), Paragraph("Batch / Lot Number:", cell_bold), Paragraph(dev["batch"], cell_regular)],
    ]
    t_info = Table(info_data, colWidths=[120, 150, 120, 150])
    t_info.setStyle(TableStyle([
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD4DD')),
        ('BACKGROUND', (0,0), (0,-1), colors.HexColor('#F5F7FA')),
        ('BACKGROUND', (2,0), (2,-1), colors.HexColor('#F5F7FA')),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('PADDING', (0,0), (-1,-1), 4),
    ]))
    elements.append(t_info)
    elements.append(Spacer(1, 8))

    # Event Description Section
    elements.append(Paragraph("2. EVENT SUMMARY & DEVIATION DESCRIPTION", section_heading))
    elements.append(Paragraph(dev["description"], body_style))
    elements.append(Spacer(1, 8))

    # Immediate Actions Taken Section
    elements.append(Paragraph("3. IMMEDIATE ACTIONS & CONTAINMENT MEASURES", section_heading))
    elements.append(Paragraph(dev["action"], body_style))
    elements.append(Spacer(1, 8))

    # Quality Verification Sign-Off Footer
    elements.append(Paragraph("4. INITIAL LOGGING VERIFICATION", section_heading))
    sign_data = [
        [
            Paragraph("<b>Logged By:</b> Operations Shift Lead<br/><b>Date:</b> " + dev["date"], cell_regular),
            Paragraph("<b>QA Reviewer:</b> Quality Assurance On-Duty<br/><b>Date:</b> " + dev["date"], cell_regular),
            Paragraph("<b>Workflow Stage:</b> Awaiting AI Extraction & Human Review", cell_regular)
        ]
    ]
    t_sign = Table(sign_data, colWidths=[180, 180, 180])
    t_sign.setStyle(TableStyle([
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD4DD')),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('PADDING', (0,0), (-1,-1), 5),
    ]))
    elements.append(t_sign)

    doc.build(elements)
    print(f"Generated: {filepath}")

def main():
    print(f"Generating 12 synthetic PDF deviation reports in {SAMPLE_DIR}...")
    for dev in DEVIATIONS:
        generate_pdf(dev)
    print("All 12 synthetic deviation reports generated successfully!")

if __name__ == "__main__":
    main()
