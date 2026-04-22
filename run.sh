#!/bin/bash

echo "Starting ANPR service..."
cd services/alpr-api
source venv/bin/activate
uvicorn app:app --host 127.0.0.1 --port 8000 &
ANPR_PID=$!

echo "Starting frontend..."
cd ..
npm run dev &
FRONTEND_PID=$!

echo "App is running! Press Ctrl+C to stop."
trap "kill $ANPR_PID $FRONTEND_PID" INT
wait