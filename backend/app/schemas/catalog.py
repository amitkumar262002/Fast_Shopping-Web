from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class CategoryBase(BaseModel):
    name: str
    slug: str
    description: Optional[str] = None
    image_url: Optional[str] = None
    parent_id: Optional[int] = None
    status: bool = True

class CategoryCreate(CategoryBase):
    pass

class Category(CategoryBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class ProductBase(BaseModel):
    sku: str
    name: str
    slug: str
    description: Optional[str] = None
    short_description: Optional[str] = None
    price: float
    special_price: Optional[float] = None
    inventory: int = 0
    status: bool = True
    image_url: Optional[str] = None
    category_id: Optional[int] = None

class ProductCreate(ProductBase):
    pass

class Product(ProductBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
