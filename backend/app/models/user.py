from sqlalchemy import Column, Integer, String, Boolean, DateTime, Float, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    email = Column(String, unique=True, index=True)
    password = Column(String)
    phone = Column(String, default="")
    profile_image = Column(String, default="https://api.dicebear.com/7.x/avataaars/svg?seed=FastShopping")
    role = Column(String, default="user")  # "user" or "admin"
    is_prime = Column(Boolean, default=False)
    last_login = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)

    addresses = relationship("Address", back_populates="user", cascade="all, delete-orphan")
    orders = relationship("Order", back_populates="user")
    wishlist_items = relationship("WishlistItem", back_populates="user", cascade="all, delete-orphan")
    reviews = relationship("Review", back_populates="user")

class Address(Base):
    __tablename__ = "addresses"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    name = Column(String)
    phone = Column(String)
    pincode = Column(String)
    city = Column(String)
    state = Column(String)
    address_line = Column(String)
    landmark = Column(String, default="")
    address_type = Column(String, default="Home") # Home, Office, etc.
    is_default = Column(Boolean, default=False)

    user = relationship("User", back_populates="addresses")

class WishlistItem(Base):
    __tablename__ = "wishlist_items"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    product_id = Column(Integer, ForeignKey("products.id"))
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="wishlist_items")
    product = relationship("Product")
