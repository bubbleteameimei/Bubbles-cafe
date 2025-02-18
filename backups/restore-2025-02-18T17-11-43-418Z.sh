#!/bin/bash
# Restore script for backup-2025-02-18T17-11-43-418Z.sql
echo "Restoring database from backup-2025-02-18T17-11-43-418Z.sql..."
psql "postgresql://neondb_owner:npg_CybevK6t8pZJ@ep-snowy-frog-a5ygs8ob.us-east-2.aws.neon.tech/neondb?sslmode=require" < "/home/runner/workspace/backups/backup-2025-02-18T17-11-43-418Z.sql"
echo "Restore complete!"