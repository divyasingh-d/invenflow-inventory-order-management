from sqlalchemy import Column, Integer, String, Float, CheckConstraint
from app.database import Base


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    # unique=True on the Column already creates the index; no need for a separate Index() entry
    sku = Column(String(100), unique=True, nullable=False, index=True)
    price = Column(Float, nullable=False)
    quantity_in_stock = Column(Integer, nullable=False, default=0)

    __table_args__ = (
        CheckConstraint("price >= 0", name="ck_product_price_non_negative"),
        CheckConstraint("quantity_in_stock >= 0", name="ck_product_qty_non_negative"),
        # NOTE: ix_products_sku index is created automatically by unique=True above.
        # Duplicate Index() removed — it caused OperationalError on SQLite.
    )

    def __repr__(self):
        return f"<Product id={self.id} name={self.name} sku={self.sku}>"
