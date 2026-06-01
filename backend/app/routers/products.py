from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from app.database import get_db
from app.models.product import Product
from app.schemas.product import ProductCreate, ProductUpdate, ProductResponse, ProductListResponse
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/products", tags=["Products"])


@router.post("/", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
def create_product(product_in: ProductCreate, db: Session = Depends(get_db)):
    """Create a new product. SKU must be unique."""
    # Check for duplicate SKU
    existing = db.query(Product).filter(Product.sku == product_in.sku).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Product with SKU '{product_in.sku}' already exists."
        )
    product = Product(**product_in.dict())
    db.add(product)
    try:
        db.commit()
        db.refresh(product)
        logger.info(f"Created product id={product.id} sku={product.sku}")
        return product
    except IntegrityError as e:
        db.rollback()
        logger.error(f"Integrity error creating product: {e}")
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Product with this SKU already exists."
        )


@router.get("/", response_model=ProductListResponse)
def list_products(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db)
):
    """Get all products with optional pagination."""
    total = db.query(Product).count()
    products = db.query(Product).offset(skip).limit(limit).all()
    return ProductListResponse(items=products, total=total)


@router.get("/{product_id}", response_model=ProductResponse)
def get_product(product_id: int, db: Session = Depends(get_db)):
    """Get a product by ID."""
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product with id={product_id} not found."
        )
    return product


@router.put("/{product_id}", response_model=ProductResponse)
def update_product(product_id: int, product_in: ProductUpdate, db: Session = Depends(get_db)):
    """Update a product. Partial updates supported."""
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product with id={product_id} not found."
        )
    update_data = product_in.dict(exclude_unset=True)
    # Check for SKU uniqueness if SKU is being updated
    if "sku" in update_data:
        existing = db.query(Product).filter(
            Product.sku == update_data["sku"],
            Product.id != product_id
        ).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Another product with SKU '{update_data['sku']}' already exists."
            )
    for field, value in update_data.items():
        setattr(product, field, value)
    try:
        db.commit()
        db.refresh(product)
        logger.info(f"Updated product id={product.id}")
        return product
    except IntegrityError as e:
        db.rollback()
        logger.error(f"Integrity error updating product: {e}")
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Update failed due to a constraint violation."
        )


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(product_id: int, db: Session = Depends(get_db)):
    """Delete a product by ID."""
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product with id={product_id} not found."
        )
    db.delete(product)
    db.commit()
    logger.info(f"Deleted product id={product_id}")
