#!/usr/bin/env bash
# Build script for Render

# Install backend dependencies
pip install -r backend/requirements.txt

# Build frontend
cd frontend
npm install --legacy-peer-deps
npm run build
cd ..
