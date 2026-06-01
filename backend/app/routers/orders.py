from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, joinedload
from app.database import get_db
from app.models.order import Order
from app.models.product import Product
from app.models.customer import Customer
from app.schemas.order import OrderCreate, OrderResponse, OrderListResponse, DashboardStats
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/orders", tags=["Orders"])


@router.post("/", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
def create_order(order_in: OrderCreate, db: Session = Depends(get_db)):
    """
    Create a new order.
    - Validates customer and product existence.
    - Checks sufficient stock.
    - Deducts stock atomically.
    - Calculates total_amount automatically.
    Transaction-safe using DB transaction.
    """
    # Validate customer exists
    customer = db.query(Customer).filter(Customer.id == order_in.customer_id).first()
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Customer with id={order_in.customer_id} not found."
        )

    # Validate product exists — use FOR UPDATE lock on PostgreSQL to prevent race conditions,
    # skip on SQLite (which uses WAL + file locking instead)
    from app.database import engine as _engine
    _is_sqlite = _engine.url.drivername.startswith("sqlite")
    _product_q = db.query(Product).filter(Product.id == order_in.product_id)
    if not _is_sqlite:
        _product_q = _product_q.with_for_update()
    product = _product_q.first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product with id={order_in.product_id} not found."
        )

    # Check sufficient stock
    if product.quantity_in_stock < order_in.quantity:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=(
                f"Insufficient stock for product '{product.name}'. "
                f"Available: {product.quantity_in_stock}, Requested: {order_in.quantity}."
            )
        )

    # Calculate total amount
    total_amount = round(product.price * order_in.quantity, 2)

    # Deduct stock (atomic within transaction)
    product.quantity_in_stock -= order_in.quantity

    # Create order
    order = Order(
        customer_id=order_in.customer_id,
        product_id=order_in.product_id,
        quantity=order_in.quantity,
        total_amount=total_amount,
    )
    db.add(order)

    try:
        db.commit()
        db.refresh(order)
        # Reload with relationships
        order = (
            db.query(Order)
            .options(joinedload(Order.customer), joinedload(Order.product))
            .filter(Order.id == order.id)
            .first()
        )
        logger.info(f"Created order id={order.id} total_amount={total_amount}")
        return order
    except Exception as e:
        db.rollback()
        logger.error(f"Error creating order: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create order. Please try again."
        )


@router.get("/", response_model=OrderListResponse)
def list_orders(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db)
):
    """Get all orders with customer and product details."""
    total = db.query(Order).count()
    orders = (
        db.query(Order)
        .options(joinedload(Order.customer), joinedload(Order.product))
        .offset(skip)
        .limit(limit)
        .all()
    )
    return OrderListResponse(items=orders, total=total)


@router.get("/{order_id}", response_model=OrderResponse)
def get_order(order_id: int, db: Session = Depends(get_db)):
    """Get an order by ID with full details."""
    order = (
        db.query(Order)
        .options(joinedload(Order.customer), joinedload(Order.product))
        .filter(Order.id == order_id)
        .first()
    )
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Order with id={order_id} not found."
        )
    return order


@router.delete("/{order_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_order(order_id: int, db: Session = Depends(get_db)):
    """Delete an order by ID. Note: stock is NOT restored on deletion."""
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Order with id={order_id} not found."
        )
    db.delete(order)
    db.commit()
    logger.info(f"Deleted order id={order_id}")
