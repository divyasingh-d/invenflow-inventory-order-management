# Backend Dockerfile — production-ready, lightweight Python slim image
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies needed for psycopg2-binary
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy and install Python dependencies first (for layer caching)
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

# Copy application source code
COPY ./app ./app

# Create non-root user for security
RUN addgroup --system appgroup && adduser --system --ingroup appgroup appuser
USER appuser

# Expose default port (Render uses $PORT env var, which overrides this via CMD)
EXPOSE 8000

# Health check — uses $PORT if set, falls back to 8000
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
    CMD curl -f http://localhost:${PORT:-8000}/health || exit 1

# Start command — Render injects $PORT, so we use shell form to expand it
# Single worker on free tier to stay within memory limits
CMD uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000} --workers 1
