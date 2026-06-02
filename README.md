# InvenFlow — Inventory & Order Management System

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.111-green.svg)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue.svg)](https://www.postgresql.org)
[![Docker](https://img.shields.io/badge/Docker-Compose-blue.svg)](https://docs.docker.com/compose)

A production-ready, full-stack **Inventory and Order Management System** built with:
- **Backend**: FastAPI (Python) + SQLAlchemy + PostgreSQL
- **Frontend**: React + Vite + JavaScript
- **Containerization**: Docker + Docker Compose
- **Deployment**: Vercel (frontend) + Render (backend) + Docker Hub (image)

---

## 🚀 Live Demo

| Service | URL |
|---------|-----|
| Frontend | https://frontend-theta-six-22.vercel.app/ |
| Backend API | https://invenflow-inventory-order-management.onrender.com |
| Health Check | https://invenflow-inventory-order-management.onrender.com/health |
| Docker Hub | https://hub.docker.com/r/divyasingh969692/invenflow-inventory-order-management |
| GitHub Repository | https://github.com/divyasingh-d/invenflow-inventory-order-management |
## ✨ Features

### Products
- ✅ Create, Read, Update, Delete products
- ✅ Unique SKU enforcement
- ✅ Stock level tracking with low-stock alerts
- ✅ Price validation

### Customers
- ✅ Create, Read, Delete customers
- ✅ Unique email enforcement
- ✅ Phone number (optional)

### Orders
- ✅ Transaction-safe order creation
- ✅ Automatic stock deduction on order
- ✅ Insufficient stock prevention
- ✅ Automatic total amount calculation
- ✅ Full order history with customer & product details

### Dashboard
- ✅ Total products, customers, orders
- ✅ Total revenue
- ✅ Low stock alert panel
- ✅ Quick navigation

---

## 🗂️ Project Structure

```
Project_2/
├── backend/
│   ├── app/
│   │   ├── main.py           # FastAPI app + CORS + exception handlers
│   │   ├── database.py       # SQLAlchemy engine + session
│   │   ├── core/
│   │   │   └── config.py     # Pydantic settings
│   │   ├── models/
│   │   │   ├── product.py
│   │   │   ├── customer.py
│   │   │   └── order.py
│   │   ├── schemas/
│   │   │   ├── product.py
│   │   │   ├── customer.py
│   │   │   └── order.py
│   │   └── routers/
│   │       ├── products.py
│   │       ├── customers.py
│   │       ├── orders.py
│   │       └── dashboard.py
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .dockerignore
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   ├── axios.js      # Axios instance + interceptors
│   │   │   └── services.js   # All API service functions
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/            # Route-level page components
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css         # Design system + CSS variables
│   ├── Dockerfile
│   ├── nginx.conf
│   └── vite.config.js
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## 🔧 Local Development Setup

### Prerequisites
- Docker Desktop
- Node.js 20+
- Python 3.11+

### Option 1: Docker Compose (Recommended)

```bash
# 1. Clone the repo
git clone https://github.com/youruser/invenflow.git
cd invenflow

# 2. Copy environment file
cp .env.example .env
# Edit .env with your values

# 3. Build and start all services
docker compose up --build

# 4. Access
#   Frontend: http://localhost
#   Backend:  http://localhost:8000
#   Docs:     http://localhost:8000/docs
```

### Option 2: Manual Development

**Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Set env vars
export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/inventory_db"
export ALLOWED_ORIGINS="http://localhost:5173"

uvicorn app.main:app --reload --port 8000
```

**Frontend:**
```bash
cd frontend
npm install
echo "VITE_API_URL=http://localhost:8000" > .env
npm run dev
```

---

## 📡 API Reference

### Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/products/` | Create product |
| `GET` | `/products/` | List all products |
| `GET` | `/products/{id}` | Get product by ID |
| `PUT` | `/products/{id}` | Update product |
| `DELETE` | `/products/{id}` | Delete product |

### Customers
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/customers/` | Create customer |
| `GET` | `/customers/` | List all customers |
| `GET` | `/customers/{id}` | Get customer by ID |
| `DELETE` | `/customers/{id}` | Delete customer |

### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/orders/` | Create order (validates stock, deducts inventory) |
| `GET` | `/orders/` | List all orders |
| `GET` | `/orders/{id}` | Get order by ID |
| `DELETE` | `/orders/{id}` | Delete order |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/dashboard/stats` | Aggregated stats |

> Full interactive docs: `http://localhost:8000/docs` (Swagger) or `/redoc` (ReDoc)

---

## 🐳 Docker

### Build Backend Image
```bash
cd backend
docker build -t invenflow-backend:latest .
```

### Push to Docker Hub
```bash
docker tag invenflow-backend:latest youruser/invenflow-backend:latest
docker push youruser/invenflow-backend:latest
```

### Docker Compose Commands
```bash
docker compose up --build       # Build and start all
docker compose up -d            # Start in background
docker compose down             # Stop all services
docker compose down -v          # Stop + remove volumes
docker compose logs backend     # View backend logs
```

---

## ☁️ Deployment

### Backend → Render

1. Connect your GitHub repo to Render
2. Create a **Web Service** pointing to `/backend`
3. Set **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Add **Environment Variables**:
   - `DATABASE_URL` — PostgreSQL internal URL from Render
   - `ALLOWED_ORIGINS` — your Vercel frontend URL
   - `DEBUG` — `false`

### Frontend → Vercel

1. Import your GitHub repo in Vercel
2. Set **Root Directory** to `frontend`
3. Set **Build Command**: `npm run build`
4. Set **Output Directory**: `dist`
5. Add **Environment Variables**:
   - `VITE_API_URL` — your Render backend URL

### Database → Render PostgreSQL

1. Create a PostgreSQL instance on Render
2. Copy the **Internal Database URL** to your backend `DATABASE_URL`

---

## 🛡️ Business Rules

- **SKU uniqueness** enforced at DB level (unique index + application check)
- **Email uniqueness** enforced at DB level
- **Stock check** before order creation (returns 422 if insufficient)
- **Atomic stock deduction** using `SELECT FOR UPDATE` (prevents race conditions)
- **Total amount** automatically calculated: `price × quantity`
- **Negative quantities/prices** blocked by DB constraints
- **Cascade deletes**: deleting customer/product cascades to orders

---

## 🧪 Testing

```bash
# Backend health check
curl http://localhost:8000/health

# Create a product
curl -X POST http://localhost:8000/products/ \
  -H "Content-Type: application/json" \
  -d '{"name": "Laptop", "sku": "LAP-001", "price": 999.99, "quantity_in_stock": 50}'

# Create a customer
curl -X POST http://localhost:8000/customers/ \
  -H "Content-Type: application/json" \
  -d '{"full_name": "Alice Smith", "email": "alice@example.com", "phone_number": "+1234567890"}'

# Create an order
curl -X POST http://localhost:8000/orders/ \
  -H "Content-Type: application/json" \
  -d '{"customer_id": 1, "product_id": 1, "quantity": 2}'

# Dashboard stats
curl http://localhost:8000/dashboard/stats
```

---

## 📄 License

MIT © 2026 InvenFlow
