# 🚀 Module 14: Complete Execution & Testing Guide

## ✅ Implementation Status: ALL 4 FEATURES COMPLETED

### **Feature 1: Time Travel Debugger** ✅
- **File:** `src/screens/StorageManagerScreen.jsx` (lines 174-189, 236-259)
- **Status:** Implemented and ready
- **How it works:**
  - Click ⚡ (lightning bolt) in Storage Optimizer header to enable Debug Mode
  - Shows "31d" button on each cached module
  - Click "31d" → module archives instantly for testing without waiting 31 days

### **Feature 2: Visual Reassurance Badge** ✅
- **File:** `src/screens/StorageManagerScreen.jsx` (lines 281-303)
- **Status:** Implemented and ready
- **How it works:**
  - When a module is archived AND passed (passed === true)
  - Shows green "✅ Record Preserved" badge on archived modules
  - Proves user's study data is safe even though file was deleted

### **Feature 3: Network Toast Notifications** ✅
- **Files:**
  - `src/App.jsx` (lines 57-65)
  - `src/services/syncService.js` (lines 30-62, 154-161)
- **Status:** Implemented and ready
- **How it works:**
  - Disconnect network → ⚠️ "Network Lost: Entering Offline Mode" (Amber)
  - Reconnect network → ℹ️ "Network Restored: Syncing X pending..." (Blue)
  - Sync complete → ✅ "Sync Complete: Records safe on server" (Green)

### **Feature 4: Data Saver Logic** ✅
- **Files:**
  - `src/screens/ModulesScreen.jsx` (lines 99-121)
  - `src/components/DownloadQualitySelector.jsx`
- **Status:** Implemented and ready
- **How it works:**
  - When downloading, user selects quality: High Quality or Data Saver
  - High Quality: ~245 MB (high_res_bytes)
  - Data Saver: ~82 MB (data_saver_bytes)
  - Toast shows: "✓ Downloaded in [Quality] ([Size]MB)"
  - Both byte counts stored in IndexedDB for proof

---

## 🎯 Quick Start (Execution Steps)

### **Step 1: Open Terminal 1 - Backend**

```powershell
cd "c:\Users\padha\Desktop\tt\frontend_design - Copy\backend"
python main.py
```

**Wait for output:**
```
[*] Starting Eagle LMS Mock Backend
[*] Server: http://0.0.0.0:8000
[OK] Eagle LMS Mock Backend started
```

✅ Backend ready on port 8000.

---

### **Step 2: Open Terminal 2 (New Window) - Frontend**

```powershell
cd "c:\Users\padha\Desktop\tt\frontend_design - Copy"
npm run dev
```

**Wait for output:**
```
➜ Local: http://localhost:5173/
```

✅ Frontend ready on port 5173.

---

### **Step 3: Open Browser**

Navigate to: **http://localhost:5173**

### **Step 4: Login**
Use credentials:
- **Email:** `trainee@eagle.com`
- **Password:** `trainee123`

---

## 🧪 Testing All 4 Features

### **Test 1: Time Travel Debugger (5 min)**

1. Go to **Settings** → **Storage Optimizer**
2. Click ⚡ lightning bolt (top-right) to enable Debug Mode
3. Download a module from **Modules** tab first
4. Return to Storage Optimizer
5. Find cached module under "Active Downloads"
6. Click "31d" button
7. **Expected:** Module moves to "Cloud Archive" instantly

**Evidence of working:**
- Storage bar decreases
- Toast: "⏱️ Time traveled 31 days - Module auto-archived for testing"
- Module no longer in "Active Downloads"

---

### **Test 2: Visual Reassurance Badge (3 min)**

Prerequisites: Module must be archived (use Time Travel)

1. Go to **Settings** → **Storage Optimizer**
2. Scroll to **"Cloud Archive"** section
3. Look for green badge on archived module
4. **Expected:** Green badge shows "✅ Record Preserved"

**Visual proof:**
```
Archived Module Card:
┌──────────────────────────────────┐
│ Python Fundamentals              │
│                 ✅ Record Preserved
│ Quality: Data Saver. Last: Jan 15│
│ [RESTORE BUTTON]                 │
└──────────────────────────────────┘
```

---

### **Test 3: Network Disconnect Toast (2 min)**

1. Keep app open on any screen
2. Open DevTools: Press **F12** → **Network** tab
3. Click dropdown: **"No throttling"** → Select **"Offline"**
4. Wait 1-2 seconds

**Expected:** Toast appears (top of screen):
```
⚠️ Amber/Warning colored
"Network Lost: Entering Offline Mode - All work will be saved locally."
```

---

### **Test 4: Network Reconnect Toast (3 min)**

Prerequisites: Must have just gone offline (Test 3)

1. While offline, navigate to "Modules" or "Results" (simulate some action)
2. Go back to DevTools Network tab
3. Click **"Offline"** → Select **"No throttling"** (reconnect)
4. Wait 2-3 seconds

**Expected:** Sequential toasts appear:

```
Toast 1 (Blue/Info):
"Network Restored: Syncing X pending assessment..."

Syncing indicator appears (pulsing dot top-right: "Syncing...")

Toast 2 (Green/Success):
"Sync Complete: Your records are now safe on the server."
```

---

### **Test 5: Data Saver Download (High Quality) (5 min)**

1. Go to **Modules** tab
2. In "Server Library" section, find any module
3. Click **"Download"** button
4. Quality selector appears
5. Select **"High Quality"**
6. Wait for download animation to complete

