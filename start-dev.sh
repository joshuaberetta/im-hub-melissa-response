#!/usr/bin/env bash
# Development startup script

echo "Starting IM Hub Development Environment..."
echo ""

# Check if backend dependencies are installed
if [ ! -d "backend/__pycache__" ]; then
    echo "Installing backend dependencies..."
    pip install -r backend/requirements.txt
fi

# Check if frontend dependencies are installed
if [ ! -d "frontend/node_modules" ]; then
    echo "Installing frontend dependencies..."
    cd frontend && npm install --legacy-peer-deps && cd ..
fi

echo ""
echo "Starting backend server on http://localhost:8000"
echo "Starting frontend dev server on http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop all servers"
echo ""

# Start backend in background
cd backend && python main.py &
BACKEND_PID=$!

# Start frontend
cd frontend && npm run dev &
FRONTEND_PID=$!

# Trap Ctrl+C to kill both processes
trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT

# Wait for both processes
wait
