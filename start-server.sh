#!/bin/bash
export DATABASE_URL="postgresql://$PGUSER:$PGPASSWORD@$PGHOST:$PGPORT/$PGDATABASE?sslmode=require"
echo "🚀 Starting Interactive Storytelling Platform..."
echo "📍 Server will be available at: http://0.0.0.0:3002"
echo "🔗 Database URL configured"
cd /home/runner/workspace
tsx server/index.ts