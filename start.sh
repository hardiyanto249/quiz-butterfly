#!/bin/bash

echo "Starting Quiz Butterfly Application..."
echo

echo "Step 1: Starting Backend Server..."
cd backend && go run . &
BACKEND_PID=$!

echo "Waiting 3 seconds for backend to start..."
sleep 3

echo "Step 2: Starting Frontend Server..."
cd ..
npm run dev &
FRONTEND_PID=$!

echo
echo "Application started successfully!"
echo "- Backend API: http://localhost:8080"
echo "- Frontend App: http://localhost:5173"
echo
echo "Press Ctrl+C to stop all servers"

# Function to kill both processes on exit
cleanup() {
    echo
    echo "Stopping servers..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo "Servers stopped."
    exit 0
}

# Set trap to call cleanup on interrupt
trap cleanup SIGINT SIGTERM

# Wait for processes
wait