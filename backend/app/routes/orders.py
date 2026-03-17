"""
Fast Shopping - Complete Orders + Payments API
Order Creation, Status Management, Razorpay Integration, Payment Verification
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import order as order_models
from app.models import product as product_models
from app.core.security import get_current_user, get_current_user_optional, require_admin
from app.models import user as user_models
import razorpay, os, hmac, hashlib
from dotenv import load_dotenv

load_dotenv()
RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID", "rzp_test_SNYh5IBLPCqXUW")
RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET", "tzinQf0lshqR1HwWWQGNRgjj")

try:
    razorpay_client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))
    # Optimized app details for Dashboard tracking
    razorpay_client.set_app_details({"title": "Fast Shopping", "version": "1.0.0"})
except Exception:
    razorpay_client = None

router = APIRouter()

def order_to_dict(o: order_models.Order) -> dict:
    return {
        "id": o.id,
        "user_id": o.user_id,
        "total_price": o.total_price,
        "payment_status": o.payment_status,
        "order_status": o.order_status,
        "razorpay_order_id": o.razorpay_order_id,
        "razorpay_payment_id": o.razorpay_payment_id,
        "created_at": str(o.created_at),
        "items": [
            {
                "id": item.id,
                "product_id": item.product_id,
                "quantity": item.quantity,
                "price": item.price,
                "title": item.product.title if item.product else "Unknown",
                "image": item.product.image if item.product else ""
            }
            for item in o.items
        ]
    }

# ─── CREATE ORDER + RAZORPAY ──────────────────────────────────────────────────
@router.post("/create")
def create_order(
    order_data: dict,
    db: Session = Depends(get_db),
    current_user: user_models.User = Depends(get_current_user_optional)
):
    total_price = float(order_data.get("total_price", 0))
    cart_items = order_data.get("items", [])
    payment_method = order_data.get("payment_method", "upi")
    
    if total_price <= 0:
        raise HTTPException(status_code=400, detail="Invalid order amount")

    # 🛡️ ANTI-DUPLICATION PROTOCOL (60 second window)
    if current_user:
        from datetime import datetime, timedelta
        recent_order = db.query(order_models.Order).filter(
            order_models.Order.user_id == current_user.id,
            order_models.Order.total_price == total_price,
            order_models.Order.created_at >= datetime.utcnow() - timedelta(seconds=60),
            order_models.Order.payment_status == "pending"
        ).first()
        
        if recent_order:
            # Check if items are identical (compare sorted product IDs and quantities)
            existing_items = sorted([(i.product_id, i.quantity) for i in recent_order.items])
            new_items = sorted([(int(i["id"]), int(i["quantity"])) for i in cart_items])
            
            if existing_items == new_items:
                print(f"Logistics: Active redundancy detected for User {current_user.id}. Diverting to Existing Protocol {recent_order.id}")
                return {
                    "status": "ORDER_REUSED",
                    "order_id": recent_order.id,
                    "razorpay_order_id": recent_order.razorpay_order_id,
                    "amount": int(total_price * 100),
                    "currency": "INR",
                    "key": RAZORPAY_KEY_ID
                }

    # Create Razorpay Order
    rzp_order_id = None
    rzp_amount = int(total_price * 100)
    
    if razorpay_client and payment_method != 'cod':
        try:
            rzp_order = razorpay_client.order.create({
                "amount": rzp_amount,
                "currency": "INR",
                "receipt": f"fs_receipt_{current_user.id if current_user else 'guest'}_{os.urandom(4).hex()}",
                "payment_capture": "1"
            })
            rzp_order_id = rzp_order['id']
        except Exception as e:
            rzp_order_id = f"order_mock_{int(total_price)}_{os.urandom(2).hex()}"
    elif payment_method == 'cod':
        rzp_order_id = f"cod_{os.urandom(6).hex()}"

    new_order = order_models.Order(
        user_id=current_user.id if current_user else None,
        total_price=total_price,
        payment_status="pending" if payment_method != 'cod' else "cod_pending",
        order_status="placed",
        razorpay_order_id=rzp_order_id,
        shipping_address=order_data.get("shipping_address", {}),
        payment_method=payment_method
    )
    db.add(new_order)
    db.flush()

    # Add Order Items + update stock
    for item in cart_items:
        product = db.query(product_models.Product).filter(product_models.Product.id == item["id"]).first()
        if product and product.stock >= item.get("quantity", 1):
            product.stock -= item.get("quantity", 1)
        order_item = order_models.OrderItem(
            order_id=new_order.id,
            product_id=item["id"],
            quantity=item.get("quantity", 1),
            price=item.get("price", 0)
        )
        db.add(order_item)

    db.commit()
    db.refresh(new_order)

    return {
        "status": "ORDER_CREATED",
        "order_id": new_order.id,
        "razorpay_order_id": rzp_order_id,
        "amount": rzp_amount,
        "currency": "INR",
        "key": RAZORPAY_KEY_ID
    }

# ─── VERIFY PAYMENT ───────────────────────────────────────────────────────────
@router.post("/payment/verify")
def verify_payment(payment_data: dict, db: Session = Depends(get_db)):
    razorpay_order_id = payment_data.get("razorpay_order_id", "")
    razorpay_payment_id = payment_data.get("razorpay_payment_id", "")
    razorpay_signature = payment_data.get("razorpay_signature", "")

    # Verify signature
    if razorpay_client and not razorpay_order_id.startswith("order_mock_"):
        try:
            razorpay_client.utility.verify_payment_signature({
                "razorpay_order_id": razorpay_order_id,
                "razorpay_payment_id": razorpay_payment_id,
                "razorpay_signature": razorpay_signature
            })
        except Exception:
            raise HTTPException(status_code=400, detail="Payment signature verification failed")

    order = db.query(order_models.Order).filter(order_models.Order.razorpay_order_id == razorpay_order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    order.payment_status = "paid"
    order.order_status = "processing"
    order.razorpay_payment_id = razorpay_payment_id
    db.commit()

    return {"status": "PAYMENT_VERIFIED", "order_id": order.id, "order_status": "processing"}

# ─── RAZORPAY WEBHOOK ────────────────────────────────────────────────────────
@router.post("/webhook")
async def razorpay_webhook(data: dict, db: Session = Depends(get_db)):
    """
    Elite Webhook Protocol for asynchronous payment synchronization.
    Handles cases where the frontend 'handler' fails to report.
    """
    event = data.get("event")
    payload = data.get("payload", {})
    
    if event == "payment.captured":
        payment_entity = payload.get("payment", {}).get("entity", {})
        razorpay_order_id = payment_entity.get("order_id")
        razorpay_payment_id = payment_entity.get("id")
        
        order = db.query(order_models.Order).filter(order_models.Order.razorpay_order_id == razorpay_order_id).first()
        if order and order.payment_status != "paid":
            order.payment_status = "paid"
            order.order_status = "processing"
            order.razorpay_payment_id = razorpay_payment_id
            db.commit()
            print(f"Logistics: Order {order.id} synchronized via Webhook.")
            
    return {"status": "NOTIFIED"}

# ─── GET ORDERS ───────────────────────────────────────────────────────────────
@router.get("/my")
def get_my_orders(current_user: user_models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    orders = db.query(order_models.Order).filter(order_models.Order.user_id == current_user.id).order_by(order_models.Order.id.desc()).all()
    return [order_to_dict(o) for o in orders]

@router.get("/{order_id}")
def get_order(order_id: int, db: Session = Depends(get_db), current_user: user_models.User = Depends(get_current_user)):
    order = db.query(order_models.Order).filter(order_models.Order.id == order_id).first()
    if not order or (order.user_id != current_user.id and current_user.role != "admin"):
        raise HTTPException(status_code=404, detail="Order not found")
    return order_to_dict(order)

# ─── ORDER ACTIONS (CANCEL/DELETE) ────────────────────────────────────────────
@router.patch("/{order_id}/cancel")
def cancel_order(order_id: int, db: Session = Depends(get_db), current_user: user_models.User = Depends(get_current_user)):
    order = db.query(order_models.Order).filter(order_models.Order.id == order_id).first()
    if not order or (order.user_id != current_user.id and current_user.role != "admin"):
        raise HTTPException(status_code=404, detail="Order not found")
        
    if order.order_status in ["shipped", "delivered"]:
        raise HTTPException(status_code=400, detail=f"Cannot cancel order that is already {order.order_status}")
    
    # Restore stock
    for item in order.items:
        product = db.query(product_models.Product).filter(product_models.Product.id == item.product_id).first()
        if product:
            product.stock += item.quantity
            
    order.order_status = "cancelled"
    db.commit()
    return {"status": "CANCELLED", "order_id": order_id}

@router.delete("/{order_id}")
def delete_order(order_id: int, db: Session = Depends(get_db), current_user: user_models.User = Depends(get_current_user)):
    order = db.query(order_models.Order).filter(order_models.Order.id == order_id).first()
    if not order or (order.user_id != current_user.id and current_user.role != "admin"):
        raise HTTPException(status_code=404, detail="Order not found")
        
    # Only allow deleting cancelled or pending/failed orders
    if order.order_status not in ["cancelled", "placed"] and order.payment_status != "pending":
        raise HTTPException(status_code=400, detail="Only cancelled or pending orders can be removed from history")
    
    # Restore stock if it was 'placed' but not paid
    if order.order_status == "placed" and order.payment_status == "pending":
        for item in order.items:
            product = db.query(product_models.Product).filter(product_models.Product.id == item.product_id).first()
            if product:
                product.stock += item.quantity

    db.delete(order)
    db.commit()
    return {"status": "DELETED", "order_id": order_id}

# ─── ADMIN ORDER MANAGEMENT ───────────────────────────────────────────────────
@router.get("/")
def get_all_orders(db: Session = Depends(get_db), _=Depends(require_admin)):
    orders = db.query(order_models.Order).order_by(order_models.Order.id.desc()).all()
    return [order_to_dict(o) for o in orders]

@router.put("/{order_id}/status")
def update_order_status(order_id: int, data: dict, db: Session = Depends(get_db), _=Depends(require_admin)):
    order = db.query(order_models.Order).filter(order_models.Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    valid_statuses = ["placed", "processing", "shipped", "out_for_delivery", "delivered", "cancelled"]
    new_status = data.get("order_status", "").lower()
    if new_status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {valid_statuses}")
    
    order.order_status = new_status
    db.commit()
    return {"status": "UPDATED", "order_status": new_status}
