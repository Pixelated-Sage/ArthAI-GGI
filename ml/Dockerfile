# ============================================
# ArthAI-GGI ML Server — Dockerfile
# CPU-only TensorFlow for cross-platform use
# ============================================

FROM python:3.12-slim AS base

# System deps for psycopg2, lxml, matplotlib
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    libxml2-dev \
    libxslt1-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python deps first (layer caching)
COPY requirements-docker.txt .
RUN pip install --no-cache-dir -r requirements-docker.txt

# Copy source code
COPY config.py server.py inference.py predict.py fetch_data.py ./
COPY src/ ./src/

# Models are volume-mounted at runtime, not baked in
# Create the expected directory structure
RUN mkdir -p models/finpredict models/finpredict_v2 data/datasets/raw data/datasets/processed data/models

# Expose ML server port
EXPOSE 8001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8001/health')" || exit 1

# Run the ML FastAPI server
CMD ["python", "server.py"]
