"""
Fast Shopping - Coupons API
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime
from sqlalchemy.orm import Session
from app.database import get_db, Base
from app.core.security import require_admin
from datetime import datetime

class Coupon(Base):
    __tablename__ = "coupons"
    id = Column(Integer, primary_key=True, index=True)
    code = Column(String, unique=True, index=True)
    discount_percent = Column(Float, default=10.0)
    max_discount = Column(Float, default=500.0)
    min_order = Column(Float, default=0.0)
    is_active = Column(Boolean, default=True)
    uses_limit = Column(Integer, default=100)
    uses_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

router = APIRouter()

@router.post("/validate")
def validate_coupon(data: dict, db: Session = Depends(get_db)):
    code = data.get("code", "").upper().strip()
    order_amount = float(data.get("amount", 0))
    
    coupon = db.query(Coupon).filter(Coupon.code == code, Coupon.is_active == True).first()
    if not coupon:
        raise HTTPException(status_code=404, detail="Invalid or expired coupon code")
    if coupon.uses_count >= coupon.uses_limit:
        raise HTTPException(status_code=400, detail="Coupon usage limit reached")
    if order_amount < coupon.min_order:
        raise HTTPException(status_code=400, detail=f"Minimum order amount is ₹{coupon.min_order}")

    raw_discount = order_amount * (coupon.discount_percent / 100)
    final_discount = min(raw_discount, coupon.max_discount)

    return {
        "valid": True,
        "code": coupon.code,
        "discount_percent": coupon.discount_percent,
        "discount_amount": round(final_discount, 2),
        "final_amount": round(order_amount - final_discount, 2),
        "message": f"{coupon.discount_percent}% off applied! You save ₹{round(final_discount, 0)}"
    }

@router.get("/")
def list_coupons(db: Session = Depends(get_db), _=Depends(require_admin)):
    coupons = db.query(Coupon).all()
    return [{"id": c.id, "code": c.code, "discount_percent": c.discount_percent,
             "max_discount": c.max_discount, "min_order": c.min_order,
             "is_active": c.is_active, "uses_count": c.uses_count, "uses_limit": c.uses_limit} for c in coupons]

@router.post("/")
def create_coupon(data: dict, db: Session = Depends(get_db), _=Depends(require_admin)):
    existing = db.query(Coupon).filter(Coupon.code == data.get("code", "").upper()).first()
    if existing:
        raise HTTPException(status_code=400, detail="Coupon code already exists")
    coupon = Coupon(
        code=data.get("code", "").upper(),
        discount_percent=float(data.get("discount_percent", 10)),
        max_discount=float(data.get("max_discount", 500)),
        min_order=float(data.get("min_order", 0)),
        uses_limit=int(data.get("uses_limit", 100))
    )
    db.add(coupon)
    db.commit()
    return {"status": "CREATED", "code": coupon.code}

@router.put("/{coupon_id}")
def update_coupon(coupon_id: int, data: dict, db: Session = Depends(get_db), _=Depends(require_admin)):
    coupon = db.query(Coupon).filter(Coupon.id == coupon_id).first()
    if not coupon:
        raise HTTPException(status_code=404, detail="Coupon not found")
    for field in ["discount_percent", "max_discount", "min_order", "is_active", "uses_limit"]:
        if field in data:
            setattr(coupon, field, data[field])
    db.commit()
    return {"status": "UPDATED"}

@router.delete("/{coupon_id}")
def delete_coupon(coupon_id: int, db: Session = Depends(get_db), _=Depends(require_admin)):
    coupon = db.query(Coupon).filter(Coupon.id == coupon_id).first()
    if not coupon:
        raise HTTPException(status_code=404, detail="Coupon not found")
    db.delete(coupon)
    db.commit()
    return {"status": "DELETED"}
