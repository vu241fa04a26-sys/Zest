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
    
    # Check if user exists in the AdminUser table first
    admin = db.query(models.AdminUser).filter(models.AdminUser.email == email).first()
    if admin:
        return models.User(
            id=admin.id,
            email=admin.email,
            full_name="System Admin",
            role="admin",
            phone="0000000000",
            created_at=datetime.utcnow()
        )
        
    user = db.query(models.User).filter(models.User.email == email).first()
    if user is None:
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

@router.post("/login")
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
    
    # 2. Check regular User table (supports email or phone number)
    is_email = "@" in login_in.email
    if is_email:
        user = db.query(models.User).filter(models.User.email == login_in.email).first()
    else:
        user = db.query(models.User).filter(models.User.phone == login_in.email).first()
        
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

@router.post("/google-login")
def google_login(req: schemas.GoogleLoginRequest, db: Session = Depends(get_db)):
    # Check if user already exists
    user = db.query(models.User).filter(models.User.email == req.email).first()
    if not user:
        # Create a new user automatically
        hashed_password = get_password_hash("GoogleOAuth2SecurePasswordPlaceholder!#")
        dummy_phone = f"G-{random.randint(100000, 999999)}"
        user = models.User(
            email=req.email,
            full_name=req.name,
            phone=dummy_phone,
            password_hash=hashed_password,
            role="user"
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        
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

@router.post("/admin/verify-login-otp", response_model=schemas.Token)
def verify_admin_login_otp(req: schemas.AdminVerifyOTPRequest, db: Session = Depends(get_db)):
    admin = db.query(models.AdminUser).filter(models.AdminUser.email == req.email).first()
    if not admin or not verify_password(req.password, admin.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    
    if req.email not in admin_login_otps or admin_login_otps[req.email] != req.otp:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired admin login OTP."
        )
        
    # Valid login! Remove OTP from store
    admin_login_otps.pop(req.email, None)
    
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
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

# In-memory dictionary to store OTPs: {phone: otp}
otp_store = {}
# In-memory dictionary to store admin login OTPs: {email: otp}
admin_login_otps = {}

def send_otp_email(to_email: str, otp_code: str, username: str, flow_name: str):
    """
    Sends an OTP verification email using smtplib.
    Falls back gracefully to console logging and local zest_otp.txt writing if server is offline.
    """
    subject = f"ZEST Canteen - {flow_name} Verification OTP"
    html_content = f"""
    <html>
      <body style="font-family: Arial, sans-serif; background-color: #0c0a09; color: #ffffff; padding: 20px; text-align: center;">
        <div style="max-width: 500px; margin: 0 auto; background-color: #1c1917; border: 1px solid #2e2a24; border-radius: 12px; padding: 30px; border-left: 4px solid #f97316;">
          <h2 style="color: #f97316; margin-bottom: 20px;">ZEST Canteen Platform</h2>
          <p style="color: #d6d3d1; font-size: 14px;">Hello, <strong>{username}</strong>,</p>
          <p style="color: #d6d3d1; font-size: 14px;">Your security verification code for <strong>{flow_name}</strong> is:</p>
          <div style="background-color: #0c0a09; border: 1px solid #f97316; border-radius: 8px; padding: 15px; font-size: 26px; font-weight: bold; letter-spacing: 4px; color: #f97316; margin: 25px 0; display: inline-block; padding-left: 30px; padding-right: 30px;">
            {otp_code}
          </div>
          <p style="color: #a8a29e; font-size: 11px; margin-top: 25px; border-t: 1px solid #2e2a24; padding-top: 15px;">
            This verification code is valid for 10 minutes. If you did not request this, please ignore this message.
          </p>
        </div>
      </body>
    </html>
    """
    
    smtp_host = settings.SMTP_HOST
    smtp_port = settings.SMTP_PORT
    smtp_user = settings.SMTP_USER
    
    sender = f"ZEST Canteen <{smtp_user}>"
    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = sender
    msg["To"] = to_email
    msg.attach(MIMEText(html_content, "html"))
    
    # 1. Print a big, prominent console log for verification
    print("\n" + "="*80)
    print(f" [EMAIL OTP SHIPMENT] Flow: {flow_name}")
    print(f" To Email: {to_email}")
    print(f" User: {username}")
    print(f" OTP Code: {otp_code}")
    print("="*80 + "\n")
    
    # 2. Write to local zest_otp.txt as fallback / development visibility
    try:
        import os
        for path in ["zest_otp.txt", "../zest_otp.txt", "backend/zest_otp.txt"]:
            try:
                with open(path, "w") as f:
                    f.write(f"OTP: {otp_code}\nEmail: {to_email}\nFlow: {flow_name}\nTime: {datetime.utcnow().isoformat()}\n")
            except:
                pass
    except Exception as e:
        print(f"Error writing OTP to file: {e}")
        
    # 3. Attempt standard SMTP transmission
    if settings.SMTP_PASSWORD:
        try:
            with smtplib.SMTP(smtp_host, smtp_port, timeout=5) as server:
                server.starttls()
                server.login(smtp_user, settings.SMTP_PASSWORD)
                server.sendmail(smtp_user, to_email, msg.as_string())
                print(f"[SMTP LOG] SMTP verification email sent to {to_email} successfully.")
        except Exception as e:
            print(f"[SMTP WARN] SMTP transmission failed: {e}. Fallback to local console/file logging completed.")
    else:
        print("[SMTP WARN] SMTP_PASSWORD is not set. Real email transmission skipped.")

@router.post("/forgot-password/request")
def request_otp(req: schemas.ForgotPasswordRequest, db: Session = Depends(get_db)):
    # Find user by email or phone number
    is_email = "@" in req.email_or_phone
    if is_email:
        user = db.query(models.User).filter(models.User.email == req.email_or_phone).first()
    else:
        user = db.query(models.User).filter(models.User.phone == req.email_or_phone).first()
    
    otp = f"{random.randint(100000, 999999)}"
    
    email = None
    username = "User"
    
    if not user:
        # Check admin
        if req.email_or_phone == "admin@zest.com":
            # Lookup default admin user
            admin = db.query(models.AdminUser).first()
            if admin:
                email = admin.email
                username = "System Admin"
            else:
                email = "admin@zest.com"
                username = "System Admin"
        else:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No user found with this email or phone number."
            )
    else:
        email = user.email
        username = user.full_name
        
    otp_store[req.email_or_phone] = otp
    
    # Trigger email transmission
    send_otp_email(email, otp, username, "Forgot Password Reset")
    
    return {
        "message": "OTP has been sent successfully to your registered email address.",
        "dev_otp": otp,
        "smtp_configured": False
    }

@router.post("/forgot-password/verify")
def verify_otp_and_reset(req: schemas.ResetPasswordConfirm, db: Session = Depends(get_db)):
    # Verify OTP
    if req.email_or_phone not in otp_store or otp_store[req.email_or_phone] != req.otp:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired OTP."
        )
    
    # Check regular user
    is_email = "@" in req.email_or_phone
    if is_email:
        user = db.query(models.User).filter(models.User.email == req.email_or_phone).first()
    else:
        user = db.query(models.User).filter(models.User.phone == req.email_or_phone).first()
        
    if user:
        user.password_hash = get_password_hash(req.new_password)
        db.commit()
        otp_store.pop(req.email_or_phone, None)
        return {"message": "Password updated successfully."}
        
    # Check admin
    if req.email_or_phone == "admin@zest.com":
        admin = db.query(models.AdminUser).first()
        if admin:
            admin.password_hash = get_password_hash(req.new_password)
            db.commit()
            otp_store.pop(req.email_or_phone, None)
            return {"message": "Password updated successfully."}
            
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="User not found."
    )
