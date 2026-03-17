"""
Fast Shopping - Admin Dashboard API
Analytics, User Management, Sales Reports
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models import user as user_models
from app.models import product as product_models
from app.models import order as order_models
from app.core.security import require_admin

router = APIRouter()

@router.get("/stats")
def get_dashboard_stats(db: Session = Depends(get_db), _=Depends(require_admin)):
    total_users = db.query(func.count(user_models.User.id)).scalar()
    total_products = db.query(func.count(product_models.Product.id)).scalar()
    total_orders = db.query(func.count(order_models.Order.id)).scalar()
    total_revenue = db.query(func.sum(order_models.Order.total_price)).filter(order_models.Order.payment_status == "paid").scalar() or 0
    pending_orders = db.query(func.count(order_models.Order.id)).filter(order_models.Order.order_status == "placed").scalar()
    
    return {
        "total_users": total_users,
        "total_products": total_products,
        "total_orders": total_orders,
        "total_revenue": round(float(total_revenue), 2),
        "pending_orders": pending_orders,
        "active_products": db.query(func.count(product_models.Product.id)).filter(product_models.Product.stock > 0).scalar()
    }

@router.get("/users")
def get_all_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), _=Depends(require_admin)):
    users = db.query(user_models.User).offset(skip).limit(limit).all()
    return [{
        "id": u.id, "name": u.name, "email": u.email,
        "phone": u.phone, "role": u.role,
        "last_login": str(u.last_login) if u.last_login else None,
        "order_count": len(u.orders),
        "total_spent": sum(o.total_price for o in u.orders if o.payment_status == "paid"),
        "created_at": str(u.created_at)
    } for u in users]

@router.put("/users/{user_id}/role")
def update_user_role(user_id: int, data: dict, db: Session = Depends(get_db), _=Depends(require_admin)):
    u = db.query(user_models.User).filter(user_models.User.id == user_id).first()
    if not u:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="User not found")
    u.role = data.get("role", "user")
    db.commit()
    return {"status": "UPDATED"}

@router.get("/revenue")
def get_revenue_chart(db: Session = Depends(get_db), _=Depends(require_admin)):
    """Monthly revenue breakdown"""
    orders = db.query(order_models.Order).filter(order_models.Order.payment_status == "paid").all()
    monthly = {}
    for o in orders:
        if o.created_at:
            key = o.created_at.strftime("%b %Y")
            monthly[key] = monthly.get(key, 0) + o.total_price
    return [{"month": k, "revenue": round(v, 2)} for k, v in monthly.items()]
