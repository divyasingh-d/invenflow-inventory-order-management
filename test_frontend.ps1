$frontend = Invoke-WebRequest -Uri "http://localhost:5173" -UseBasicParsing
Write-Host "Frontend HTTP status: $($frontend.StatusCode)"
Write-Host "Has InvenFlow title: $($frontend.Content -match 'InvenFlow')"
Write-Host "Content preview (first 200 chars):"
Write-Host $frontend.Content.Substring(0, [Math]::Min(200, $frontend.Content.Length))
