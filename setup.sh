#!/bin/bash

echo "Installing frontend dependencies..."
npm install

echo "Installing ANPR API dependencies..."
cd services/alpr-api
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

echo "Setup complete!"