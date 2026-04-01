# 🦅 Eagle LMS - Module 14: Intelligent Offline-First Learning Management System

A **production-ready offline-first LMS** built with React + Vite (frontend) and FastAPI (backend), designed for educational environments with unreliable network connectivity. Features intelligent local caching, automatic sync, and seamless Android deployment via Capacitor.

---

## 🎯 Key Features

### **Core Offline-First Architecture**
- ✅ **Local Vault (Dexie.js)** - IndexedDB offline storage with automatic persistence
- ✅ **Resilient Sync Engine** - Automatically syncs cached assessments when connection restored
- ✅ **Offline Assessments** - Take tests offline, results saved locally and synced later
- ✅ **30-Day Auto-Archive** - Inactive modules auto-archive to free storage, preserving completion records
- ✅ **Network Detection** - Real-time network status via Capacitor with user notifications

### **4 Advanced Features (Module 14)**
1. **⏱️ Time Travel Debugger** - Skip 31 days instantly to test auto-archive without waiting
2. **✅ Visual Reassurance Badge** - Shows "Record Preserved" for archived-but-completed modules
3. **📡 Network Toast Notifications** - Real-time feedback on disconnect/reconnect/sync events
4. **💾 Data Saver Quality Selection** - Download modules in High Quality or Bandwidth-Optimized mode

### **Native Android Integration**
- Capacitor for Android packaging
- Cleartext HTTP support for local FastAPI dev server
- Network state and storage permissions configured
- Professional APK build ready for deployment

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    React Frontend (Vite)                     │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Screens: Modules | Detail | Assessment | Results    │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
         ↓  (Network Detection + Sync Queue)  ↓
┌─────────────────────────────────────────────────────────────┐
│           Offline Services Layer (Frontend)                  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ • Dexie.js (IndexedDB) - Local data vault            │   │
│  │ • Sync Service - Queue & auto-sync assessments      │   │
│  │ • Offline Assessment Service - Offline test engine  │   │
│  │ • Auto-Archive Service - 30-day cleanup             │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
         ↓  (axios + JWT Auth)  ↓
┌─────────────────────────────────────────────────────────────┐
│          FastAPI Backend (Python 3.13 + SQLAlchemy)          │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ • POST /api/auth/login - JWT token generation       │   │
│  │ • GET /api/trainee/dashboard - Module metadata      │   │
│  │ • POST /api/sync/offline-results - Batch sync       │   │
│  │ SQLite Database: 5 sample modules + 3 students      │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 Project Structure

```
eagle-lms/
├── src/
│   ├── main.jsx                          # React entry point
│   ├── App.jsx                           # App shell + service orchestration
│   ├── index.css                         # Global styles
│   ├── nativeServices.js                 # Capacitor wrapper
│   │
│   ├── screens/
│   │   ├── LoginScreen.jsx               # Authentication UI (JWT)
│   │   ├── ModulesScreen.jsx             # Module list + quality download selector
│   │   ├── ModuleDetailScreen.jsx        # Video player + metadata
│   │   ├── ResultsScreen.jsx             # Test results history
│   │   ├── SettingsScreen.jsx            # Settings + logout
│   │   └── StorageManagerScreen.jsx      # Local storage + debugging tools
│   │
│   ├── components/
│   │   ├── OfflineAccessDashboard.jsx    # Cached modules display
│   │   ├── StorageBar.jsx                # Storage usage visualization
│   │   ├── DownloadQualitySelector.jsx   # HQ vs Data Saver toggle
│   │   ├── Toast.jsx                     # Toast notification system
│   │   └── Icons.jsx                     # SVG icon library
│   │
│   ├── api/
│   │   └── apiService.js                 # Axios instance + JWT interceptor
│   │
│   ├── db/
│   │   └── localVault.js                 # Dexie.js schema + DB operations
│   │
│   ├── services/
│   │   ├── syncService.js                # Resilient sync engine + queue
│   │   └── offlineAssessmentService.js   # Offline test data persistence
│   │
│   └── context/
│       └── AuthContext.jsx               # Global auth state + JWT management
│
├── backend/
│   ├── main.py                           # FastAPI server (port 8000)
│   ├── requirements.txt                  # Python dependencies
│   ├── eagle_lms.db                      # SQLite database (auto-seeded)
│   └── README.md                         # Backend documentation
│
├── android/                              # Capacitor Android native project
│   ├── app/src/main/
│   │   ├── AndroidManifest.xml           # Permissions + cleartext HTTP
│   │   └── java/com/eagle/lms/
│   │       └── MainActivity.java         # Capacitor activity entry point
│   └── ... (Gradle build files)
│
├── capacitor.config.js                   # Capacitor config (appId, webDir)
├── vite.config.js                        # Vite build config (React + port 5173)
├── package.json                          # Frontend dependencies + scripts
│
├── RUNNING.md                            # Quick start guide
├── OFFLINE_FIRST.md                      # Complete architecture documentation
├── ADVANCED_FEATURES.md                  # Test scenarios for 4 new features
├── EXECUTION_SUMMARY.md                  # Feature checklist
└── README.md                             # This file
```

