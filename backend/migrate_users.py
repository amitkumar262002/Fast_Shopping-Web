import sqlite3
import os

db_path = os.path.join(os.path.dirname(__file__), 'fast_shopping_master.db')
print(f"Connecting to {db_path}")
conn = sqlite3.connect(db_path)
c = conn.cursor()

columns = [
    ('is_prime', 'BOOLEAN DEFAULT 0'),
    ('last_login', 'DATETIME'),
    ('created_at', 'DATETIME')
]

for col_name, col_type in columns:
    try:
        c.execute(f'ALTER TABLE users ADD COLUMN {col_name} {col_type}')
        print(f"Added {col_name}")
    except Exception as e:
        print(f"Error adding {col_name}: {e}")

conn.commit()
conn.close()
