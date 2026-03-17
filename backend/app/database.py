from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

# --- DATABASE PROTOCOL ---
SQLALCHEMY_DATABASE_URL = "sqlite:///./fast_shopping_master.db"
# production should use os.getenv("DATABASE_URL", "postgresql://user:pass@localhost:5432/fs_db")

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
