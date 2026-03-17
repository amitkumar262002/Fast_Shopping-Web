from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ...models import database, catalog as models
from ...schemas import catalog as schemas

router = APIRouter(prefix="/catalog", tags=["catalog"])

@router.get("/categories", response_model=List[schemas.Category])
def get_categories(db: Session = Depends(database.get_db)):
    return db.query(models.Category).all()

@router.get("/products", response_model=List[schemas.Product])
def get_products(db: Session = Depends(database.get_db)):
    return db.query(models.Product).all()

@router.get("/products/{product_id}", response_model=schemas.Product)
def get_product(product_id: int, db: Session = Depends(database.get_db)):
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product
