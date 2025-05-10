from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class CategoryBase(BaseModel):
    name: str
    description: Optional[str] = None
    image_url: Optional[str] = None

class CategoryCreate(CategoryBase):
    pass

class CategoryResponse(CategoryBase):
    id: int

    class Config:
        from_attributes = True

class ProductBase(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    stock: int
    image_url: Optional[str] = None

class ProductCreate(ProductBase):
    category_ids: List[int]

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    stock: Optional[int] = None
    image_url: Optional[str] = None
    category_ids: Optional[List[int]] = None

class ProductResponse(ProductBase):
    id: int
    created_at: datetime
    categories: List[CategoryResponse]

    class Config:
        from_attributes = True 