# Добавить WP_ENVIRONMENT_TYPE в wp-config.php внутри контейнера (Option 2)
# Запуск после бэкапа: .\scripts\patch-wp-config-env.ps1

$Config = @'

/* WP_ENVIRONMENT_TYPE - Application Passwords on localhost without HTTPS */
if ( ! defined( 'WP_ENVIRONMENT_TYPE' ) ) {
    define( 'WP_ENVIRONMENT_TYPE', 'local' );
}

'@

# Копируем wp-config из контейнера
$TempFile = [System.IO.Path]::GetTempFileName()
docker cp wp-new-wordpress:/var/www/html/wp-config.php $TempFile | Out-Null

# Проверяем, не добавлен ли уже
$Content = Get-Content $TempFile -Raw
if ($Content -match "WP_ENVIRONMENT_TYPE") {
    Write-Host "WP_ENVIRONMENT_TYPE already in wp-config.php" -ForegroundColor Yellow
    Remove-Item $TempFile -Force
    exit 0
}

# Вставляем перед строкой "That's all" или require wp-settings
$Lines = $Content -split "`r?`n"
$InsertIdx = -1
for ($i = 0; $i -lt $Lines.Count; $i++) {
    if ($Lines[$i] -match "That's all|stop editing") { $InsertIdx = $i; break }
    if ($Lines[$i] -match "wp-settings\.php" -and $InsertIdx -eq -1) { $InsertIdx = $i; break }
}
if ($InsertIdx -lt 0) { Write-Host "Marker not found in wp-config.php" -ForegroundColor Red; exit 1 }
$Before = $Lines[0..($InsertIdx-1)] -join "`n"
$After = $Lines[$InsertIdx..($Lines.Count-1)] -join "`n"
$NewContent = $Before + "`n`n" + $Config.TrimEnd() + "`n`n" + $After

# Сохраняем без BOM (PHP чувствителен к BOM)
[System.IO.File]::WriteAllText($TempFile, $NewContent, [System.Text.UTF8Encoding]::new($false))
docker cp $TempFile wp-new-wordpress:/var/www/html/wp-config.php
Remove-Item $TempFile -Force

Write-Host "WP_ENVIRONMENT_TYPE added to wp-config.php" -ForegroundColor Green
Write-Host "Refresh WordPress Profile page -> Application Passwords" -ForegroundColor Cyan
