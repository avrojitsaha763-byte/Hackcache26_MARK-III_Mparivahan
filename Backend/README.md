# 🚗 Licence Saathi (EasyDL) — Backend Service

FastAPI backend with Supabase integration for the Mparivahan Learner's Licence assistant.

---

## ⚡ Quick Start

### 1. Activate the Virtual Environment
On Windows (PowerShell):
```powershell
.venv\Scripts\Activate.ps1
```

### 2. Configure Supabase Environment Variables
Copy `.env.example` to `.env`:
```powershell
cp .env.example .env
```
Fill in your Supabase Project Key:
```ini
SUPABASE_URL=https://hhsisahbdmriugkyigrk.supabase.co
SUPABASE_KEY=your_supabase_anon_or_service_key_here
PORT=8000
```
> **Note:** If `SUPABASE_KEY` is not provided, the API automatically operates in offline fallback mode with high-fidelity sample data matching the Phase 1 seed records.

### 3. Run the Backend API Server
```powershell
.venv\Scripts\uvicorn.exe main:app --reload --port 8000
```
API Documentation (Interactive Swagger UI): [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 📡 API Endpoints

| Method | Endpoint | Description | Frontend Consumer |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | Health check & Supabase connection status | System |
| `GET` | `/api/applications/{app_number}` | Query application stage, status, timeline & details | `/track` |
| `GET` | `/api/questions` | Fetch RTO practice questions by category | `/learn` |
| `POST` | `/api/check-eligibility` | Age calculation & MV Act eligibility check | `/can-i-apply` |
| `POST` | `/api/quiz/submit` | Score submitted RTO mock test and return pass/fail | `/learn` |
