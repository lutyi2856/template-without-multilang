# Migrate WordPress DB from local Docker to Coolify VPS
# Usage: .\scripts\migrate-wp-to-coolify.ps1
# Prerequisites: Docker running with wp-new-db, .env with DB credentials

$VPS_IP = "85.234.107.148"
$VPS_USER = "root"
$SSH_KEY = "$env:USERPROFILE\.ssh\id_ed25519"
$DB_NAME_LOCAL = if ($env:DB_NAME) { $env:DB_NAME } else { "wp_new" }
$DB_NAME_REMOTE = if ($env:DB_NAME_REMOTE) { $env:DB_NAME_REMOTE } else { "wp_production" }
$DB_ROOT_PASSWORD = if ($env:DB_ROOT_PASSWORD) { $env:DB_ROOT_PASSWORD } else { "root_password" }
$WP_URL = "http://${VPS_IP}:8002"
$NEXTJS_URL = "http://${VPS_IP}:3000"
$SSH = "C:\Program Files\Git\usr\bin\ssh.exe"
$SCP = "C:\Program Files\Git\usr\bin\scp.exe"

Write-Host "=== WordPress DB Migration: Local -> Coolify VPS ===" -ForegroundColor Cyan
Write-Host "VPS: $VPS_IP | Local DB: $DB_NAME_LOCAL | Remote DB: $DB_NAME_REMOTE"

# 1. Export from local (avoid PowerShell redirect - use docker internal)
Write-Host "`n[1/5] Exporting DB from local container..." -ForegroundColor Yellow
docker exec wp-new-db bash -c "mariadb-dump -u root -p$DB_ROOT_PASSWORD --default-character-set=utf8mb4 $DB_NAME_LOCAL > /tmp/dump.sql"
if ($LASTEXITCODE -ne 0) { throw "Export failed" }
docker cp wp-new-db:/tmp/dump.sql "$PWD/local_db.sql"
if ($LASTEXITCODE -ne 0) { throw "Copy from container failed" }
Write-Host "Exported to local_db.sql" -ForegroundColor Green

# 2. Transfer to VPS
Write-Host "`n[2/5] Transferring to VPS..." -ForegroundColor Yellow
& $SCP -i $SSH_KEY -o StrictHostKeyChecking=no "$PWD/local_db.sql" "${VPS_USER}@${VPS_IP}:/tmp/local_db.sql"
if ($LASTEXITCODE -ne 0) { throw "SCP failed" }
Write-Host "Transferred" -ForegroundColor Green

# 3-5. On VPS: upload script, run import
Write-Host "`n[3-5/5] Running import on VPS..." -ForegroundColor Yellow
& $SCP -i $SSH_KEY -o StrictHostKeyChecking=no "$PWD/scripts/migrate-wp-remote.sh" "${VPS_USER}@${VPS_IP}:/tmp/migrate-wp-remote.sh"
& $SSH -i $SSH_KEY -o StrictHostKeyChecking=no "${VPS_USER}@${VPS_IP}" "sed -i 's/\r`$//' /tmp/migrate-wp-remote.sh && chmod +x /tmp/migrate-wp-remote.sh && bash /tmp/migrate-wp-remote.sh $VPS_IP $DB_NAME_REMOTE $DB_ROOT_PASSWORD"
if ($LASTEXITCODE -ne 0) { throw "Remote import failed" }

Write-Host "`n=== Migration complete ===" -ForegroundColor Green
Write-Host "Run on VPS to rebuild Next.js: docker compose -f docker-compose.production.yml -f override.yml build nextjs && docker compose ... up -d nextjs"
