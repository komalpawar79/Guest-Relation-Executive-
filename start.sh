#!/bin/bash

# Start MongoDB (if installed locally)
echo "Starting MongoDB..."
# mongod  # Uncomment if MongoDB is installed locally

# Start Backend
echo "Starting Backend Server..."
cd backend
npm install
npm run dev &
BACKEND_PID=$!

# Wait for backend to start
sleep 3

# Start Frontend
echo "Starting Frontend Development Server..."
cd ../frontend
npm install
npm run dev &
FRONTEND_PID=$!

# Keep running
wait $BACKEND_PID $FRONTEND_PID
