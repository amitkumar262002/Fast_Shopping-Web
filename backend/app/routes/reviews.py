"""
Fast Shopping - Reviews, Coupons & Notifications API
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models.product import Product, Review
from app.models import user as user_models
from app.core.security import get_current_user, require_admin
from datetime import datetime

router = APIRouter()

# ─── REVIEWS ──────────────────────────────────────────────────────────────────
@router.get("/products/{product_id}/reviews")
def get_reviews(product_id: int, db: Session = Depends(get_db)):
    reviews = db.query(Review).filter(Review.product_id == product_id).order_by(Review.id.desc()).all()
    return [
        {
            "id": r.id,
            "rating": r.rating,
            "comment": r.comment,
            "user_name": r.user.name if r.user else "User",
            "created_at": str(r.created_at)
        }
        for r in reviews
    ]

@router.post("/products/{product_id}/reviews")
def add_review(
    product_id: int,
    data: dict,
    db: Session = Depends(get_db),
    current_user: user_models.User = Depends(get_current_user)
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    # Check if user already reviewed
    existing = db.query(Review).filter(Review.product_id == product_id, Review.user_id == current_user.id).first()
    if existing:
        existing.rating = data.get("rating", existing.rating)
        existing.comment = data.get("comment", existing.comment)
        db.commit()
        return {"status": "UPDATED", "review_id": existing.id}

    review = Review(
        product_id=product_id,
        user_id=current_user.id,
        rating=data.get("rating", 5),
        comment=data.get("comment", ""),
        created_at=datetime.utcnow()
    )
    db.add(review)
    db.flush()

    # Update product average rating
    avg = db.query(func.avg(Review.rating)).filter(Review.product_id == product_id).scalar()
    product.rating = round(float(avg), 1)
    db.commit()

    return {"status": "CREATED", "review_id": review.id}

@router.delete("/reviews/{review_id}")
def delete_review(review_id: int, db: Session = Depends(get_db), current_user: user_models.User = Depends(get_current_user)):
    review = db.query(Review).filter(Review.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    if review.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    db.delete(review)
    db.commit()
    return {"status": "DELETED"}
