#!/bin/bash

# AZUL STREET API - Deploy Script
# Usage: ./scripts/deploy.sh [production|staging]

set -e

ENV=${1:-production}
echo "🚀 Deploying AZUL STREET API to $ENV..."

# Load environment variables
if [ -f ".env.$ENV" ]; then
    export $(cat .env.$ENV | grep -v '^#' | xargs)
else
    echo "❌ .env.$ENV file not found!"
    exit 1
fi

# Pull latest code
echo "📥 Pulling latest code..."
git pull origin main

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --only=production

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Run migrations
echo "🗄️ Running database migrations..."
npx prisma migrate deploy

# Build TypeScript
echo "🔨 Building application..."
npm run build

# Restart services
echo "🔄 Restarting services..."
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d --build

# Health check
echo "🏥 Running health check..."
sleep 10
if curl -s http://localhost/health | grep -q 'OK'; then
    echo "✅ Deployment successful!"
else
    echo "❌ Health check failed!"
    docker-compose -f docker-compose.prod.yml logs api
    exit 1
fi

echo "🎉 AZUL STREET API deployed successfully!"
