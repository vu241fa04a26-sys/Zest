from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "ZEST Canteen Platform"
    API_V1_STR: str = "/api"
    SECRET_KEY: str = "supersecretkeythatsshouldbechangedinproduction123!!!"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 10080  # 7 days
    ALGORITHM: str = "HS256"
    
    # Defaults to SQLite locally for convenience, overridden by environment variable for Docker/Production
    DATABASE_URL: str = "sqlite:///./zest.db"
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
