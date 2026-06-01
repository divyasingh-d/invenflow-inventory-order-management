from pydantic import BaseModel, Field, validator
from typing import Optional
from datetime import datetime


class OrderBase(BaseModel):
    customer_id: int = Field(..., gt=0, description="Customer ID")
    product_id: int = Field(..., gt=0, description="Product ID")
    quantity: int = Field(..., gt=0, description="Quantity ordered (must be > 0)")

    @validator("quantity")
    def quantity_must_be_positive(cls, v):
        if v <= 0:
            raise ValueError("Quantity must be greater than 0")
        return v


class OrderCreate(OrderBase):
    pass


class OrderProductInfo(BaseModel):
    id: int
    name: str
    sku: str
    price: float

    class Config:
        from_attributes = True


class OrderCustomerInfo(BaseModel):
    id: int
    full_name: str
    email: str

    class Config:
        from_attributes = True


class OrderResponse(BaseModel):
    id: int
    customer_id: int
    product_id: int
    quantity: int
    total_amount: float
    created_at: datetime
    customer: Optional[OrderCustomerInfo] = None
    product: Optional[OrderProductInfo] = None

    class Config:
        from_attributes = True


class OrderListResponse(BaseModel):
    items: list[OrderResponse]
    total: int


class DashboardStats(BaseModel):
    total_products: int
    total_customers: int
    total_orders: int
    low_stock_products: list[dict]
    total_revenue: float
