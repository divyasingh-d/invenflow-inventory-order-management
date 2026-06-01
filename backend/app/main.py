import logging
import logging.config
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from sqlalchemy.exc import SQLAlchemyError

from app.core.config import settings
from app.database import init_db
from app.routers import products, customers, orders, dashboard

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
    datefmt="%Y-%m-%dT%H:%M:%S",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan: startup and shutdown events."""
    logger.info("Starting up: Initializing database tables...")
    init_db()
    logger.info("Database initialization complete.")
    yield
    logger.info("Shutting down application.")


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="""
## Inventory & Order Management System API

A production-ready REST API for managing products, customers, and orders.

### Features
- **Product Management**: Full CRUD with unique SKU enforcement
- **Customer Management**: CRUD with unique email enforcement
- **Order Management**: Transaction-safe orders with automatic stock deduction
- **Dashboard**: Aggregated statistics for monitoring
    """,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan,
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Custom Exception Handlers
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = []
    for error in exc.errors():
        field = " -> ".join(str(loc) for loc in error["loc"])
        errors.append({"field": field, "message": error["msg"]})
    logger.warning(f"Validation error on {request.url}: {errors}")
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": "Validation failed", "errors": errors},
    )


@app.exception_handler(SQLAlchemyError)
async def sqlalchemy_exception_handler(request: Request, exc: SQLAlchemyError):
    logger.error(f"Database error on {request.url}: {exc}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "A database error occurred. Please try again."},
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unexpected error on {request.url}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An unexpected error occurred."},
    )


# Include Routers
app.include_router(products.router)
app.include_router(customers.router)
app.include_router(orders.router)
app.include_router(dashboard.router)


@app.get("/", tags=["Health"])
def root():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "docs": "/docs",
    }


@app.get("/health", tags=["Health"])
def health_check():
    """Detailed health check."""
    import traceback
    from app.database import SessionLocal
    db_status = "ok"
    db_error = None
    tables = []
    columns_info = {}
    try:
        from sqlalchemy import text, inspect
        from app.database import engine
        db = SessionLocal()
        db.execute(text("SELECT 1")).fetchone()
        
        inspector = inspect(engine)
        tables = inspector.get_table_names()
        
        for table in tables:
            columns_info[table] = [
                {"name": col["name"], "type": str(col["type"])}
                for col in inspector.get_columns(table)
            ]
        db.close()
    except Exception as e:
        db_status = "error"
        db_error = f"{type(e).__name__}: {str(e)}\n{traceback.format_exc()}"
        
    return {
        "status": "ok", 
        "version": settings.APP_VERSION,
        "database": db_status,
        "database_error": db_error,
        "tables": tables,
        "columns": columns_info
    }
