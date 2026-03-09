param(
    [string]$BaseUrl = "http://localhost:3000"
)

# Admin Login
Write-Host "1. Testing Admin Login..."
try {
    $loginResponse = Invoke-WebRequest -Uri "$BaseUrl/auth/login" -Method POST `
        -ContentType "application/json" `
        -Body (@{email = "admin@example.com"; password = "Admin@123"} | ConvertTo-Json) `
        -ErrorAction Stop
    
    $adminToken = ($loginResponse.Content | ConvertFrom-Json).access_token
    Write-Host "✅ Admin Login Success" -ForegroundColor Green
    Write-Host "   Token: $($adminToken.Substring(0, 20))..."
} catch {
    Write-Host "❌ Admin Login Failed: $_" -ForegroundColor Red
    exit 1
}

# Get Dashboard
Write-Host "`n2. Testing Admin Dashboard..."
try {
    $dashResponse = Invoke-WebRequest -Uri "$BaseUrl/admin/dashboard" -Method GET `
        -Headers @{Authorization = "Bearer $adminToken"} `
        -ErrorAction Stop
    
    $dashData = $dashResponse.Content | ConvertFrom-Json
    Write-Host "✅ Dashboard Retrieved" -ForegroundColor Green
    Write-Host "   Total Products: $($dashData.totalProducts)"
    Write-Host "   Total Variants: $($dashData.totalVariants)"
    Write-Host "   Total Reservations: $($dashData.totalReservations)"
    Write-Host "   Pending Reservations: $($dashData.pendingReservations)"
    Write-Host "   Confirmed Revenue: `$$($dashData.confirmedRevenue)"
} catch {
    Write-Host "❌ Dashboard Failed: $_" -ForegroundColor Red
}

# Get Admin Products
Write-Host "`n3. Testing Admin Products List..."
try {
    $productsResponse = Invoke-WebRequest -Uri "$BaseUrl/admin/products" -Method GET `
        -Headers @{Authorization = "Bearer $adminToken"} `
        -ErrorAction Stop
    
    $products = $productsResponse.Content | ConvertFrom-Json
    Write-Host "✅ Admin Products Retrieved" -ForegroundColor Green
    Write-Host "   Total Products: $($products.Count)"
    if ($products.Count -gt 0) {
        Write-Host "   First Product: $($products[0].name) - Variants: $($products[0].variants.Count)"
    }
} catch {
    Write-Host "❌ Products Failed: $_" -ForegroundColor Red
}

# Get Admin Users
Write-Host "`n4. Testing Admin Users List..."
try {
    $usersResponse = Invoke-WebRequest -Uri "$BaseUrl/admin/users" -Method GET `
        -Headers @{Authorization = "Bearer $adminToken"} `
        -ErrorAction Stop
    
    $users = $usersResponse.Content | ConvertFrom-Json
    Write-Host "✅ Admin Users Retrieved" -ForegroundColor Green
    Write-Host "   Total Users: $($users.Count)"
    $users | ForEach-Object { Write-Host "   - $($_.email) ($($_.role))" }
} catch {
    Write-Host "❌ Users Failed: $_" -ForegroundColor Red
}

# Get Public Products
Write-Host "`n5. Testing Public Products List..."
try {
    $pubResponse = Invoke-WebRequest -Uri "$BaseUrl/products" -Method GET `
        -ErrorAction Stop
    
    $pubProducts = $pubResponse.Content | ConvertFrom-Json
    Write-Host "✅ Public Products Retrieved" -ForegroundColor Green
    Write-Host "   Total Products: $($pubProducts.Count)"
} catch {
    Write-Host "❌ Public Products Failed: $_" -ForegroundColor Red
}

Write-Host "`n✅ All tests completed!" -ForegroundColor Green
