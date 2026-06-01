from pydantic import BaseModel, Field, EmailStr, validator
from typing import Optional


class CustomerBase(BaseModel):
    full_name: str = Field(..., min_length=1, max_length=255, description="Customer full name")
    email: EmailStr = Field(..., description="Customer email - must be unique")
    phone_number: Optional[str] = Field(None, max_length=50, description="Customer phone number")

    @validator("full_name")
    def name_must_not_be_blank(cls, v):
        if not v.strip():
            raise ValueError("Full name cannot be blank")
        return v.strip()


class CustomerCreate(CustomerBase):
    pass


class CustomerResponse(CustomerBase):
    id: int

    class Config:
        from_attributes = True


class CustomerListResponse(BaseModel):
    items: list[CustomerResponse]
    total: int
