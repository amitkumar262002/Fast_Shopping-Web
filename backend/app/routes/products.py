"""
Fast Shopping - Complete Products API
Categories, Products, Reviews, Search, Filters
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.database import get_db
from app.models import product as product_models
from app.core.security import get_current_user, require_admin, get_current_user_optional
from app.models import user as user_models
from typing import Optional, List

router = APIRouter()

# ─── CATEGORIES ────────────────────────────────────────────────────────────────
@router.get("/categories")
def get_categories(db: Session = Depends(get_db)):
    cats = db.query(product_models.Category).all()
    return [{"id": c.id, "name": c.name, "icon": c.icon} for c in cats]

@router.post("/categories", status_code=201)
def create_category(cat: dict, db: Session = Depends(get_db), _=Depends(require_admin)):
    existing = db.query(product_models.Category).filter(product_models.Category.name == cat["name"]).first()
    if existing:
        return {"status": "EXISTS", "id": existing.id}
    new_cat = product_models.Category(name=cat["name"], icon=cat.get("icon", ""))
    db.add(new_cat)
    db.commit()
    db.refresh(new_cat)
    return {"status": "CREATED", "id": new_cat.id}

# ─── PRODUCTS ──────────────────────────────────────────────────────────────────
def product_to_dict(p: product_models.Product) -> dict:
    images = [img.image_url for img in p.images] if p.images else []
    return {
        "id": p.id,
        "title": p.title,
        "description": p.description or "",
        "price": p.price,
        "originalPrice": p.discount_price or round(p.price * 1.25, 0),
        "discount_price": p.discount_price,
        "category": p.category.name if p.category else "General",
        "category_id": p.category_id,
        "stock": p.stock,
        "brand": p.brand or "Fast Shopping",
        "rating": round(p.rating or 4.2, 1),
        "image": p.image or "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400",
        "images": images if images else [p.image, p.image, p.image],
        "specs": p.specs or {},
        "created_at": str(p.created_at)
    }

@router.get("/")
def get_products(
    skip: int = 0,
    limit: int = 300,
    category: Optional[str] = None,
    search: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    brand: Optional[str] = None,
    sort: Optional[str] = "newest",
    db: Session = Depends(get_db)
):
    query = db.query(product_models.Product)
    
    if category:
        query = query.join(product_models.Category).filter(product_models.Category.name.ilike(f"%{category}%"))
    if search:
        query = query.filter(or_(
            product_models.Product.title.ilike(f"%{search}%"),
            product_models.Product.brand.ilike(f"%{search}%"),
            product_models.Product.description.ilike(f"%{search}%")
        ))
    if min_price is not None:
        query = query.filter(product_models.Product.price >= min_price)
    if max_price is not None:
        query = query.filter(product_models.Product.price <= max_price)
    if brand:
        query = query.filter(product_models.Product.brand.ilike(f"%{brand}%"))
    
    if sort == "price_asc":
        query = query.order_by(product_models.Product.price.asc())
    elif sort == "price_desc":
        query = query.order_by(product_models.Product.price.desc())
    elif sort == "rating":
        query = query.order_by(product_models.Product.rating.desc())
    else:
        query = query.order_by(product_models.Product.created_at.desc())
    
    products = query.offset(skip).limit(limit).all()
    return [product_to_dict(p) for p in products]

@router.get("/{product_id}")
def get_product(product_id: int, db: Session = Depends(get_db)):
    item = db.query(product_models.Product).filter(product_models.Product.id == product_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Product not found")
    result = product_to_dict(item)
    # Add reviews
    reviews = db.query(product_models.Review).filter(product_models.Review.product_id == product_id).all()
    result["reviews"] = [{"id": r.id, "rating": r.rating, "comment": r.comment, "user_id": r.user_id, "created_at": str(r.created_at)} for r in reviews]
    result["review_count"] = len(reviews)
    return result

@router.post("/", status_code=201)
def create_product(prod: dict, db: Session = Depends(get_db), _=Depends(require_admin)):
    new_prod = product_models.Product(
        title=prod["title"],
        description=prod.get("description", ""),
        price=float(prod["price"]),
        discount_price=float(prod.get("discount_price")) if prod.get("discount_price") else None,
        category_id=prod.get("category_id"),
        stock=prod.get("stock", 100),
        brand=prod.get("brand", ""),
        rating=prod.get("rating", 4.2),
        image=prod.get("image", ""),
        specs=prod.get("specs", {})
    )
    db.add(new_prod)
    db.commit()
    db.refresh(new_prod)
    return {"status": "CREATED", "id": new_prod.id}

@router.put("/{product_id}")
def update_product(product_id: int, prod: dict, db: Session = Depends(get_db), _=Depends(require_admin)):
    item = db.query(product_models.Product).filter(product_models.Product.id == product_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Product not found")
    for key, value in prod.items():
        if hasattr(item, key):
            setattr(item, key, value)
    db.commit()
    return {"status": "UPDATED"}

@router.delete("/{product_id}")
def delete_product(product_id: int, db: Session = Depends(get_db), _=Depends(require_admin)):
    item = db.query(product_models.Product).filter(product_models.Product.id == product_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Product not found")
    db.delete(item)
    db.commit()
    return {"status": "DELETED"}

# ─── REVIEWS ───────────────────────────────────────────────────────────────────
@router.get("/{product_id}/reviews")
def get_reviews(product_id: int, db: Session = Depends(get_db)):
    reviews = db.query(product_models.Review).filter(
        product_models.Review.product_id == product_id
    ).order_by(product_models.Review.id.desc()).all()
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

@router.post("/{product_id}/reviews", status_code=201)
def add_review(
    product_id: int,
    review: dict,
    db: Session = Depends(get_db),
    current_user: user_models.User = Depends(get_current_user)
):
    from sqlalchemy import func
    item = db.query(product_models.Product).filter(product_models.Product.id == product_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Product not found")

    # Upsert: update existing review if user already reviewed
    existing = db.query(product_models.Review).filter(
        product_models.Review.product_id == product_id,
        product_models.Review.user_id == current_user.id
    ).first()

    if existing:
        existing.rating = int(review.get("rating", existing.rating))
        existing.comment = review.get("comment", existing.comment)
    else:
        new_review = product_models.Review(
            product_id=product_id,
            user_id=current_user.id,
            rating=int(review.get("rating", 5)),
            comment=review.get("comment", "")
        )
        db.add(new_review)

    db.flush()
    # Recalculate average rating
    avg = db.query(func.avg(product_models.Review.rating)).filter(
        product_models.Review.product_id == product_id
    ).scalar()
    item.rating = round(float(avg), 1)
    db.commit()
    return {"status": "REVIEW_SAVED"}
