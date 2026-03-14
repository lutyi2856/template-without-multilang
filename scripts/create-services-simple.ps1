# PowerShell script to create services data via WordPress REST API

$baseUrl = "http://localhost:8002/wp-json/wp/v2"
$auth = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes("admin:admin"))
$headers = @{
    "Authorization" = "Basic $auth"
    "Content-Type" = "application/json"
}

# Категории услуг
$categories = @(
    @{name="Имплантация зубов"; slug="implantation"; description="Установка зубных имплантов"}
    @{name="Лечение зубов"; slug="treatment"; description="Терапевтическое лечение"}
    @{name="Протезирование"; slug="prosthetics"; description="Восстановление зубов протезами"}
    @{name="Отбеливание"; slug="whitening"; description="Профессиональное отбеливание зубов"}
    @{name="Брекеты и ортодонтия"; slug="braces"; description="Исправление прикуса"}
    @{name="Детская стоматология"; slug="children"; description="Стоматология для детей"}
    @{name="Хирургия"; slug="surgery"; description="Хирургические вмешательства"}
)

# Услуги для каждой категории
$services = @{
    "implantation" = @(
        "Имплантация зубов под ключ"
        "Имплант OSSTEM"
        "Имплант Nobel Biocare"
        "Имплант Straumann"
        "Синус-лифтинг"
        "Костная пластика"
        "All-on-4"
        "All-on-6"
        "Имплантация за 1 день"
        "Имплантация без боли"
    )
    "treatment" = @(
        "Лечение кариеса"
        "Лечение пульпита"
        "Лечение периодонтита"
        "Эндодонтическое лечение"
        "Лечение под микроскопом"
        "Художественная реставрация"
        "Лечение зуба мудрости"
        "Перелечивание каналов"
    )
    "prosthetics" = @(
        "Коронки из циркония"
        "Керамические коронки"
        "Металлокерамические коронки"
        "Виниры"
        "Вкладки и накладки"
        "Мостовидные протезы"
        "Съемные протезы"
        "Бюгельные протезы"
        "Протезы на имплантах"
        "Временные коронки"
        "Протезирование на замках"
        "Протезирование при полном отсутствии зубов"
    )
    "whitening" = @(
        "Отбеливание ZOOM"
        "Лазерное отбеливание"
        "Домашнее отбеливание"
        "Отбеливание Opalescence"
        "Профессиональная чистка"
        "Air Flow"
    )
    "braces" = @(
        "Металлические брекеты"
        "Керамические брекеты"
        "Сапфировые брекеты"
        "Лингвальные брекеты"
        "Элайнеры Invisalign"
        "Исправление прикуса"
        "Ортодонтическое лечение взрослых"
        "Ретенция после брекетов"
        "Пластинки для детей"
    )
    "children" = @(
        "Детская профилактика"
        "Лечение молочных зубов"
        "Серебрение зубов"
        "Фторирование"
        "Герметизация фиссур"
        "Удаление молочных зубов"
        "Детская ортодонтия"
    )
    "surgery" = @(
        "Удаление зуба"
        "Удаление зуба мудрости"
        "Сложное удаление"
        "Резекция верхушки корня"
        "Удаление кисты"
        "Пластика уздечки"
        "Вестибулопластика"
        "Лоскутная операция"
        "Имплантация костной ткани"
        "Открытый синус-лифтинг"
        "Закрытый синус-лифтинг"
    )
}

Write-Host "=== Creating Service Categories ===" -ForegroundColor Green

$createdCategories = @{}

foreach ($cat in $categories) {
    try {
        $body = @{
            name = $cat.name
            slug = $cat.slug
            description = $cat.description
        } | ConvertTo-Json -Depth 10
        
        $response = Invoke-RestMethod -Uri "$baseUrl/service_categories" -Method Post -Headers $headers -Body $body -ErrorAction Stop
        $createdCategories[$cat.slug] = $response.id
        Write-Host "✓ Created category: $($cat.name) (ID: $($response.id))" -ForegroundColor Green
    }
    catch {
        # Category might already exist
        $existing = Invoke-RestMethod -Uri "$baseUrl/service_categories?slug=$($cat.slug)" -Method Get
        if ($existing.Count -gt 0) {
            $createdCategories[$cat.slug] = $existing[0].id
            Write-Host "✓ Category already exists: $($cat.name) (ID: $($existing[0].id))" -ForegroundColor Yellow
        }
        else {
            Write-Host "✗ Error creating category: $($cat.name) - $_" -ForegroundColor Red
        }
    }
}

Write-Host "`n=== Creating Services ===" -ForegroundColor Green

$totalServices = 0

foreach ($catSlug in $services.Keys) {
    if (-not $createdCategories.ContainsKey($catSlug)) {
        continue
    }
    
    $categoryId = $createdCategories[$catSlug]
    $servicesList = $services[$catSlug]
    
    Write-Host "`nCategory: $catSlug (creating $($servicesList.Count) services)" -ForegroundColor Cyan
    
    foreach ($serviceName in $servicesList) {
        try {
            $body = @{
                title = $serviceName
                status = "publish"
                content = "Описание услуги: $serviceName"
                excerpt = "Профессиональная услуга: $serviceName"
                service_categories = @($categoryId)
            } | ConvertTo-Json -Depth 10
            
            $response = Invoke-RestMethod -Uri "$baseUrl/services" -Method Post -Headers $headers -Body $body -ErrorAction Stop
            Write-Host "  ✓ Created service: $serviceName (ID: $($response.id))" -ForegroundColor Green
            $totalServices++
        }
        catch {
            Write-Host "  ✗ Error creating service: $serviceName - $_" -ForegroundColor Red
        }
    }
}

Write-Host "`n=== Summary ===" -ForegroundColor Green
Write-Host "Categories: $($createdCategories.Count)"
Write-Host "Services: $totalServices"
Write-Host "`n✓ Done!" -ForegroundColor Green
