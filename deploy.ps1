#!/usr/bin/env pwsh
# Local deployment script for Kaprao52
# This script validates environment variables before deploying

$ErrorActionPreference = "Stop"

Write-Host "🚀 Kaprao52 Deployment Script" -ForegroundColor Cyan
Write-Host "==============================" -ForegroundColor Cyan

# Check if .env file exists
$envFile = ".env"
if (-not (Test-Path $envFile)) {
    Write-Host "❌ .env file not found!" -ForegroundColor Red
    Write-Host "Please create a .env file based on .env.example" -ForegroundColor Yellow
    exit 1
}

# Read and validate .env content
$envContent = Get-Content $envFile -Raw

# Check for placeholder values
$hasPlaceholder = $false

if ($envContent -match "your_supabase_project_url|your-project|placeholder") {
    Write-Host "❌ VITE_SUPABASE_URL contains placeholder value!" -ForegroundColor Red
    $hasPlaceholder = $true
}

if ($envContent -match "your_supabase_anon_key|placeholder-key") {
    Write-Host "❌ VITE_SUPABASE_ANON_KEY contains placeholder value!" -ForegroundColor Red
    $hasPlaceholder = $true
}

if ($hasPlaceholder) {
    Write-Host ""
    Write-Host "⚠️  Please update your .env file with actual Supabase credentials:" -ForegroundColor Yellow
    Write-Host "   1. Get your credentials from https://app.supabase.com" -ForegroundColor White
    Write-Host "   2. Update VITE_SUPABASE_URL with your project URL" -ForegroundColor White
    Write-Host "   3. Update VITE_SUPABASE_ANON_KEY with your anon key" -ForegroundColor White
    Write-Host ""
    Write-Host "Example .env:" -ForegroundColor Cyan
    Write-Host "VITE_SUPABASE_URL=https://xxxxxxxxxxxxxxxxx.supabase.co" -ForegroundColor Gray
    Write-Host "VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs..." -ForegroundColor Gray
    exit 1
}

# Check for actual Supabase values
if ($envContent -match "VITE_SUPABASE_URL=https://[^\s]+\.supabase\.co" -and 
    $envContent -match "VITE_SUPABASE_ANON_KEY=eyJ[a-zA-Z0-9_-]+") {
    Write-Host "✅ Environment variables look valid" -ForegroundColor Green
} else {
    Write-Host "⚠️  Could not validate environment variables format" -ForegroundColor Yellow
    $continue = Read-Host "Continue anyway? (y/N)"
    if ($continue -ne "y" -and $continue -ne "Y") {
        exit 1
    }
}

# Install dependencies
Write-Host ""
Write-Host "📦 Installing dependencies..." -ForegroundColor Cyan
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ npm install failed!" -ForegroundColor Red
    exit 1
}

# Build
Write-Host ""
Write-Host "🔨 Building project..." -ForegroundColor Cyan
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed!" -ForegroundColor Red
    exit 1
}

# Deploy
Write-Host ""
Write-Host "🚀 Deploying to GitHub Pages..." -ForegroundColor Cyan
npm run deploy
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Deploy failed!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "✅ Deployment complete!" -ForegroundColor Green
Write-Host "   Your site should be available at: https://sorawittj-hue.github.io/Kaprao-app/" -ForegroundColor White
