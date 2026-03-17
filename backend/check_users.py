from app.database import SessionLocal
from app.models.user import User

db = SessionLocal()
try:
    users = db.query(User).all()
    for u in users:
        print(f"ID: {u.id} | Name: {u.name} | Email: {u.email} | Role: {u.role}")
finally:
    db.close()
