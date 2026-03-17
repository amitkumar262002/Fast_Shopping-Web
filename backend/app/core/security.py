"""
Fast Shopping - Security Core Module
JWT Authentication + PBKDF2 Password Hashing (cross-platform compatible)
"""
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import user as user_models
import hashlib, os, secrets

SECRET_KEY = os.getenv("SECRET_KEY", "fastshopping-enterprise-secret-2026-xK9mL2pQ8nR3vT")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days

security = HTTPBearer(auto_error=False)

def hash_password(password: str) -> str:
    """PBKDF2-SHA256 password hashing - secure and cross-platform"""
    salt = secrets.token_hex(16)
    key = hashlib.pbkdf2_hmac("sha256", password.encode(), salt.encode(), 310000)
    return f"pbkdf2:sha256:{salt}:{key.hex()}"

def verify_password(plain: str, hashed: str) -> bool:
    """Verify password against stored hash"""
    if not hashed or ":" not in hashed:
        # Legacy SHA256 support
        import hashlib as _h
        return _h.sha256(plain.encode()).hexdigest() == hashed
    try:
        parts = hashed.split(":")
        if len(parts) < 4:
            return False
        _, algo, salt, stored_key = parts[0], parts[1], parts[2], parts[3]
        key = hashlib.pbkdf2_hmac("sha256", plain.encode(), salt.encode(), 310000)
        return key.hex() == stored_key
    except Exception:
        return False

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> user_models.User:
    if not credentials:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: int = int(payload.get("sub"))
    except (JWTError, TypeError, ValueError):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    
    user = db.query(user_models.User).filter(user_models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return user

def get_current_user_optional(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> Optional[user_models.User]:
    if not credentials:
        return None
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: int = int(payload.get("sub"))
        return db.query(user_models.User).filter(user_models.User.id == user_id).first()
    except Exception:
        return None

def require_admin(current_user: user_models.User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user
