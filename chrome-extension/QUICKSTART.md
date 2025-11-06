# 🚀 Quick Start Guide

Get up and running with Proof of Art extension in 5 minutes!

## Step 1: Install Extension (2 minutes)

1. Open Chrome browser
2. Go to `chrome://extensions/`
3. Enable "Developer mode" (top right toggle)
4. Click "Load unpacked"
5. Select the `chrome-extension` folder
6. Done! 🎉

## Step 2: Create Icons (1 minute)

The extension needs icon files. Choose one method:

**Option A: Use HTML Generator (Easiest)**
1. Open `icons/create-icons.html` in your browser
2. Icons are auto-generated
3. Click "Download All"
4. Icons are saved to your Downloads folder
5. Move them to the `icons/` folder

**Option B: Use Python Script**
```bash
cd icons
pip install pillow
python create-icons.py
```

**Option C: Use Your Own**
- Create 16x16, 32x32, 48x48, and 128x128 PNG files
- Name them `icon16.png`, `icon32.png`, etc.
- Place in `icons/` folder

## Step 3: Basic Configuration (1 minute)

1. Click the extension icon in Chrome toolbar
2. Click settings icon (⚙️)
3. **Optional**: Enter your backend API endpoint
4. **Optional**: Add IPFS provider token (for storage)

> **Note**: The extension works without a backend! Proofs are stored locally.

## Step 4: Test It! (1 minute)

### Test with ChatGPT:
1. Go to https://chatgpt.com
2. Ask: "Generate an image of a sunset"
3. Wait for image to appear
4. Click extension icon - see your proof! ✓

### Test with Bing:
1. Go to https://www.bing.com/images/create
2. Enter: "a beautiful landscape"
3. Click Create
4. Check extension popup for proof!

## ✅ You're Done!

The extension is now tracking your AI art across platforms!

## What Happens Next?

Every time you generate AI art on supported platforms:
1. 📝 Extension captures your prompt
2. 🖼️ Captures the generated image
3. 🔐 Computes cryptographic hash
4. 💾 Stores proof locally
5. ☁️ Optionally uploads to IPFS
6. ✨ Creates verifiable proof record

## View Your Proofs

Click the extension icon to:
- See all your proofs
- View proof details
- Export proof data
- Verify authenticity

## Supported Platforms

✅ ChatGPT / DALL-E  
✅ Google Gemini  
✅ Midjourney (Discord)  
✅ Bing Image Creator  
✅ Leonardo.ai  
✅ Stable Diffusion Web  

More coming soon!

## Need Help?

- 📖 Read [README.md](README.md) for full documentation
- ⚙️ Read [SETUP.md](SETUP.md) for detailed setup
- 🐛 Having issues? Check the troubleshooting section in SETUP.md

## Advanced Setup (Optional)

### Add IPFS Storage
1. Sign up for [Web3.Storage](https://web3.storage) (free)
2. Get API token
3. Add to extension settings
4. Your art is now stored on IPFS! 🌐

### Setup Backend API
1. Use the example backend template
2. Deploy to your server
3. Add endpoint to extension settings
4. Verify and register proofs online!

---

**Happy Creating! 🎨**

Your AI art is now tracked, verified, and provably yours!

