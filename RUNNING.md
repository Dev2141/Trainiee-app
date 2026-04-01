# 🚀 Module 14: Running the Project

## Prerequisites

- Python 3.11+ installed
- Node.js & npm installed
- Backend running on port 8000
- Frontend running on port 5173

---

## ⚡ Quick Start

### **Step 1: Open Terminal 1 - Backend**

Copy and paste this command:

```powershell
cd "c:\Users\padha\Desktop\tt\frontend_design - Copy\backend"; python main.py
```

**Wait for this output:**
```
INFO:     Uvicorn running on http://127.0.0.1:8000
```

✅ Backend is ready.

---

### **Step 2: Open Terminal 2 - Frontend**

Open a **new PowerShell window** and copy/paste:

```powershell
cd "c:\Users\padha\Desktop\tt\frontend_design - Copy"; npm run dev
```

**Wait for this output:**
```
➜ Local: http://localhost:5173/
```

✅ Frontend is ready.

---

### **Step 3: Open Browser**

Go to:
```
http://localhost:5173
```

---

## 🔐 Login Credentials

Click **Sign In** and use:

| Field | Value |
|-------|-------|
| Email | `trainee@eagle.com` |
| Password | `trainee123` |

---

## 📚 Module 14: Offline-First Features

### **What's New**

The app now features a complete **offline-first architecture** with:

✅ **Local Vault (Dexie.js)** - IndexedDB offline storage
✅ **Resilient Sync Engine** - Auto-syncs when connection restored
✅ **Offline Assessments** - Take tests offline, sync results later
✅ **30-Day Auto-Archive** - Inactive modules auto-archive with notifications
✅ **Network Detection** - Capacitor network listener
✅ **Sync Indicator** - Visual feedback during sync

### **Documentation**

Full implementation guide: **OFFLINE_FIRST.md**

---

## ✨ Features to Test

After login, explore:

✅ **Modules Screen** - View 5 live modules with storage info
✅ **Download** - Select quality (HQ or Data Saver)
✅ **Offline Access Dashboard** - NEW! Shows cached modules
✅ **Take Assessment Offline** - NEW! Works without connection
✅ **Auto-Sync** - NEW! Syncs when online
✅ **Storage Manager** (Settings → Storage Optimizer) - See storage usage
✅ **Sign Out** (Settings → Sign Out) - Test logout

---

## 🛠 Troubleshooting

| Issue | Solution |
|-------|----------|
| Backend won't start | Check if port 8000 is free: `netstat -ano \| findstr :8000` |
| Frontend won't start | Check if port 5173 is free: `netstat -ano \| findstr :5173` |
| "Cannot connect to backend" | Make sure backend terminal shows "running on http://127.0.0.1:8000" |
| Blank login screen | Open DevTools (F12) → Console for error messages |
| Offline features not working | Check browser DevTools → Application → IndexedDB "EagleLocalVault" |

---

## 📁 Project Structure

```
frontend_design - Copy/
├── backend/
│   ├── main.py              ← FastAPI server
│   ├── eagle_lms.db         ← SQLite database
│   └── requirements.txt
├── src/
│   ├── db/
│   │   └── localVault.js    ← NEW: Dexie.js offline storage
│   ├── services/
│   │   ├── syncService.js   ← NEW: Resilient sync engine
│   │   └── offlineAssessmentService.js ← NEW: Offline assessments
│   ├── components/
│   │   └── OfflineAccessDashboard.jsx ← NEW: Offline UI
│   ├── screens/
│   │   ├── LoginScreen.jsx
│   │   ├── ModulesScreen.jsx
│   │   └── SettingsScreen.jsx
│   ├── App.jsx
│   └── index.css
├── RUNNING.md
└── OFFLINE_FIRST.md        ← Full documentation
```

---

## 🔌 API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/auth/login` | Login & get JWT token |
| GET | `/api/trainee/dashboard` | Get all modules |
| GET | `/api/trainee/module/{id}` | Get module details |
| POST | `/api/sync/offline-results` | Sync offline tests |

---

## ✅ All Systems Running?

If you see:
- ✅ Backend: `Uvicorn running on http://127.0.0.1:8000`
- ✅ Frontend: `Local: http://localhost:5173/`
- ✅ Browser: Login page visible

**You're ready to test!** 🎯
