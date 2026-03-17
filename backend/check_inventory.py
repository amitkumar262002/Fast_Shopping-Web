from app.database import SessionLocal
from app.models import product as product_models

db = SessionLocal()
products = db.query(product_models.Product).all()
print(f"Total Products: {len(products)}")
for p in products:
    cat_name = p.category.name if p.category else "No Category"
    print(f"- {p.title} | {cat_name} | ₹{p.price}")
db.close()
