import os
import uuid
import json
from pathlib import Path
from datetime import datetime, timedelta
from typing import List, Optional
import jwt
import secrets

from fastapi import FastAPI, HTTPException, Depends, status, Header
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, String, Integer, Float, DateTime, Boolean, ForeignKey, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session, relationship
from pydantic import BaseModel

# ==================== CONFIG ====================
# Use an absolute path so the DB is always found regardless of
# which directory the server is launched from.
_BASE_DIR = Path(__file__).resolve().parent
DATABASE_URL = f"sqlite:///{_BASE_DIR / 'eagle_lms.db'}"

# IMPORTANT: Load SECRET_KEY from environment variable so it stays
# stable across server restarts. Without this, every restart generates
# a new key and ALL existing JWT tokens become invalid → login fails.
# To set it permanently, add to your shell / .env:
#   set EAGLE_SECRET_KEY=your-very-long-random-string   (Windows)
#   export EAGLE_SECRET_KEY=your-very-long-random-string (Linux/Mac)
SECRET_KEY = os.environ.get(
    "EAGLE_SECRET_KEY",
    "eagle-lms-stable-secret-key-do-not-change-in-prod-2024"  # fixed fallback for dev
)
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours

# ==================== DATABASE SETUP ====================
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# ==================== SQLALCHEMY MODELS ====================
class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(String, nullable=False)  # trainer, trainee
    created_at = Column(DateTime, default=datetime.utcnow)

    test_attempts = relationship("TestAttempt", back_populates="trainee")


class Module(Base):
    __tablename__ = "modules"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    training_type = Column(String, nullable=False)  # self_paced, virtual, classroom
    duration_hours = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    materials = relationship("Material", back_populates="module", cascade="all, delete-orphan")
    tests = relationship("Test", back_populates="module", cascade="all, delete-orphan")


class Material(Base):
    __tablename__ = "materials"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    module_id = Column(String, ForeignKey("modules.id"), nullable=False)
    title = Column(String, nullable=False)
    file_type = Column(String, nullable=False)  # pdf, video, document, etc.
    description = Column(Text, nullable=False)
    high_res_url = Column(String, nullable=False)
    high_res_bytes = Column(Integer, nullable=False)
    data_saver_url = Column(String, nullable=False)
    data_saver_bytes = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    module = relationship("Module", back_populates="materials")


class Test(Base):
    __tablename__ = "tests"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    module_id = Column(String, ForeignKey("modules.id"), nullable=False)
    title = Column(String, nullable=False)
    total_marks = Column(Integer, default=100)
    passing_percentage = Column(Float, default=70.0)
    created_at = Column(DateTime, default=datetime.utcnow)

    module = relationship("Module", back_populates="tests")
    attempts = relationship("TestAttempt", back_populates="test", cascade="all, delete-orphan")


class TestAttempt(Base):
    __tablename__ = "test_attempts"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    test_id = Column(String, ForeignKey("tests.id"), nullable=False)
    trainee_id = Column(String, ForeignKey("users.id"), nullable=False)
    score = Column(Integer, nullable=False)
    total_marks = Column(Integer, nullable=False)
    percentage = Column(Float, nullable=False)
    passed = Column(Boolean, nullable=False)
    offline_timestamp = Column(DateTime, nullable=True)
    submitted_at = Column(DateTime, default=datetime.utcnow)

    test = relationship("Test", back_populates="attempts")
    trainee = relationship("User", back_populates="test_attempts")


# ==================== PYDANTIC MODELS ====================
class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: dict


class LoginRequest(BaseModel):
    email: str
    password: str


class MaterialResponse(BaseModel):
    id: str
    title: str
    file_type: str
    description: str
    high_res_url: str
    high_res_bytes: int
    data_saver_url: str
    data_saver_bytes: int


class ModuleResponse(BaseModel):
    id: str
    title: str
    description: str
    training_type: str
    duration_hours: int
    materials: List[MaterialResponse] = []


