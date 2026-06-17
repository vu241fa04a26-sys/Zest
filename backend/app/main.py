import os
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import Base, engine, ensure_sqlite_schema
from app.core.websocket import manager
from app.routers import auth, menu, orders, admin

# Create tables on startup
Base.metadata.create_all(bind=engine)
ensure_sqlite_schema()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0",
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Parse allowed origins for CORS compatibility with credentials
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:8000",
    "http://127.0.0.1:8000",
]

frontend_url = os.getenv("FRONTEND_URL")
if frontend_url:
    origins.append(frontend_url.rstrip("/"))

allowed_origins_env = os.getenv("ALLOWED_ORIGINS")
if allowed_origins_env:
    for origin in allowed_origins_env.split(","):
        stripped = origin.strip().rstrip("/")
        if stripped:
            origins.append(stripped)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"https://.*\.vercel\.app",  # Support all Vercel deployments (production & previews)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Connect sub-routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(menu.router, prefix=settings.API_V1_STR)
app.include_router(orders.router, prefix=settings.API_V1_STR)
app.include_router(admin.router, prefix=settings.API_V1_STR)

# Expose OpenAPI schema at the root /openapi.json for compatibility with deployment checkers
@app.get("/openapi.json", include_in_schema=False)
def get_openapi_endpoint():
    return app.openapi()

@app.get("/")
def read_root():
    return {"message": "Welcome to ZEST Premium Canteen Backend API"}

@app.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: str):
    await manager.connect(websocket, client_id)
    try:
        while True:
            # Keep connection open, handle potential client pings
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        manager.disconnect(websocket, client_id)
