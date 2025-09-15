#!/bin/bash
cd "$(dirname "$0")"
export NODE_ENV=${NODE_ENV:-development}
export PORT=${PORT:-3002}
echo "Starting dev server on ${PORT}..."
npm run dev