from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class Category(Base):
    __tablename__ = "categories"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    icon = Column(String) # Lucide icon name or image URL
    created_at = Column(DateTime, default=datetime.utcnow)

    products = relationship("Product", back_populates="category")

class Product(Base):
    __tablename__ = "products"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(String)
    price = Column(Float)
    discount_price = Column(Float, nullable=True)
    category_id = Column(Integer, ForeignKey("categories.id"))
    stock = Column(Integer, default=0)
    brand = Column(String)
    rating = Column(Float, default=0.0)
    image = Column(String) # Main image URL
    specs = Column(JSON, default={}) # Technical specifications
    created_at = Column(DateTime, default=datetime.utcnow)

    category = relationship("Category", back_populates="products")
    images = relationship("ProductImage", back_populates="product")
    reviews = relationship("Review", back_populates="product")

class ProductImage(Base):
    __tablename__ = "product_images"
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"))
    image_url = Column(String)
    
    product = relationship("Product", back_populates="images")

class Review(Base):
    __tablename__ = "reviews"
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    rating = Column(Integer)
    comment = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

    product = relationship("Product", back_populates="reviews")
    user = relationship("User", back_populates="reviews")
