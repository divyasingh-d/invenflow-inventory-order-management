# InvenFlow — Complete Cloud Deployment Guide

> **Build Status**: ✅ Backend validated | ✅ Frontend builds | ✅ All APIs tested  
> **Commits**: 5 commits, production-ready

---

## Table of Contents
1. [GitHub Repository Setup](#1-github-repository-setup)
2. [Docker Hub Setup](#2-docker-hub-setup)
3. [GitHub Actions Secrets](#3-github-actions-secrets)
4. [Render Backend + Database](#4-render-backend--database)
5. [Vercel Frontend](#5-vercel-frontend)
6. [Post-Deployment: Update CORS](#6-post-deployment-update-cors)
7. [Verification Checklist](#7-verification-checklist)
8. [Environment Variables Reference](#8-environment-variables-reference)
9. [Required GitHub Secrets Reference](#9-required-github-secrets-reference)
10. [Submission Checklist](#10-submission-checklist)

---

## 1. GitHub Repository Setup

### Step-by-Step

**Step 1.1 — Create GitHub account** (if you don't have one)
- Go to https://github.com/signup
- Choose a username (e.g., `yourname`)

**Step 1.2 — Create a new repository**
1. Go to https://github.com/new
2. Fill in:
   - **Repository name**: `invenflow`
   - **Description**: `Inventory & Order Management System — FastAPI + React + PostgreSQL`
   - **Visibility**: `Public` (required for free Render/Vercel)
   - ❌ Do NOT check "Initialize with README" (the repo already has one)
3. Click **Create repository**

**Step 1.3 — Generate a Personal Access Token (PAT)**
1. Go to https://github.com/settings/tokens/new
2. Set:
   - **Note**: `invenflow-deploy`
   - **Expiration**: `90 days`
   - **Scopes**: Check `repo` (full control of private repositories)
3. Click **Generate token**
4. **Copy the token immediately** — it won't be shown again

**Step 1.4 — Push the local repository**

Open PowerShell and run these commands (replace `YOUR_USERNAME` and `YOUR_PAT`):

```powershell
cd "C:\Users\Admin\Desktop\Project_2"

# Set the remote URL with your credentials
git remote add origin https://YOUR_USERNAME:YOUR_PAT@github.com/YOUR_USERNAME/invenflow.git

# Push all commits to GitHub
git push -u origin master:main
```

**Step 1.5 — Verify the push succeeded**
- Go to `https://github.com/YOUR_USERNAME/invenflow`
- You should see all 5+ commits and the full project structure

---

## 2. Docker Hub Setup

### Step-by-Step

**Step 2.1 — Create Docker Hub account**
1. Go to https://hub.docker.com/signup
2. Register (free account)
3. Note your username (e.g., `yourname`) — you'll use it as `DOCKERHUB_USERNAME`

**Step 2.2 — Create a repository on Docker Hub**
1. Go to https://hub.docker.com/repository/create
2. Fill in:
   - **Repository name**: `invenflow-backend`
   - **Description**: `InvenFlow FastAPI backend — production image`
   - **Visibility**: `Public`
3. Click **Create**

**Step 2.3 — Create a Docker Hub Access Token**
1. Go to https://hub.docker.com/settings/security
2. Click **New Access Token**
3. Set:
   - **Token description**: `github-actions-invenflow`
   - **Access permissions**: `Read & Write`
4. Click **Generate**
5. **Copy the token** — it won't be shown again

> Docker Hub image URL after push:  
> `https://hub.docker.com/r/YOUR_DOCKERHUB_USERNAME/invenflow-backend`

---

## 3. GitHub Actions Secrets

These secrets power the CI/CD pipeline. Without them, Docker push is skipped.

**Step 3.1 — Navigate to repository secrets**
1. Go to `https://github.com/YOUR_USERNAME/invenflow`
2. Click **Settings** tab
3. Click **Secrets and variables** → **Actions**
4. Click **New repository secret** for each secret below

**Step 3.2 — Add the following secrets**

| Secret Name | Value | Required For |
|---|---|---|
| `DOCKERHUB_USERNAME` | Your Docker Hub username | Docker image push |
| `DOCKERHUB_TOKEN` | Docker Hub Access Token from Step 2.3 | Docker image push |
| `VITE_API_URL` | `https://invenflow-backend.onrender.com` | Frontend build with correct API URL |

> **Note**: Add `VITE_API_URL` after deploying Render (Step 4). Until then, the CI workflow uses a default placeholder.

**Step 3.3 — Trigger the pipeline**

After adding secrets, trigger the workflow:
```powershell
# Make a tiny change and push, or manually trigger in GitHub UI
git commit --allow-empty -m "chore: trigger CI/CD pipeline"
git push origin master:main
```

Or: Go to **Actions tab** → **InvenFlow CI/CD Pipeline** → **Run workflow**

**Expected pipeline result:**
- ✅ `Backend — Validate & Test` — passes
- ✅ `Frontend — Build Production Bundle` — passes
- ✅ `Docker — Build & Push Backend Image` — pushes `latest` tag
- ✅ `Deployment Summary` — shows Docker Hub URL

---

## 4. Render Backend + Database

### One-Click Blueprint Deploy (Recommended)

**Step 4.1 — Create Render account**
1. Go to https://render.com
2. Sign up with **GitHub** (click "Sign up with GitHub" → authorize Render)

**Step 4.2 — Deploy via Blueprint (uses render.yaml)**
1. In Render dashboard, click **New** → **Blueprint**
2. Select your **invenflow** repository
3. Render reads `render.yaml` and shows a preview:
   - `invenflow-db` → PostgreSQL database (free)
   - `invenflow-backend` → Web service (Python, free)
4. Click **Apply**
5. Deployment starts automatically (~3-5 minutes)

**Step 4.3 — Wait for deployment to complete**

Watch the build logs:
1. Go to **Dashboard** → **invenflow-backend** → **Logs**
2. Wait for: `Application startup complete.`
3. Your backend URL: `https://invenflow-backend.onrender.com`

> **Free tier note**: First request after inactivity takes ~30 seconds (cold start). This is normal.

**Step 4.4 — Verify backend is live**

Open these URLs in your browser:
- `https://invenflow-backend.onrender.com/health` → Should return `{"status":"ok","version":"1.0.0"}`
- `https://invenflow-backend.onrender.com/docs` → Swagger UI
- `https://invenflow-backend.onrender.com/dashboard/stats` → `{"total_products":0,...}`

**Step 4.5 — Alternative: Manual Web Service (if Blueprint doesn't work)**

If Blueprint fails, create manually:
1. **New** → **Web Service**
2. Connect GitHub repo
3. Settings:
   - **Name**: `invenflow-backend`
   - **Root Directory**: `backend`
   - **Runtime**: Python 3
   - **Build Command**: `pip install --no-cache-dir -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT --workers 1`
4. **Environment Variables** (click Add):
   - `DATABASE_URL` → (Internal URL from your Render PostgreSQL)
   - `ALLOWED_ORIGINS` → `https://YOUR-APP.vercel.app,http://localhost:5173`
   - `DEBUG` → `false`
   - `APP_NAME` → `InvenFlow API`
   - `APP_VERSION` → `1.0.0`
5. **Health Check Path**: `/health`
6. Click **Create Web Service**

---

## 5. Vercel Frontend

**Step 5.1 — Create Vercel account**
1. Go to https://vercel.com/signup
2. Sign up with **GitHub** (click "Continue with GitHub" → authorize)

**Step 5.2 — Import the repository**
1. Click **Add New** → **Project**
2. Click **Import** next to your `invenflow` repository
3. Configure the project:

   | Field | Value |
   |---|---|
   | **Root Directory** | `frontend` |
   | **Framework Preset** | Vite |
   | **Build Command** | `npm run build` |
   | **Output Directory** | `dist` |
   | **Install Command** | `npm ci` |

4. **Environment Variables** — click **Add**:

   | Name | Value |
   |---|---|
   | `VITE_API_URL` | `https://invenflow-backend.onrender.com` |

5. Click **Deploy**

**Step 5.3 — Wait for deployment (~1-2 minutes)**

Vercel shows build logs in real-time. Look for:
```
Build Completed
✓ built in 590ms
```

Your frontend URL: `https://invenflow-YOUR-HASH.vercel.app` or `https://invenflow.vercel.app`

**Step 5.4 — Verify frontend is live**
1. Visit your Vercel URL
2. You should see the InvenFlow dashboard
3. Navigate to Products, Customers, Orders pages
4. Verify the sidebar and navbar render correctly

---

## 6. Post-Deployment: Update CORS

After you have your Vercel URL, update CORS on Render to allow it.

**Option A — Update via Render Dashboard (Easiest)**
1. Go to **Render Dashboard** → **invenflow-backend** → **Environment**
2. Find `ALLOWED_ORIGINS`
3. Click **Edit** and update to:
   ```
   https://YOUR-VERCEL-URL.vercel.app,http://localhost:5173
   ```
4. Click **Save Changes**
5. Render auto-redeploys (~1 minute)

**Option B — Update render.yaml and push**
```yaml
- key: ALLOWED_ORIGINS
  value: "https://YOUR-VERCEL-URL.vercel.app,http://localhost:5173"
```
Then:
```powershell
git add render.yaml
git commit -m "fix: update CORS with production Vercel URL"
git push origin master:main
```

---

## 7. Verification Checklist

Run these checks after deployment:

### Backend API Tests
```bash
# Health check
curl https://invenflow-backend.onrender.com/health

# Create a product
curl -X POST https://invenflow-backend.onrender.com/products/ \
  -H "Content-Type: application/json" \
  -d '{"name":"Laptop Pro","sku":"LAP-PRO-001","price":1299.99,"quantity_in_stock":25}'

# Create a customer
curl -X POST https://invenflow-backend.onrender.com/customers/ \
  -H "Content-Type: application/json" \
  -d '{"full_name":"Alice Johnson","email":"alice@example.com","phone_number":"+1-555-0100"}'

# Create an order
curl -X POST https://invenflow-backend.onrender.com/orders/ \
  -H "Content-Type: application/json" \
  -d '{"customer_id":1,"product_id":1,"quantity":2}'

# Dashboard stats
curl https://invenflow-backend.onrender.com/dashboard/stats

# List all products
curl https://invenflow-backend.onrender.com/products/

# List all customers
curl https://invenflow-backend.onrender.com/customers/

# List all orders
curl https://invenflow-backend.onrender.com/orders/
```

### CORS Verification
```bash
curl -H "Origin: https://YOUR-VERCEL-URL.vercel.app" \
     -H "Access-Control-Request-Method: GET" \
     -X OPTIONS \
     https://invenflow-backend.onrender.com/products/ -v
# Look for: Access-Control-Allow-Origin: https://YOUR-VERCEL-URL.vercel.app
```

### Frontend Page Checks
| Page | Path | Expected |
|---|---|---|
| Dashboard | `/` | Stats cards, low-stock panel |
| Products | `/products` | Product table, Add Product button |
| Customers | `/customers` | Customer table, Add Customer button |
| Orders | `/orders` | Order table with product & customer names |

---

## 8. Environment Variables Reference

### Backend (Render Environment)

| Variable | Example Value | Required | Description |
|---|---|---|---|
| `DATABASE_URL` | `postgresql://user:pass@host/db` | ✅ Yes | Auto-injected by Render Blueprint |
| `APP_NAME` | `InvenFlow API` | ✅ Yes | Application name |
| `APP_VERSION` | `1.0.0` | ✅ Yes | API version |
| `DEBUG` | `false` | ✅ Yes | Must be `false` in production |
| `ALLOWED_ORIGINS` | `https://invenflow.vercel.app` | ✅ Yes | Frontend URL(s) for CORS |

### Frontend (Vercel Environment)

| Variable | Example Value | Required | Description |
|---|---|---|---|
| `VITE_API_URL` | `https://invenflow-backend.onrender.com` | ✅ Yes | Backend API base URL |

### Local Development (backend/.env)

| Variable | Local Value | Description |
|---|---|---|
| `DATABASE_URL` | `sqlite:///./inventory_dev.db` | Local SQLite (no server needed) |
| `DEBUG` | `true` | Show SQL queries |
| `ALLOWED_ORIGINS` | `http://localhost:5173,http://localhost:3000` | Local dev CORS |

---

## 9. Required GitHub Secrets Reference

Go to: `github.com/YOUR_USERNAME/invenflow` → **Settings** → **Secrets and variables** → **Actions**

| Secret Name | Where to Get | Used In |
|---|---|---|
| `DOCKERHUB_USERNAME` | Your Docker Hub username | `docker-build-push` job |
| `DOCKERHUB_TOKEN` | hub.docker.com → Account Settings → Security → New Access Token | `docker-build-push` job |
| `VITE_API_URL` | Your Render backend URL | `frontend-build` job |

---

## 10. Submission Checklist

Fill in your URLs as you complete each step:

```
GitHub Repository:
  URL: https://github.com/YOUR_USERNAME/invenflow
  Commits: 5+
  Status: [ ] Pushed

Docker Hub Image:
  URL: https://hub.docker.com/r/YOUR_DOCKERHUB_USERNAME/invenflow-backend
  Tags: latest, sha-XXXXXXX
  Status: [ ] Pushed by GitHub Actions

Backend API (Render):
  URL: https://invenflow-backend.onrender.com
  Health: https://invenflow-backend.onrender.com/health
  Swagger: https://invenflow-backend.onrender.com/docs
  Status: [ ] Deployed and healthy

Frontend (Vercel):
  URL: https://invenflow-YOUR-HASH.vercel.app
  Status: [ ] Deployed and showing dashboard

Database (Render PostgreSQL):
  Name: invenflow-db
  Status: [ ] Connected and verified via /dashboard/stats

CORS Test:
  Status: [ ] Frontend can call backend without CORS errors

Form Submission Values:
  GitHub Repository Link:  https://github.com/YOUR_USERNAME/invenflow
  Docker Hub Image Link:   https://hub.docker.com/r/YOUR_DOCKERHUB_USERNAME/invenflow-backend
  Frontend Hosted URL:     https://invenflow-YOUR-HASH.vercel.app
  Backend API Hosted URL:  https://invenflow-backend.onrender.com
```

---

## Quick Reference Commands

### Start local development
```powershell
# Terminal 1 — Backend
cd "C:\Users\Admin\Desktop\Project_2\backend"
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Terminal 2 — Frontend
cd "C:\Users\Admin\Desktop\Project_2\frontend"
npm run dev
```

### Push updates to GitHub (triggers CI/CD)
```powershell
cd "C:\Users\Admin\Desktop\Project_2"
git add -A
git commit -m "your message"
git push origin master:main
```

### Run local validation
```powershell
cd "C:\Users\Admin\Desktop\Project_2\backend"
python validate.py
```

### Run local API tests (requires backend running)
```powershell
cd "C:\Users\Admin\Desktop\Project_2"
powershell -File test_api.ps1
```
