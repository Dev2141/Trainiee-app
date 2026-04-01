# Module 14: Offline-First Architecture & Storage Lifecycle

## 🏗️ Architecture Overview

This implementation enables the Eagle LMS app to function seamlessly offline using a resilient sync engine.

```
┌─────────────────────────────────┐
│  User Takes Assessment Offline   │
└────────────┬────────────────────┘
             │
             ▼
    ┌─────────────────────┐
    │ Check Network Status │
    └──────┬──────┬───────┘
      Online│     │Offline
           ▼     ▼
      [Server] [LocalVault]
           │     (Dexie.js)
           │     │
           │     ▼
           │   [sync_queue]
           │     (pending items)
           │     │
      ┌────┴─────┴─────┐
      │ Connection      │
      │ Restored        │
      ▼                 ▼
   [Sync Engine]  [Background Sync]
      │                 │
      └────────┬────────┘
               ▼
      [POST /api/sync/offline-results]
               │
        ┌──────┴──────┐
        ▼             ▼
    [Success]    [Retry Logic]
      │
      ▼
   [Delete from Queue]
```

---

## 📦 New Dependencies

```bash
npm install dexie @capacitor/network @capacitor/local-notifications
```

- **dexie**: IndexedDB wrapper for browser offline storage
- **@capacitor/network**: Native network status detection
- **@capacitor/local-notifications**: Native push notifications for inactivity alerts

---

## 🗂️ Files Created

### 1. **src/db/localVault.js** - Local Database
The encrypted local storage vault for all offline data.

**Stores:**
- `downloaded_modules` - Modules cached for offline access
- `sync_queue` - Queue of pending assessment submissions

**API:**
```javascript
// Downloaded Modules
await downloadedModulesStore.addModule(moduleData);
await downloadedModulesStore.getCachedModules();
await downloadedModulesStore.updateLastAccessed(moduleId);
await downloadedModulesStore.archiveModule(moduleId);
await downloadedModulesStore.getInactiveModules(dayThreshold);

// Sync Queue
await syncQueueStore.addToQueue(testData);
await syncQueueStore.getQueue(); // Only pending items
await syncQueueStore.removeFromQueue(id);
await syncQueueStore.getQueueStats();
```

---

### 2. **src/services/syncService.js** - Resilient Sync Engine

**Features:**
- 🌐 Network status listener using Capacitor
- 🔄 Automatic sync on connection restoration
- 📋 Queue management with retry logic
- ⏱️ 30-day inactivity archival
- 🔔 Local notifications at 25/28 days

**Usage:**
```javascript
import { syncService, autoArchiveService } from '../services/syncService';

// Initialize on app launch
useEffect(() => {
  await syncService.init((status, data) => {
    console.log('Sync status:', status); // 'idle', 'syncing', 'error'
    if (status === 'idle' && data?.successCount > 0) {
      showToast(`✓ Synced ${data.successCount} results`);
    }
  });

  // Run maintenance checks
  await autoArchiveService.runMaintenanceCheck();

  return () => syncService.destroy();
}, []);
```

---

### 3. **src/services/offlineAssessmentService.js** - Assessment Handler

Handles assessment submissions (online or offline).

**Usage:**
```javascript
import offlineAssessmentService from '../services/offlineAssessmentService';

const handleSubmitAssessment = async () => {
  const result = await offlineAssessmentService.submitAssessment({
    test_id: '123',
    trainee_id: '456',
    score: 85,
    total_marks: 100,
    percentage: 85,
    passed: true,
  });

  if (result.synced) {
    showToast('✓ Assessment submitted to server', 'success');
  } else if (result.queued) {
    showToast('✓ Saved offline - will sync later', 'warning');
  } else {
    showToast('✗ Error: ' + result.message, 'error');
  }
};
```

---

### 4. **src/components/OfflineAccessDashboard.jsx** - UI Component

Displays:
- 🌐 Network connectivity status
- 📥 Cached modules available offline
- ⏳ Pending sync queue stats
- ✅ Last access timestamps

---

## 🔄 Data Flow: Assessment Submission

### Scenario 1: User is Online
```
User clicks "Submit"
    ↓
offlineAssessmentService.submitAssessment()
    ↓
Network.getStatus() → connected: true
    ↓
POST /api/sync/offline-results
    ↓
200 OK
    ↓
showToast('✓ Assessment submitted')
```

### Scenario 2: User is Offline
```
User clicks "Submit"
    ↓
offlineAssessmentService.submitAssessment()
    ↓
Network.getStatus() → connected: false
    ↓
Save to sync_queue in IndexedDB
    ↓
showToast('✓ Saved offline - will sync later')
    ↓
[Later when connection restored]
    ↓
syncService listens for network change
    ↓
Automatically POST all queued items
    ↓
On 200 OK: Delete from queue
    ↓
showToast('✓ Synced 3 offline results')
```

---

## 📅 30-Day Inactivity Logic

**Formula:**
```
Time Since Last Access (Δ) = Current_Time() - last_accessed_at
Inactivity Threshold = 30 days = 2,592,000,000 milliseconds
```

