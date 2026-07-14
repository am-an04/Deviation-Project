# GroundSet: Adaptive Role-Based Decision Experience

GroundSet is a production-grade full-stack prototype demonstrating how enterprise SaaS portals can adapt their interface structures, copywriting, and interactive visualizations in real-time based on buyer persona profiles (Chief Risk Officer, CTO, Principal Engineer, Financial Investor), while ensuring strict mathematical transparency in backend rule engines.

GroundSet is built by **BPOptima** to reinforce the philosophy of deterministic, auditable decisions over probabilistic black-box predictions.

---

## Technical Stack

- **Ingestion & Server Api**: FastAPI (Python 3.13, Pydantic v2)
- **Frontend App**: Vite, React 19, TypeScript, Tailwind CSS
- **Transitions**: Framer Motion (respects prefers-reduced-motion)
- **State Management**: React Context (Theme & Role simulation)
- **Query caching**: TanStack Query & Axios
- **Orchestration**: Docker & Docker Compose
- **Quality Assurance**: Pytest (backend), Vitest & React Testing Library (frontend)

---

## Folder Structure

```
Bpoptima/
├── backend/
│   ├── app/
│   │   ├── data/                 # JSON Mock Data sources
│   │   ├── engine.py             # Deterministic policies engine logic
│   │   └── main.py               # FastAPI routers & middlewares
│   ├── tests/
│   │   └── test_backend.py       # API & rules evaluation unit tests
│   ├── requirements.txt          # Python requirements
│   └── Dockerfile                # Uvicorn slim image layout
├── frontend/
│   ├── src/
│   │   ├── app/                  # Entry points and global styles
│   │   ├── features/             # Persona specific components
│   │   │   ├── cro/              # Timeline audit log traces
│   │   │   ├── cto/              # Topological integrations graph
│   │   │   ├── engineer/         # Policy playground forms sandbox
│   │   │   └── investor/         # Comparative metrics and ROIs
│   │   ├── layouts/              # Navbar and Footer frames
│   │   ├── routes/               # Page views
│   │   └── shared/               # Contexts, hooks, and reusable elements
│   ├── index.html
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── nginx.conf                # Nginx proxy mapping React paths
│   └── Dockerfile                # Node multi-stage build container
├── docker-compose.yml            # Multi-service local coordinator
└── README.md
```

---

## API Specifications

### 1. `GET /api/roles`
Returns the available persona IDs configured on the server: `["cro", "cto", "engineer", "investor"]`.

### 2. `GET /api/experience/{role}`
Returns structured landing copy, marketing headlines, feature summaries, and active component type configuration.

### 3. `GET /api/timeline`
Returns step-by-step audit logs of a sample document ingestion flow, tracing OCR parsed geometries, rule evaluations, and manual overrides.

### 4. `POST /api/rule-engine`
Runs a typed loan application profile through a deterministic rule check tree.
- **Input JSON**:
  ```json
  {
    "income": 120000,
    "creditScore": 720,
    "employment": "Employed",
    "loanAmount": 45000
  }
  ```
- **Returns**: `decision` ("Approved", "Declined", "Escalated for Human Review"), `matchedRules`, `evidenceUsed`, `reasoning` steps, `auditTrail` cryptographic key, `processingTimeMs`.

---

## Development Setup

### Requirement Checks
Ensure you have the following installed:
- Docker && Docker Compose (OR Python 3.12+ and Node.js 18+)

### 1. Launching via Docker (One Command)
Build and spin up both service containers concurrently:
```bash
docker compose up --build
```
- Access the Adapting Interface: `http://localhost`
- Access Backend API gateway: `http://localhost:8000/docs`

### 2. Running Services Locally (Manual)

#### A. Backend setup:
```bash
cd backend
python -m venv venv
# On Windows powershell:
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --port 8000 --reload
```

#### B. Frontend setup:
```bash
cd frontend
npm install
npm run dev
```

---

## QA Testing

### Backend Unit Tests:
Ensure you are in virtual environment:
```bash
cd backend
python -m pytest tests/
```

### Frontend Unit Tests:
Run the Vitest assertion suite:
```bash
cd frontend
npm test
```

---

## MIT License

Copyright (c) 2026 BPOptima

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software...
