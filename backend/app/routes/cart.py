"""
Fast Shopping - Cart + Wishlist + Admin Routes
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import user as user_models
from app.models import product as product_models
from app.core.security import get_current_user, require_admin

router = APIRouter()

# ─── WISHLIST ─────────────────────────────────────────────────────────────────
@router.get("/wishlist")
def get_wishlist(db: Session = Depends(get_db), current_user: user_models.User = Depends(get_current_user)):
    items = db.query(user_models.WishlistItem).filter(user_models.WishlistItem.user_id == current_user.id).all()
    result = []
    for item in items:
        p = item.product
        if p:
            result.append({
                "id": p.id, "title": p.title, "price": p.price,
                "image": p.image, "brand": p.brand, "rating": p.rating,
                "originalPrice": p.discount_price or round(p.price * 1.25, 0)
            })
    return result

@router.post("/wishlist/{product_id}")
def toggle_wishlist(product_id: int, db: Session = Depends(get_db), current_user: user_models.User = Depends(get_current_user)):
    existing = db.query(user_models.WishlistItem).filter(
        user_models.WishlistItem.user_id == current_user.id,
        user_models.WishlistItem.product_id == product_id
    ).first()
    
    if existing:
        db.delete(existing)
        db.commit()
        return {"status": "REMOVED", "in_wishlist": False}
    
    product = db.query(product_models.Product).filter(product_models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    new_item = user_models.WishlistItem(user_id=current_user.id, product_id=product_id)
    db.add(new_item)
    db.commit()
    return {"status": "ADDED", "in_wishlist": True}