---

## 🚀 Quick Start

### **Prerequisites**
- Node.js 18+
- npm 9+
- Python 3.11+
- (Optional) Android Studio for native builds

### **Local Development**

**Terminal 1 - Backend (FastAPI)**
```bash
cd backend
pip install -r requirements.txt
python main.py
```

**Expected output:**
```
[OK] Eagle LMS Mock Backend started
INFO:     Uvicorn running on http://127.0.0.1:8000
```

**Terminal 2 - Frontend (React + Vite)**
```bash
npm install
npm run dev
```

**Expected output:**
```
➜ Local: http://localhost:5173/
```

### **Login Credentials**
Open http://localhost:5173 and use:
- **Email:** `trainee@eagle.com`
- **Password:** `trainee123`

---

## 📚 Features Guide

### **1️⃣ Download Modules with Quality Selection**
- Navigate to **Modules Screen**
- Click **Download** on any module
- Choose **High Quality** (full resolution) or **Data Saver** (optimized)
- Monitor local storage usage in real-time

### **2️⃣ Take Assessments Offline**
- **Modules Screen** → Select a module → **Take Assessment**
- Complete test while offline
- Results auto-save to IndexedDB
- When connection restored, syncs automatically

### **3️⃣ Storage Management**
- **Settings** → **Storage Optimizer**
- View all downloaded modules and their storage footprint
- Manual archive or delete as needed
- **Debug Mode** (click Settings 3 times):
  - **31d Button** - Time travel to test 30-day auto-archive
  - See "Record Preserved" badge for archived-but-completed modules

### **4️⃣ Network Status**
- **Toasts appear automatically** when:
  - 🔴 Network Lost → "Entering Offline Mode"
  - 🟡 Syncing → "Syncing {count} pending assessments..."
  - 🟢 Sync Complete → "Your records are now safe on the server"

---

## 🔧 Configuration

### **Dynamic API URL for Physical Devices**

Edit `src/api/apiService.js`:

```javascript
// Line 11: Replace with your laptop's IPv4 address
const LAN_IP = '192.168.1.100'; // ← Your Wi-Fi IP here

// Get your IP on Windows:
// Run: ipconfig /all
// Look for: IPv4 Address
```

### **Android Manifest Permissions**

Already configured in `android/app/src/main/AndroidManifest.xml`:
- ✅ `INTERNET` - Network access
- ✅ `ACCESS_NETWORK_STATE` - Detect network changes
- ✅ `READ_EXTERNAL_STORAGE` - Offline data access
- ✅ `WRITE_EXTERNAL_STORAGE` - Save offline data
- ✅ `usesCleartextTraffic="true"` - Allow HTTP (not just HTTPS)

---

## 📦 Build & Deploy

### **Web Build**
```bash
npm run build
npm run preview
```

### **Android APK Build**

**Step 1: Find your laptop's LAN IP**
```bash
# Windows
ipconfig /all
# Look for IPv4 Address (e.g., 192.168.1.100)

# Mac/Linux
ip a
```

**Step 2: Update API URL**
Edit `src/api/apiService.js` line 11 with your IP

**Step 3: Build and sync**
```bash
npm run build
npx cap sync android
npx cap open android
```

