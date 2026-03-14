<#
.SYNOPSIS
  Safe Disk C: cleanup - temp folders, npm/yarn cache, Docker prune.
  Does NOT touch Windows, Program Files, AppData (except Temp), or project folders (e.g. D:\template).
.DESCRIPTION
  Run without admin for user-level cleanup. Admin actions (Windows Update cache, hibernation) are documented in comments only.
.PARAMETER WhatIf
  Shows what would be done without actually deleting files.
.PARAMETER AggressiveDocker
  Use docker system prune -a (removes unused images, frees more space ~10+ GB).
.PARAMETER CleanWER
  Clean Windows Error Reports (C:\ProgramData\Microsoft\Windows\WER). Low risk.
.EXAMPLE
  .\safe-disk-c-cleanup.ps1
.EXAMPLE
  .\safe-disk-c-cleanup.ps1 -AggressiveDocker -WhatIf
#>
[CmdletBinding(SupportsShouldProcess)]
param(
    [switch]$AggressiveDocker,
    [switch]$CleanWER
)

# Protected paths - script must never delete these
$ProtectedPaths = @(
    "D:\template",
    "C:\Windows",
    "C:\Program Files",
    "C:\Program Files (x86)"
)

function Test-PathIsProtected {
    param([string]$Path)
    try {
        $fullPath = [System.IO.Path]::GetFullPath($Path)
    } catch {
        return $true
    }
    foreach ($p in $ProtectedPaths) {
        try {
            $pp = [System.IO.Path]::GetFullPath($p)
        } catch {
            $pp = $p
        }
        if ($fullPath -like "$pp*" -or $pp -like "$fullPath*") {
            return $true
        }
    }
    return $false
}

function Get-CDriveFreeSpaceGB {
    $drive = Get-PSDrive C -PSProvider FileSystem
    return [math]::Round($drive.Free / 1GB, 2)
}

# --- Before ---
$freeBefore = Get-CDriveFreeSpaceGB
Write-Host "C: free space before cleanup: $freeBefore GB" -ForegroundColor Cyan

# --- 1. User TEMP folders ---
$tempPaths = @(
    $env:TEMP,
    "$env:LOCALAPPDATA\Temp"
)
foreach ($tp in $tempPaths) {
    if (-not (Test-Path $tp)) { continue }
    if (Test-PathIsProtected $tp) {
        Write-Host "SKIP (protected): $tp" -ForegroundColor Yellow
        continue
    }
    $count = (Get-ChildItem $tp -Recurse -ErrorAction SilentlyContinue | Measure-Object).Count
    if ($PSCmdlet.ShouldProcess($tp, "Remove temp files ($count items)")) {
        Remove-Item "$tp\*" -Recurse -Force -ErrorAction SilentlyContinue
        Write-Host "Cleaned: $tp" -ForegroundColor Green
    }
}

# --- 2. npm cache ---
if (Get-Command npm -ErrorAction SilentlyContinue) {
    if ($PSCmdlet.ShouldProcess("npm cache", "Clean")) {
        npm cache clean --force 2>$null
        Write-Host "Cleaned: npm cache" -ForegroundColor Green
    }
}

# --- 3. yarn cache ---
if (Get-Command yarn -ErrorAction SilentlyContinue) {
    if ($PSCmdlet.ShouldProcess("yarn cache", "Clean")) {
        yarn cache clean 2>$null
        Write-Host "Cleaned: yarn cache" -ForegroundColor Green
    }
}

# --- 4. Docker (if running) ---
if (Get-Command docker -ErrorAction SilentlyContinue) {
    try {
        $null = docker info 2>&1
        if ($LASTEXITCODE -eq 0) {
            $desc = if ($AggressiveDocker) { "system prune -a (incl. unused images)" } else { "system prune" }
            if ($PSCmdlet.ShouldProcess("Docker", $desc)) {
                if ($AggressiveDocker) { docker system prune -a -f 2>$null } else { docker system prune -f 2>$null }
                Write-Host "Cleaned: Docker $desc" -ForegroundColor Green
            }
        }
    } catch {
        Write-Host "Docker not running, skipping" -ForegroundColor Gray
    }
}

# --- 5. WER (Windows Error Reports) - optional ---
if ($CleanWER) {
    $werPath = "C:\ProgramData\Microsoft\Windows\WER"
    if ((Test-Path $werPath) -and (-not (Test-PathIsProtected $werPath))) {
        $werReports = Join-Path $werPath "ReportQueue"
        if (Test-Path $werReports) {
            if ($PSCmdlet.ShouldProcess($werReports, "Clean WER reports")) {
                Remove-Item "$werReports\*" -Recurse -Force -ErrorAction SilentlyContinue
                Write-Host "Cleaned: WER ReportQueue" -ForegroundColor Green
            }
        }
    }
}

# --- After ---
Start-Sleep -Seconds 1
$freeAfter = Get-CDriveFreeSpaceGB
$freed = [math]::Round($freeAfter - $freeBefore, 2)
Write-Host "C: free space after cleanup:  $freeAfter GB" -ForegroundColor Cyan
Write-Host "Freed: $freed GB" -ForegroundColor $(if ($freed -gt 0) { "Green" } else { "Gray" })

# --- MANUAL STEPS (no admin) ---
Write-Host ""
Write-Host "--- Manual steps (more space) ---" -ForegroundColor Yellow
Write-Host "1. Win+R -> cleanmgr -> C: -> Clean up system files (Windows.old, Recycle Bin, etc.)"
Write-Host "2. For ~12 GB: docker system prune -a -f (run with -AggressiveDocker)"
Write-Host "3. Settings -> System -> Storage -> Configure Storage Sense"
Write-Host "4. Exclude D:\template and other project folders from Storage Sense"
Write-Host ""
Write-Host "--- Run disk-c-analyze.ps1 for full C: drive analysis ---" -ForegroundColor Gray
Write-Host "--- DO NOT delete: C:\Windows (except Temp), Program Files, D:\template, pagefile.sys ---" -ForegroundColor Yellow
