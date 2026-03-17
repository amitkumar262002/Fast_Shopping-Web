from app.database import SessionLocal
from app.models import product as product_models

db = SessionLocal()

# Get Categories
categories = {c.name: c for c in db.query(product_models.Category).all()}

def get_or_create_category(name):
    if name in categories:
        return categories[name]
    cat = product_models.Category(name=name)
    db.add(cat)
    db.commit()
    db.refresh(cat)
    categories[name] = cat
    return cat

baby_cat = get_or_create_category("Baby & Kids")
wedding_cat = get_or_create_category("Wedding & Home")

extra_products = [
    # BABY PRODUCTS (Toys & Clothing)
    {
        "title": "LEGO Classic Medium Creative Brick Box",
        "description": "Infinite building possibilities for kids aged 4-15. Includes bricks in 35 different colors.",
        "price": 2499,
        "discount_price": 2999,
        "image": "https://m.media-amazon.com/images/I/71atvXN2Y9L._SX522_.jpg",
        "category": baby_cat,
        "rating": 4.8,
        "stock": 50,
        "brand": "LEGO"
    },
    {
        "title": "Kids Cotton T-Shirt Pack of 3",
        "description": "Soft and breathable cotton t-shirts for boys and girls aged 2-15 years.",
        "price": 899,
        "discount_price": 1299,
        "image": "https://m.media-amazon.com/images/I/61U0e+N5HQL._AC_UL480_FMwebp_QL65_.jpg",
        "category": baby_cat,
        "rating": 4.5,
        "stock": 100,
        "brand": "Fast Kids"
    },
    {
        "title": "Remote Control Stunt Car",
        "description": "High-speed 360 degree rotating stunt car with LED lights for kids.",
        "price": 1499,
        "discount_price": 2199,
        "image": "https://m.media-amazon.com/images/I/71p0WfB6LKL._SX522_.jpg",
        "category": baby_cat,
        "rating": 4.6,
        "stock": 30,
        "brand": "ToyZone"
    },
    {
        "title": "Baby Soft Walking Shoes",
        "description": "Anti-slip soft sole shoes for toddlers and kids. Comfortable and stylish.",
        "price": 599,
        "discount_price": 999,
        "image": "https://m.media-amazon.com/images/I/61m1P-s8YXL._AC_UL480_FMwebp_QL65_.jpg",
        "category": baby_cat,
        "rating": 4.4,
        "stock": 80,
        "brand": "TinyToes"
    },
    # WEDDING PRODUCTS
    {
        "title": "Premium Dinner Set - 32 Pieces",
        "description": "Elegant bone china dinner set perfect for wedding gifting and home hosting.",
        "price": 5999,
        "discount_price": 8999,
        "image": "https://m.media-amazon.com/images/I/61+9Z6LNoDL._SX679_.jpg",
        "category": wedding_cat,
        "rating": 4.7,
        "stock": 15,
        "brand": "Royal Home"
    },
    {
        "title": "Prestige Electric Kettle 1.5L",
        "description": "Essential kitchen appliance for modern homes. Fast boiling and automatic shut-off.",
        "price": 849,
        "discount_price": 1299,
        "image": "https://m.media-amazon.com/images/I/51p6K6B-KKL._SX679_.jpg",
        "category": wedding_cat,
        "rating": 4.3,
        "stock": 40,
        "brand": "Prestige"
    },
    {
        "title": "King Size Luxury Bedsheet Set",
        "description": "100% Cotton 300TC bedsheets with 2 pillow covers. Soft and premium feel.",
        "price": 1299,
        "discount_price": 1999,
        "image": "https://m.media-amazon.com/images/I/81S8Bf4vjML._SX679_.jpg",
        "category": wedding_cat,
        "rating": 4.5,
        "stock": 60,
        "brand": "LinenDecor"
    }
]

for p_data in extra_products:
    p = product_models.Product(
        title=p_data["title"],
        description=p_data["description"],
        price=p_data["price"],
        discount_price=p_data.get("discount_price"),
        image=p_data["image"],
        category=p_data["category"],
        rating=p_data["rating"],
        stock=p_data["stock"],
        brand=p_data["brand"]
    )
    db.add(p)

db.commit()
print("✅ Added extra products for Baby and Wedding registries!")
db.close()
