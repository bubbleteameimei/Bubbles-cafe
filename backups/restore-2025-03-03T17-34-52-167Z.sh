#!/bin/bash
# Restore script for backup-2025-03-03T17-34-52-167Z.sql
echo "Restoring database from backup-2025-03-03T17-34-52-167Z.sql..."
psql "postgresql://neondb_owner:npg_epc5kZw2NDCx@ep-dawn-fog-a5gmxwmq.us-east-2.aws.neon.tech/neondb?sslmode=require" < "/home/runner/workspace/backups/backup-2025-03-03T17-34-52-167Z.sql"
echo "Restore complete!"