# Fulcrum — local setup helper.
# Run from PowerShell (right-click → Run with PowerShell, or open PS in this folder and: ./INSTALL.ps1)
# 1) Copies the repo to %USERPROFILE%\Documents\fulcrum
# 2) Cleans any half-baked .git and re-inits
# 3) npm install
# 4) Stages an initial commit
# 5) Tells you the next 2 git commands to push to GitHub

$ErrorActionPreference = "Stop"

$src = $PSScriptRoot
$dst = Join-Path $env:USERPROFILE "Documents\fulcrum"

Write-Host "=== Fulcrum installer ===" -ForegroundColor Cyan
Write-Host "Source:      $src"
Write-Host "Destination: $dst"

if (-not (Test-Path $dst)) {
    New-Item -ItemType Directory -Path $dst | Out-Null
}

Write-Host "`n[1/5] Copying files (excluding node_modules, dist, .git)..." -ForegroundColor Cyan
robocopy $src $dst /E /XD node_modules dist .git .vercel /XF .cron-secret.tmp /NFL /NDL /NJH /NJS /NC /NS /NP | Out-Null
if ($LASTEXITCODE -gt 7) {
    Write-Host "robocopy failed with exit $LASTEXITCODE" -ForegroundColor Red
    exit 1
}

# Carry the .cron-secret.tmp into destination if you ran INSTALL twice; otherwise we'll generate later.
if (Test-Path (Join-Path $src ".cron-secret.tmp")) {
    Copy-Item (Join-Path $src ".cron-secret.tmp") (Join-Path $dst ".cron-secret.tmp")
}

Set-Location $dst

Write-Host "`n[2/5] Cleaning any leftover .git..." -ForegroundColor Cyan
if (Test-Path ".git") {
    Remove-Item -Recurse -Force ".git"
}

Write-Host "`n[3/5] npm install (may take ~30s)..." -ForegroundColor Cyan
npm install --no-audit --no-fund --silent
if ($LASTEXITCODE -ne 0) {
    Write-Host "npm install failed" -ForegroundColor Red
    exit 1
}

Write-Host "`n[4/5] git init + initial commit..." -ForegroundColor Cyan
git init -q -b main
git add .
git commit -q -m "feat: initial fulcrum scaffold (v0.1)"

Write-Host "`n[5/5] Ready. Next steps:" -ForegroundColor Green
Write-Host ""
Write-Host "  A) Create a new empty repo at https://github.com/new" -ForegroundColor Yellow
Write-Host "     name: fulcrum   |   visibility: public or private (your call)"
Write-Host ""
Write-Host "  B) Then in this PowerShell window run:" -ForegroundColor Yellow
Write-Host "     git remote add origin https://github.com/utkugrhn-source/fulcrum.git"
Write-Host "     git push -u origin main"
Write-Host ""
Write-Host "  C) Tell me when both A and B are done — I'll handle Vercel + Supabase + DNS."
