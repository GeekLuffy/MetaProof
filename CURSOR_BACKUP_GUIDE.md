# Cursor Chat History Backup & Restore Guide

## 📁 Where Cursor Stores Data Locally

### Windows:
```
Main data folder:
C:\Users\YourUsername\AppData\Roaming\Cursor\

Quick access:
Win+R → %APPDATA%\Cursor
```

### Mac:
```
~/Library/Application Support/Cursor/
```

### Linux:
```
~/.config/Cursor/
```

## 🚀 Quick Backup (Current Computer)

### Option 1: Automated Backup Script

```powershell
# Run this PowerShell script
.\backup-cursor-data.ps1
```

This will create a folder like: `cursor-backup-2025-11-06_01-30-00\`

### Option 2: Manual Backup

1. **Open File Explorer**
2. Press `Win + R`
3. Type: `%APPDATA%\Cursor`
4. Press Enter
5. Copy the entire **Cursor** folder
6. Paste it to a USB drive or cloud storage

## 📥 Restore on New Computer

### Option 1: Automated Restore Script

1. Copy your backup folder to the new computer
2. Run:
   ```powershell
   .\restore-cursor-data.ps1
   ```

### Option 2: Manual Restore

1. **Install Cursor** on new computer
2. **Close Cursor** completely
3. Press `Win + R` → `%APPDATA%\Cursor`
4. **Replace** the entire Cursor folder with your backup
5. **Start Cursor**

## 📋 Important Files & Folders

```
Cursor/
├── User/
│   ├── globalStorage/          ← AI chat history
│   ├── workspaceStorage/       ← Workspace-specific data
│   ├── settings.json           ← Your settings
│   └── keybindings.json        ← Keyboard shortcuts
├── Cache/                      ← Can skip (regenerates)
└── extensions/                 ← Installed extensions
```

## 💾 What to Backup

### ✅ Essential (Backup these):
- `User/globalStorage/` - Chat history, AI data
- `User/workspaceStorage/` - Workspace data
- `User/settings.json` - Settings
- `User/keybindings.json` - Keybindings

### ⚠️ Optional:
- `extensions/` - Extensions (or reinstall)

### ❌ Skip these (regenerate automatically):
- `Cache/`
- `CachedData/`
- `logs/`

## 🔄 Transfer Methods

### Method 1: USB Drive
1. Backup to USB
2. Plug into new computer
3. Restore

### Method 2: Cloud Storage
1. Upload backup to Google Drive/OneDrive/Dropbox
2. Download on new computer
3. Restore

### Method 3: Network Transfer
1. Share folder on network
2. Access from new computer
3. Copy and restore

### Method 4: Git (Not recommended for chat history)
- Chat history files are binary/large
- Better for code, not for Cursor data

## ⚡ Quick Commands

### Backup on Current Computer:
```powershell
# Open Cursor data folder
explorer $env:APPDATA\Cursor

# Or run backup script
.\backup-cursor-data.ps1
```

### Restore on New Computer:
```powershell
# Run restore script
.\restore-cursor-data.ps1

# Or manually:
explorer $env:APPDATA\Cursor
# Then paste your backup
```

## 🔍 Verify Backup

Check backup includes:
```powershell
# Check folder size
Get-ChildItem "cursor-backup-*" -Recurse | 
    Measure-Object -Property Length -Sum

# List important folders
Get-ChildItem "cursor-backup-*\Cursor\User" -Directory
```

Should show: globalStorage, workspaceStorage, etc.

## 🛠️ Troubleshooting

### Chat history not appearing?
1. Make sure you restored to correct location (`%APPDATA%\Cursor`)
2. Check that `User/globalStorage/` exists
3. Try restarting Cursor
4. Sign in to your Cursor account

### "Access Denied" error?
1. Close Cursor completely
2. Check Task Manager (no Cursor processes)
3. Try restore again

### Files are read-only?
```powershell
# Remove read-only attribute
Get-ChildItem "$env:APPDATA\Cursor" -Recurse | 
    ForEach-Object { $_.IsReadOnly = $false }
```

## 🎯 Best Practice Workflow

### On Computer 1:
1. ✅ Create Git repo for your project (poa/)
2. ✅ Push to GitHub
3. ✅ Run `backup-cursor-data.ps1` for chat history
4. ✅ Copy backup to USB/cloud

### On Computer 2:
1. ✅ Install Cursor
2. ✅ Sign in to Cursor account (for cloud sync)
3. ✅ Clone Git repo: `git clone https://github.com/you/proof-of-art-network.git`
4. ✅ Run `restore-cursor-data.ps1` (for chat history)
5. ✅ Start working!

## 📊 Typical Backup Size

```
Cursor data backup size:
- Small (new user): ~100 MB
- Medium (regular use): ~500 MB - 1 GB
- Large (heavy use): ~2-5 GB
```

## ⏱️ How Often to Backup

- **Before switching computers**: Always
- **After important chats**: Recommended
- **Weekly**: Good practice
- **Automatic**: Use cloud sync by signing in

## 🔐 Security Note

⚠️ **Chat history may contain sensitive information!**

- Keep backups secure
- Don't share publicly
- Use encrypted storage if needed
- Delete old backups when not needed

## ✅ Quick Checklist

### Backing Up:
- [ ] Close Cursor
- [ ] Run backup script or copy folder
- [ ] Verify backup size is reasonable
- [ ] Store backup safely

### Restoring:
- [ ] Install Cursor on new computer
- [ ] Close Cursor completely
- [ ] Run restore script or copy folder
- [ ] Start Cursor
- [ ] Verify chat history appears

---

**Created**: 2025-11-06
**For**: Proof-of-Art Network Project
**Location**: `C:\Users\user\PycharmProjects\Proof-of-Art\`

