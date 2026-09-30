#!/usr/bin/env bash
# ==============================================================================
# Smart India Hackathon (SIH) - Problem Statement 26120
# Digital Twin for Cyclic Steam Stimulation (CSS) & Sucker Rod Pump (SRP)
# Heavy Oil Wells of Baghewala Field (Oil India Limited)
# ==============================================================================

set -e

echo "======================================================================"
echo "    BAGHEWALA FIELD DIGITAL TWIN - STARTUP LAUNCHER (MERN STACK)     "
echo "======================================================================"

# Determine project directory
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$PROJECT_ROOT/backend"
FRONTEND_DIR="$PROJECT_ROOT/frontend"

# Step 1: Backend Verification & Dependency Installation
echo "[1/4] Checking Backend dependencies..."
cd "$BACKEND_DIR"
if [ ! -d "node_modules" ]; then
    echo "Installing backend dependencies..."
    npm install
fi

# Step 2: Frontend Verification & Dependency Installation
echo "[2/4] Checking Frontend dependencies..."
cd "$FRONTEND_DIR"
if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
fi

# Step 3: Launch Backend Server (Port 5000)
echo "[3/4] Starting Express Physics Engine & MongoDB Server on http://localhost:5000..."
cd "$BACKEND_DIR"
node src/server.js &
BACKEND_PID=$!
echo "Backend started with PID $BACKEND_PID"

# Allow backend and database to seed
sleep 3

# Step 4: Launch Frontend Dashboard (Port 3000)
echo "[4/4] Starting Vite SCADA Frontend on http://localhost:3000..."
cd "$FRONTEND_DIR"
npm run dev

# Trap exit to cleanup background backend process
trap "kill $BACKEND_PID" EXIT
