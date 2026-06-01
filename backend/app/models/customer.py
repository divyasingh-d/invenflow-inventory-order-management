from sqlalchemy import Column, Integer, String
from app.database import Base


class Customer(Base):
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(255), nullable=False)
    # unique=True creates the unique index automatically — no separate Index() needed
    email = Column(String(255), unique=True, nullable=False, index=True)
    phone_number = Column(String(50), nullable=True)

    # NOTE: ix_customers_email index removed from __table_args__ — it duplicated
    # the index already created by unique=True on the email column above.
    # Duplicate index caused OperationalError on SQLite.

    def __repr__(self):
        return f"<Customer id={self.id} full_name={self.full_name} email={self.email}>"
