from sqlalchemy import Column, Integer, String, Index
from app.database import Base


class Customer(Base):
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    phone_number = Column(String(50), nullable=True)

    __table_args__ = (
        Index("ix_customers_email", "email", unique=True),
    )

    def __repr__(self):
        return f"<Customer id={self.id} full_name={self.full_name} email={self.email}>"
