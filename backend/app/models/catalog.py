from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Float, Text, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base

class Category(Base):
    __tablename__ = "categories"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    slug = Column(String(255), unique=True, index=True)
    description = Column(Text, nullable=True)
    image_url = Column(String(512), nullable=True)
    parent_id = Column(Integer, ForeignKey("categories.id"), nullable=True)
    status = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    children = relationship("Category", backref="parent", remote_side=[id])
    products = relationship("Product", back_populates="category")

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    sku = Column(String(100), unique=True, index=True)
    name = Column(String(255), nullable=False)
    slug = Column(String(255), unique=True, index=True)
    description = Column(Text, nullable=True)
    short_description = Column(Text, nullable=True)
    price = Column(Float, nullable=False)
    special_price = Column(Float, nullable=True)
    weight = Column(Float, nullable=True, default=0)
    inventory = Column(Integer, default=0)
    status = Column(Boolean, default=True)
    image_url = Column(String(512), nullable=True)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    category = relationship("Category", back_populates="products")
