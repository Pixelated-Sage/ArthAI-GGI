# 🚀 FinPredict AI - Team Setup Guide

Welcome to the FinPredict AI team! This document contains the exact steps to get this complicated, multi-architecture (Frontend + Backend + Machine Learning) stack running flawlessly on your local machine.

---

## 🐳 Option 1: Docker (Recommended for Windows/Team)

This is the **easiest and fastest** way to get started. It handles all dependencies, Python versions, and OS differences automatically.

### 1. Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running.
- **IMPORTANT (Windows Users)**: Increase Docker RAM to at least **8GB** in `Settings > Resources`.

### 2. Quickstart Script

```bash
./scripts/docker-start.sh
```

_(On Windows PowerShell, use: `docker compose up --build`)_

### 3. Verification

- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:8000/api/v1](http://localhost:8000/api/v1)
- **ML Server Health**: [http://localhost:8001/health](http://localhost:8001/health)

### 4. Debugging & Development

- **View Logs**: `docker compose logs -f`
- **Restart a Service**: `docker compose restart backend`
- **Rebuild after changes**: `docker compose up -d --build`

---

## 🛑 IMPORTANT: Handling The Machine Learning Models

**DO NOT push the ML models to Git/GitHub.**
Place all individual stock folders directly inside this directory:
`ArthAI-GGI/ml/models/finpredict/`

---

## 💻 Option 2: Manual Local Setup (Advanced/Native Linux)

### 1. ML Engine Setup (Python 3.12 REQUIRED)

```bash
cd ml/
python3.12 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### 2. Backend Setup

```bash
cd backend/
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### 3. Frontend Setup

```bash
cd frontend/
npm install
```
