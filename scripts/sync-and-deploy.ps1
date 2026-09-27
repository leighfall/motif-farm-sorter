# Checks whether the TTC addon has produced fresher price data than what's
# currently checked into this repo, and if so, copies it in, regenerates
# data/motifs.json, and commits + pushes (which triggers an auto-deploy on
# Vercel via its GitHub integration). Safe to run on a schedule - it's a
# no-op whenever nothing's changed.
#
# Run manually to test: powershell -File scripts\sync-and-deploy.ps1
# Registered as a scheduled task by scripts\register-task.ps1.

$ErrorActionPreference = 'Continue'

$ProjectDir = Split-Path -Parent $PSScriptRoot
$DataDir = Join-Path $ProjectDir 'data'
$LiveAddonDir = "C:\Users\autum\OneDrive\Documents\Elder Scrolls Online\live\AddOns\TamrielTradeCentre"
$LogDir = Join-Path $ProjectDir 'logs'
$LogFile = Join-Path $LogDir 'sync.log'

$NpmPath = 'C:\Program Files\nodejs\npm.cmd'
$GitPath = 'C:\Program Files\Git\cmd\git.exe'

New-Item -ItemType Directory -Force -Path $LogDir | Out-Null

function Write-Log {
    param([string]$Message)
    $timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
    "$timestamp  $Message" | Tee-Object -FilePath $LogFile -Append
}

function Get-Sha256 {
    param([string]$Path)
    if (-not (Test-Path $Path)) { return $null }
    return (Get-FileHash -Path $Path -Algorithm SHA256).Hash
}

try {
    Write-Log "Checking for TTC data updates..."

    $files = @('ItemLookUpTable_EN.lua', 'PriceTableNA.lua')
    $changed = $false

    foreach ($file in $files) {
        $liveFile = Join-Path $LiveAddonDir $file
        $localFile = Join-Path $DataDir $file

        if (-not (Test-Path $liveFile)) {
            Write-Log "WARNING: $liveFile not found (has the TTC addon run at least once?). Skipping."
            continue
        }

        $liveHash = Get-Sha256 $liveFile
        $localHash = Get-Sha256 $localFile

        if ($liveHash -ne $localHash) {
            Write-Log "$file has changed - copying into data/."
            Copy-Item -Path $liveFile -Destination $localFile -Force
            $changed = $true
        }
    }

    if (-not $changed) {
        Write-Log "No changes detected. Nothing to do."
        exit 0
    }

    Set-Location $ProjectDir

    Write-Log "Running npm run build:data..."
    & $NpmPath run build:data 2>&1 | ForEach-Object { Write-Log "  $_" }
    if ($LASTEXITCODE -ne 0) { throw "build:data failed with exit code $LASTEXITCODE" }

    Write-Log "Staging updated data files..."
    # Note: the raw .lua files are intentionally gitignored (source material
    # only, ~7MB) - only the derived JSON gets committed.
    & $GitPath add data/motifs.json data/last-updated.json 2>&1 | Out-Null

    & $GitPath diff --cached --quiet
    if ($LASTEXITCODE -eq 0) {
        Write-Log "Nothing staged to commit. Done."
        exit 0
    }

    $commitMessage = "Auto-refresh motif price data ($(Get-Date -Format 'yyyy-MM-dd HH:mm'))"
    Write-Log "Committing: $commitMessage"
    & $GitPath commit -m $commitMessage 2>&1 | ForEach-Object { Write-Log "  $_" }
    if ($LASTEXITCODE -ne 0) { throw "git commit failed with exit code $LASTEXITCODE" }

    Write-Log "Pushing to origin..."
    & $GitPath push 2>&1 | ForEach-Object { Write-Log "  $_" }
    if ($LASTEXITCODE -ne 0) { throw "git push failed with exit code $LASTEXITCODE" }

    Write-Log "Done. Vercel should pick up the push and auto-deploy."
}
catch {
    Write-Log "ERROR: $_"
    exit 1
}
