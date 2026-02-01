# Test API Endpoints

## Login Test
Write-Host "Testing Login API..." -ForegroundColor Cyan

$loginBody = @{
    email = "admin@rbselibrary.edu"
    password = "Admin@123"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "http://localhost:5001/api/v1/auth/login" `
        -Method POST `
        -Body $loginBody `
        -ContentType "application/json"
    
    Write-Host "✅ Login Successful!" -ForegroundColor Green
    Write-Host "Token: $($response.data.token.Substring(0, 20))..." -ForegroundColor Yellow
    Write-Host "User: $($response.data.user.name) ($($response.data.user.role))" -ForegroundColor Yellow
    
    # Store token for subsequent requests
    $global:token = $response.data.token
    
} catch {
    Write-Host "❌ Login Failed!" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}

## Health Check
Write-Host "`nTesting Health Check..." -ForegroundColor Cyan

try {
    $health = Invoke-RestMethod -Uri "http://localhost:5001/health" -Method GET
    Write-Host "✅ Health Check Passed!" -ForegroundColor Green
    Write-Host "Message: $($health.message)" -ForegroundColor Yellow
} catch {
    Write-Host "❌ Health Check Failed!" -ForegroundColor Red
}

## Get Current User (Protected Route)
if ($global:token) {
    Write-Host "`nTesting Protected Route (Get Me)..." -ForegroundColor Cyan
    
    try {
        $headers = @{
            Authorization = "Bearer $global:token"
        }
        
        $me = Invoke-RestMethod -Uri "http://localhost:5001/api/v1/auth/me" `
            -Method GET `
            -Headers $headers
        
        Write-Host "✅ Protected Route Access Successful!" -ForegroundColor Green
        Write-Host "User Details:" -ForegroundColor Yellow
        $me.data.user | Format-List name, email, role, admissionNumber, board
        
    } catch {
        Write-Host "❌ Protected Route Access Failed!" -ForegroundColor Red
        Write-Host $_.Exception.Message -ForegroundColor Red
    }
}

Write-Host "`n🎉 API Testing Complete!" -ForegroundColor Green
