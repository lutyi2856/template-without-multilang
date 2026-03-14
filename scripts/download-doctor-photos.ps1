# PowerShell script для скачивания и загрузки фотографий врачей
# Использует WordPress MCP через call_mcp_tool

# Note: Этот скрипт является шаблоном
# Фактическая загрузка изображений выполняется через PHP скрипт: scripts/install-doctor-images.php
# Список URL изображений находится в PHP скрипте

Write-Host "=== Downloading and Uploading Doctor Photos ===" -ForegroundColor Green
Write-Host ""

# Получаем список врачей через WordPress MCP
# Note: Этот скрипт должен быть запущен через инструмент, который может вызывать MCP
# Для ручного запуска используйте: docker exec -it template-wordpress-1 wp eval-file /var/www/html/scripts/download-doctor-photos.php

Write-Host "Note: This PowerShell script is a template." -ForegroundColor Yellow
Write-Host "For actual execution, use the PHP script: scripts/download-doctor-photos.php" -ForegroundColor Yellow
Write-Host ""
Write-Host "The PHP script will:" -ForegroundColor Cyan
Write-Host "1. Get all doctors from WordPress" -ForegroundColor Cyan
Write-Host "2. Download PNG images from free sources" -ForegroundColor Cyan
Write-Host "3. Upload to WordPress media library" -ForegroundColor Cyan
Write-Host "4. Set as featured_image for each doctor post" -ForegroundColor Cyan
