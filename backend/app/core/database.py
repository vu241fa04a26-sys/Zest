from sqlalchemy import create_engine
from sqlalchemy import text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

# SQLite needs connect_args; PostgreSQL does not
connect_args = {}
db_url = settings.DATABASE_URL
if db_url.startswith("sqlite"):
    connect_args = {"check_same_thread": False}
elif db_url.startswith("postgres://"):
    # Fix potential Postgres schema issues in standard deployment strings
    db_url = db_url.replace("postgres://", "postgresql://", 1)

engine = create_engine(db_url, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def ensure_sqlite_schema():
    if not db_url.startswith("sqlite"):
        return

    with engine.begin() as connection:
        existing_columns = {
            row[1] for row in connection.execute(text("PRAGMA table_info(orders)")).fetchall()
        }

        if "payment_method" not in existing_columns:
            connection.execute(text("ALTER TABLE orders ADD COLUMN payment_method VARCHAR"))

        if "transaction_id" not in existing_columns:
            connection.execute(text("ALTER TABLE orders ADD COLUMN transaction_id VARCHAR"))
