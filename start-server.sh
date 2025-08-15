#!/bin/bash
cd /home/runner/workspace
export NODE_ENV=development
export REPLIT_EDITING=true
export PORT=3002
echo "Starting server..."
tsx server/index.ts