**Expected:**
```
Toast (Green/Success):
"✓ Downloaded in High Quality (~245MB)"

Module appears in "Offline Access" section
Storage bar increases by ~245 MB
```

---

### **Test 6: Data Saver Download (Bandwidth Optimized) (5 min)**

1. Go to **Modules** tab
2. Find a different module
3. Click **"Download"** button
4. Select **"Data Saver Mode"**
5. Wait for download animation

**Expected:**
```
Toast (Green/Success):
"✓ Downloaded in Data Saver Mode (~82MB) - Bandwidth Optimized"

Module appears in "Offline Access" section
Storage bar increases by ~82 MB (NOT 245)
```

**Comparison Proof:**
```
Module A (HQ):    245 MB
Module B (DS):     82 MB
────────────────────────
Bandwidth Saved:   163 MB (67% reduction!)
```

---

### **Test 7: Verify IndexedDB Byte Counts (5 min)**

1. Download a module in Data Saver mode (from Test 6)
2. Open DevTools: **F12** → **Application** tab
3. Expand: **IndexedDB** → **EagleLocalVault** → **downloaded_modules**
4. Find your downloaded module (click to inspect)

**Expected to see:**
```
Row 1: title = "Python Fundamentals"
Row 2: quality = "ds" (Data Saver selected)
Row 3: size_mb = 82
Row 4: high_res_bytes = 256000000 (245 MB - stored for reference)
Row 5: data_saver_bytes = 85000000 (82 MB - what was downloaded)
```

---

### **Test 8: Complete Offline → Archive → Restore Flow (10 min)**

**Scenario:** Prove the entire workflow without losing data

1. **Step A - Download Module:**
   - Go to **Modules** → Download a module in **Data Saver** mode (82 MB)
   - Storage bar shows: **82 MB**
   - Module in "Offline Access"

2. **Step B - Enable Debug & Time Travel:**
   - Go to **Settings** → **Storage Optimizer**
   - Click ⚡ to enable Debug Mode
   - Click "31d" on the cached module
   - Module moves to "Cloud Archive"
   - Storage bar shows: **0 MB** (file deleted)
   - Green "✅ Record Preserved" badge visible

3. **Step C - Restore Module:**
   - Click **"Restore"** button on archived module
   - Quality widget appears
   - Select same quality
   - Module returns to "Offline Access"
   - Storage bar shows: **82 MB** again
   - No data lost ✓

**Complete flow proves:**
- ✅ Archive works (frees storage)
- ✅ Data is preserved (badge + restore works)
- ✅ Quality metadata retained (restore knows original quality)

---

## 📊 Complete Testing Checklist

| # | Test | Expected Behavior | Status |
|---|------|-------------------|--------|
| 1 | Debug Mode Toggle | ⚡ button turns blue | ☐ |
| 2 | Time Travel 31d | Module moves to archive, storage ↓ | ☐ |
| 3 | Record Preserved Badge | Green ✅ badge on archived | ☐ |
| 4 | Network Disconnect | ⚠️ Amber toast appears | ☐ |
| 5 | Network Reconnect | ℹ️ Blue "Syncing..." toast | ☐ |
| 6 | Sync Complete | ✅ Green "Safe on server" toast | ☐ |
| 7 | HQ Download | Toast: "245MB", storage ↑ | ☐ |
| 8 | Data Saver Download | Toast: "82MB", storage ↑ | ☐ |
| 9 | IndexedDB Bytes | quality + size_mb match | ☐ |
| 10 | Archive → Restore | Data preserved, no loss | ☐ |

---

## 🔍 Debugging Commands (Browser Console)

If any feature isn't working, check these in DevTools console (F12):

```javascript
// Check downloaded modules
import { downloadedModulesStore } from './src/db/localVault.js';
const modules = await downloadedModulesStore.getAllModules();
console.log('Downloaded modules:', modules);

// Check sync queue
import { syncQueueStore } from './src/db/localVault.js';
const queue = await syncQueueStore.getQueue();
console.log('Pending syncs:', queue);

// Check network status
import { Network } from '@capacitor/network';
const status = await Network.getStatus();
console.log('Network:', status);

// Check archive status
const inactive = await downloadedModulesStore.getInactiveModules(30);
console.log('Inactive (>30d):', inactive);
```

---

## ⚠️ Troubleshooting

| Issue | Solution |
|-------|----------|
| Backend won't start | Port 8000 in use. Kill it: `netstat -ano \| findstr :8000`, then `taskkill /PID [PID]` |
| Frontend won't start | Port 5173 in use. Restart terminal or kill process |
| Toast not appearing | Check DevTools Console (F12) for errors |
| Network events not firing | Ensure you use DevTools Network throttling, not actual offline |
| Storage bar didn't update | Refresh page or go to different tab and back |
| Archive button missing | Download a module first, then go to Storage Optimizer |

---

## ✅ SUCCESS CRITERIA

All 4 features are working when you can:

1. ✅ **Time Travel:** Click "31d" and see module archive instantly
2. ✅ **Reassurance:** See green "Record Preserved" badge on archived data
3. ✅ **Network Toasts:** See 3-event toast sequence when toggling offline
4. ✅ **Data Saver:** Download same module twice with different quality, see different sizes

**All tests passing = Module 14 complete!** 🎉

---

## 📝 Notes

- All implementations follow online-first patterns (Dexie.js, Capacitor, FastAPI)
- Features are production-ready and can be deployed
- Database is auto-seeded on startup with 5 sample modules
- JWT tokens expire after 24 hours
- All timestamps use UTC (datetime.utcnow())
