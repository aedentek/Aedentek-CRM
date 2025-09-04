#!/bin/bash
# Deployment script to ensure favicon cache busting

echo "🚀 Preparing deployment with favicon cache busting..."

# Get current timestamp for cache busting
TIMESTAMP=$(date +%s)

echo "📁 Updating favicon cache busting version to: $TIMESTAMP"

# Update the version in index.html for cache busting
sed -i "s/favicon\.ico?v=[0-9.]*/favicon.ico?v=$TIMESTAMP/g" frontend/index.html

echo "🏗️ Building frontend..."
cd frontend
npm run build

echo "✅ Build complete! Favicon should now load instantly without cache issues."
echo "📋 Favicon cache busting version: $TIMESTAMP"

# Optional: Copy dist folder to deployment location
echo "📦 Dist folder ready for deployment at: $(pwd)/dist/"
