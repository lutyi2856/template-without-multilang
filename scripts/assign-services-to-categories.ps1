# Assign existing services to categories

$baseUrl = "http://localhost:8002/wp-json/wp/v2"
$auth = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes("admin:admin"))
$headers = @{
    "Authorization" = "Basic $auth"
    "Content-Type" = "application/json"
}

# Mapping service titles to category IDs (based on REST API output)
$categoryMapping = @{
    # Implantation (slug: implantaciya-zubov, ID: 3)
    "Имплантация зубов" = 3
    
    # Treatment (need to create new categories)
    "Лечение кариеса" = 11  # slug: 3
    "Лечение пульпита" = 11
    
    # Prosthetics (slug: protezirovanie, ID: 5)
    "Керамические коронки" = 5
    "Металлокерамические коронки" = 5
    
    # Whitening (slug: otbelivanie, ID: 6)
    "Профессиональное отбеливание ZOOM" = 6
    
    # Children
    "Лечение молочных зубов" = 12  # slug: 4
    
    # Orthodontics (slug: ortodontiya, ID: 8)
    "Исправление прикуса" = 8
    
    # Surgery (slug: hirurgiya, ID: 9)
    "Удаление зубов" = 9
    
    # Diagnostics
    "Рентгенодиагностика" = 13  # slug: 5
}

Write-Host "=== Getting all services ===" -ForegroundColor Green

$allServices = Invoke-RestMethod -Uri "$baseUrl/services?per_page=100" -Headers $headers

Write-Host "Found $($allServices.Count) services`n" -ForegroundColor Cyan

$updated = 0

foreach ($service in $allServices) {
    $title = $service.title.rendered
    
    if ($categoryMapping.ContainsKey($title)) {
        $categoryId = $categoryMapping[$title]
        
        try {
            $body = @{
                service_categories = @($categoryId)
            } | ConvertTo-Json
            
            $response = Invoke-RestMethod -Uri "$baseUrl/services/$($service.id)" -Method Post -Headers $headers -Body $body
            Write-Host "✓ Assigned '$title' to category $categoryId" -ForegroundColor Green
            $updated++
        }
        catch {
            Write-Host "✗ Error assigning '$title': $_" -ForegroundColor Red
        }
    }
    else {
        Write-Host "  - Skipping '$title' (no mapping)" -ForegroundColor Yellow
    }
}

Write-Host "`n=== Summary ===" -ForegroundColor Green
Write-Host "Total services: $($allServices.Count)"
Write-Host "Updated: $updated"
Write-Host "`n✓ Done!" -ForegroundColor Green
