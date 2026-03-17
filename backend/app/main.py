from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
from app import models  # Ensure all models are registered in Base.metadata
from app.routes import auth, products, orders, cart, admin, search, reviews, coupons
from app.database import engine, Base

# ─── CREATE TABLES ────────────────────────────────────────────────────────────
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Fast Shopping Enterprise API",
    description="Scalable Global Retail Protocol API",
    version="4.5.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

# ─── GLOBAL SECURE RECOGNITION PROTOCOL (CORS) ──────────────────────────────
# Allowing explicit origins for cross-platform local development.
# Use both localhost and 127.0.0.1 to prevent browser fragmentation issues.
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:8000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# ─── STATIC FILES ─────────────────────────────────────────────────────────────
os.makedirs("static/uploads", exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")

# ─── ROUTES ───────────────────────────────────────────────────────────────────
app.include_router(auth.router,     prefix="/api/auth",      tags=["Auth"])
app.include_router(products.router, prefix="/api/products",  tags=["Products"])
app.include_router(orders.router,   prefix="/api/orders",    tags=["Orders"])
app.include_router(cart.router,     prefix="/api/user",      tags=["User/Wishlist"])
app.include_router(admin.router,    prefix="/api/admin",     tags=["Admin"])
app.include_router(search.router,   prefix="/api/search",    tags=["Search"])
app.include_router(reviews.router,  prefix="/api",           tags=["Reviews"])
app.include_router(coupons.router,  prefix="/api/coupons",   tags=["Coupons"])

@app.get("/")
async def root():
    return {"status": "ACTIVE", "version": "4.5.0", "message": "Global CORS Active"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
