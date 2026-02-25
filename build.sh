#!/bin/bash

echo "🚀 Starting Kaprao52 React Build..."

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
  echo "📦 Installing dependencies..."
  npm install
fi

# Create .env if not exists
if [ ! -f ".env" ]; then
  echo "⚠️  .env file not found. Creating from .env.example..."
  cp .env.example .env
  echo "📝 Please update .env with your credentials"
fi

# Run TypeScript check
echo "🔍 Running TypeScript check..."
npm run typecheck

if [ $? -ne 0 ]; then
  echo "❌ TypeScript check failed!"
  exit 1
fi

# Build the app
echo "🏗️  Building the app..."
npm run build

if [ $? -eq 0 ]; then
  echo "✅ Build successful!"
  echo "📁 Output directory: dist/"
else
  echo "❌ Build failed!"
  exit 1
fi
