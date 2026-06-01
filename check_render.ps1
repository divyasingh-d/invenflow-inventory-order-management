$urls = @(
    "https://invenflow-inventory-order-management.onrender.com/health",
    "https://invenflow-backend.onrender.com/health"
)
foreach ($url in $urls) {
    try {
        $r = Invoke-WebRequest $url -UseBasicParsing -TimeoutSec 20
        Write-Host "LIVE: $url -> HTTP $($r.StatusCode)" -ForegroundColor Green
        Write-Host $r.Content
    } catch {
        $code = $_.Exception.Response.StatusCode.value__
        Write-Host "NOT LIVE: $url -> $code" -ForegroundColor Red
    }
}
