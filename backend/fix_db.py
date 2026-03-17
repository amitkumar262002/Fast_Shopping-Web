import sqlite3
import os

db_path = "fast_shopping_master.db"

def fix_database():
    if not os.path.exists(db_path):
        print(f"❌ Database not found at {db_path}")
        return

    print("🛠️ Starting database repair protocol...")
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    # 1. Fix 'users' table - add 'last_login' if missing
    try:
        cursor.execute("SELECT last_login FROM users LIMIT 1")
    except sqlite3.OperationalError:
        print("🚀 Adding missing 'last_login' column to 'users' table...")
        cursor.execute("ALTER TABLE users ADD COLUMN last_login DATETIME")
        print("✅ Added 'last_login'")

    # 2. Fix 'addresses' table - add 'address_line' if missing
    try:
        cursor.execute("SELECT address_line FROM addresses LIMIT 1")
    except sqlite3.OperationalError:
        print("🚀 Adding missing 'address_line' column to 'addresses' table...")
        cursor.execute("ALTER TABLE addresses ADD COLUMN address_line TEXT")
        print("✅ Added 'address_line'")

    # 3. Double check for other possible missing columns
    try:
        cursor.execute("SELECT landmark FROM addresses LIMIT 1")
    except sqlite3.OperationalError:
        print("🚀 Adding 'landmark' to 'addresses'...")
        cursor.execute("ALTER TABLE addresses ADD COLUMN landmark TEXT DEFAULT ''")

    conn.commit()
    conn.close()
    print("✨ Database repair complete! All columns synced.")

if __name__ == "__main__":
    fix_database()
