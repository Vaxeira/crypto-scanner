# 🔍 Crypto Swing Scanner

A live crypto swing trading opportunity scanner powered by the Binance public API.  
**Free · No API key needed · Deploys to Vercel in 2 minutes.**

## Features
- Scans top 300 USDT pairs on Binance by volume
- Real-time 4H RSI, volume spikes, support & resistance
- TradingView 4H charts embedded per coin
- Discord & Telegram alert sending
- Auto-refresh with configurable interval
- Simulated data fallback if Binance is unreachable

---

## 🚀 Deploy to Vercel (2 minutes)

### Step 1 — Push to GitHub
1. Go to [github.com/new](https://github.com/new) and create a new **public** repository named `crypto-scanner`
2. Upload the contents of this folder to that repo (drag & drop the files into GitHub's UI, or use git):

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/crypto-scanner.git
git push -u origin main
```

### Step 2 — Deploy on Vercel
1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **"Add New Project"**
3. Select your `crypto-scanner` repository
4. Vercel auto-detects Vite — just click **"Deploy"**
5. Done! You'll get a live URL like `https://crypto-scanner-xyz.vercel.app`

---

## 💻 Run Locally

```bash
npm install
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173)

---

## 📁 Project Structure

```
crypto-scanner/
├── index.html          # HTML entry point
├── vite.config.js      # Vite config
├── package.json        # Dependencies
└── src/
    ├── main.jsx        # React root
    └── App.jsx         # Scanner app (all logic + UI)
```
