# Mass upload HQ WebP doctor photos to WordPress
#
# Prerequisites:
#   node scripts/reprocess-doctor-images.js   # convert all JPG to WebP quality 90
#
# Usage:
#   .\scripts\upload-all-doctor-hq-images.ps1
#   .\scripts\upload-all-doctor-hq-images.ps1 -DryRun

param(
    [switch]$DryRun,
    [string]$ContainerName = "wp-new-wordpress"
)

$ProjectRoot = if ($PSScriptRoot) { Split-Path -Parent $PSScriptRoot } else { "D:\template" }
$CreatedDoctorsPath = Join-Path $ProjectRoot "kan-data\created-doctors.json"
$ProcessedDir = Join-Path $ProjectRoot "kan-data\processed\cards"

if (-not (Test-Path $CreatedDoctorsPath)) {
    Write-Error "created-doctors.json not found: $CreatedDoctorsPath"
    exit 1
}

$doctors = Get-Content $CreatedDoctorsPath -Raw | ConvertFrom-Json
$uploaded = 0
$skipped = 0

foreach ($doc in $doctors) {
    $slug = $doc.slug
    $postId = $doc.postId

    # -2 suffix: use base slug's photo (e.g. abdalieva-uldaulet-parahatovna-2 -> abdalieva-uldaulet-parahatovna.webp)
    $photoSlug = if ($slug -match "^(.+)-2$") { $Matches[1] } else { $slug }
    $webpPath = Join-Path $ProcessedDir "$photoSlug.webp"

    if (-not (Test-Path $webpPath)) {
        Write-Host "Skip $slug (no $photoSlug.webp)" -ForegroundColor Yellow
        $skipped++
        continue
    }

    if ($DryRun) {
        Write-Host "Would upload $photoSlug.webp -> post $postId ($($doc.name))"
        $uploaded++
        continue
    }

    Write-Host "Uploading $photoSlug.webp -> post $postId..." -ForegroundColor Cyan
    $tempPath = "/tmp/doctor-$slug.webp"

    docker cp $webpPath "${ContainerName}:$tempPath"
    if ($LASTEXITCODE -ne 0) {
        Write-Error "docker cp failed for $slug"
        continue
    }

    docker exec $ContainerName wp media import $tempPath --post_id=$postId --featured_image --allow-root 2>$null | Out-Null
    docker exec $ContainerName rm -f $tempPath 2>$null

    Write-Host "  OK post $postId" -ForegroundColor Green
    $uploaded++
}

Write-Host "`nDone: $uploaded uploaded, $skipped skipped"
