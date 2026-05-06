#!/bin/bash
# Manual deploy to gh-pages (use this instead of GitHub Actions when billing is locked)

set -e

echo "🚀 Kaprao52 Manual Deploy"
echo "========================="

# Validate .env
if [ ! -f ".env" ]; then
  echo "❌ .env file not found! Copy .env.example and fill in real credentials."
  exit 1
fi

if grep -qE "your_supabase|your-project|placeholder" .env; then
  echo "❌ .env still has placeholder values — please fill in real credentials first."
  exit 1
fi

echo "✅ .env looks good"

# Install deps if needed
if [ ! -d "node_modules" ]; then
  echo "📦 Installing dependencies..."
  npm install
fi

# Typecheck
echo "🔍 TypeScript check..."
npm run typecheck

# Build
echo "🏗️  Building..."
NODE_ENV=production npm run build

echo "🚢 Deploying to gh-pages..."
npm run deploy

echo ""
echo "✅ Done! Site will be live at: https://sorawittj-hue.github.io/Kaprao-app/"
