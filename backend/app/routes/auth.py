"""
Fast Shopping - Complete Auth Routes
Register, Login, Profile, Address Management
"""
from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile
import os
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import user as user_models
from app.core.security import hash_password, verify_password, create_access_token, get_current_user

router = APIRouter()

# ─── REGISTER ──────────────────────────────────────────────────────────────────
@router.post("/register", status_code=201)
def register(user: dict, db: Session = Depends(get_db)):
    try:
        # Check mandatory fields to avoid KeyErrors
        email = user.get("email")
        password = user.get("password")
        name = user.get("name")
        
        if not email or not password or not name:
            raise HTTPException(status_code=400, detail="Missing required information: Email, Password, and Name are mandatory.")

        if db.query(user_models.User).filter(user_models.User.email == email).first():
            raise HTTPException(status_code=400, detail="This email is already registered in our system.")
        
        profile_img = user.get("profile_image")
        if not profile_img or profile_img == "":
            profile_img = "https://api.dicebear.com/7.x/avataaars/svg?seed=FastShopping"

        new_user = user_models.User(
            name=name,
            email=email,
            password=hash_password(password),
            phone=user.get("phone", ""),
            profile_image=profile_img,
            role=user.get("role", "user")
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        
        token = create_access_token({"sub": str(new_user.id), "email": new_user.email, "role": new_user.role})
        return {
            "status": "SUCCESS",
            "token": token,
            "user": {
                "id": new_user.id, 
                "name": new_user.name, 
                "email": new_user.email, 
                "role": new_user.role, 
                "profile_image": new_user.profile_image,
                "is_prime": new_user.is_prime
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ REGISTRATION ERROR: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error during registration process.")

# ─── LOGIN ─────────────────────────────────────────────────────────────────────
@router.post("/login")
def login(creds: dict, db: Session = Depends(get_db)):
    user = db.query(user_models.User).filter(user_models.User.email == creds["email"]).first()
    if not user or not verify_password(creds["password"], user.password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    from datetime import datetime
    user.last_login = datetime.utcnow()
    db.commit()
    
    token = create_access_token({"sub": str(user.id), "email": user.email, "role": user.role})
    return {
        "status": "AUTHORIZED",
        "token": token,
        "user": {"id": user.id, "name": user.name, "email": user.email, "role": user.role, "profile_image": user.profile_image, "phone": user.phone}
    }

# ─── SOCIAL LOGIN (G-AUTH SYNC) ─────────────────────────────────────────────
@router.post("/social-login")
def social_login(data: dict, db: Session = Depends(get_db)):
    email = data.get("email")
    if not email:
        raise HTTPException(status_code=400, detail="Email is mandatory for social sync")
        
    user = db.query(user_models.User).filter(user_models.User.email == email).first()
    
    if not user:
        # Auto-registration for new social users
        user = user_models.User(
            name=data.get("name", email.split("@")[0]),
            email=email,
            password=hash_password(f"SOCIAL_{email}"), # Placeholder but secure hash
            phone=data.get("phone", ""),
            profile_image=data.get("profile_image", ""),
            role="user"
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    
    # Update last login
    from datetime import datetime
    user.last_login = datetime.utcnow()
    db.commit()
    
    token = create_access_token({"sub": str(user.id), "email": user.email, "role": user.role})
    return {
        "status": "AUTHORIZED",
        "token": token,
        "user": {
            "id": user.id, 
            "name": user.name, 
            "email": user.email, 
            "role": user.role, 
            "profile_image": user.profile_image,
            "phone": user.phone,
            "is_prime": user.is_prime
        }
    }

# ─── PROFILE ───────────────────────────────────────────────────────────────────
@router.get("/me")
def get_profile(current_user: user_models.User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email,
        "phone": current_user.phone,
        "profile_image": current_user.profile_image,
        "role": current_user.role,
        "created_at": str(current_user.created_at)
    }

@router.put("/me")
def update_profile(data: dict, db: Session = Depends(get_db), current_user: user_models.User = Depends(get_current_user)):
    # Only update fields if they are present in data and not empty/null
    if data.get("name"): 
        current_user.name = data["name"]
    
    # Phone can be empty, but only update if key is present
    if "phone" in data:
        current_user.phone = data["phone"]
        
    if data.get("profile_image"): 
        current_user.profile_image = data["profile_image"]
        
    if "is_prime" in data:
        current_user.is_prime = data["is_prime"]
        
    if data.get("password"):
        current_user.password = hash_password(data["password"])
        
    db.commit()
    db.refresh(current_user)
    return {
        "status": "UPDATED",
        "name": current_user.name,
        "email": current_user.email,
        "phone": current_user.phone,
        "profile_image": current_user.profile_image,
        "role": current_user.role,
        "is_prime": current_user.is_prime,
        "created_at": str(current_user.created_at)
    }

# ─── ADDRESSES ─────────────────────────────────────────────────────────────────
@router.get("/addresses")
def get_addresses(current_user: user_models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    addresses = db.query(user_models.Address).filter(user_models.Address.user_id == current_user.id).all()
    return [{
        "id": a.id, 
        "name": a.name, 
        "phone": a.phone, 
        "pincode": a.pincode, 
        "city": a.city, 
        "state": a.state, 
        "address_line": a.address_line,
        "landmark": a.landmark,
        "address_type": a.address_type,
        "is_default": a.is_default
    } for a in addresses]
@router.post("/addresses", status_code=201)
def add_address(addr: dict, db: Session = Depends(get_db), current_user: user_models.User = Depends(get_current_user)):
    # If this is the user's first address, make it default
    is_first = db.query(user_models.Address).filter(user_models.Address.user_id == current_user.id).count() == 0
    
    new_addr = user_models.Address(
        user_id=current_user.id,
        name=addr.get("name", ""),
        phone=addr.get("phone", ""),
        pincode=addr.get("pincode", ""),
        city=addr.get("city", ""),
        state=addr.get("state", ""),
        address_line=addr.get("address_line", ""),
        landmark=addr.get("landmark", ""),
        address_type=addr.get("address_type", "Home"),
        is_default=is_first
    )
    
    # If explicitly set as default or is first
    if addr.get("is_default") or is_first:
        db.query(user_models.Address).filter(user_models.Address.user_id == current_user.id).update({"is_default": False})
        new_addr.is_default = True
        # Also sync user phone if empty
        if not current_user.phone:
            current_user.phone = addr.get("phone", "")

    db.add(new_addr)
    db.commit()
    db.refresh(new_addr)
    return {"status": "ADDED", "id": new_addr.id, "is_default": new_addr.is_default}

@router.put("/addresses/{addr_id}/default")
def set_default_address(addr_id: int, db: Session = Depends(get_db), current_user: user_models.User = Depends(get_current_user)):
    # Reset all addresses for this user
    db.query(user_models.Address).filter(user_models.Address.user_id == current_user.id).update({"is_default": False})
    
    # Set the selected one as default
    addr = db.query(user_models.Address).filter(user_models.Address.id == addr_id, user_models.Address.user_id == current_user.id).first()
    if not addr:
        raise HTTPException(status_code=404, detail="Address not found")
    
    addr.is_default = True
    # Sync phone to profile
    current_user.phone = addr.phone
    
    db.commit()
    return {"status": "DEFAULT_SET"}

@router.delete("/addresses/{addr_id}")
def delete_address(addr_id: int, db: Session = Depends(get_db), current_user: user_models.User = Depends(get_current_user)):
    addr = db.query(user_models.Address).filter(user_models.Address.id == addr_id, user_models.Address.user_id == current_user.id).first()
    if not addr:
        raise HTTPException(status_code=404, detail="Address not found")
    db.delete(addr)
    db.commit()
    return {"status": "DELETED"}

# ─── IMAGE UPLOAD ─────────────────────────────────────────────────────────────
from fastapi import File, UploadFile
import uuid
import shutil

@router.post("/upload-image")
async def upload_image(file: UploadFile = File(...), current_user: user_models.User = Depends(get_current_user)):
    # Create directory if not exists
    os.makedirs("static/uploads", exist_ok=True)
    
    file_extension = file.filename.split(".")[-1]
    file_name = f"{uuid.uuid4()}.{file_extension}"
    file_path = f"static/uploads/{file_name}"
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Return the full URL
    image_url = f"http://127.0.0.1:8000/static/uploads/{file_name}"
    return {"url": image_url}
