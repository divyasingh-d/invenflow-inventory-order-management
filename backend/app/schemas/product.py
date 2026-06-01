from pydantic import BaseModel, Field, validator
from typing import Optional


class ProductBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255, description="Product name")
    sku: str = Field(..., min_length=1, max_length=100, description="Stock Keeping Unit - must be unique")
    price: float = Field(..., ge=0, description="Product price (must be >= 0)")
    quantity_in_stock: int = Field(..., ge=0, description="Quantity in stock (must be >= 0)")

    @validator("name")
    def name_must_not_be_blank(cls, v):
        if not v.strip():
            raise ValueError("Name cannot be blank")
        return v.strip()

    @validator("sku")
    def sku_must_not_be_blank(cls, v):
        if not v.strip():
            raise ValueError("SKU cannot be blank")
        return v.strip().upper()


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    sku: Optional[str] = Field(None, min_length=1, max_length=100)
    price: Optional[float] = Field(None, ge=0)
    quantity_in_stock: Optional[int] = Field(None, ge=0)

    @validator("name")
    def name_must_not_be_blank(cls, v):
        if v is not None and not v.strip():
            raise ValueError("Name cannot be blank")
        return v.strip() if v else v

    @validator("sku")
    def sku_must_not_be_blank(cls, v):
        if v is not None and not v.strip():
            raise ValueError("SKU cannot be blank")
        return v.strip().upper() if v else v


class ProductResponse(ProductBase):
    id: int

    class Config:
        from_attributes = True


class ProductListResponse(BaseModel):
    items: list[ProductResponse]
    total: int
