Param(
  [switch]$Rebuild
)

Write-Host "Starting NFL Analytics stack..." -ForegroundColor Cyan

if ($Rebuild) {
  Write-Host "Rebuilding images..." -ForegroundColor Yellow
  docker compose build --no-cache
}

docker compose up -d --build

Write-Host "\nServices running:" -ForegroundColor Green
docker compose ps

Write-Host "\nEndpoints:" -ForegroundColor Cyan
Write-Host "- Backend API: http://localhost:5000" -ForegroundColor Cyan
Write-Host "- Frontend UI: http://localhost:3000" -ForegroundColor Cyan


