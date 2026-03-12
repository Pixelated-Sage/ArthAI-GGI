# 🚀 FinPredict AI - Team Setup Guide

Welcome to the FinPredict AI team! This document contains the exact steps to get this legacy ML stack running flawlessly on your local machine.

---

## 🔑 1. Environment Configuration

Before starting, copy the example environment file:

```bash
cp .env.example .env
```

**CRITICAL: Firebase Credentials**
You MUST fill in the `NEXT_PUBLIC_FIREBASE_...` keys in `.env`.

- If missing, the frontend will build with placeholders, but **Authentication will not work**.
- If correct, Docker will automatically bake these keys into the Next.js static build.

---

## 🐳 2. Option 1: Docker (Recommended)

Handles all dependencies, Python versions, and OS differences automatically.

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed.
- **RAM**: Ensure Docker has at least **8GB** allocated (`Settings > Resources`).

### Start the Stack

```bash
./scripts/docker-start.sh
```

### Verification

- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:8000/api/v1](http://localhost:8000/api/v1)
- **ML Server Health**: [http://localhost:8001/health](http://localhost:8001/health)

---

## 🛑 3. Handling Machine Learning Models

**DO NOT push the large `.keras` or `.pkl` model files to GitHub.**
Place all stock folders (e.g., `RELIANCE.NS/`) inside the V2 directory:
`ArthAI-GGI/ml/models/finpredict_v2/`

---

## 🛠️ 4. Build Troubleshooting

If the build hangs or fails:

1. **Sequential Build (Low-RAM Fix)**:

   ```bash
   docker compose build ml
   docker compose build backend
   docker compose build frontend
   docker compose up -d
   ```

2. **Clean Build (If corruption suspected)**:
   ```bash
   docker compose down
   docker builder prune -f
   docker compose up --build -d
   ```

---

## 💻 5. Option 2: Manual Setup (Advanced)

### ML Engine (Python 3.12)

**Requirement**: You must have `TA-Lib` C-library installed on your OS.

- **Ubuntu**: `sudo apt install libta-lib0-dev`
- **Arch**: `yay -S ta-lib`

```bash
cd ml/
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python server.py
```

### Backend

```bash
cd backend/
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```
