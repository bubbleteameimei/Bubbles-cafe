#!/bin/bash
cd "$(dirname "$0")"
export NODE_ENV=${NODE_ENV:-development}
export REPLIT_EDITING=${REPLIT_EDITING:-true}
export PORT=${PORT:-3002}
echo "Starting server on ${PORT}..."
tsx server/index.ts