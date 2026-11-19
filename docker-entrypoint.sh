#!/bin/sh
set -e

mkdir -p /app/uploads/vehicle-documents /app/uploads/parts-bills
chown -R nextjs:nodejs /app/uploads

exec su-exec nextjs:nodejs "$@"
