# Restart dev server script
Write-Host "🧹 Cleaning cache..."
Remove-Item -Recurse -Force node_modules/.vite -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force node_modules/.cache -ErrorAction SilentlyContinue

Write-Host "🚀 Starting dev server..."
npm run dev
