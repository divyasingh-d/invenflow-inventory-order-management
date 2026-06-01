$frontendUrl = "https://frontend-theta-six-22.vercel.app"
Write-Host "=== Vercel Frontend Verification ===" -ForegroundColor Cyan
Write-Host ""

$fe = Invoke-WebRequest $frontendUrl -UseBasicParsing
Write-Host "HTTP Status      : $($fe.StatusCode)"
Write-Host "Has InvenFlow    : $($fe.Content -match 'InvenFlow')"
Write-Host "Has React app    : $($fe.Content -match 'id=.root')"
Write-Host "Content length   : $($fe.Content.Length) bytes"
Write-Host ""
Write-Host "Frontend URL: $frontendUrl" -ForegroundColor Green
