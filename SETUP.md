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

The backend needs MongoDB connection details in `.env` file.

**If you're using the EXISTING MongoDB:**
- The `.env` file already has credentials
- Just run `npm run dev`
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
