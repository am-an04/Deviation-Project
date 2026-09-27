# AI-Powered Deviation Intake Module (Enterprise QMS)

A professional, enterprise-grade Quality Management System (QMS) web application engineered for the life-sciences and pharmaceutical domain. The module features an **AI-assisted, human-controlled** workflow that extracts unstructured deviation information from PDF reports, auto-populates editable QMS forms, performs risk and severity assessments with transparent reasoning, and securely persists reviewed records to PostgreSQL.

---

## 1. Project Overview & Philosophy

In regulated pharmaceutical environments (21 CFR Part 11, EU GMP Annex 11), AI must never make silent, irreversible decisions. 

This application implements the core principle: **AI-assisted, human-controlled**:
- The AI extracts data and prepares recommendations.
- The Quality Professional inspects, edits, and confirms all information before database persistence.
- Clear traceability badges distinguish AI-extracted information from human modifications and un-identified fields.
- The UI strictly adheres to a restrained enterprise QMS aesthetic (no generic chatbot patterns, no neon gradients).

---

## 2. Complete Workflow

```
PDF Document (Dropzone or Synthetic Sample)
        ↓
PyMuPDF Text Extraction (Strict validation: type, size, corruption)
        ↓
LangGraph Extraction Graph (validate → extract → LLM → Pydantic validation)
        ↓
Structured JSON + Traceability Metadata
        ↓
Redux Toolkit Store (`deviationSlice`)
        ↓
Log Deviation Form (Auto-populated with editable fields & status pills)
        ↓
Human Review & Edits (`dispatch(updateReviewedField)`)
        ↓
LangGraph Assessment Graph (Risk factors, impact analysis, suggested severity)
        ↓
AI Assistant Recommendation Panel (Reasoning, key factors, suggested severity)
        ↓
Human Confirmation / Modification of Severity
        ↓
Save Action (`dispatch(saveDeviation)`)
        ↓
PostgreSQL Database (`deviations` table with auto-generated `DEV-0001` IDs)
        ↓
Deviation Register & Detail Inspection View
```

---

## 3. Technology Stack

### Frontend
- **Framework:** React 19 + TypeScript + Vite
- **State Management:** Redux Toolkit (`@reduxjs/toolkit`, `react-redux`)
- **Styling:** Tailwind CSS (Custom enterprise QMS palette: Navy `#174A7E`, Dark Navy `#123A63`, Slate `#F5F7FA`, Text `#17212B`)
- **Routing:** React Router v7
- **HTTP Client:** Axios (Centralized API service layer)
- **Icons:** Lucide React

### Backend
- **Framework:** FastAPI (Python 3.11 - 3.13)
- **Validation:** Pydantic v2
- **ORM & DB:** SQLAlchemy 2.0 + PostgreSQL (`psycopg` / `psycopg2-binary`) with automatic local SQLite fallback (`deviations.db`)
- **PDF Extraction:** PyMuPDF (`fitz`) for high-fidelity text extraction
- **AI Orchestration:** LangGraph (StateGraph workflows)
- **Vector DB & RAG:** ChromaDB with semantic guideline retrieval (`knowledge_base/`)
- **Rules Engine:** Deterministic regulatory rules engine (`severity_rules.py`) with rule candidate classification
- **LLM Engine:** Groq API (Configurable model, e.g. `llama-3.3-70b-versatile` / `llama-3.1-8b-instant`) with deterministic fallback parser

---

## 4. Redux Architecture

Redux Toolkit manages the entire application workflow:

```
frontend/src/store/
├── store.ts                 # Central store configuration
├── hooks.ts                 # Typed useAppDispatch and useAppSelector
└── slices/
    ├── deviationSlice.ts    # PDF upload state, extractedData, reviewedData, field traceability
    ├── assessmentSlice.ts   # AI suggested severity, reason, potential impact, final confirmed severity
    ├── deviationsSlice.ts   # Database records list, filtering, search, and detail records
    └── uiSlice.ts            # Active workflow step (1..4), saving indicators, notifications
```

### Exact Action Flow:
1. `setUploadedFileMeta` → Stores file details in `deviationSlice`.
2. `extractDeviation(file)` (AsyncThunk) → Calls `/api/deviations/extract`.
3. `extractDeviation.fulfilled` → Automatically updates `extractedData` and mirrors into `reviewedData`.
4. `updateReviewedField({ field, value })` → Updates edited fields and updates traceability status to `User Modified`.
5. `assessDeviation(reviewedData)` (AsyncThunk) → Calls `/api/deviations/assess`.
6. `setFinalSeverity(severity)` / `acceptAiSuggestion` → Records the human-in-the-loop decision in `assessmentSlice`.
7. `saveDeviation(payload)` (AsyncThunk) → Calls `POST /api/deviations` and prepends the saved record to `deviationsSlice`.

---

## 5. Project Structure

