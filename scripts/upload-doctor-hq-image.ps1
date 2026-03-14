# Загрузка HQ WebP фото врача в WordPress как featured image
#
# Использование:
#   .\scripts\upload-doctor-hq-image.ps1 -Slug abdalieva-uldaulet-parahatovna -PostId 857
#
# Требует: Docker, wp-new-wordpress контейнер, reprocess-doctor-images.js уже выполнен

param(
    [Parameter(Mandatory = $true)]
    [string]$Slug,
    [Parameter(Mandatory = $true)]
    [int]$PostId,
    [string]$SourcePath,
    [string]$ContainerName = "wp-new-wordpress"
)

$ProjectRoot = if ($PSScriptRoot) { Split-Path -Parent $PSScriptRoot } else { "D:\template" }

$LocalPath = if ($SourcePath -and (Test-Path $SourcePath)) { $SourcePath } else { Join-Path $ProjectRoot "kan-data\processed\cards\$Slug.webp" }
$TempPath = "/tmp/doctor-$Slug.webp"

if (-not (Test-Path $LocalPath)) {
    Write-Error "File not found: $LocalPath"
    Write-Host "Run first: node scripts/reprocess-doctor-images.js $Slug"
    exit 1
}

Write-Host "Uploading $Slug.webp to WordPress (post ID: $PostId)..." -ForegroundColor Cyan

docker cp $LocalPath "${ContainerName}:$TempPath"
if ($LASTEXITCODE -ne 0) {
    Write-Error "docker cp failed"
    exit 1
}

docker exec $ContainerName wp media import $TempPath --post_id=$PostId --featured_image --allow-root
$importExit = $LASTEXITCODE

docker exec $ContainerName rm -f $TempPath 2>$null

if ($importExit -ne 0) {
    Write-Error "wp media import failed"
    exit 1
}

Write-Host "Done. Featured image updated for post ID $PostId" -ForegroundColor Green
