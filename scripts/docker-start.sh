#!/bin/bash

# =================================================================
# FinPredict AI — Docker Quickstart Script
# =================================================================

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}🚀 Starting FinPredict AI Docker Stack...${NC}"

# Check for .env file
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  .env file not found. Creating from .env.example...${NC}"
    cp .env.example .env
    echo -e "${RED}❌ Please edit .env with your credentials and run again.${NC}"
    exit 1
fi

# Check for models
if [ ! -d "ml/models/finpredict" ]; then
    echo -e "${YELLOW}⚠️  WARNING: ml/models/finpredict not found.${NC}"
    echo -e "Predictions will fail unless you place the model files in that directory."
fi

# Build and Start
echo -e "${GREEN}📦 Building and starting containers...${NC}"
docker compose up -d --build

echo -e "\n${GREEN}✅ Success! Services are booting up.${NC}"
echo -e "--------------------------------------------------------"
echo -e "${BLUE}🌍 Frontend:${NC} http://localhost:3000"
echo -e "${BLUE}⚙️  Backend: ${NC} http://localhost:8000/api/v1"
echo -e "${BLUE}🧠 ML Server:${NC} http://localhost:8001/health"
echo -e "--------------------------------------------------------"
echo -e "To view logs, run: ${YELLOW}docker compose logs -f${NC}"
echo -e "To stop, run:      ${YELLOW}docker compose down${NC}"
