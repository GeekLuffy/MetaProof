# Cursor Data Backup Script
# Run this to backup all Cursor data including chat history

$backupDate = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$backupFolder = ".\cursor-backup-$backupDate"

Write-Host "Creating Cursor backup..." -ForegroundColor Green

# Create backup folder
New-Item -ItemType Directory -Path $backupFolder -Force | Out-Null

# Backup main Cursor data
Write-Host "Backing up Cursor data..." -ForegroundColor Yellow
$cursorData = "$env:APPDATA\Cursor"
if (Test-Path $cursorData) {
    Copy-Item -Path $cursorData -Destination "$backupFolder\Cursor" -Recurse -Force
    Write-Host "✓ Cursor data backed up" -ForegroundColor Green
} else {
    Write-Host "✗ Cursor data folder not found" -ForegroundColor Red
}

# Backup workspace storage (chat history)
Write-Host "Backing up workspace storage..." -ForegroundColor Yellow
$workspaceStorage = "$env:APPDATA\Cursor\User\workspaceStorage"
if (Test-Path $workspaceStorage) {
    Copy-Item -Path $workspaceStorage -Destination "$backupFolder\workspaceStorage" -Recurse -Force
    Write-Host "✓ Workspace storage backed up" -ForegroundColor Green
}

# Backup global storage (AI data)
Write-Host "Backing up global storage..." -ForegroundColor Yellow
$globalStorage = "$env:APPDATA\Cursor\User\globalStorage"
if (Test-Path $globalStorage) {
    Copy-Item -Path $globalStorage -Destination "$backupFolder\globalStorage" -Recurse -Force
    Write-Host "✓ Global storage backed up" -ForegroundColor Green
}

Write-Host "`n✓ Backup complete!" -ForegroundColor Green
Write-Host "Backup location: $backupFolder" -ForegroundColor Cyan
Write-Host "`nBackup size:" -ForegroundColor Yellow
Get-ChildItem -Path $backupFolder -Recurse | Measure-Object -Property Length -Sum | 
    Select-Object @{Name="Size (MB)";Expression={[math]::Round($_.Sum / 1MB, 2)}}

# Create info file
$infoContent = @"
Cursor Data Backup
==================
Date: $backupDate
Computer: $env:COMPUTERNAME
User: $env:USERNAME

To restore on another computer:
1. Install Cursor
2. Close Cursor completely
3. Copy the 'Cursor' folder to: %APPDATA%\Cursor
4. Replace existing files
5. Start Cursor

Note: You may need to sign in again to sync with cloud.
"@

Set-Content -Path "$backupFolder\README.txt" -Value $infoContent
Write-Host "`nREADME.txt created with restore instructions" -ForegroundColor Cyan

