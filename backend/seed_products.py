import sys
import os
from sqlalchemy.orm import Session
from datetime import datetime

# Add the current directory to sys.path to import app modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal, engine
from app.models.product import Category, Product, ProductImage
from app.models import product as product_models

def seed():
    db = SessionLocal()
    try:
        # 1. Create Categories
        categories_data = [
            {"name": "Mobiles", "icon": "Smartphone"},
            {"name": "Electronics", "icon": "Monitor"},
            {"name": "Fashion", "icon": "Shirt"},
            {"name": "Home & Kitchen", "icon": "Home"},
            {"name": "Beauty", "icon": "Sparkles"},
            {"name": "Audio", "icon": "Headphones"},
            {"name": "Gaming", "icon": "Gamepad2"},
            {"name": "Books", "icon": "Book"}
        ]

        category_map = {}
        for cat_data in categories_data:
            cat = db.query(Category).filter(Category.name == cat_data["name"]).first()
            if not cat:
                cat = Category(name=cat_data["name"], icon=cat_data["icon"])
                db.add(cat)
                db.commit()
                db.refresh(cat)
            category_map[cat_data["name"]] = cat.id

        # 2. Add Products
        products_data = [
            # MOBILES
            {
                "title": "iPhone 15 Pro Max (256GB) - Natural Titanium",
                "description": "The iPhone 15 Pro Max is forged in titanium and features the groundbreaking A17 Pro chip, a customizable Action button, and a more versatile Pro camera system.",
                "price": 159900,
                "discount_price": 148900,
                "category_name": "Mobiles",
                "stock": 50,
                "brand": "Apple",
                "rating": 4.8,
                "image": "https://images.unsplash.com/photo-1696446701796-da61225697cc?w=800&auto=format&fit=crop",
                "specs": {"Display": "6.7-inch Super Retina XDR", "Chip": "A17 Pro", "Camera": "48MP Main"}
            },
            {
                "title": "Samsung Galaxy S24 Ultra 5G (Titanium Gray)",
                "description": "Meet Galaxy S24 Ultra, the ultimate form of Galaxy Ultra with a new titanium exterior and a 17.25cm (6.8\") flat display.",
                "price": 129999,
                "discount_price": 119999,
                "category_name": "Mobiles",
                "stock": 45,
                "brand": "Samsung",
                "rating": 4.7,
                "image": "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&auto=format&fit=crop",
                "specs": {"Display": "6.8-inch Dynamic AMOLED", "Chip": "Snapdragon 8 Gen 3", "Camera": "200MP Quad"}
            },
            {
                "title": "OnePlus 12 (Silky Black, 12GB RAM, 256GB)",
                "description": "Smooth Beyond Belief. Powered by Snapdragon 8 Gen 3, with a 2K 120Hz ProXDR Display.",
                "price": 64999,
                "discount_price": 59999,
                "category_name": "Mobiles",
                "stock": 30,
                "brand": "OnePlus",
                "rating": 4.5,
                "image": "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop",
                "specs": {"RAM": "12GB", "Storage": "256GB", "Battery": "5400mAh"}
            },
            # ELECTRONICS
            {
                "title": "MacBook Air M2 Chip (13.6-inch, 8GB RAM, 256GB SSD)",
                "description": "Strikingly thin design. Supercharged by M2. Up to 18 hours of battery life.",
                "price": 99900,
                "discount_price": 84900,
                "category_name": "Electronics",
                "stock": 25,
                "brand": "Apple",
                "rating": 4.9,
                "image": "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop",
                "specs": {"Chip": "Apple M2", "RAM": "8GB", "Storage": "256GB SSD"}
            },
            {
                "title": "Sony WH-1000XM5 Wireless Noise Cancelling Headphones",
                "description": "The WH-1000XM5 headphones rewrite the rules for distraction-free listening.",
                "price": 29990,
                "discount_price": 24900,
                "category_name": "Audio",
                "stock": 100,
                "brand": "Sony",
                "rating": 4.8,
                "image": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop",
                "specs": {"Type": "Over-Ear", "Battery": "30 Hours", "Bluetooth": "5.2"}
            },
            # FASHION
            {
                "title": "Nike Air Max 270 Men's Shoes",
                "description": "Nike's first lifestyle Air Max brings you style, comfort and big attitude.",
                "price": 12995,
                "discount_price": 10995,
                "category_name": "Fashion",
                "stock": 60,
                "brand": "Nike",
                "rating": 4.6,
                "image": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop",
                "specs": {"Color": "Black/White", "Material": "Mesh"}
            },
            {
                "title": "Levi's Men's 511 Slim Fit Jeans",
                "description": "A modern slim with room to move, the 511 Slim Fit Jeans are a classic since right now.",
                "price": 3299,
                "discount_price": 2299,
                "category_name": "Fashion",
                "stock": 150,
                "brand": "Levi's",
                "rating": 4.3,
                "image": "https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&auto=format&fit=crop",
                "specs": {"Fit": "Slim", "Material": "Denim"}
            },
            # HOME & KITCHEN
            {
                "title": "Dyson V11 Absolute Cord-Free Vacuum Cleaner",
                "description": "Intelligently cleans your home. Twice the suction of any cord-free vacuum.",
                "price": 45900,
                "discount_price": 39900,
                "category_name": "Home & Kitchen",
                "stock": 15,
                "brand": "Dyson",
                "rating": 4.7,
                "image": "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=800&auto=format&fit=crop",
                "specs": {"Type": "Cordless", "Run Time": "60 Mins"}
            },
            # BEAUTY
            {
                "title": "Chanel No. 5 Eau de Parfum Spray",
                "description": "The essence of femininity. A floral aldehyde bouquet.",
                "price": 14500,
                "discount_price": 13500,
                "category_name": "Beauty",
                "stock": 40,
                "brand": "Chanel",
                "rating": 4.9,
                "image": "https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&auto=format&fit=crop",
                "specs": {"Size": "100ml", "Fragrance": "Floral"}
            },
            # GAMING
            {
                "title": "PlayStation 5 Console (Disc Edition)",
                "description": "Experience lightning-fast loading with an ultra-high-speed SSD.",
                "price": 54990,
                "discount_price": 49990,
                "category_name": "Gaming",
                "stock": 20,
                "brand": "Sony",
                "rating": 4.9,
                "image": "https://images.unsplash.com/photo-1606813907291-d86ebb9b7427?w=800&auto=format&fit=crop",
                "specs": {"Storage": "825GB SSD", "Resolution": "4K/120fps"}
            }
        ]

        # Add more random products to make it look full
        for i in range(1, 11):
            products_data.append({
                "title": f"Premium Wireless Earbuds Pro {i}",
                "description": "Crystal clear sound with advanced active noise cancellation and long battery life.",
                "price": 5999 + (i * 100),
                "discount_price": 3999 + (i * 100),
                "category_name": "Audio",
                "stock": 100,
                "brand": "FastAudio",
                "rating": 4.2,
                "image": f"https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop",
                "specs": {"Battery": "24h", "Waterproof": "IPX7"}
            })

        for p_data in products_data:
            cat_name = p_data.pop("category_name")
            p_data["category_id"] = category_map[cat_name]
            
            # Check if product exists by title
            p = db.query(Product).filter(Product.title == p_data["title"]).first()
            if not p:
                p = Product(**p_data)
                db.add(p)
                db.commit()
                print(f"Added: {p.title}")

        print("Seeding complete! 🚀")

    except Exception as e:
        print(f"Error during seeding: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed()
