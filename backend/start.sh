#!/bin/sh
set -e

echo "Running database migrations..."
python -m alembic upgrade head

echo "Seeding database..."
python scripts/seed.py || echo "Seeding skipped or already done"

echo "Starting server on port ${PORT:-8000}..."
exec uvicorn app.main:app --host 0.0.0.0 --port "${PORT:-8000}"
