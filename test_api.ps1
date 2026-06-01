try {
    $r = Invoke-WebRequest -Uri "http://localhost:8000/docs" -UseBasicParsing
    Write-Host "Swagger /docs HTTP status: $($r.StatusCode)"
    Write-Host "Content-Type: $($r.Headers['Content-Type'])"
} catch {
    Write-Host "Swagger /docs failed: $($_.Exception.Message)"
}

try {
    $r2 = Invoke-WebRequest -Uri "http://localhost:8000/openapi.json" -UseBasicParsing
    Write-Host "OpenAPI JSON HTTP status: $($r2.StatusCode)"
} catch {
    Write-Host "OpenAPI JSON failed: $($_.Exception.Message)"
}

Write-Host ""
Write-Host "=== POST /products/ - create test product ==="
$body = '{"name":"Test Laptop","sku":"LAP-001","price":999.99,"quantity_in_stock":50}'
try {
    $r3 = Invoke-RestMethod -Uri "http://localhost:8000/products/" -Method POST -Body $body -ContentType "application/json"
    $r3 | ConvertTo-Json
} catch {
    Write-Host "Error: $($_.Exception.Message)"
}

Write-Host ""
Write-Host "=== POST /customers/ - create test customer ==="
$body2 = '{"full_name":"Jane Doe","email":"jane@example.com","phone_number":"+1234567890"}'
try {
    $r4 = Invoke-RestMethod -Uri "http://localhost:8000/customers/" -Method POST -Body $body2 -ContentType "application/json"
    $r4 | ConvertTo-Json
} catch {
    Write-Host "Error: $($_.Exception.Message)"
}

Write-Host ""
Write-Host "=== POST /orders/ - create test order ==="
$body3 = '{"customer_id":1,"product_id":1,"quantity":3}'
try {
    $r5 = Invoke-RestMethod -Uri "http://localhost:8000/orders/" -Method POST -Body $body3 -ContentType "application/json"
    $r5 | ConvertTo-Json
} catch {
    Write-Host "Error: $($_.Exception.Message)"
}

Write-Host ""
Write-Host "=== GET /dashboard/stats (after seeding) ==="
Invoke-RestMethod -Uri "http://localhost:8000/dashboard/stats" | ConvertTo-Json
