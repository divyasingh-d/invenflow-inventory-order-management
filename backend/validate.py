"""Quick startup validation script - tests all imports and DB connectivity."""
import sys
import os

# Force UTF-8 output on Windows
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")

# Ensure we run from backend/ directory
os.chdir(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, ".")

print("=" * 60)
print("InvenFlow Backend - Startup Validation")
print("=" * 60)

# 1. Config
print("\n[1/6] Testing config import...")
try:
    from app.core.config import settings
    print(f"  DATABASE_URL : {settings.DATABASE_URL}")
    print(f"  DEBUG        : {settings.DEBUG}")
    print(f"  CORS origins : {settings.cors_origins}")
    print("  [OK] Config loaded successfully")
except Exception as e:
    print(f"  [FAIL] Config: {e}")
    sys.exit(1)

# 2. Database engine
print("\n[2/6] Testing database engine creation...")
try:
    from app.database import engine, Base
    print(f"  Engine dialect: {engine.dialect.name}")
    print(f"  Driver       : {engine.url.drivername}")
    print("  [OK] Engine created successfully")
except Exception as e:
    print(f"  [FAIL] Engine: {e}")
    sys.exit(1)

# 3. Models
print("\n[3/6] Testing model imports...")
try:
    from app.models.product import Product
    from app.models.customer import Customer
    from app.models.order import Order
    print("  [OK] All models imported successfully")
except Exception as e:
    print(f"  [FAIL] Models: {e}")
    sys.exit(1)

# 4. Create tables
print("\n[4/6] Creating/verifying database tables...")
try:
    from app.database import init_db
    init_db()
    print("  [OK] Tables created/verified successfully")
except Exception as e:
    print(f"  [FAIL] Table creation: {e}")
    sys.exit(1)

# 5. Test DB connection with a query
print("\n[5/6] Testing database connectivity...")
try:
    from sqlalchemy import text, inspect
    from app.database import SessionLocal
    with SessionLocal() as session:
        result = session.execute(text("SELECT 1")).fetchone()
        print(f"  SELECT 1 result: {result}")
    inspector = inspect(engine)
    tables = inspector.get_table_names()
    print(f"  Tables in DB: {tables}")
    print("  [OK] Database connectivity confirmed")
except Exception as e:
    print(f"  [FAIL] DB connectivity: {e}")
    sys.exit(1)

# 6. FastAPI app import
print("\n[6/6] Testing FastAPI app import and router registration...")
try:
    from app.main import app
    api_routes = [r.path for r in app.routes if hasattr(r, "path")]
    print(f"  Routes registered ({len(api_routes)}):")
    for r in api_routes:
        print(f"    {r}")
    print("  [OK] FastAPI app imported successfully")
except Exception as e:
    print(f"  [FAIL] FastAPI app: {e}")
    sys.exit(1)

print("\n" + "=" * 60)
print("ALL CHECKS PASSED - Backend is ready to start!")
print("")
print("To start the backend, run:")
print("  cd backend")
print("  python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000")
print("")
print("Swagger docs will be at: http://localhost:8000/docs")
print("Health check:            http://localhost:8000/health")
print("=" * 60)
