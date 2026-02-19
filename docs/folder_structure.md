# 📂 FinPredict AI - Project Structure Checklist

## 📌 Overview

This document outlines the fixed folder structure for the **FinPredict AI** project. This structure is designed to be scalable, modular, and team-friendly. It separates concerns between Frontend (Web/Mobile), Backend (API), and Machine Learning pipelines.

---

## 🏗️ Root Directory Structure

```graphql
FinPredict/
├── backend/                # FastAPI Application (API, Business Logic)
├── frontend/               # Next.js 14 Web Application
├── mobile/                 # React Native (Expo) Mobile Application
├── ml/                     # Machine Learning Pipeline (Training, Evaluation)
├── infrastructure/         # DevOps, Docker, & Deployment Configs
├── docs/                   # Project Documentation & Specifications
├── scripts/                # Developer Utility Scripts (Setup, Data Migration)
├── tests/                  # End-to-End & Integration Tests
├── .gitignore              # Global Git Ignore rules
├── README.md               # Project Entry Point
└── folder_structure.md     # This Document
```

---

## 📂 Detailed Breakdown

### 1. `backend/` (FastAPI)

The core API service handling requests, DB interactions, and serving predictions.

```graphql
backend/
├── app/
│   ├── api/                # API Route Handlers (v1 endpoints)
│   ├── core/               # App configuration (Settings, Security)
│   ├── db/                 # Database connection & Session management
│   ├── models/             # SQLAlchemy/Pydantic Models
│   ├── schemas/            # Pydantic Schemas for Request/Response
│   ├── services/           # Business Logic (Prediction, AuthService)
│   └── main.py             # App Entry Point
├── tests/                  # Backend-specific tests (pytest)
├── config/                 # have the Accounts keys and configs
├── requirements.txt        # Python Dependencies
└── Dockerfile              # Backend Container Config
```

### 2. `frontend/` (Next.js 14)

The web interface for users.

```graphql
frontend/
├── app/                    # App Router Pages & Layouts
├── components/             # Reusable UI Components
│   ├── ui/                 # Shadcn/Base UI components
│   └── shared/             # Shared functionality components (Charts, Forms)
├── lib/                    # Utility functions, API clients
├── public/                 # Static Assets (Images, Icons)
├── styles/                 # Global CSS / Tailwind Config
└── package.json            # Node.js Dependencies
```

### 3. `mobile/` (React Native / Expo)

The mobile application codebase.

```graphql
mobile/
├── assets/                 # Mobile-specific assets
├── src/
│   ├── components/         # Mobile UI Components
│   ├── screens/            # Application Screens
│   ├── navigation/         # React Navigation Setup
│   └── services/           # Mobile API Services
└── app.json                # Expo Configuration
```

### 4. `ml/` (Machine Learning)

Dedicated environment for Data Science and ML Engineering.

```graphql
ml/
├── data/                   # Raw & Processed Data (GitIgnored)
├── models/                 # Saved Model Artifacts (.pkl, .h5) (GitIgnored)
├── notebooks/              # Jupyter Notebooks for Exploration
├── src/
│   ├── training/           # Training Pipelines
│   ├── inference/          # Inference Scripts
│   └── features/           # Feature Engineering Logic
└── requirements.txt        # ML-specific Dependencies
```

### 5. `infrastructure/` (DevOps)

Configuration for environments and deployment.

```graphql
infrastructure/
├── docker/                 # Docker Compose files
├── k8s/                    # Kubernetes Manifests (Future)
└── monitoring/             # Prometheus/Grafana Configs
```

### 6. `scripts/` (Utilities)

Helper scripts for developers.

```graphql
scripts/
├── setup_dev.sh            # One-click dev environment setup
└── db_migrate.sh           # Database migration helper
```

---

## 🔮 Future Scalability

- **Microservices**: The `backend/` folder can be split into `services/` if the monolith becomes too large.
- **Shared Libraries**: A `packages/` folder can be added at the root for sharing code (types, utils) between `frontend`, `mobile`, and `backend`.

## ⚠️ Important Rules for Team

1. **Never commit large files**: Data inside `ml/data` and models inside `ml/models` should rely on external storage (S3/GCS) or Git LFS.
2. **Environment Variables**: Always use `.env` files. Templates are provided as `.env.example`.
3. **Partition Management**: For heavy local development, use the `scripts/setup_dev.sh` to symlink resource-heavy folders (like `node_modules` or `venv`) to separate partitions if needed.
