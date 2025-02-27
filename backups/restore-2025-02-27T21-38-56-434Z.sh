#!/bin/bash
# Restore script for backup-2025-02-27T21-38-56-434Z.sql
echo "Restoring database from backup-2025-02-27T21-38-56-434Z.sql..."
psql "postgresql://neondb_owner:npg_TyuPEaFxcj59@ep-damp-sky-a6gwq6px.us-west-2.aws.neon.tech/neondb?sslmode=require" < "/home/runner/workspace/backups/backup-2025-02-27T21-38-56-434Z.sql"
echo "Restore complete!"