import os
import sqlite3

db_path = "fast_shopping_master.db"

def reset_database():
    print("🧹 Cleaning database... FRESH START PROTOCOL INITIATED.")
    
    # 1. Delete existing database file
    if os.path.exists(db_path):
        try:
            os.remove(db_path)
            print(f"✅ Deleted existing database: {db_path}")
        except Exception as e:
            print(f"❌ Failed to delete database: {e}")
            return
    else:
        print("ℹ️ Database file not found, creating fresh one.")

    # 2. Database initialization will be handled by SQLAlchemy on next startup.
    # We just need to make sure the app.main.py has create_all().
    print("✨ Database cleared. All tables will be recreated on next backend startup.")

if __name__ == "__main__":
    reset_database()
