import requests
import random
from sqlalchemy.orm import Session
from app.database import SessionLocal, engine
from app.models import Category, Product, ProductImage, User, Order
import json

# Product Data Pool for seeding
CATEGORIES = [
    {"name": "Mobiles", "icon": "Smartphone"},
    {"name": "Electronics", "icon": "Monitor"},
    {"name": "Fashion", "icon": "ShoppingBag"},
    {"name": "Home", "icon": "Home"},
    {"name": "Appliances", "icon": "Zap"},
    {"name": "Accessories", "icon": "Watch"},
    {"name": "Audio", "icon": "Headphones"},
    {"name": "Gaming", "icon": "Gamepad"}
]

BRANDS = {
    "Mobiles": ["Apple", "Samsung", "OnePlus", "Google", "Xiaomi", "Nothing"],
    "Electronics": ["Dell", "HP", "ASUS", "Lenovo", "MSI", "Microsoft"],
    "Fashion": ["Nike", "Adidas", "Puma", "Levi's", "Zara", "H&M"],
    "Home": ["Dyson", "Philips", "IKEA", "SleepyCat"],
    "Audio": ["Sony", "Bose", "JBL", "Sennheiser", "Marshall"],
    "Gaming": ["Razer", "Logitech", "Corsair", "SteelSeries", "Nintendo"]
}

IMAGE_POOLS = {
    "Mobiles": [
        "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80",
        "https://images.unsplash.com/photo-1592890288564-76628a30a657?w=800&q=80",
        "https://images.unsplash.com/photo-1573148195900-7845dcb9b127?w=800&q=80",
        "https://images.unsplash.com/photo-1616348436168-de43ad0db179?w=800&q=80"
    ],
    "Electronics": [
        "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80",
        "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=800&q=80",
        "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=800&q=80"
    ],
    "Audio": [
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80",
        "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&q=80",
        "https://images.unsplash.com/photo-1583394838336-34b92c74fe92?w=800&q=80"
    ],
    "Fashion": [
        "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80",
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80",
        "https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=800&q=80"
    ]
}

DEFAULT_IMAGE = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80"

def seed_db():
    db = SessionLocal()
    
    # Check if data already exists to avoid duplication
    if db.query(Category).count() > 0:
        print("Data already exists. Skipping seeds.")
        db.close()
        return

    print("Seeding Enterprise Database...")

    # Create Categories
    category_map = {}
    for cat in CATEGORIES:
        category = Category(name=cat["name"], icon=cat["icon"])
        db.add(category)
        db.flush() # To get ID
        category_map[cat["name"]] = category.id

    # Create 200+ Products
    product_count = 0
    for cat_name, cat_id in category_map.items():
        base_brands = BRANDS.get(cat_name, ["Generic"])
        for i in range(25): # 25 products per category x 8 categories = 200 products
            brand = random.choice(base_brands)
            name = f"{brand} {cat_name[:-1] if cat_name.endswith('s') else cat_name} Elite Pro {i+1}"
            price = random.randint(1000, 150000)
            original_price = int(price * (1 + random.uniform(0.1, 0.4)))
            
            product = Product(
                title=name,
                description=f"Advanced {cat_name} solution for enterprise-grade performance. Featuring revolutionary technology and high-speed synchronization.",
                price=price,
                discount_price=None,
                stock=random.randint(5, 100),
                rating=round(random.uniform(4.0, 5.0), 1),
                brand=brand,
                category_id=cat_id,
                specs={
                    "Node Type": "Enterprise",
                    "Security": "RSA Enabled",
                    "Warranty": "36 Cycles",
                    "Region": "Global"
                }
            )
            db.add(product)
            db.flush()

            # Add Images
            img_url = random.choice(IMAGE_POOLS.get(cat_name, [DEFAULT_IMAGE]))
            product.image = img_url # Main product image
            
            img = ProductImage(product_id=product.id, image_url=img_url)
            db.add(img)

            
            product_count += 1

    db.commit()
    print(f"Successfully deployed {product_count} product nodes to the ecosystem.")
    db.close()

if __name__ == "__main__":
    seed_db()
