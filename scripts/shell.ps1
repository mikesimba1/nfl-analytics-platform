Param(
  [ValidateSet("backend","frontend")]
  [string]$Service = "backend"
)

Write-Host "Opening shell in $Service container..." -ForegroundColor Cyan
if ($Service -eq "backend") {
  docker compose exec backend bash
} else {
  docker compose exec frontend sh
}


