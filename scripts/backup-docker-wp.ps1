# Backup WordPress Docker: DB + wp-content + wp-config.php
# Запуск: .\scripts\backup-docker-wp.ps1
# Требуется: docker compose, контейнеры должны быть запущены

$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path -Parent $PSScriptRoot
if (-not (Test-Path $ProjectRoot)) {
    $ProjectRoot = Get-Location
}
$BackupsDir = Join-Path $ProjectRoot "backups"
$Timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm"
$BackupDir = Join-Path $BackupsDir "wp-backup-$Timestamp"

Write-Host "Backup WordPress Docker -> $BackupDir" -ForegroundColor Cyan

# Загрузка .env если есть
$DbUser = "wp_user"
$DbPass = "wp_password"
$DbName = "wp_new"
$DbRootPass = "root_password"
if (Test-Path (Join-Path $ProjectRoot ".env")) {
    Get-Content (Join-Path $ProjectRoot ".env") | ForEach-Object {
        if ($_ -match "^DB_USER=(.+)$") { $DbUser = $Matches[1].Trim() }
        if ($_ -match "^DB_PASSWORD=(.+)$") { $DbPass = $Matches[1].Trim() }
        if ($_ -match "^DB_NAME=(.+)$") { $DbName = $Matches[1].Trim() }
        if ($_ -match "^DB_ROOT_PASSWORD=(.+)$") { $DbRootPass = $Matches[1].Trim() }
    }
}

# 1. Папка бэкапа
New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null

# 2. База данных
Write-Host "  [1/3] MariaDB dump..." -ForegroundColor Yellow
try {
    docker exec wp-new-db mysqldump -u root "-p$DbRootPass" --single-transaction --routines --triggers "$DbName" | Out-File -FilePath (Join-Path $BackupDir "db.sql") -Encoding utf8
    Write-Host "        OK: db.sql" -ForegroundColor Green
} catch {
    Write-Host "        FAIL: $_" -ForegroundColor Red
}

# 3. wp-content (volume)
Write-Host "  [2/3] wp-content volume..." -ForegroundColor Yellow
$Volumes = docker volume ls -q | Where-Object { $_ -match "wp-new-content" }
if ($Volumes) {
    $VolName = $Volumes | Select-Object -First 1
    try {
        docker run --rm -v "${VolName}:/data" -v "${BackupDir}:/out" alpine sh -c "cd /data && tar czf /out/wp-content.tar.gz ."
        Write-Host "        OK: wp-content.tar.gz" -ForegroundColor Green
    } catch {
        Write-Host "        FAIL: $_" -ForegroundColor Red
    }
} else {
    Write-Host "        SKIP: volume not found" -ForegroundColor Gray
}

# 4. wp-config.php
Write-Host "  [3/3] wp-config.php..." -ForegroundColor Yellow
try {
    docker cp wp-new-wordpress:/var/www/html/wp-config.php (Join-Path $BackupDir "wp-config.php")
    Write-Host "        OK: wp-config.php" -ForegroundColor Green
} catch {
    Write-Host "        FAIL: $_" -ForegroundColor Red
}

# Итог
Write-Host ""
Write-Host "Backup готов: $BackupDir" -ForegroundColor Cyan
Get-ChildItem $BackupDir | ForEach-Object { Write-Host "  - $($_.Name)" }
