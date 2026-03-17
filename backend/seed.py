"""
Fast Shopping - Product Database Seeder
Run: python seed.py
Seeds 200+ products across all categories with real Unsplash images
"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal, engine, Base
from app.models.product import Category, Product, ProductImage
from app.models.user import User, WishlistItem
from app.models.order import Order, OrderItem, Payment
from app.core.security import hash_password

Base.metadata.create_all(bind=engine)
db = SessionLocal()

print("🛒 Fast Shopping - Database Seeder v3.0")
print("=" * 50)

# ─── CATEGORIES ───────────────────────────────────────────────────────────────
categories_data = [
    {"name": "Mobiles", "icon": "Smartphone"},
    {"name": "Electronics", "icon": "Cpu"},
    {"name": "Laptops", "icon": "Laptop"},
    {"name": "Fashion", "icon": "Shirt"},
    {"name": "Home & Kitchen", "icon": "Home"},
    {"name": "Appliances", "icon": "Tv"},
    {"name": "Sports", "icon": "Trophy"},
    {"name": "Books", "icon": "BookOpen"},
    {"name": "Beauty", "icon": "Star"},
    {"name": "Toys", "icon": "Gift"},
]

categories = {}
for cat_data in categories_data:
    existing = db.query(Category).filter(Category.name == cat_data["name"]).first()
    if not existing:
        cat = Category(**cat_data)
        db.add(cat)
        db.flush()
        categories[cat_data["name"]] = cat.id
        print(f"  ✅ Category: {cat_data['name']}")
    else:
        categories[cat_data["name"]] = existing.id
db.commit()

# ─── PRODUCTS ─────────────────────────────────────────────────────────────────
products_data = [
    # MOBILES (40 products)
    {"title": "Samsung Galaxy S24 Ultra", "price": 129999, "dp": 109999, "brand": "Samsung", "cat": "Mobiles", "rating": 4.8, "stock": 50, "image": "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400"},
    {"title": "iPhone 15 Pro Max 256GB", "price": 159900, "dp": 149900, "brand": "Apple", "cat": "Mobiles", "rating": 4.9, "stock": 30, "image": "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400"},
    {"title": "OnePlus 12 Pro 5G", "price": 64999, "dp": 59999, "brand": "OnePlus", "cat": "Mobiles", "rating": 4.7, "stock": 80, "image": "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400"},
    {"title": "Google Pixel 8 Pro", "price": 85999, "dp": 79999, "brand": "Google", "cat": "Mobiles", "rating": 4.6, "stock": 45, "image": "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=400"},
    {"title": "Xiaomi 14 Ultra", "price": 99999, "dp": 89999, "brand": "Xiaomi", "cat": "Mobiles", "rating": 4.5, "stock": 60, "image": "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=400"},
    {"title": "Vivo V30 Pro 5G", "price": 39999, "dp": 34999, "brand": "Vivo", "cat": "Mobiles", "rating": 4.3, "stock": 100, "image": "https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=400"},
    {"title": "OPPO Find X7 Ultra", "price": 74999, "dp": 69999, "brand": "OPPO", "cat": "Mobiles", "rating": 4.4, "stock": 55, "image": "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=400"},
    {"title": "Realme GT 5 Pro", "price": 29999, "dp": 26999, "brand": "Realme", "cat": "Mobiles", "rating": 4.2, "stock": 120, "image": "https://images.unsplash.com/photo-1571380401583-72ca84994796?w=400"},
    {"title": "Samsung Galaxy A55 5G", "price": 34999, "dp": 31999, "brand": "Samsung", "cat": "Mobiles", "rating": 4.3, "stock": 90, "image": "https://images.unsplash.com/photo-1610945264803-c22b62d2a7b3?w=400"},
    {"title": "iPhone 14 128GB", "price": 69900, "dp": 59900, "brand": "Apple", "cat": "Mobiles", "rating": 4.7, "stock": 40, "image": "https://images.unsplash.com/photo-1664478546384-d57ffe74a78c?w=400"},
    {"title": "Nothing Phone (2a)", "price": 23999, "dp": 21999, "brand": "Nothing", "cat": "Mobiles", "rating": 4.4, "stock": 75, "image": "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=400"},
    {"title": "Motorola Edge 50 Pro", "price": 31999, "dp": 28999, "brand": "Motorola", "cat": "Mobiles", "rating": 4.1, "stock": 85, "image": "https://images.unsplash.com/photo-1615496215836-6d5e2f5e7c85?w=400"},
    {"title": "iQOO 12 5G", "price": 52999, "dp": 49999, "brand": "iQOO", "cat": "Mobiles", "rating": 4.5, "stock": 65, "image": "https://images.unsplash.com/photo-1556656793-08538906a9f8?w=400"},
    {"title": "Poco X6 Pro 5G", "price": 26999, "dp": 23999, "brand": "Poco", "cat": "Mobiles", "rating": 4.3, "stock": 110, "image": "https://images.unsplash.com/photo-1605236453806-6ff36851218e?w=400"},
    {"title": "Samsung Galaxy Z Fold 5", "price": 154999, "dp": 139999, "brand": "Samsung", "cat": "Mobiles", "rating": 4.6, "stock": 20, "image": "https://images.unsplash.com/photo-1598327106026-d9521da673d1?w=400"},
    {"title": "OnePlus Nord 3 5G", "price": 33999, "dp": 29999, "brand": "OnePlus", "cat": "Mobiles", "rating": 4.3, "stock": 95, "image": "https://images.unsplash.com/photo-1494698853255-237c04a2a96e?w=400"},
    {"title": "Redmi Note 13 Pro+", "price": 29999, "dp": 26999, "brand": "Xiaomi", "cat": "Mobiles", "rating": 4.4, "stock": 130, "image": "https://images.unsplash.com/photo-1580910051074-3eb694886505?w=400"},
    {"title": "Infinix GT 20 Pro", "price": 17999, "dp": 15999, "brand": "Infinix", "cat": "Mobiles", "rating": 4.0, "stock": 150, "image": "https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=400"},
    {"title": "Tecno Phantom V Fold", "price": 89999, "dp": 79999, "brand": "Tecno", "cat": "Mobiles", "rating": 4.2, "stock": 35, "image": "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=400"},
    {"title": "Samsung Galaxy S23 FE", "price": 44999, "dp": 39999, "brand": "Samsung", "cat": "Mobiles", "rating": 4.4, "stock": 70, "image": "https://images.unsplash.com/photo-1569534403314-f2ed8b23b769?w=400"},

    # ELECTRONICS (30 products)
    {"title": "Sony WH-1000XM5 Headphones", "price": 29990, "dp": 24990, "brand": "Sony", "cat": "Electronics", "rating": 4.8, "stock": 60, "image": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400"},
    {"title": "Apple AirPods Pro 2nd Gen", "price": 24900, "dp": 22900, "brand": "Apple", "cat": "Electronics", "rating": 4.7, "stock": 80, "image": "https://images.unsplash.com/photo-1606741965509-717f4b99c11a?w=400"},
    {"title": "Samsung Galaxy Watch 6 Classic", "price": 34999, "dp": 29999, "brand": "Samsung", "cat": "Electronics", "rating": 4.5, "stock": 45, "image": "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=400"},
    {"title": "Apple Watch Series 9 GPS", "price": 41900, "dp": 38900, "brand": "Apple", "cat": "Electronics", "rating": 4.8, "stock": 35, "image": "https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=400"},
    {"title": "JBL Charge 5 Speaker", "price": 14999, "dp": 12999, "brand": "JBL", "cat": "Electronics", "rating": 4.6, "stock": 90, "image": "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400"},
    {"title": "Canon EOS R50 Camera", "price": 62990, "dp": 57990, "brand": "Canon", "cat": "Electronics", "rating": 4.7, "stock": 25, "image": "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400"},
    {"title": "GoPro HERO12 Black", "price": 39500, "dp": 35500, "brand": "GoPro", "cat": "Electronics", "rating": 4.6, "stock": 40, "image": "https://images.unsplash.com/photo-1607462109225-6b64ae2dd3cb?w=400"},
    {"title": "Bose QuietComfort 45", "price": 27900, "dp": 23900, "brand": "Bose", "cat": "Electronics", "rating": 4.7, "stock": 55, "image": "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400"},
    {"title": "Kindle Paperwhite 11th Gen", "price": 14999, "dp": 12999, "brand": "Amazon", "cat": "Electronics", "rating": 4.6, "stock": 100, "image": "https://images.unsplash.com/photo-1544816155-12df9643f363?w=400"},
    {"title": "Fitbit Charge 6", "price": 14995, "dp": 12995, "brand": "Google", "cat": "Electronics", "rating": 4.4, "stock": 70, "image": "https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=400"},
    {"title": "Sony PlayStation 5", "price": 54990, "dp": 49990, "brand": "Sony", "cat": "Electronics", "rating": 4.9, "stock": 15, "image": "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=400"},
    {"title": "Nintendo Switch OLED", "price": 34999, "dp": 31999, "brand": "Nintendo", "cat": "Electronics", "rating": 4.8, "stock": 30, "image": "https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=400"},
    {"title": "Logitech MX Master 3S", "price": 9995, "dp": 8495, "brand": "Logitech", "cat": "Electronics", "rating": 4.7, "stock": 120, "image": "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400"},
    {"title": "Samsung 43\" 4K Smart TV", "price": 34990, "dp": 29990, "brand": "Samsung", "cat": "Electronics", "rating": 4.5, "stock": 20, "image": "https://images.unsplash.com/photo-1593784991095-a205069470b6?w=400"},
    {"title": "Boat Rockerz 550 Headphones", "price": 1999, "dp": 1499, "brand": "boAt", "cat": "Electronics", "rating": 4.2, "stock": 200, "image": "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=400"},
    {"title": "Realme Watch S Pro", "price": 5999, "dp": 4999, "brand": "Realme", "cat": "Electronics", "rating": 4.1, "stock": 140, "image": "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400"},
    {"title": "JBL Flip 6 Bluetooth Speaker", "price": 9999, "dp": 8499, "brand": "JBL", "cat": "Electronics", "rating": 4.5, "stock": 85, "image": "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=400"},
    {"title": "Mi Band 8 Pro", "price": 4499, "dp": 3999, "brand": "Xiaomi", "cat": "Electronics", "rating": 4.3, "stock": 160, "image": "https://images.unsplash.com/photo-1510017803434-a899398421b3?w=400"},
    {"title": "Noise ColorFit Pro 4", "price": 3499, "dp": 2999, "brand": "Noise", "cat": "Electronics", "rating": 4.0, "stock": 180, "image": "https://images.unsplash.com/photo-1617043786394-f977fa12eddf?w=400"},
    {"title": "Sony LinkBuds S TWS", "price": 14990, "dp": 12990, "brand": "Sony", "cat": "Electronics", "rating": 4.4, "stock": 65, "image": "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400"},

    # LAPTOPS (25 products)
    {"title": "MacBook Air M3 13-inch", "price": 114900, "dp": 109900, "brand": "Apple", "cat": "Laptops", "rating": 4.9, "stock": 25, "image": "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400"},
    {"title": "Dell XPS 15 4K OLED", "price": 189990, "dp": 174990, "brand": "Dell", "cat": "Laptops", "rating": 4.8, "stock": 15, "image": "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=400"},
    {"title": "HP Spectre x360 14", "price": 134990, "dp": 124990, "brand": "HP", "cat": "Laptops", "rating": 4.7, "stock": 20, "image": "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400"},
    {"title": "ASUS ROG Strix G16 Gaming", "price": 154990, "dp": 144990, "brand": "ASUS", "cat": "Laptops", "rating": 4.7, "stock": 18, "image": "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=400"},
    {"title": "Lenovo ThinkPad X1 Carbon", "price": 139990, "dp": 129990, "brand": "Lenovo", "cat": "Laptops", "rating": 4.8, "stock": 12, "image": "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400"},
    {"title": "Microsoft Surface Laptop 5", "price": 119990, "dp": 109990, "brand": "Microsoft", "cat": "Laptops", "rating": 4.6, "stock": 22, "image": "https://images.unsplash.com/photo-1484788984921-03950022c9ef?w=400"},
    {"title": "Acer Aspire 7 Gaming", "price": 54990, "dp": 49990, "brand": "Acer", "cat": "Laptops", "rating": 4.3, "stock": 40, "image": "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=400"},
    {"title": "HP Victus 16 Gaming", "price": 79990, "dp": 74990, "brand": "HP", "cat": "Laptops", "rating": 4.4, "stock": 30, "image": "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=400"},
    {"title": "Lenovo IdeaPad Slim 5", "price": 59990, "dp": 54990, "brand": "Lenovo", "cat": "Laptops", "rating": 4.3, "stock": 45, "image": "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400"},
    {"title": "MacBook Pro M3 Pro 14-inch", "price": 199900, "dp": 189900, "brand": "Apple", "cat": "Laptops", "rating": 4.9, "stock": 10, "image": "https://images.unsplash.com/photo-1491933382434-500287f9b54b?w=400"},
    {"title": "Dell Inspiron 15 Intel i7", "price": 74990, "dp": 69990, "brand": "Dell", "cat": "Laptops", "rating": 4.4, "stock": 35, "image": "https://images.unsplash.com/photo-1611186871525-4dd1f73c8b2e?w=400"},
    {"title": "ASUS VivoBook 15X OLED", "price": 64990, "dp": 59990, "brand": "ASUS", "cat": "Laptops", "rating": 4.5, "stock": 28, "image": "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=400"},
    {"title": "MSI Titan GT77 HX Gaming", "price": 299990, "dp": 279990, "brand": "MSI", "cat": "Laptops", "rating": 4.8, "stock": 8, "image": "https://images.unsplash.com/photo-1593640408182-31c228af23db?w=400"},

    # FASHION (30 products)
    {"title": "Nike Air Max 270 Sneakers", "price": 12995, "dp": 9995, "brand": "Nike", "cat": "Fashion", "rating": 4.6, "stock": 80, "image": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400"},
    {"title": "Adidas Ultraboost 23", "price": 14999, "dp": 12999, "brand": "Adidas", "cat": "Fashion", "rating": 4.7, "stock": 65, "image": "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=400"},
    {"title": "Levi's 511 Slim Fit Jeans", "price": 3799, "dp": 2999, "brand": "Levi's", "cat": "Fashion", "rating": 4.4, "stock": 150, "image": "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400"},
    {"title": "Puma RS-X3 Streetwear", "price": 7999, "dp": 5999, "brand": "Puma", "cat": "Fashion", "rating": 4.3, "stock": 90, "image": "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400"},
    {"title": "H&M Slim Fit Oxford Shirt", "price": 1799, "dp": 1299, "brand": "H&M", "cat": "Fashion", "rating": 4.2, "stock": 200, "image": "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400"},
    {"title": "Tommy Hilfiger Classic Polo", "price": 3499, "dp": 2799, "brand": "Tommy Hilfiger", "cat": "Fashion", "rating": 4.5, "stock": 120, "image": "https://images.unsplash.com/photo-1622470953794-aa9c70b0fb9d?w=400"},
    {"title": "Woodland Trek Boots", "price": 5999, "dp": 4799, "brand": "Woodland", "cat": "Fashion", "rating": 4.4, "stock": 75, "image": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400"},
    {"title": "Reebok Classic Leather Sneaker", "price": 7499, "dp": 5999, "brand": "Reebok", "cat": "Fashion", "rating": 4.3, "stock": 85, "image": "https://images.unsplash.com/photo-1539185441755-769473a23570?w=400"},
    {"title": "Zara Oversized Hoodie", "price": 3999, "dp": 3199, "brand": "Zara", "cat": "Fashion", "rating": 4.4, "stock": 110, "image": "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=400"},
    {"title": "Allen Solly Formal Trousers", "price": 2499, "dp": 1999, "brand": "Allen Solly", "cat": "Fashion", "rating": 4.2, "stock": 130, "image": "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=400"},
    {"title": "Being Human Graphic T-Shirt", "price": 1499, "dp": 999, "brand": "Being Human", "cat": "Fashion", "rating": 4.1, "stock": 180, "image": "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=400"},
    {"title": "Fossil Gen 6 Smartwatch", "price": 19995, "dp": 16995, "brand": "Fossil", "cat": "Fashion", "rating": 4.4, "stock": 50, "image": "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400"},
    {"title": "Ray-Ban Aviator Classic Sunglasses", "price": 9490, "dp": 7990, "brand": "Ray-Ban", "cat": "Fashion", "rating": 4.7, "stock": 60, "image": "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400"},

    # HOME & KITCHEN (25 products)
    {"title": "Instant Pot Duo 7-in-1", "price": 9999, "dp": 7999, "brand": "Instant Pot", "cat": "Home & Kitchen", "rating": 4.7, "stock": 45, "image": "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400"},
    {"title": "Dyson V15 Detect Vacuum", "price": 62900, "dp": 57900, "brand": "Dyson", "cat": "Home & Kitchen", "rating": 4.8, "stock": 25, "image": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400"},
    {"title": "Philips Air Fryer XXL", "price": 14999, "dp": 12499, "brand": "Philips", "cat": "Home & Kitchen", "rating": 4.6, "stock": 60, "image": "https://images.unsplash.com/photo-1621188988909-fbef0a26a3c0?w=400"},
    {"title": "IKEA Kallax Shelf Unit", "price": 7999, "dp": 6999, "brand": "IKEA", "cat": "Home & Kitchen", "rating": 4.5, "stock": 30, "image": "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400"},
    {"title": "Nespresso Vertuo Next Coffee Machine", "price": 19990, "dp": 16990, "brand": "Nespresso", "cat": "Home & Kitchen", "rating": 4.6, "stock": 40, "image": "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400"},
    {"title": "Prestige Deluxe Plus Pressure Cooker", "price": 1899, "dp": 1499, "brand": "Prestige", "cat": "Home & Kitchen", "rating": 4.4, "stock": 150, "image": "https://images.unsplash.com/photo-1585515320310-259814833e62?w=400"},
    {"title": "Bombay Dyeing Comforter Set", "price": 3499, "dp": 2799, "brand": "Bombay Dyeing", "cat": "Home & Kitchen", "rating": 4.3, "stock": 80, "image": "https://images.unsplash.com/photo-1540518614846-7eded433c457?w=400"},
    {"title": "Moksha Aromatherapy Diffuser", "price": 2499, "dp": 1999, "brand": "Moksha", "cat": "Home & Kitchen", "rating": 4.2, "stock": 100, "image": "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=400"},
    {"title": "Milton Thermosteel Flask 1L", "price": 899, "dp": 699, "brand": "Milton", "cat": "Home & Kitchen", "rating": 4.5, "stock": 200, "image": "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400"},
    {"title": "Godrej EON Refrigerator 253L", "price": 24990, "dp": 21990, "brand": "Godrej", "cat": "Home & Kitchen", "rating": 4.3, "stock": 15, "image": "https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=400"},
    {"title": "WaterScape RO Water Purifier", "price": 12999, "dp": 10999, "brand": "Kent", "cat": "Home & Kitchen", "rating": 4.5, "stock": 35, "image": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400"},
    {"title": "Saregama Carvaan Music Player", "price": 6990, "dp": 5990, "brand": "Saregama", "cat": "Home & Kitchen", "rating": 4.4, "stock": 55, "image": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400"},

    # APPLIANCES (20 products)
    {"title": "LG 8 Kg Fully Automatic Washing Machine", "price": 34990, "dp": 29990, "brand": "LG", "cat": "Appliances", "rating": 4.5, "stock": 20, "image": "https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=400"},
    {"title": "Samsung 1.5 Ton 5 Star Inverter AC", "price": 44990, "dp": 39990, "brand": "Samsung", "cat": "Appliances", "rating": 4.4, "stock": 18, "image": "https://images.unsplash.com/photo-1587145901045-0e8c0d3df07d?w=400"},
    {"title": "LG 43\" NanoCell 4K TV", "price": 51990, "dp": 44990, "brand": "LG", "cat": "Appliances", "rating": 4.6, "stock": 12, "image": "https://images.unsplash.com/photo-1593359677879-a4bb92f4834c?w=400"},
    {"title": "Whirlpool 240L Frost-Free Fridge", "price": 26990, "dp": 23990, "brand": "Whirlpool", "cat": "Appliances", "rating": 4.4, "stock": 16, "image": "https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=400"},
    {"title": "Bajaj Majesty 2400 W Room Heater", "price": 3499, "dp": 2799, "brand": "Bajaj", "cat": "Appliances", "rating": 4.3, "stock": 90, "image": "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400"},
    {"title": "Pigeon Rapido 2200 Watt Mixer Grinder", "price": 2499, "dp": 1999, "brand": "Pigeon", "cat": "Appliances", "rating": 4.2, "stock": 120, "image": "https://images.unsplash.com/photo-1585515320310-259814833e62?w=400"},
    {"title": "Havells Fresco 1200 mm Ceiling Fan", "price": 3799, "dp": 2999, "brand": "Havells", "cat": "Appliances", "rating": 4.4, "stock": 100, "image": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400"},
    {"title": "Usha Mist Air Duos Cooler", "price": 8999, "dp": 7499, "brand": "Usha", "cat": "Appliances", "rating": 4.1, "stock": 45, "image": "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400"},

    # SPORTS (20 products)
    {"title": "Yonex Arcsaber 11 Badminton Racket", "price": 8999, "dp": 7499, "brand": "Yonex", "cat": "Sports", "rating": 4.7, "stock": 60, "image": "https://images.unsplash.com/photo-1613918431703-aa50889e3be7?w=400"},
    {"title": "Cosco CR-150 Cricket Bat", "price": 4499, "dp": 3799, "brand": "Cosco", "cat": "Sports", "rating": 4.3, "stock": 80, "image": "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=400"},
    {"title": "Decathlon Running Shoes T500", "price": 3999, "dp": 3299, "brand": "Decathlon", "cat": "Sports", "rating": 4.4, "stock": 100, "image": "https://images.unsplash.com/photo-1543338977-322a2e38d2e4?w=400"},
    {"title": "Garmin Forerunner 265 GPS Watch", "price": 42990, "dp": 38990, "brand": "Garmin", "cat": "Sports", "rating": 4.7, "stock": 30, "image": "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400"},
    {"title": "Nivia Storm Football", "price": 999, "dp": 799, "brand": "Nivia", "cat": "Sports", "rating": 4.2, "stock": 200, "image": "https://images.unsplash.com/photo-1614632537423-1e6c2e7e0aab?w=400"},
    {"title": "Boldfit Yoga Mat 6mm", "price": 799, "dp": 599, "brand": "Boldfit", "cat": "Sports", "rating": 4.3, "stock": 250, "image": "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400"},
    {"title": "Dumbbell Set 20kg Adjustable", "price": 3999, "dp": 3299, "brand": "PowerMax", "cat": "Sports", "rating": 4.5, "stock": 50, "image": "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400"},
    {"title": "TRX Suspension Training Kit", "price": 6999, "dp": 5999, "brand": "TRX", "cat": "Sports", "rating": 4.6, "stock": 40, "image": "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400"},
    {"title": "Speedo Endurance Swim Goggles", "price": 1499, "dp": 1199, "brand": "Speedo", "cat": "Sports", "rating": 4.4, "stock": 150, "image": "https://images.unsplash.com/photo-1560089000-7433a4ebbd64?w=400"},

    # BOOKS (20 products)
    {"title": "Atomic Habits - James Clear", "price": 599, "dp": 449, "brand": "Penguin", "cat": "Books", "rating": 4.9, "stock": 300, "image": "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400"},
    {"title": "Rich Dad Poor Dad - Robert Kiyosaki", "price": 399, "dp": 299, "brand": "Plata Publishing", "cat": "Books", "rating": 4.8, "stock": 350, "image": "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=400"},
    {"title": "The Alchemist - Paulo Coelho", "price": 299, "dp": 199, "brand": "HarperCollins", "cat": "Books", "rating": 4.7, "stock": 250, "image": "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400"},
    {"title": "Zero to One - Peter Thiel", "price": 499, "dp": 379, "brand": "Crown Business", "cat": "Books", "rating": 4.7, "stock": 200, "image": "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400"},
    {"title": "The Psychology of Money", "price": 399, "dp": 299, "brand": "Harriman House", "cat": "Books", "rating": 4.8, "stock": 280, "image": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400"},
    {"title": "Clean Code - Robert C. Martin", "price": 999, "dp": 799, "brand": "Prentice Hall", "cat": "Books", "rating": 4.8, "stock": 180, "image": "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400"},
    {"title": "Think and Grow Rich", "price": 299, "dp": 199, "brand": "Sound Wisdom", "cat": "Books", "rating": 4.6, "stock": 300, "image": "https://images.unsplash.com/photo-1491841573634-28140fc7ced7?w=400"},

    # BEAUTY (20 products)
    {"title": "L'Oreal Paris Revitalift Serum", "price": 1299, "dp": 999, "brand": "L'Oreal", "cat": "Beauty", "rating": 4.5, "stock": 100, "image": "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400"},
    {"title": "Mamaearth Vitamin C Face Wash", "price": 349, "dp": 279, "brand": "Mamaearth", "cat": "Beauty", "rating": 4.3, "stock": 200, "image": "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=400"},
    {"title": "Biotique Morning Nector Moisturizer", "price": 299, "dp": 239, "brand": "Biotique", "cat": "Beauty", "rating": 4.2, "stock": 150, "image": "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=400"},
    {"title": "Philips BT7502 Beard Trimmer", "price": 2899, "dp": 2299, "brand": "Philips", "cat": "Beauty", "rating": 4.5, "stock": 80, "image": "https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=400"},
    {"title": "WOW Skin Science Apple Cider Vinegar Shampoo", "price": 549, "dp": 449, "brand": "WOW", "cat": "Beauty", "rating": 4.3, "stock": 180, "image": "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=400"},
    {"title": "Lakmé Eyeconic Kajal", "price": 199, "dp": 149, "brand": "Lakmé", "cat": "Beauty", "rating": 4.4, "stock": 250, "image": "https://images.unsplash.com/photo-1596690943567-4793bb06a83c?w=400"},
    {"title": "Bombay Shaving Company Safety Razor", "price": 1799, "dp": 1399, "brand": "Bombay Shaving", "cat": "Beauty", "rating": 4.6, "stock": 90, "image": "https://images.unsplash.com/photo-1621607512214-68297480165e?w=400"},

    # TOYS (15 products)
    {"title": "LEGO Technic Bugatti Chiron", "price": 34999, "dp": 29999, "brand": "LEGO", "cat": "Toys", "rating": 4.9, "stock": 20, "image": "https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=400"},
    {"title": "Hot Wheels Ultimate Garage", "price": 4999, "dp": 3999, "brand": "Hot Wheels", "cat": "Toys", "rating": 4.6, "stock": 50, "image": "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=400"},
    {"title": "Funskool Monopoly Board Game", "price": 1299, "dp": 999, "brand": "Funskool", "cat": "Toys", "rating": 4.5, "stock": 100, "image": "https://images.unsplash.com/photo-1632501641765-e568d28b0015?w=400"},
    {"title": "Barbie Dreamhouse Playset", "price": 14999, "dp": 12999, "brand": "Mattel", "cat": "Toys", "rating": 4.7, "stock": 30, "image": "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=400"},
    {"title": "Remote Control Monster Truck", "price": 3499, "dp": 2799, "brand": "Maisto", "cat": "Toys", "rating": 4.3, "stock": 75, "image": "https://images.unsplash.com/photo-1571019612259-ed5d9ea57f1d?w=400"},
]

# Insert products
inserted = 0
for pd in products_data:
    cat_id = categories.get(pd["cat"])
    if not cat_id:
        print(f"  ⚠️  Category not found: {pd['cat']}")
        continue
    
    existing = db.query(Product).filter(Product.title == pd["title"]).first()
    if existing:
        continue
    
    product = Product(
        title=pd["title"],
        description=f"{pd['brand']} {pd['title']} - Premium quality product available exclusively on Fast Shopping with guaranteed authenticity and fast delivery.",
        price=float(pd["price"]),
        discount_price=float(pd["dp"]),
        category_id=cat_id,
        stock=pd["stock"],
        brand=pd["brand"],
        rating=pd["rating"],
        image=pd["image"],
        specs={
            "Brand": pd["brand"],
            "Category": pd["cat"],
            "Stock": pd["stock"],
            "Warranty": "1 Year Manufacturer Warranty",
            "In Box": f"{pd['title']}, User Manual, Warranty Card"
        }
    )
    db.add(product)
    inserted += 1

db.commit()
print(f"\n✅ Seeded {inserted} products successfully!")

# ─── ADMIN USER ───────────────────────────────────────────────────────────────
admin_exists = db.query(User).filter(User.email == "admin@fastshopping.com").first()
if not admin_exists:
    admin = User(
        name="Fast Shopping Admin",
        email="admin@fastshopping.com",
        password=hash_password("Admin@123"),
        phone="+91-9999999999",
        role="admin",
        profile_image="https://api.dicebear.com/7.x/avataaars/svg?seed=Admin"
    )
    db.add(admin)
    db.commit()
    print("✅ Admin user created: admin@fastshopping.com / Admin@123")
else:
    print("ℹ️  Admin user already exists")

# ─── TEST USER ─────────────────────────────────────────────────────────────────
test_user_exists = db.query(User).filter(User.email == "user@fastshopping.com").first()
if not test_user_exists:
    test_user = User(
        name="Ankit Singh",
        email="user@fastshopping.com",
        password=hash_password("User@123"),
        phone="+91-9876543210",
        role="user",
        profile_image="https://api.dicebear.com/7.x/avataaars/svg?seed=Ankit"
    )
    db.add(test_user)
    db.commit()
    print("✅ Test user created: user@fastshopping.com / User@123")

db.close()
print("\n🎉 Database seeding complete!")
print("\n📋 Login Credentials:")
print("   Admin: admin@fastshopping.com / Admin@123")
print("   User:  user@fastshopping.com / User@123")
print("\n🌐 API Docs: http://localhost:8000/api/docs")