**Timeline:**
| Day | Action |
|-----|--------|
| Day 0-24 | Module available offline |
| **Day 25** | 🔔 Notification: "Will archive in 5 days" |
| **Day 28** | 🔔 Notification: "Will archive in 2 days" |
| **Day 30+** | ⚙️ Auto-archive: `is_locally_cached = false` |

**Implementation:**
```javascript
// Run on app launch
await autoArchiveService.checkAndArchiveInactive(); // Archives modules >30 days
await autoArchiveService.checkAndNotifyNearInactivity(); // Notifications at 25/28 days

// Module is archived but completion records remain
// User can restore from Cloud Archive if needed
```

---

## 🎯 Integration Points

### In AssessmentDetailScreen (or wherever tests are submitted):

```jsx
import offlineAssessmentService from '../services/offlineAssessmentService';

export default function AssessmentDetailScreen() {
  const handleSubmit = async () => {
    const result = await offlineAssessmentService.submitAssessment({
      test_id: assessment.test_id,
      trainee_id: user.id,
      score: finalScore,
      total_marks: assessment.total_marks,
      percentage: (finalScore / assessment.total_marks) * 100,
      passed: (finalScore / assessment.total_marks) * 100 >= 70,
    });

    if (result.success) {
      showToast(result.message, result.synced ? 'success' : 'warning');
      onBack();
    } else {
      showToast('Error: ' + result.message, 'error');
    }
  };

  return (
    <div>
      {/* Assessment UI */}
      <button onClick={handleSubmit}>Submit Assessment</button>
    </div>
  );
}
```

### In App.jsx (Already Added):

```jsx
useEffect(() => {
  if (isAuthenticated) {
    // Initialize sync and archive services
    await autoArchiveService.runMaintenanceCheck();
    await syncService.init((status, data) => {
      setSyncStatus(status);
      if (status === 'idle' && data?.successCount > 0) {
        showToast(`✓ Synced ${data.successCount} offline results`);
      }
    });
  }
  return () => syncService.destroy();
}, [isAuthenticated]);
```

---

## 🔔 Notifications

Local notifications are triggered at 25 and 28 days of inactivity:

```javascript
await LocalNotifications.schedule({
  notifications: [
    {
      title: "Python Fundamentals inactive for 25 days",
      body: "Will be archived in 5 days if not accessed",
      id: 12345,
      schedule: { at: new Date(Date.now() + 1000) },
      smallIcon: 'icon',
      iconColor: '#2563EB',
    },
  ],
});
```

---

## 📊 Sync Queue Schema (Dexie.js)

```javascript
sync_queue table {
  ++id: number,                    // Auto-increment primary key
  test_id: string,                 // Reference to test
  trainee_id: string,              // Reference to user
  score: number,                   // Points scored
  total_marks: number,             // Total possible points
  percentage: number,              // (score/total_marks) * 100
  passed: boolean,                 // Score >= passing_percentage
  payload: string,                 // JSON stringified test data
  offline_timestamp: Date,         // When test was taken
  status: 'pending' | 'syncing' | 'failed',
  retry_count: number,             // Number of sync attempts
  last_error: string,              // Last error message
}

downloaded_modules table {
  ++id: number,
  module_id: string,
  title: string,
  quality: 'hq' | 'ds',
  size_mb: number,
  high_res_bytes: number,
  data_saver_bytes: number,
  is_locally_cached: boolean,      // ← KEY: true = offline available
  last_accessed_at: Date,          // ← Used for 30-day calculation
  downloaded_at: Date,
  archived_at: Date | null,
}
```

---

## ✅ Testing Checklist

- [ ] Take assessment offline, verify it saves to sync_queue
- [ ] Go online, verify automatic sync and removal from queue
- [ ] Check inbox at 25-day and 28-day marks for notifications
- [ ] Verify module archives after 30 days of inactivity
- [ ] Restore archived module from Cloud Archive
- [ ] Verify sync indicator appears during syncing
- [ ] Check OfflineAccessDashboard shows all cached modules
- [ ] Verify network status updates in real-time

---

## 🐛 Debugging

```javascript
// Check offline queue
const queue = await syncQueueStore.getQueue();
console.log('Pending items:', queue);

// Check cached modules
const modules = await downloadedModulesStore.getCachedModules();
console.log('Available offline:', modules);

// Check sync stats
const stats = await syncQueueStore.getQueueStats();
console.log('Sync stats:', stats);

// Manually trigger sync
await syncService.checkAndSyncQueue();

// Manually run archive check
await autoArchiveService.runMaintenanceCheck();
```

---

## 🚀 Performance Notes

- **IndexedDB** - Synchronous where possible; persists across app restarts
- **Network Listener** - Registered once per app session; minimal battery impact
- **Sync Engine** - Non-blocking; doesn't freeze UI during sync
- **Archive Check** - Runs once on app launch; ~O(n) complexity where n = num_modules

---

## 🔒 Security Considerations

- Dexie.js data is **not encrypted** by default (use Capacitor Secure Storage for sensitive data in production)
- JWT tokens are still used for API calls
- Local data persists after logout (consider clearing on logout if needed)

---

## 📚 References

- [Dexie.js Docs](https://dexie.org/)
- [Capacitor Network API](https://capacitorjs.com/docs/apis/network)
- [Capacitor Local Notifications](https://capacitorjs.com/docs/apis/local-notifications)

