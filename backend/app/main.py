from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .api import products, auth, users

app = FastAPI(title="African Market API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(products.router, prefix="/api/products", tags=["products"])

@app.get("/")
async def root():
    return {"message": "Welcome to African Market API"} 