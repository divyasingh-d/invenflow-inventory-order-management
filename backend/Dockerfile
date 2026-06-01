# InvenFlow Backend — Production Dockerfile
# Optimized for Render.com free tier
FROM python:3.11-slim

WORKDIR /app

# System deps: gcc + libpq for psycopg2, curl for healthcheck
RUN apt-get update \
    && apt-get install -y --no-install-recommends gcc libpq-dev curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies (cached layer)
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

# Copy app source
COPY ./app ./app

# Non-root user
RUN groupadd --system appgroup && useradd --system --gid appgroup appuser
USER appuser

EXPOSE 8000

# Shell form so $PORT env var is expanded at runtime (Render injects PORT)
CMD uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000} --workers 1
