"""
Fast Shopping - Advanced Search API
Supports: Full-text search, autocomplete, filters (category, brand, price, rating), sorting
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, func
from app.database import get_db
from app.models.product import Product, Category

router = APIRouter()

def product_to_dict(p: Product) -> dict:
    return {
        "id": p.id,
        "title": p.title,
        "brand": p.brand,
        "price": p.price,
        "discount_price": p.discount_price,
        "rating": p.rating,
        "stock": p.stock,
        "image": p.image,
        "category": p.category.name if p.category else "",
        "category_id": p.category_id,
        "description": p.description,
        "specs": p.specs or {},
        "review_count": len(p.reviews) if p.reviews else 0,
    }

@router.get("/")
def search_products(
    q: str = Query(None, description="Search query"),
    category: str = Query(None),
    brand: str = Query(None),
    min_price: float = Query(None),
    max_price: float = Query(None),
    min_rating: float = Query(None),
    sort_by: str = Query("relevance", description="relevance | price_asc | price_desc | rating | newest"),
    page: int = Query(1, ge=1),
    limit: int = Query(24, ge=1, le=100),
    db: Session = Depends(get_db)
):
    query = db.query(Product)

    # Full-text search on title, brand, description
    if q and q.strip():
        search_term = f"%{q.strip()}%"
        query = query.filter(
            or_(
                Product.title.ilike(search_term),
                Product.brand.ilike(search_term),
                Product.description.ilike(search_term)
            )
        )

    # Category filter (by name or id)
    if category:
        cat = db.query(Category).filter(Category.name.ilike(f"%{category}%")).first()
        if cat:
            query = query.filter(Product.category_id == cat.id)

    # Brand filter
    if brand:
        query = query.filter(Product.brand.ilike(f"%{brand}%"))

    # Price filter
    if min_price is not None:
        query = query.filter(Product.price >= min_price)
    if max_price is not None:
        query = query.filter(Product.price <= max_price)

    # Rating filter
    if min_rating is not None:
        query = query.filter(Product.rating >= min_rating)

    # Only in-stock
    query = query.filter(Product.stock > 0)

    # Sorting
    if sort_by == "price_asc":
        query = query.order_by(Product.price.asc())
    elif sort_by == "price_desc":
        query = query.order_by(Product.price.desc())
    elif sort_by == "rating":
        query = query.order_by(Product.rating.desc())
    elif sort_by == "newest":
        query = query.order_by(Product.id.desc())
    else:  # relevance - higher rating first
        query = query.order_by(Product.rating.desc(), Product.id.desc())

    total = query.count()
    products = query.offset((page - 1) * limit).limit(limit).all()

    return {
        "total": total,
        "page": page,
        "limit": limit,
        "pages": (total + limit - 1) // limit,
        "results": [product_to_dict(p) for p in products]
    }

@router.get("/autocomplete")
def autocomplete(q: str = Query(..., min_length=1), db: Session = Depends(get_db)):
    """Fast autocomplete suggestions for search bar"""
    if not q or len(q.strip()) < 1:
        return {"suggestions": []}

    search_term = f"%{q.strip()}%"
    
    # Get product title suggestions
    products = db.query(Product.title, Product.brand).filter(
        or_(
            Product.title.ilike(search_term),
            Product.brand.ilike(search_term)
        )
    ).limit(8).all()

    # Get category suggestions
    categories = db.query(Category.name).filter(
        Category.name.ilike(search_term)
    ).limit(3).all()

    suggestions = []
    seen = set()
    for p in products:
        if p.title not in seen:
            suggestions.append({"type": "product", "text": p.title})
            seen.add(p.title)
        if p.brand and p.brand not in seen:
            suggestions.append({"type": "brand", "text": p.brand})
            seen.add(p.brand)
    for c in categories:
        if c.name not in seen:
            suggestions.append({"type": "category", "text": c.name})
            seen.add(c.name)

    return {"suggestions": suggestions[:10]}

@router.get("/filters")
def get_filter_options(category: str = Query(None), db: Session = Depends(get_db)):
    """Get available filter options for a given category"""
    query = db.query(Product).filter(Product.stock > 0)
    if category:
        cat = db.query(Category).filter(Category.name.ilike(f"%{category}%")).first()
        if cat:
            query = query.filter(Product.category_id == cat.id)

    products = query.all()
    brands = sorted(list(set(p.brand for p in products if p.brand)))
    prices = [p.price for p in products if p.price]
    
    return {
        "brands": brands,
        "price_range": {
            "min": int(min(prices)) if prices else 0,
            "max": int(max(prices)) if prices else 0,
        },
        "categories": [{"id": c.id, "name": c.name} for c in db.query(Category).all()]
    }
