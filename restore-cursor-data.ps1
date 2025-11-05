# Cursor Data Restore Script
# Run this on the NEW computer to restore Cursor data

param(
    [Parameter(Mandatory=$false)]
    [string]$BackupFolder = ""
)

Write-Host "Cursor Data Restore Script" -ForegroundColor Green
Write-Host "==========================" -ForegroundColor Green

# If no backup folder specified, look for most recent backup
if ($BackupFolder -eq "") {
    $backups = Get-ChildItem -Path ".\cursor-backup-*" -Directory | Sort-Object Name -Descending
    if ($backups.Count -eq 0) {
        Write-Host "✗ No backup folders found!" -ForegroundColor Red
        Write-Host "Please specify backup folder: .\restore-cursor-data.ps1 -BackupFolder 'path\to\backup'" -ForegroundColor Yellow
        exit 1
    }
    $BackupFolder = $backups[0].FullName
    Write-Host "Using most recent backup: $BackupFolder" -ForegroundColor Cyan
}

# Check if backup exists
if (-not (Test-Path $BackupFolder)) {
    Write-Host "✗ Backup folder not found: $BackupFolder" -ForegroundColor Red
    exit 1
}

# Warn user
Write-Host "`n⚠️  WARNING: This will replace your current Cursor data!" -ForegroundColor Yellow
Write-Host "Make sure Cursor is CLOSED before proceeding." -ForegroundColor Yellow
$confirm = Read-Host "`nContinue? (yes/no)"
if ($confirm -ne "yes") {
    Write-Host "Restore cancelled." -ForegroundColor Yellow
    exit 0
}

# Check if Cursor is running
$cursorProcess = Get-Process -Name "Cursor" -ErrorAction SilentlyContinue
if ($cursorProcess) {
    Write-Host "✗ Cursor is currently running!" -ForegroundColor Red
    Write-Host "Please close Cursor and try again." -ForegroundColor Yellow
    exit 1
}

# Restore data
Write-Host "`nRestoring Cursor data..." -ForegroundColor Green

$cursorDataPath = "$env:APPDATA\Cursor"

# Backup existing data (just in case)
if (Test-Path $cursorDataPath) {
    $backupExisting = "$env:TEMP\cursor-backup-existing-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
    Write-Host "Backing up existing data to: $backupExisting" -ForegroundColor Yellow
    Copy-Item -Path $cursorDataPath -Destination $backupExisting -Recurse -Force
}

# Restore from backup
$backupCursorPath = Join-Path $BackupFolder "Cursor"
if (Test-Path $backupCursorPath) {
    Write-Host "Restoring Cursor data..." -ForegroundColor Yellow
    Copy-Item -Path "$backupCursorPath\*" -Destination $cursorDataPath -Recurse -Force
    Write-Host "✓ Cursor data restored" -ForegroundColor Green
} else {
    Write-Host "✗ Cursor backup not found in backup folder" -ForegroundColor Red
}

Write-Host "`n✓ Restore complete!" -ForegroundColor Green
Write-Host "You can now start Cursor." -ForegroundColor Cyan
Write-Host "`nNote: You may need to sign in to your Cursor account again." -ForegroundColor Yellow

