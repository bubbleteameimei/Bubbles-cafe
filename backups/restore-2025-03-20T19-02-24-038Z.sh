#!/bin/bash
# Restore script for backup-2025-03-20T19-02-24-038Z.sql
echo "Restoring database from backup-2025-03-20T19-02-24-038Z.sql..."
psql "postgresql://neondb_owner:npg_5nmiaD2FqKGB@ep-mute-butterfly-a5jj3vjx.us-east-2.aws.neon.tech/neondb?sslmode=require" < "/home/runner/workspace/backups/backup-2025-03-20T19-02-24-038Z.sql"
echo "Restore complete!"