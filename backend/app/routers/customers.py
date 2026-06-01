from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from app.database import get_db
from app.models.customer import Customer
from app.schemas.customer import CustomerCreate, CustomerResponse, CustomerListResponse
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/customers", tags=["Customers"])


@router.post("/", response_model=CustomerResponse, status_code=status.HTTP_201_CREATED)
def create_customer(customer_in: CustomerCreate, db: Session = Depends(get_db)):
    """Create a new customer. Email must be unique."""
    existing = db.query(Customer).filter(Customer.email == customer_in.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Customer with email '{customer_in.email}' already exists."
        )
    customer = Customer(**customer_in.dict())
    db.add(customer)
    try:
        db.commit()
        db.refresh(customer)
        logger.info(f"Created customer id={customer.id} email={customer.email}")
        return customer
    except IntegrityError as e:
        db.rollback()
        logger.error(f"Integrity error creating customer: {e}")
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Customer with this email already exists."
        )


@router.get("/", response_model=CustomerListResponse)
def list_customers(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db)
):
    """Get all customers with optional pagination."""
    total = db.query(Customer).count()
    customers = db.query(Customer).offset(skip).limit(limit).all()
    return CustomerListResponse(items=customers, total=total)


@router.get("/{customer_id}", response_model=CustomerResponse)
def get_customer(customer_id: int, db: Session = Depends(get_db)):
    """Get a customer by ID."""
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Customer with id={customer_id} not found."
        )
    return customer


@router.delete("/{customer_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_customer(customer_id: int, db: Session = Depends(get_db)):
    """Delete a customer by ID."""
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Customer with id={customer_id} not found."
        )
    db.delete(customer)
    db.commit()
    logger.info(f"Deleted customer id={customer_id}")
