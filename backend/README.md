# Eagle LMS Mock Backend

A FastAPI-based mock backend for testing Module 14: Intelligent Offline Functionality & Storage Management for a Training & Reporting System.

## Features

✅ **SQLite Database** - Local SQLAlchemy models for portability
✅ **Mock JWT Authentication** - HS256 token-based auth
✅ **Complete Schema** - Users, Modules, Materials, Tests, TestAttempts
✅ **Realistic Storage Data** - High-res (100-300MB) and data-saver (20-50MB) files
✅ **Offline Sync API** - Persist offline test attempts
✅ **Auto-seeding** - 5 training modules with materials on startup
✅ **CORS Enabled** - Ready for mobile/frontend integration

## Setup

### 1. Install Python Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Run the Server

```bash
python main.py
```

Expected output:
```
============================================================
🚀 Starting Eagle LMS Mock Backend
============================================================
📍 Database: sqlite:///./eagle_lms.db
🔑 Secret Key: ...
🌐 Server: http://0.0.0.0:8000
📖 Docs: http://localhost:8000/docs
============================================================
```

## Database Schema

### Users
- `id` (UUID)
- `name` (String)
- `email` (String, unique)
- `password_hash` (String)
- `role` (String: trainer/trainee)
- `created_at` (DateTime)

### Modules
- `id` (UUID)
- `title` (String)
- `description` (Text)
- `training_type` (String: self_paced/virtual/classroom)
- `duration_hours` (Integer)
- `created_at` (DateTime)

### Materials
- `id` (UUID)
- `module_id` (FK)
- `title` (String)
- `file_type` (String: pdf/video/document/etc)
- `description` (Text)
- `high_res_url` (String)
- `high_res_bytes` (Integer) - 100-300MB
- `data_saver_url` (String)
- `data_saver_bytes` (Integer) - 20-50MB
- `created_at` (DateTime)

### TestAttempts
- `id` (UUID)
- `test_id` (FK)
- `trainee_id` (FK to Users)
- `score` (Integer)
- `total_marks` (Integer)
- `percentage` (Float)
- `passed` (Boolean)
- `offline_timestamp` (DateTime) - When completed offline
- `submitted_at` (DateTime) - When synced to server

## API Endpoints

### Authentication

**POST /api/auth/login**
```json
{
  "email": "trainee@eagle.com",
  "password": "trainee123"
}
```

Response:
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "token_type": "bearer",
  "user": {
    "id": "uuid",
    "name": "Jane Trainee",
    "email": "trainee@eagle.com",
    "role": "trainee"
  }
}
```

### Dashboard

**GET /api/trainee/dashboard?token={token}**

Returns list of enrolled modules with materials.

### Module Details

**GET /api/trainee/module/{module_id}?token={token}**

Includes storage summary:
```json
{
  "storage_summary": {
    "total_high_res_bytes": 1258291200,
    "total_data_saver_bytes": 251658240,
    "high_res_mb": 1200.0,
    "data_saver_mb": 240.0
  }
}
```

### Offline Sync

**POST /api/sync/offline-results?token={token}**
```json
{
  "attempts": [
    {
      "test_id": "uuid",
      "trainee_id": "uuid",
      "score": 85,
      "total_marks": 100,
      "percentage": 85.0,
      "passed": true,
      "offline_timestamp": "2024-03-20T10:30:00"
    }
  ]
}
```

### File Serving

**GET /uploads/{filename}**

Serves static files for download testing.

## Test Credentials

| Email | Password | Role |
|-------|----------|------|
| trainer@eagle.com | trainer123 | trainer |
| trainee@eagle.com | trainee123 | trainee |

## Seeded Data

On startup, the backend automatically creates:

- ✅ 5 Training Modules
  - Python Fundamentals (self_paced)
  - Data Science Essentials (virtual)
  - Web Development with Django (classroom)
  - Cloud Computing 101 (self_paced)
  - Machine Learning Advanced (virtual)

- ✅ 5-8 Materials per module with realistic byte sizes
- ✅ 1 Test per module
- ✅ Sample test attempts for record

## Interactive Documentation

Once running, access Swagger UI at: **http://localhost:8000/docs**

## Database File

Location: `backend/eagle_lms.db`

To reset, delete this file and restart the server.

## Troubleshooting

**Port 8000 already in use?**
```bash
python main.py --port 8001
```

**Import errors?**
```bash
pip install --upgrade -r requirements.txt
```

**Database locked?**
Delete `backend/eagle_lms.db` and restart.

---

**Built for Module 14: Intelligent Offline Functionality & Storage Management**
