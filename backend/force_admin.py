import sys
sys.path.append('.')
from app.database import SessionLocal
from app.models.user import User
from app.core.security import hash_password

db = SessionLocal()

email = "fast_admin@protocol.io"
password = "Admin@Matrix2026"

admin = db.query(User).filter(User.email == email).first()
if not admin:
    print(f"Admin not found. Creating {email}...")
    admin = User(email=email, name="Fast Admin", phone="9999999999", role="admin")
    db.add(admin)

admin.password = hash_password(password)
admin.role = "admin"
db.commit()

print("Admin credentials updated successfully!")
db.close()