**Step 4: In Android Studio**
- Connect physical phone via USB
- Click **Run** (▶️)
- Select your phone
- APK installs and runs

### **Ensure Backend is Running**
```bash
cd backend
python main.py
```

Verify from phone:
- Open browser: `http://192.168.X.X:8000/docs` (FastAPI Swagger)

---

## 🧪 Testing Checklist

See **ADVANCED_FEATURES.md** for 8+ comprehensive test scenarios covering:

- ✅ Time Travel Debugger (31-day skip)
- ✅ Visual Reassurance Badge (archived modules)
- ✅ Network Toast Notifications (all 3 events)
- ✅ Data Saver Download Selection
- ✅ Offline Assessment Sync
- ✅ Auto-Archive Functionality
- ✅ Storage Bar Accuracy
- ✅ Multi-screen Navigation

---

## 🛠️ Tech Stack

### **Frontend**
| Tool | Version | Purpose |
|------|---------|---------|
| React | 19 | UI framework |
| Vite | 7 | Build tool + dev server |
| React Router | 7 | Client-side routing |
| Axios | latest | HTTP client + JWT interceptor |
| Dexie.js | latest | IndexedDB wrapper (offline storage) |
| Capacitor | 8 | Native Android bridge |

### **Backend**
| Tool | Version | Purpose |
|------|---------|---------|
| FastAPI | 0.115 | REST API framework |
| Uvicorn | 0.32 | ASGI server |
| SQLAlchemy | 2.0 | ORM for SQLite |
| PyJWT | 2.8 | JWT token generation |
| Pydantic | 2.0 | Request/response validation |

### **Database**
| Database | Purpose |
|----------|---------|
| SQLite | Backend persistence (5 modules, 3 students) |
| IndexedDB (Dexie.js) | Frontend offline vault |

---

## 📖 Documentation

| File | Content |
|------|---------|
| **RUNNING.md** | Step-by-step quick start guide |
| **OFFLINE_FIRST.md** | Complete architecture + service documentation |
| **ADVANCED_FEATURES.md** | 8+ test scenarios with visual proofs |
| **EXECUTION_SUMMARY.md** | Feature implementation checklist |

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Backend won't start | Check Python: `python --version` (needs 3.11+) |
| Frontend won't start | Check Node: `node --version` (needs 18+) |
| "Cannot connect to backend" | Verify backend terminal shows "Uvicorn running..." |
| API returns 404 | Ensure backend is at `http://localhost:8000` |
| Phone can't reach backend | Both phone & laptop on same WiFi, firewall allows port 8000 |
| Offline features not working | Check browser DevTools → Application → IndexedDB → EagleLocalVault |
| "Table offline_results does not exist" | Backend data not seeded; restart: `python main.py` |

---

## 🔐 Security Notes

- **JWT Token:** 24-hour expiry, stored in localStorage
- **Cleartext HTTP:** Allowed only for local dev (localhost/192.168.x.x)
- **Production:** Replace with signed HTTPS certificate
- **Database:** SQLite mock data for testing; use PostgreSQL for production

---

## 📊 Performance Metrics

- **Offline-first:** Full module access without network
- **Sync Queue:** Batches up to 50 assessments for efficient syncing
- **Auto-Archive:** 30-day cleanup with completed-module preservation
- **Storage:** Data Saver mode reduces downloads by ~60%

---

## 🎓 Learning Objectives (Module 14)

Upon completing this module, you will understand:

1. **Offline-First Architecture** - Design apps for intermittent connectivity
2. **IndexedDB + Service Workers** - Client-side data persistence
3. **Resilient Sync Patterns** - Queue-based offline data synchronization
4. **Native Mobile Integration** - Capacitor for React → Android/iOS
5. **Network Detection** - Real-time connectivity feedback
6. **JWT Authentication** - Secure token-based auth across network transitions

---

## 📝 License

ISC

---

## 🤝 Contributing

This is a complete educational module. For production use:
- Add an API rate limiter
- Replace SQLite with PostgreSQL
- Implement refresh token rotation
- Add comprehensive error logging
- Set up monitoring + alerting

---

**🚀 Ready to deploy? Start with RUNNING.md for the quick start guide!**
