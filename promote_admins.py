import sqlite3
import os

db_path = os.path.join('backend', 'fast_shopping_master.db')
if not os.path.exists(db_path):
    print(f"Error: DB not found at {db_path}")
    exit(1)

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

try:
    cursor.execute("UPDATE users SET role = 'admin';")
    conn.commit()
    print(f"Successfully promoted {cursor.rowcount} users to admin.")
except Exception as e:
    print(f"Error: {e}")
finally:
    conn.close()