```
.
├── backend/
│   ├── app/
│   │   ├── ai/
│   │   │   ├── __init__.py
│   │   │   ├── assessment.py       # Prompt & Groq assessment logic
│   │   │   ├── extraction.py       # Prompt & Groq structured extraction logic
│   │   │   ├── graph.py            # LangGraph StateGraph definitions
│   │   │   ├── rag.py              # ChromaDB vector retrieval & knowledge base loader
│   │   │   ├── severity_rules.py   # Deterministic regulatory rules engine & candidates
│   │   │   └── state.py            # TypedDict state definitions
│   │   ├── models/
│   │   │   └── deviation.py        # SQLAlchemy Deviations model
│   │   ├── routers/
│   │   │   └── deviations.py       # FastAPI routes for extract, assess, CRUD, samples
│   │   ├── schemas/
│   │   │   ├── assessment.py       # Pydantic schemas for impact assessment & rules
│   │   │   └── deviation.py        # Pydantic schemas for extraction & persistence
│   │   ├── services/
│   │   │   ├── deviation_service.py# Business logic & sequential ID generator
│   │   │   └── pdf_service.py      # PyMuPDF document validation & text extraction
│   │   ├── config.py               # Pydantic Settings & environment variables
│   │   ├── database.py             # Engine, SessionLocal, auto SQLite fallback
│   │   └── main.py                 # FastAPI application entrypoint with CORS & startup RAG init
│   ├── knowledge_base/             # Regulatory SOPs & severity classification guidelines
│   │   ├── impact_assessment_guidelines.md
│   │   ├── process_deviation_guidelines.md
│   │   └── severity_guidelines.md
│   ├── test_new_pdfs_pipeline.py   # Verification test for PDF extraction pipeline
│   ├── test_rag_rules_scenarios.py # Verification test for RAG & deterministic rules
│   ├── .env.example
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── assessment/
│   │   │   │   └── AiAssessmentPanel.tsx
│   │   │   ├── common/
│   │   │   │   └── AnalyzingModal.tsx
│   │   │   ├── deviations/
│   │   │   │   └── EditableDeviationForm.tsx
│   │   │   ├── layout/
│   │   │   │   ├── Header.tsx
│   │   │   │   └── Sidebar.tsx
│   │   │   └── upload/
│   │   │       └── PdfUpload.tsx
│   │   ├── layouts/
│   │   │   └── AppLayout.tsx
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── DeviationDetail.tsx
│   │   │   ├── Deviations.tsx
│   │   │   ├── LogDeviation.tsx
│   │   │   └── PlaceholderModule.tsx
│   │   ├── services/
│   │   │   └── api.ts              # Central Axios service
│   │   ├── store/
│   │   │   ├── slices/             # Redux Toolkit slices
│   │   │   ├── hooks.ts
│   │   │   └── store.ts
│   │   ├── types/
│   │   │   └── index.ts            # TypeScript interfaces
│   │   ├── App.tsx
│   │   ├── index.css               # Tailwind CSS & enterprise scrollbars
│   │   └── main.tsx
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts
│
├── sample_data/
│   ├── deviations/                 # 12 synthetic deviation PDFs
│   └── generate_sample_pdfs.py     # ReportLab generator script
│
├── tests/
│   └── test_e2e_suite.py           # Automated end-to-end Python test suite
│
├── README.md
└── .gitignore
```

---

## 6. Environment Variables

Create `backend/.env` based on `backend/.env.example`:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/qms_deviations
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=llama-3.3-70b-versatile
FRONTEND_URL=http://localhost:5173
```

*Note: If `GROQ_API_KEY` is not provided, the system gracefully activates an intelligent deterministic QMS fallback parser so the complete 12-sample test dataset can be evaluated offline or without API credits.*

---

## 7. PostgreSQL Setup

1. Start your local PostgreSQL server or Docker container:
   ```bash
   docker run --name qms-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=qms_deviations -p 5432:5432 -d postgres:16-alpine
   ```
2. Set `DATABASE_URL=postgresql://postgres:postgres@localhost:5432/qms_deviations` in `backend/.env`.
3. The application automatically initializes the required table schema on startup.

---

## 8. How to Run Locally

### Terminal 1: Backend (FastAPI)
```bash
# Navigate to backend
cd backend

# Create virtual environment (if not already created)
python -m venv venv

# Windows activation
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run server with live reload
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```
Backend API will be available at: `http://127.0.0.1:8000`  
Interactive Swagger Docs: `http://127.0.0.1:8000/docs`

### Terminal 2: Frontend (React + Vite)
```bash
# Navigate to frontend
cd frontend

# Install npm dependencies
npm install

# Start development server
npm run dev -- --host 127.0.0.1 --port 5173
```
Frontend Web Application: `http://127.0.0.1:5173`

---

## 9. LangGraph Workflows

### Extraction Graph
```
START → validate_input → extract_document_text → llm_extract → validate_structured_output → return_result → END
```
- **validate_input:** Asserts text presence and length.
- **extract_document_text:** Prepares document stream for extraction.
- **llm_extract:** Calls Groq model with structured output prompt adhering strictly to no-inference rules.
- **validate_structured_output:** Validates schema conformance against Pydantic model `ExtractedDeviationData`.

