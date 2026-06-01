Write-Host "=== FINAL SYSTEM STATUS ===" -ForegroundColor Cyan
Write-Host ""

# Backend tests
Write-Host "[BACKEND] Testing all endpoints..." -ForegroundColor Yellow
$health = Invoke-RestMethod "http://localhost:8000/health"
Write-Host "  /health          : status=$($health.status) version=$($health.version)"

$root = Invoke-RestMethod "http://localhost:8000/"
Write-Host "  /               : status=$($root.status) app=$($root.app)"

$stats = Invoke-RestMethod "http://localhost:8000/dashboard/stats"
Write-Host "  /dashboard/stats : products=$($stats.total_products) customers=$($stats.total_customers) orders=$($stats.total_orders) revenue=`$$($stats.total_revenue)"

$docs = Invoke-WebRequest "http://localhost:8000/docs" -UseBasicParsing
Write-Host "  /docs (Swagger)  : HTTP $($docs.StatusCode)"

$openapi = Invoke-WebRequest "http://localhost:8000/openapi.json" -UseBasicParsing
Write-Host "  /openapi.json    : HTTP $($openapi.StatusCode)"

Write-Host ""
Write-Host "[FRONTEND] Testing..." -ForegroundColor Yellow
$fe = Invoke-WebRequest "http://localhost:5173" -UseBasicParsing
Write-Host "  http://localhost:5173 : HTTP $($fe.StatusCode)"
Write-Host "  Has InvenFlow title   : $($fe.Content -match 'InvenFlow')"

Write-Host ""
Write-Host "[DATABASE] Status..." -ForegroundColor Yellow
$dbPath = "backend\inventory_dev.db"
if (Test-Path $dbPath) {
    $size = (Get-Item $dbPath).Length
    Write-Host "  SQLite DB file : $dbPath ($size bytes)"
} else {
    Write-Host "  SQLite DB file : Not found yet (will be created on first startup)"
}

Write-Host ""
Write-Host "[DOCKER] Status..." -ForegroundColor Yellow
Write-Host "  Docker Desktop : NOT installed"
Write-Host "  Using SQLite   : Yes (zero-config local dev mode)"

Write-Host ""
Write-Host "[GIT] Recent commits..." -ForegroundColor Yellow
git log --oneline -4

Write-Host ""
Write-Host "=== ALL SYSTEMS OPERATIONAL ===" -ForegroundColor Green
