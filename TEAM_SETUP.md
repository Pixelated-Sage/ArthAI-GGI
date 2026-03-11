# 🚀 FinPredict AI - Team Setup Guide

Welcome to the FinPredict AI team! This document contains the exact steps to get this complicated, multi-architecture (Frontend + Backend + Machine Learning) stack running flawlessly on your local machine.

## 🛑 IMPORTANT: Handling The Machine Learning Models

**DO NOT push the ML models to Git/GitHub.**
Machine learning models (specifically `.keras`, `.h5`, `.pkl` files) are massive binary blobs. Committing them directly to Git will permanently bloat the repository, make cloning extremely slow, and cause Git to crash.

**How to sync models:**

1. The project leader will securely share a zipped folder of the trained models (`RELIANCE.NS`, `TCS.NS`, etc.) through Google Drive, Slack, or AWS S3.
2. Download and unzip the file.
3. Place all those individual stock folders directly inside this directory in your local repository:
   ```text
   ArthAI-GGI/ml/models/finpredict/
   ```
   _(Note: The `ml/models/` folder is already explicitly ignored in `.gitignore`, ensuring your weights are never accidentally committed.)_

---

## 💻 1. Clone & Core Environment Setup

First, clone the repository to your local machine:

```bash
git clone https://github.com/your-repo/ArthAI-GGI.git
cd ArthAI-GGI
```

Make sure your system has the following pre-requisites installed:

- **Node.js** (v18 or higher)
- **Python 3.12** (Critical for ML TensorFlow bindings)
- **PostgreSQL** & **Redis**

Create an empty `.env` file at the root of `ArthAI-GGI` and ask the team lead for the secret keys to paste inside it.

---

## 🧠 2. ML Engine Setup (Python 3.12 is REQUIRED)

The Machine Learning server runs automatically in the background when the backend starts, but its isolated environment must be built perfectly.

**⚠️ WARNING for Linux/Arch Users:** You **must** use Python 3.12. If you try to compile TensorFlow or Keras using Python 3.13 or 3.14, your installation will enter an endless compilation loop because pre-built binary wheels don't exist yet for cutting-edge pythons.

```bash
cd ml/

# 1. Destroy any broken overlapping virtual environments
rm -rf .venv

# 2. Force the creation of a strictly Python 3.12 environment
python3.12 -m venv .venv

# 3. Activate it
source .venv/bin/activate

# 4. Install dependencies (this will now download fast precompiled wheels)
pip install --upgrade pip
pip install -r requirements.txt

# 5. Extract models shared by team
# [drag the pre-trained folders into ml/models/finpredict/]

# 6. Exit directory
cd ..
deactivate
```

---

## ⚡ 3. Backend Setup (FastAPI)

The backend acts as the central conductor, managing GraphQL/REST routes, PostgreSQL tracking, caching, and silently proxying traffic directly into your isolated ML engine.

```bash
cd backend/

# 1. Create standard python virtual environment (Python 3.11/3.12/3.14 are fine here)
python -m venv .venv

# 2. Activate it
source .venv/bin/activate

# 3. Install requirements
pip install -r requirements.txt

# 4. Exit directory
cd ..
deactivate
```

---

## 🎨 4. Frontend Setup (React/Node)

```bash
cd frontend/
npm install
cd ..
```

---

## 🏁 5. Booting the Application

You only need **two** terminal tabs to run the entire system. You do **not** need to boot the ML server manually.

### Terminal 1: The Backend (& ML Auto-Boot)

```bash
cd backend
source .venv/bin/activate
uvicorn app.main:app --reload
```

_(Watch the startup logs: You will see it verifying Postgres/Redis and then outputting `🚀 Starting ML Model Server on port 8001...` - It spawns the ML engine on its own thread!)_

### Terminal 2: The Frontend

```bash
cd frontend
npm run dev
```

The system is now fully operational!
