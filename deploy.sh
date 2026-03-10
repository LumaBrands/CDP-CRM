#!/bin/bash
set -e

# ============================================================
# CDP CRM - Railway Deployment Script
# ============================================================
# Prerequisites:
#   npm install -g @railway/cli
#   railway login
#
# Usage:
#   ./deploy.sh
# ============================================================

echo "=== CDP CRM Railway Deployment ==="
echo ""

# Check Railway CLI
if ! command -v railway &> /dev/null; then
    echo "Railway CLI not found. Install with: npm install -g @railway/cli"
    exit 1
fi

# Check authentication
railway whoami || { echo "Not logged in. Run: railway login"; exit 1; }

echo ""
echo "Step 1: Creating Railway project..."
railway init --name "cdp-crm" 2>/dev/null || echo "Project already exists, linking..."
railway link || true

echo ""
echo "Step 2: Adding PostgreSQL database..."
railway add --database postgres 2>/dev/null || echo "PostgreSQL may already exist"

echo ""
echo "Step 3: Generating JWT secret..."
JWT_SECRET=$(openssl rand -hex 32)
echo "JWT_SECRET_KEY=$JWT_SECRET"

echo ""
echo "Step 4: Deploying backend..."
railway service create backend 2>/dev/null || true

# Set backend environment variables
railway variables set \
    JWT_SECRET_KEY="$JWT_SECRET" \
    CORS_ORIGINS="*" \
    --service backend 2>/dev/null || true

# Link DATABASE_URL from Postgres plugin
echo "  -> Link DATABASE_URL: In Railway dashboard, go to backend service > Variables > Add Reference > select DATABASE_URL from PostgreSQL"

# Deploy backend
cd backend
railway up --service backend --detach
cd ..

echo ""
echo "Step 5: Deploying frontend..."
railway service create frontend 2>/dev/null || true

# Deploy frontend
cd frontend
railway up --service frontend --detach
cd ..

echo ""
echo "Step 6: Generating domains..."
railway domain --service backend 2>/dev/null || true
railway domain --service frontend 2>/dev/null || true

echo ""
echo "============================================================"
echo "DEPLOYMENT STARTED!"
echo ""
echo "Next steps:"
echo "  1. Open Railway dashboard: railway open"
echo "  2. In backend service > Variables:"
echo "     - Add DATABASE_URL reference from PostgreSQL service"
echo "     - Update CORS_ORIGINS to your frontend URL"
echo "  3. In frontend service > Variables:"
echo "     - Set NEXT_PUBLIC_API_URL to your backend URL + /api"
echo "     - Redeploy frontend after setting this"
echo ""
echo "Default login: admin@cdpcrm.com / admin123"
echo "============================================================"
