# Create proper service categories with correct names

$baseUrl = "http://localhost:8002/wp-json/wp/v2"
$auth = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes("admin:admin"))
$headers = @{
    "Authorization" = "Basic $auth"
    "Content-Type" = "application/json; charset=utf-8"
}

$categories = @(
    @{name="Implantation"; slug="implantation"; description="Dental implants installation"}
    @{name="Treatment"; slug="treatment"; description="Therapeutic treatment"}
    @{name="Prosthetics"; slug="prosthetics"; description="Dental prosthetics"}
    @{name="Whitening"; slug="whitening"; description="Professional whitening"}
    @{name="Braces"; slug="braces"; description="Orthodontics"}
    @{name="Children Dentistry"; slug="children"; description="Pediatric dentistry"}
    @{name="Surgery"; slug="surgery"; description="Dental surgery"}
)

Write-Host "=== Creating Service Categories ===" -ForegroundColor Green

$createdCategories = @{}

foreach ($cat in $categories) {
    $body = @{
        name = $cat.name
        slug = $cat.slug
        description = $cat.description
    } | ConvertTo-Json -Depth 10
    
    # Check if exists first
    $existing = Invoke-RestMethod -Uri "$baseUrl/service_categories?slug=$($cat.slug)" -Headers $headers -ErrorAction SilentlyContinue
    
    if ($existing -and $existing.Count -gt 0) {
        $createdCategories[$cat.slug] = $existing[0].id
        Write-Host "Exists: $($cat.name) (ID: $($existing[0].id))" -ForegroundColor Yellow
    }
    else {
        $response = Invoke-RestMethod -Uri "$baseUrl/service_categories" -Method Post -Headers $headers -Body $body -ErrorAction SilentlyContinue
        if ($response) {
            $createdCategories[$cat.slug] = $response.id
            Write-Host "Created: $($cat.name) (ID: $($response.id))" -ForegroundColor Green
        }
    }
}

Write-Host "`n=== Created Categories ===" -ForegroundColor Green
$createdCategories.GetEnumerator() | ForEach-Object {
    Write-Host "$($_.Key): $($_.Value)"
}

Write-Host "`n✓ Done! Created $($createdCategories.Count) categories" -ForegroundColor Green
