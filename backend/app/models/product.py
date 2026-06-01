from sqlalchemy import Column, Integer, String, Float, CheckConstraint, Index
from app.database import Base


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    sku = Column(String(100), unique=True, nullable=False, index=True)
    price = Column(Float, nullable=False)
    quantity_in_stock = Column(Integer, nullable=False, default=0)

    __table_args__ = (
        CheckConstraint("price >= 0", name="ck_product_price_non_negative"),
        CheckConstraint("quantity_in_stock >= 0", name="ck_product_qty_non_negative"),
        Index("ix_products_sku", "sku", unique=True),
    )

    def __repr__(self):
        return f"<Product id={self.id} name={self.name} sku={self.sku}>"
