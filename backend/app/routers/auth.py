from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from jose import jwt, JWTError
from datetime import datetime, timedelta
from app.core.config import settings
from app.core.database import get_db
from app.core.security import get_password_hash, verify_password, create_access_token, create_refresh_token
from app import models, schemas

router = APIRouter(prefix="/auth", tags=["auth"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login", auto_error=False)

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> models.User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if not token:
        raise credentials_exception
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    # Check if user exists in the standard User table
    user = db.query(models.User).filter(models.User.email == email).first()
    if user is None:
        # Also check AdminUser table just in case they are logged in as admin
        admin = db.query(models.AdminUser).filter(models.AdminUser.email == email).first()
        if admin:
            # Return a dummy or temporary User object representing the admin
            return models.User(
                id=admin.id,
                email=admin.email,
                full_name="System Admin",
                role="admin",
                phone="0000000000",
                created_at=datetime.utcnow()
            )
        raise credentials_exception
    return user

def get_current_admin(current_user: models.User = Depends(get_current_user)) -> models.User:
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have administrative privileges",
        )
    return current_user

@router.post("/register", response_model=schemas.UserOut, status_code=status.HTTP_201_CREATED)
def register(user_in: schemas.UserCreate, db: Session = Depends(get_db)):
    # Check if user already exists
    existing_user = db.query(models.User).filter(models.User.email == user_in.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address is already registered.",
        )
    
    hashed_password = get_password_hash(user_in.password)
    new_user = models.User(
        email=user_in.email,
        full_name=user_in.full_name,
        phone=user_in.phone,
        password_hash=hashed_password,
        role="user"
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.post("/login", response_model=schemas.Token)
def login(login_in: schemas.UserLogin, db: Session = Depends(get_db)):
    # 1. Check AdminUser table first for admin logins
    admin = db.query(models.AdminUser).filter(models.AdminUser.email == login_in.email).first()
    if admin and verify_password(login_in.password, admin.password_hash):
        access_token = create_access_token(subject=admin.email)
        refresh_token = create_refresh_token(subject=admin.email)
        return {
            "id": admin.id,
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "role": "admin",
            "email": admin.email,
            "name": "System Admin"
        }
    
    # 2. Check regular User table
    user = db.query(models.User).filter(models.User.email == login_in.email).first()
    if not user or not verify_password(login_in.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    access_token = create_access_token(subject=user.email)
    refresh_token = create_refresh_token(subject=user.email)
    
    return {
        "id": user.id,
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "role": user.role,
        "email": user.email,
        "name": user.full_name
    }

@router.post("/refresh", response_model=schemas.Token)
def refresh(refresh_token: str, db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate refresh token",
    )
    try:
        payload = jwt.decode(refresh_token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email: str = payload.get("sub")
        is_refresh = payload.get("refresh")
        if email is None or not is_refresh:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
        
    # Check if admin
    admin = db.query(models.AdminUser).filter(models.AdminUser.email == email).first()
    if admin:
        access = create_access_token(subject=admin.email)
        refresh = create_refresh_token(subject=admin.email)
        return {
            "id": admin.id,
            "access_token": access,
            "refresh_token": refresh,
            "token_type": "bearer",
            "role": "admin",
            "email": admin.email,
            "name": "System Admin"
        }
        
    user = db.query(models.User).filter(models.User.email == email).first()
    if user is None:
        raise credentials_exception
        
    access = create_access_token(subject=user.email)
    refresh = create_refresh_token(subject=user.email)
    
    return {
        "id": user.id,
        "access_token": access,
        "refresh_token": refresh,
        "token_type": "bearer",
        "role": user.role,
        "email": user.email,
        "name": user.full_name
    }

@router.get("/me", response_model=schemas.UserOut)
def read_current_user(current_user: models.User = Depends(get_current_user)):
    return current_user

import random

# In-memory dictionary to store OTPs: {phone: otp}
otp_store = {}

@router.post("/forgot-password/request")
def request_otp(req: schemas.ForgotPasswordRequest, db: Session = Depends(get_db)):
    # Find user by phone number
    user = db.query(models.User).filter(models.User.phone == req.phone).first()
    if not user:
        if req.phone == "0000000000":
            otp = f"{random.randint(100000, 999999)}"
            otp_store[req.phone] = otp
            print(f"\n[OTP VERIFICATION] Reset password OTP for System Admin ({req.phone}) is: {otp}\n")
            return {"message": "OTP sent successfully to your phone number."}
        
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No user found with this phone number."
        )
    
    otp = f"{random.randint(100000, 999999)}"
    otp_store[req.phone] = otp
    print(f"\n[OTP VERIFICATION] Reset password OTP for {user.full_name} ({req.phone}) is: {otp}\n")
    return {"message": "OTP sent successfully to your phone number."}

@router.post("/forgot-password/verify")
def verify_otp_and_reset(req: schemas.ResetPasswordConfirm, db: Session = Depends(get_db)):
    # Verify OTP
    if req.phone not in otp_store or otp_store[req.phone] != req.otp:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired OTP."
        )
    
    # Check regular user
    user = db.query(models.User).filter(models.User.phone == req.phone).first()
    if user:
        user.password_hash = get_password_hash(req.new_password)
        db.commit()
        otp_store.pop(req.phone, None)
        return {"message": "Password updated successfully."}
        
    # Check admin
    if req.phone == "0000000000":
        admin = db.query(models.AdminUser).first()
        if admin:
            admin.password_hash = get_password_hash(req.new_password)
            db.commit()
            otp_store.pop(req.phone, None)
            return {"message": "Password updated successfully."}
            
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="User not found."
    )
