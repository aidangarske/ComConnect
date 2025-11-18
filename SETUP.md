# ComConnect Setup Guide

## Quick Start (Easiest Way)

```bash
cd /home/aidangarske/ComConnect
./start-all.sh
```

The script will:
- ✅ Install dependencies
- ✅ Start backend (port 8080)
- ✅ Start frontend (port 5173)
- ✅ Open browser automatically

## Manual Start (2 Terminals)

**Terminal 1 - Backend:**
```bash
cd /home/aidangarske/ComConnect/server
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd /home/aidangarske/ComConnect/client/mern-stack/frontend
npm run dev
```

Open: http://localhost:5173

## Demo Accounts (Ready to Login)

```
Seeker Account:
  Email: seeker@comconnect.com
  Password: seeker123

Provider Account:
  Email: provider@comconnect.com
  Password: provider123

Admin Account:
  Email: admin@comconnect.com
  Password: admin123
```

## Environment Setup (First Time Only)

### Backend Requirements

**⚠️ IMPORTANT: `.env` files are NOT in git (for security). Each developer must create their own!**

1. **Copy the template:**
   ```bash
   cd server
   cp .env.example .env
   ```
   the .env.sample should work tho just simply rename it to .env

2. **Edit `.env` with your MongoDB credentials:**
   - The `.env.example` file has the shared MongoDB connection string
   - Just copy it to `.env` and it should work!

3. **Verify it works:**
   ```bash
   npm run dev
   ```
   You should see: `✅ MongoDB Connected Successfully!`

**If you're using the EXISTING MongoDB:**
- The `.env.example` already has the correct credentials
- Just copy it: `cp .env.example .env`
- ✅ Works immediately!

**"npm modules not found"**
```bash
cd server && npm install
cd ../client/mern-stack/frontend && npm install
```

## What's Connected

✅ **Backend:** Node.js/Express on port 8080
✅ **Frontend:** React/Vite on port 5173
✅ **Database:** MongoDB Atlas (cloud)
✅ **Auth:** JWT tokens
