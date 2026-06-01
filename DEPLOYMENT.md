# InvenFlow — Production Deployment Setup Guide

This document outlines the one-time setup steps to activate the automated CI/CD pipeline.

---

## 1. GitHub Repository Secrets

After creating the GitHub repo, go to:
**Settings → Secrets and variables → Actions → New repository secret**

Add the following secrets:

| Secret Name | Value | Where to get it |
|---|---|---|
| `DOCKERHUB_USERNAME` | Your Docker Hub username | https://hub.docker.com |
| `DOCKERHUB_TOKEN` | Docker Hub Access Token | hub.docker.com → Account Settings → Security → New Access Token |
| `VITE_API_URL` | Your Render backend URL | After Render deploy (e.g., `https://invenflow-backend.onrender.com`) |

---

## 2. Deploy Backend to Render (One-Click Blueprint)

1. Go to https://dashboard.render.com
2. Click **New → Blueprint**
3. Connect your GitHub repository
4. Render auto-detects `render.yaml` and provisions:
   - **Web Service**: `invenflow-backend` (Python)
   - **PostgreSQL Database**: `invenflow-db`
5. Click **Apply**
6. Wait ~3 minutes for deployment
7. Your backend URL: `https://invenflow-backend.onrender.com`

After deployment, **update `render.yaml`** `ALLOWED_ORIGINS` with your Vercel URL.

---

## 3. Deploy Frontend to Vercel (One-Click Import)

1. Go to https://vercel.com/new
2. Click **Import Git Repository**
3. Select your `invenflow` GitHub repo
4. Configure:
   - **Root Directory**: `frontend`
   - **Framework**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Add **Environment Variable**:
   - `VITE_API_URL` = `https://invenflow-backend.onrender.com`
6. Click **Deploy**
7. Your frontend URL: `https://invenflow-YOUR_ID.vercel.app`

---

## 4. GitHub Actions → Docker Hub

Once secrets are set, every push to `main` automatically:
1. Tests the backend (SQLite)
2. Builds the frontend
3. Builds and pushes `YOUR_DOCKERHUB_USERNAME/invenflow-backend:latest`

Docker Hub image: `https://hub.docker.com/r/YOUR_DOCKERHUB_USERNAME/invenflow-backend`

---

## 5. Update CORS After Vercel Deploy

In `render.yaml`, update `ALLOWED_ORIGINS`:
```
- key: ALLOWED_ORIGINS
  value: "https://YOUR-APP.vercel.app,http://localhost:5173"
```

Or update directly in Render Dashboard → Environment → Edit `ALLOWED_ORIGINS`.

---

## Final URLs Checklist

- [ ] GitHub: `https://github.com/YOUR_USER/invenflow`
- [ ] Docker Hub: `https://hub.docker.com/r/YOUR_DOCKERHUB_USER/invenflow-backend`
- [ ] Frontend: `https://invenflow.vercel.app`
- [ ] Backend: `https://invenflow-backend.onrender.com`
- [ ] Swagger: `https://invenflow-backend.onrender.com/docs`