### Assessment Graph
```
START → validate_deviation → rag_guideline_retrieval + rules_evaluation → llm_assess_impact → validate_assessment → return_assessment → END
```
- Executes as an isolated, independent workflow.
- **RAG Guideline Retrieval:** ChromaDB semantic search over official QMS severity matrices and regulatory guidelines.
- **Deterministic Rules Engine:** Categorizes deviation against standard industry risk candidates.
- Evaluates human-reviewed deviation parameters alongside contextual guidelines and candidate rules.
- Recommends severity (`Minor`, `Moderate`, `Major`, `Critical`) alongside detailed factual justification, regulatory citation, and bulleted key factors.

---

## 10. Database Schema

```sql
CREATE TABLE deviations (
    id SERIAL PRIMARY KEY,
    deviation_id VARCHAR(30) UNIQUE NOT NULL,
    source_document_reference VARCHAR(150),
    date_of_occurrence DATE,
    site VARCHAR(255),
    department VARCHAR(255),
    title VARCHAR(500),
    detection_source VARCHAR(255),
    source VARCHAR(255),
    related_product VARCHAR(255),
    batch_number VARCHAR(100),
    description TEXT,
    immediate_action TEXT,

    ai_potential_impact TEXT,
    ai_suggested_severity VARCHAR(50),
    ai_severity_reason TEXT,
    rule_candidate VARCHAR(50),
    assessment_status VARCHAR(50),

    final_severity VARCHAR(50),
    status VARCHAR(50) DEFAULT 'Draft',
    source_filename VARCHAR(255),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

IDs are generated sequentially on the backend: `DEV-0001`, `DEV-0002`, `DEV-0003`, etc.

---

## 11. API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Health check, DB connectivity & Groq configuration status |
| `GET` | `/api/deviations/samples` | Lists synthetic test PDFs |
| `GET` | `/api/deviations/samples/{filename}` | Streams a specific synthetic PDF |
| `POST` | `/api/deviations/extract` | Uploads PDF, extracts text with PyMuPDF, runs LangGraph extraction |
| `POST` | `/api/deviations/assess` | Analyzes reviewed deviation with RAG + Rules Engine + LLM and returns AI severity recommendation |
| `POST` | `/api/deviations` | Saves final reviewed deviation to PostgreSQL / local SQLite |
| `GET` | `/api/deviations` | Retrieves deviations with search, status, and severity filters |
| `GET` | `/api/deviations/{deviation_id}` | Retrieves a single deviation record |

---

## 12. Synthetic Sample Dataset

Located in `sample_data/deviations/`:
1. `01_temperature_excursion.pdf` — Bioreactor temperature drift (37.0 °C to 39.4 °C for 42 min)
2. `02_pressure_excursion.pdf` — Hydrogenation reactor pressure spike (4.8 bar)
3. `03_missing_documentation.pdf` — Missing in-process weight check sign-off
4. `04_equipment_failure.pdf` — Peristaltic dosing pump bearing seizure
5. `05_material_seal_issue.pdf` — High-shear mixer lid silicone gasket tear
6. `06_calibration_issue.pdf` — Analytical balance calibration out-of-tolerance
7. `07_storage_temperature_excursion.pdf` — Cold storage 2–8 °C excursion (11.2 °C for 3.5 hrs)
8. `08_quantity_discrepancy.pdf` — Raw material dispensing discrepancy (3.8 kg shortfall)
9. `09_procedure_availability_issue.pdf` — Obsolete SOP version at packaging line
10. `10_environmental_monitoring.pdf` — Viable particle action limit excursion on settle plate
11. `11_power_interruption.pdf` — Emergency generator transfer delay during lyophilization
12. `12_equipment_identification_mismatch.pdf` — Filter housing equipment ID mismatch

These 12 synthetic deviation reports are stored in `sample_data/deviations/` strictly for automated testing and manual evaluation. The application workflow starts completely empty and accepts any valid text-based PDF via drag-and-drop or file browsing.

---

## 13. Automated Testing

### End-to-End Test Suite:
```bash
python tests/test_e2e_suite.py
```
Verifies:
- Health check
- Sample listing
- All 12 PDFs extraction & traceability metadata
- AI impact assessment with RAG & rules
- Human-in-the-loop saving and sequential ID generation (`DEV-0001`, `DEV-0002`)
- Search and filtering in the deviation register
- Detail page retrieval
- Error cases (empty PDF, corrupt file, invalid non-PDF file)

### RAG & Deterministic Rules Validation:
```bash
python backend/test_rag_rules_scenarios.py
```

### PDF Extraction Pipeline Verification:
```bash
python backend/test_new_pdfs_pipeline.py
```

---

## 14. Known Limitations & Future Improvements

- **Text-based PDFs only:** Current MVP relies on PyMuPDF for digital text extraction. Scanned image PDFs requiring OCR (e.g. Tesseract / Google Document AI) are flagged with a user-friendly notification.
- **Simplified Authentication:** In this MVP, the user context is simulated as a certified Quality Specialist ("Quality User"). Full SSO / SAML integration can be plugged in.
- **Workflow Expansion:** Placeholders are in place for CAPA, Change Control, and Audits to show the complete enterprise QMS sitemap.
