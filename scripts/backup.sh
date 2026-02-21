#!/bin/bash

# AZUL STREET API - Backup Script
# Run daily via cron: 0 2 * * * /path/to/backup.sh

set -e

BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)
DB_CONTAINER="azul_db"

mkdir -p $BACKUP_DIR

echo "🗄️ Starting backup at $(date)..."

# Database backup
echo "💾 Backing up PostgreSQL..."
docker exec $DB_CONTAINER pg_dump -U postgres azulstreet > "$BACKUP_DIR/db_$DATE.sql"

# Compress backup
gzip "$BACKUP_DIR/db_$DATE.sql"

# Upload to S3 (optional)
# aws s3 cp "$BACKUP_DIR/db_$DATE.sql.gz" s3://azulstreet-backups/

# Clean old backups (keep last 7 days)
find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete

echo "✅ Backup completed: db_$DATE.sql.gz"
