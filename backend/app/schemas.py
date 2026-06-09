from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime

# Token Schemas
class Token(BaseModel):
    id: int
    access_token: str
    refresh_token: str
    token_type: str
    role: str
    email: str
    name: str

class TokenData(BaseModel):
    email: Optional[str] = None

# User Schemas
class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    phone: str

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserOut(UserBase):
    id: int
    role: str
    created_at: datetime
    
    class Config:
        from_attributes = True

# Category Schemas
class CategoryBase(BaseModel):
    name: str
    image: Optional[str] = None

class CategoryCreate(CategoryBase):
    pass

class CategoryOut(CategoryBase):
    id: int
    
    class Config:
        from_attributes = True

# MenuItem Schemas
class MenuItemBase(BaseModel):
    name: str
    description: Optional[str] = None
    image: Optional[str] = None
    price: float
    is_veg: bool = True
    is_available: bool = True
    availability_status: str = "In Stock"  # "In Stock", "Out Of Stock", "Limited Stock"

class MenuItemCreate(MenuItemBase):
    category_id: int

class MenuItemUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    image: Optional[str] = None
    price: Optional[float] = None
    is_veg: Optional[bool] = None
    is_available: Optional[bool] = None
    availability_status: Optional[str] = None
    category_id: Optional[int] = None

class MenuItemOut(MenuItemBase):
    id: int
    category_id: int
    
    class Config:
        from_attributes = True

# OrderItem Schemas
class OrderItemBase(BaseModel):
    menu_item_id: int
    quantity: int

class OrderItemCreate(OrderItemBase):
    pass

class OrderItemOut(BaseModel):
    id: int
    menu_item_id: int
    quantity: int
    item_price: float
    menu_item: MenuItemOut
    
    class Config:
        from_attributes = True

# Order Schemas
class OrderCreate(BaseModel):
    items: List[OrderItemCreate]
    payment_method: Optional[str] = "UPI"
    transaction_id: Optional[str] = None

class OrderStatusUpdate(BaseModel):
    status: str  # "Pending", "Accepted", "Preparing", "Ready", "Completed", "Rejected"

class OrderOut(BaseModel):
    id: int
    user_id: int
    user: Optional[UserOut] = None
    order_status: str
    total_amount: float
    payment_method: Optional[str] = None
    transaction_id: Optional[str] = None
    created_at: datetime
    items: List[OrderItemOut]
    
    class Config:
        from_attributes = True

# Admin Auth Schemas
class AdminLogin(BaseModel):
    email: EmailStr
    password: str

# Analytics Schemas
class AnalyticsOverview(BaseModel):
    today_orders: int
    active_orders: int
    completed_orders: int
    today_revenue: float

# Forgot Password Schemas
class ForgotPasswordRequest(BaseModel):
    phone: str

class ResetPasswordConfirm(BaseModel):
    phone: str
    otp: str
    new_password: str
