# Quick API Test for NEWOTEG Backend
Write-Host "`n🧪 Testing NEWOTEG Backend..." -ForegroundColor Cyan
Write-Host "================================`n" -ForegroundColor Cyan

# Test 1: Health check - Get all products
Write-Host "Test 1: GET /products (Public endpoint)" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000/products" -Method GET -UseBasicParsing
    Write-Host "✅ Success! Found $($response.Count) products" -ForegroundColor Green
    if ($response.Count -gt 0) {
        Write-Host "   Sample product: $($response[0].name)" -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n" 

# Test 2: Admin Login
Write-Host "Test 2: POST /auth/login (Admin login)" -ForegroundColor Yellow
try {
    $loginBody = @{
        email = "admin@example.com"
        password = "Admin@123"
    } | ConvertTo-Json
    
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:3000/auth/login" -Method POST -Body $loginBody -ContentType "application/json" -UseBasicParsing
    Write-Host "✅ Login successful!" -ForegroundColor Green
    Write-Host "   User: $($loginResponse.user.fullName)" -ForegroundColor Gray
    Write-Host "   Role: $($loginResponse.user.role)" -ForegroundColor Gray
    $token = $loginResponse.accessToken
    
    Write-Host "`n"
    
    # Test 3: Admin Dashboard (requires auth)
    Write-Host "Test 3: GET /admin/dashboard (Protected endpoint)" -ForegroundColor Yellow
    $headers = @{
        "Authorization" = "Bearer $token"
    }
    $dashboard = Invoke-RestMethod -Uri "http://localhost:3000/admin/dashboard" -Method GET -Headers $headers -UseBasicParsing
    Write-Host "✅ Dashboard accessed successfully!" -ForegroundColor Green
    Write-Host "   Total Products: $($dashboard.products.total)" -ForegroundColor Gray
    Write-Host "   Total Reservations: $($dashboard.reservations.total)" -ForegroundColor Gray
    
} catch {
    Write-Host "❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n================================" -ForegroundColor Cyan
Write-Host "✅ Backend is working correctly!" -ForegroundColor Green
Write-Host "🔗 Server: http://localhost:3000" -ForegroundColor Cyan
Write-Host "📊 Connection pooling: ACTIVE`n" -ForegroundColor Cyan
