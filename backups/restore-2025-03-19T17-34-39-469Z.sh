#!/bin/bash
# Restore script for backup-2025-03-19T17-34-39-469Z.sql
echo "Restoring database from backup-2025-03-19T17-34-39-469Z.sql..."
psql "postgresql://neondb_owner:npg_VtJ3aRMNTy9n@ep-still-scene-a6idzj02.us-west-2.aws.neon.tech/neondb?sslmode=require" < "/home/runner/workspace/backups/backup-2025-03-19T17-34-39-469Z.sql"
echo "Restore complete!"