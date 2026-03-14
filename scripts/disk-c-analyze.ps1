<#
.SYNOPSIS
  Read-only C: drive analysis - folder sizes, safe cleanup candidates.
.DESCRIPTION
  Does NOT delete anything. Uses Get-ChildItem, Measure-Object, Test-Path, Get-PSDrive only.
.EXAMPLE
  .\disk-c-analyze.ps1
#>

$ErrorActionPreference = "SilentlyContinue"
$userProfile = $env:USERPROFILE

function Get-FolderSizeGB {
    param([string]$Path)
    if (-not (Test-Path $Path)) { return $null }
    try {
        $sum = (Get-ChildItem $Path -Recurse -Force -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum
        return [math]::Round($sum / 1GB, 2)
    } catch {
        return $null
    }
}

function Get-FileSizeGB {
    param([string]$Path)
    if (-not (Test-Path $Path)) { return $null }
    try {
        $item = Get-Item $Path -Force -ErrorAction SilentlyContinue
        if ($item -is [System.IO.FileInfo]) {
            return [math]::Round($item.Length / 1GB, 2)
        }
    } catch { }
    return $null
}

# --- C: Drive Summary ---
$drive = Get-PSDrive C -PSProvider FileSystem
$totalGB = [math]::Round(($drive.Used + $drive.Free) / 1GB, 2)
$usedGB = [math]::Round($drive.Used / 1GB, 2)
$freeGB = [math]::Round($drive.Free / 1GB, 2)

Write-Host "=== C: Drive Summary ===" -ForegroundColor Cyan
Write-Host "Total: $totalGB GB | Used: $usedGB GB | Free: $freeGB GB"
Write-Host ""

# --- Key Folders (skip C:\Windows and Program Files - too large, slow to scan) ---
$keyPaths = @(
    "C:\Users",
    "C:\ProgramData",
    "C:\Windows\Temp",
    "C:\Windows\SoftwareDistribution\Download",
    "C:\Windows.old",
    "$userProfile\AppData\Local",
    "$userProfile\AppData\Local\Temp",
    "$userProfile\AppData\Local\npm-cache",
    "$userProfile\AppData\Local\Yarn\Cache",
    "$userProfile\AppData\Local\Docker",
    "$userProfile\.npm",
    "$userProfile\.yarn",
    "$userProfile\AppData\Local\Google\Chrome\User Data\Default\Cache",
    "$userProfile\AppData\Local\Microsoft\Edge\User Data\Default\Cache",
    "C:\ProgramData\Docker",
    "C:\ProgramData\Microsoft\Windows\WER",
    "C:\`$Recycle.Bin"
)

$results = @()
foreach ($p in $keyPaths) {
    $size = Get-FolderSizeGB $p
    if ($null -ne $size -and $size -gt 0) {
        $results += [PSCustomObject]@{ Path = $p; SizeGB = $size }
    }
}

# Files
$filePaths = @("C:\hiberfil.sys", "C:\pagefile.sys")
foreach ($p in $filePaths) {
    $size = Get-FileSizeGB $p
    if ($null -ne $size -and $size -gt 0) {
        $results += [PSCustomObject]@{ Path = $p; SizeGB = $size }
    }
}

Write-Host "=== Key Folders (GB) ===" -ForegroundColor Cyan
$results | Sort-Object SizeGB -Descending | ForEach-Object {
    $pad = $_.Path.PadRight(55)
    Write-Host "$pad $($_.SizeGB)"
}

# --- Safe Cleanup Candidates ---
$cleanupPaths = @(
    "$userProfile\AppData\Local\Temp",
    "$env:TEMP",
    "C:\Windows\Temp",
    "C:\Windows\SoftwareDistribution\Download",
    "C:\Windows.old",
    "C:\`$Recycle.Bin",
    "$userProfile\AppData\Local\npm-cache",
    "$userProfile\AppData\Local\Yarn\Cache",
    "$userProfile\.npm",
    "$userProfile\.yarn",
    "$userProfile\AppData\Local\Docker",
    "$userProfile\AppData\Local\Google\Chrome\User Data\Default\Cache",
    "$userProfile\AppData\Local\Microsoft\Edge\User Data\Default\Cache",
    "C:\ProgramData\Docker",
    "C:\ProgramData\Microsoft\Windows\WER"
)

Write-Host ""
Write-Host "=== Safe Cleanup Candidates (GB) ===" -ForegroundColor Yellow
foreach ($p in $cleanupPaths) {
    if (Test-Path $p) {
        $size = if ((Get-Item $p -Force -ErrorAction SilentlyContinue) -is [System.IO.FileInfo]) {
            Get-FileSizeGB $p
        } else {
            Get-FolderSizeGB $p
        }
        if ($null -ne $size -and $size -gt 0) {
            $pad = $p.PadRight(55)
            Write-Host "$pad $size"
        }
    }
}

# --- Top subfolders in User Profile ---
Write-Host ""
Write-Host "=== Top Subfolders in $userProfile (GB) ===" -ForegroundColor Cyan
$userSubfolders = @()
if (Test-Path $userProfile) {
    Get-ChildItem $userProfile -Force -Directory -ErrorAction SilentlyContinue | ForEach-Object {
        $path = $_.FullName
        $size = Get-FolderSizeGB $path
        if ($null -ne $size -and $size -gt 0) {
            $userSubfolders += [PSCustomObject]@{ Path = $path; SizeGB = $size }
        }
    }
}
$userSubfolders | Sort-Object SizeGB -Descending | Select-Object -First 15 | ForEach-Object {
    $short = $_.Path.Replace($userProfile, "~")
    $pad = $short.PadRight(50)
    Write-Host "$pad $($_.SizeGB)"
}

Write-Host ""
Write-Host "--- Run safe-disk-c-cleanup.ps1 for automated safe cleanup ---" -ForegroundColor Gray
