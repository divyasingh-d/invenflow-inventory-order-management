from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models.product import Product
from app.models.customer import Customer
from app.models.order import Order
from app.schemas.order import DashboardStats

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

LOW_STOCK_THRESHOLD = 10


@router.get("/stats", response_model=DashboardStats)
def get_dashboard_stats(db: Session = Depends(get_db)):
    """Get aggregated dashboard statistics."""
    total_products = db.query(Product).count()
    total_customers = db.query(Customer).count()
    total_orders = db.query(Order).count()

    low_stock = (
        db.query(Product)
        .filter(Product.quantity_in_stock <= LOW_STOCK_THRESHOLD)
        .order_by(Product.quantity_in_stock.asc())
        .limit(10)
        .all()
    )
    low_stock_list = [
        {
            "id": p.id,
            "name": p.name,
            "sku": p.sku,
            "quantity_in_stock": p.quantity_in_stock,
        }
        for p in low_stock
    ]

    total_revenue_result = db.query(func.sum(Order.total_amount)).scalar()
    total_revenue = round(float(total_revenue_result or 0), 2)

    return DashboardStats(
        total_products=total_products,
        total_customers=total_customers,
        total_orders=total_orders,
        low_stock_products=low_stock_list,
        total_revenue=total_revenue,
    )
