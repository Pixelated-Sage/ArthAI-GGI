# FinPredict AI - Backend

## Overview

This is the backend service for **FinPredict AI**, built with **FastAPI**. It handles API requests, database interactions (PostgreSQL, Redis, Firebase), and serves ML predictions.

## Tech Stack

- **Framework**: FastAPI
- **Database**: PostgreSQL (TimescaleDB) with `asyncpg` + SQLAlchemy (Async)
- **Cache**: Redis with `redis-py` (Async)
- **Auth/Notification**: Firebase Admin SDK
- **ML**: Sentence Transformers, Pandas, Numpy
- **Logging**: Loguru

## Setup

1.  **Environment Variables**:
    Ensure the root `.env` file exists and contains the necessary keys:

    ```env
    TIMESCALEDB_URL=postgresql://user:pass@host:port/dbname
    REDIS_HOST=...
    FIREBASE_CREDENTIALS_PATH=...
    ```

    This backend folder uses a symlink to the root `.env`.

2.  **Install Dependencies**:

    ```bash
    # Ensure virtual environment is active
    pip install -r requirements.txt
    ```

3.  **Run Migrations**:

    ```bash
    alembic upgrade head
    ```

4.  **Run Server**:
    ```bash
    uvicorn app.main:app --reload
    ```

## Development

- **Database Connections**:
  - `app/db/session.py`: Async PostgreSQL session.
  - `app/db/redis.py`: Async Redis client.
  - `app/db/firebase.py`: Firebase Admin SDK.

- **Migrations**:
  - Create revision: `alembic revision --autogenerate -m "message"`
  - Apply: `alembic upgrade head`

- **Logging**:
  - Use `from loguru import logger` instead of `print`.
  - Logs are rotated and saved to `/data/logs/finpredict_ai.log`.