class DashboardResponse(BaseModel):
    message: str
    modules: List[ModuleResponse]


class OfflineTestAttempt(BaseModel):
    test_id: str
    trainee_id: str
    score: int
    total_marks: int
    percentage: float
    passed: bool
    offline_timestamp: datetime


class OfflineSyncRequest(BaseModel):
    attempts: List[OfflineTestAttempt]


# ==================== FASTAPI APP ====================
app = FastAPI(title="Eagle LMS Mock Backend", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create upload directory
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Mount static files
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# ==================== UTILITY FUNCTIONS ====================
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Create JWT token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def verify_token(token: str):
    """Verify JWT token"""
    try:
        # Strip 'Bearer ' prefix if present
        if token.startswith("Bearer "):
            token = token[7:]

        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return user_id
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")


def get_db():
    """Database session dependency"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_current_user(token: str = None, db: Session = Depends(get_db)):
    """Get current user from token"""
    if not token:
        raise HTTPException(status_code=401, detail="Missing token")

    user_id = verify_token(token)
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


# ==================== AUTH ENDPOINTS ====================
@app.post("/api/auth/login", response_model=TokenResponse)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    """Mock login endpoint"""
    user = db.query(User).filter(User.email == request.email).first()

    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if user.password_hash != request.password:  # In production: use bcrypt
        raise HTTPException(status_code=401, detail="Invalid credentials")

    access_token = create_access_token(data={"sub": user.id})

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user={
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role,
        }
    )


# ==================== DASHBOARD ENDPOINTS ====================
@app.get("/api/trainee/dashboard")
def get_dashboard(authorization: str = Header(None), db: Session = Depends(get_db)):
    """Get trainee dashboard with enrolled modules"""
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing authorization header")

    user_id = verify_token(authorization)

    modules = db.query(Module).all()

    module_responses = []
    for module in modules:
        materials = [
            MaterialResponse(
                id=m.id,
                title=m.title,
                file_type=m.file_type,
                description=m.description,
                high_res_url=m.high_res_url,
                high_res_bytes=m.high_res_bytes,
                data_saver_url=m.data_saver_url,
                data_saver_bytes=m.data_saver_bytes,
            )
            for m in module.materials
        ]

        module_responses.append(ModuleResponse(
            id=module.id,
            title=module.title,
            description=module.description,
            training_type=module.training_type,
            duration_hours=module.duration_hours,
            materials=materials,
        ))

    return DashboardResponse(
        message="Dashboard loaded successfully",
        modules=module_responses
    )


@app.get("/api/trainee/module/{module_id}")
def get_module_details(module_id: str, authorization: str = Header(None), db: Session = Depends(get_db)):
    """Get detailed module information with material byte sizes"""
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing authorization header")

    user_id = verify_token(authorization)

    module = db.query(Module).filter(Module.id == module_id).first()
    if not module:
        raise HTTPException(status_code=404, detail="Module not found")

    total_high_res = sum(m.high_res_bytes for m in module.materials)
    total_data_saver = sum(m.data_saver_bytes for m in module.materials)

    materials = [
        MaterialResponse(
            id=m.id,
            title=m.title,
            file_type=m.file_type,
            description=m.description,
            high_res_url=m.high_res_url,
            high_res_bytes=m.high_res_bytes,
            data_saver_url=m.data_saver_url,
            data_saver_bytes=m.data_saver_bytes,
        )
        for m in module.materials
    ]

    return {
        "id": module.id,
        "title": module.title,
        "description": module.description,
        "training_type": module.training_type,
        "duration_hours": module.duration_hours,
        "materials": materials,
        "storage_summary": {
            "total_high_res_bytes": total_high_res,
            "total_data_saver_bytes": total_data_saver,
            "high_res_mb": round(total_high_res / (1024 * 1024), 2),
            "data_saver_mb": round(total_data_saver / (1024 * 1024), 2),
        }
    }


# ==================== OFFLINE SYNC ENDPOINTS ====================
@app.post("/api/sync/offline-results")
def sync_offline_results(request: OfflineSyncRequest, authorization: str = Header(None), db: Session = Depends(get_db)):
    """Sync offline test results completed in dead zones"""
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing authorization header")

    user_id = verify_token(authorization)

    synced_attempts = []

    for attempt_data in request.attempts:
        # Verify test exists
        test = db.query(Test).filter(Test.id == attempt_data.test_id).first()
        if not test:
            continue

        # Verify trainee exists
        trainee = db.query(User).filter(User.id == attempt_data.trainee_id).first()
        if not trainee:
            continue

        # Create test attempt record
        test_attempt = TestAttempt(
            test_id=attempt_data.test_id,
            trainee_id=attempt_data.trainee_id,
            score=attempt_data.score,
            total_marks=attempt_data.total_marks,
            percentage=attempt_data.percentage,
            passed=attempt_data.passed,
            offline_timestamp=attempt_data.offline_timestamp,
            submitted_at=datetime.utcnow(),
        )

        db.add(test_attempt)
        synced_attempts.append({
            "id": test_attempt.id,
            "test_id": test_attempt.test_id,
            "trainee_id": test_attempt.trainee_id,
            "score": test_attempt.score,
            "passed": test_attempt.passed,
            "offline_timestamp": test_attempt.offline_timestamp,
        })

    db.commit()

    return {
        "message": f"Successfully synced {len(synced_attempts)} offline results",
        "synced_attempts": synced_attempts
    }


# ==================== RESULTS ENDPOINTS ====================
@app.get("/api/trainee/results")
def get_trainee_results(authorization: str = Header(None), db: Session = Depends(get_db)):
    """Get all test attempt results for the authenticated trainee"""
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing authorization header")

    user_id = verify_token(authorization)

    # Join TestAttempt -> Test -> Module to get module name
    attempts = (
        db.query(TestAttempt, Test, Module)
        .join(Test, TestAttempt.test_id == Test.id)
        .join(Module, Test.module_id == Module.id)
        .filter(TestAttempt.trainee_id == user_id)
        .order_by(TestAttempt.submitted_at.desc())
        .all()
    )

    results = []
    for attempt, test, module in attempts:
        results.append({
            "id": attempt.id,
            "test_id": attempt.test_id,
            "module_id": module.id,
            "moduleName": module.title,
            "testName": test.title,
            "score": attempt.score,
            "total_marks": attempt.total_marks,
            "percentageScore": round(attempt.percentage, 1),
            "passed": attempt.passed,
            "syncStatus": "synced" if attempt.offline_timestamp is None else "local",
            "completedAt": attempt.submitted_at.isoformat() if attempt.submitted_at else None,
            "offlineTimestamp": attempt.offline_timestamp.isoformat() if attempt.offline_timestamp else None,
        })

    return {"results": results}


# ==================== FILE SERVING ENDPOINTS ====================
@app.get("/uploads/{filename}")
def serve_file(filename: str):
    """Serve static dummy files for testing downloads"""
    file_path = os.path.join(UPLOAD_DIR, filename)

    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")

    return FileResponse(file_path)


# ==================== SEED DATA ====================
def seed_data():
    """Populate database with initial test data"""
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # Check if data already exists
    if db.query(User).first():
        print("Database already seeded. Skipping...")
        db.close()
        return

    # Create users
    trainer = User(
        id=str(uuid.uuid4()),
        name="John Trainer",
        email="trainer@eagle.com",
        password_hash="trainer123",
        role="trainer"
    )

    trainee = User(
        id=str(uuid.uuid4()),
        name="Jane Trainee",
        email="trainee@eagle.com",
        password_hash="trainee123",
        role="trainee"
    )

    db.add(trainer)
    db.add(trainee)
    db.flush()

    # Create modules with materials
    modules_data = [
        {
            "title": "Python Fundamentals",
            "description": "Learn the basics of Python programming",
            "training_type": "self_paced",
            "duration_hours": 20,
            "materials_count": 5,
        },
        {
            "title": "Data Science Essentials",
            "description": "Introduction to data science and analytics",
            "training_type": "virtual",
            "duration_hours": 30,
            "materials_count": 6,
        },
        {
            "title": "Web Development with Django",
            "description": "Build web applications using Django framework",
            "training_type": "classroom",
            "duration_hours": 40,
            "materials_count": 8,
        },
        {
            "title": "Cloud Computing 101",
            "description": "Understanding cloud platforms and services",
            "training_type": "self_paced",
            "duration_hours": 25,
            "materials_count": 7,
        },
        {
            "title": "Machine Learning Advanced",
            "description": "Advanced ML concepts and implementations",
            "training_type": "virtual",
            "duration_hours": 35,
            "materials_count": 6,
        },
    ]

    for mod_data in modules_data:
        module = Module(
            id=str(uuid.uuid4()),
            title=mod_data["title"],
            description=mod_data["description"],
            training_type=mod_data["training_type"],
            duration_hours=mod_data["duration_hours"],
        )
        db.add(module)
        db.flush()

        # Create materials for each module
        file_types = ["pdf", "video", "document", "image", "dataset"]
        for i in range(mod_data["materials_count"]):
            file_type = file_types[i % len(file_types)]

            # Realistic file sizes
            high_res_bytes = (100 + i * 20) * 1024 * 1024  # 100MB-300MB
            data_saver_bytes = (20 + i * 5) * 1024 * 1024  # 20MB-50MB

            material = Material(
                id=str(uuid.uuid4()),
                module_id=module.id,
                title=f"{mod_data['title']} - {file_type.upper()} {i+1}",
                file_type=file_type,
                description=f"Learning material {i+1} for {mod_data['title']}",
                high_res_url=f"/uploads/sample_{module.id}_{i}_hd.{file_type}",
                high_res_bytes=high_res_bytes,
                data_saver_url=f"/uploads/sample_{module.id}_{i}_sd.{file_type}",
                data_saver_bytes=data_saver_bytes,
            )
            db.add(material)

        # Create test for module
        test = Test(
            id=str(uuid.uuid4()),
            module_id=module.id,
            title=f"{mod_data['title']} - Assessment",
            total_marks=100,
            passing_percentage=70.0,
        )
        db.add(test)
        db.flush()

        # Create sample test attempt
        test_attempt = TestAttempt(
            id=str(uuid.uuid4()),
            test_id=test.id,
            trainee_id=trainee.id,
            score=85,
            total_marks=100,
            percentage=85.0,
            passed=True,
            offline_timestamp=datetime.utcnow() - timedelta(days=1),
            submitted_at=datetime.utcnow(),
        )
        db.add(test_attempt)

    db.commit()
    db.close()
    print("[OK] Database seeded successfully!")


# ==================== STARTUP & SHUTDOWN ====================
@app.on_event("startup")
def startup():
    """Initialize database on startup"""
    seed_data()
    print("[OK] Eagle LMS Mock Backend started")


@app.get("/health")
def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "Eagle LMS Mock Backend",
        "database": str(_BASE_DIR / 'eagle_lms.db'),
        "timestamp": datetime.utcnow().isoformat()
    }


@app.get("/api/debug/users")
def list_users(db: Session = Depends(get_db)):
    """DEBUG: List all users in the database (remove before production)"""
    users = db.query(User).all()
    return [
        {"email": u.email, "role": u.role, "name": u.name, "password": u.password_hash}
        for u in users
    ]


# ==================== MAIN ====================
if __name__ == "__main__":
    import uvicorn

    print("\n" + "="*60)
    print("[*] Starting Eagle LMS Mock Backend")
    print("="*60)
    print(f"[*] Database: {DATABASE_URL}")
    print(f"[*] Secret Key: {SECRET_KEY[:20]}...")
    print(f"[*] Server: http://0.0.0.0:8000")
    print(f"[*] Docs: http://localhost:8000/docs")
    print("="*60 + "\n")

    uvicorn.run(app, host="0.0.0.0", port=8000)
