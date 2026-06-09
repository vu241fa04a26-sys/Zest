# ZEST Canteen Ordering Platform - Deployment Guide

ZEST is designed to be deployment-ready, utilizing Docker, PostgreSQL, Nginx, FastAPI, and Next.js.

---

## 1. Quick Start (Standalone Local Development)

For local development without Docker, follow these steps to run frontend and backend independently.

### Backend Setup:
1. Ensure Python 3.13+ is installed.
2. Initialize virtual environment and install packages:
   ```bash
   python -m venv venv
   .\venv\Scripts\activate
   pip install -r backend/requirements.txt
   ```
3. Run the database seed script to populate starting categories, items, and create the admin account:
   ```bash
   python backend/seed.py
   ```
   *Note: Seed creates default admin `admin@zest.com` with password `ZestAdmin2026!`.*
4. Start the FastAPI development server:
   ```bash
   uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
   ```
   - API Docs will be available at: http://127.0.0.1:8000/docs
   - WebSockets live URL: ws://127.0.0.1:8000/ws/{client_id}

### Frontend Setup:
1. Ensure Node.js 18+ (tested on v24) is installed.
2. Navigate into `frontend/` and install npm dependencies:
   ```bash
   cd frontend
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
   - Local website will be live at: http://localhost:3000

---

## 2. Docker Containerized Production Launch

In a production environment, Docker Compose brings up the entire stack with PostgreSQL and a preconfigured Nginx reverse proxy. Nginx proxies traffic as follows:
- http://localhost/ -> Next.js Frontend
- http://localhost/api/ -> FastAPI Backend
- ws://localhost/ws/ -> WebSocket server

### Build and Launch:
1. Make sure Docker Desktop is running.
2. Open terminal in the project root directory containing `docker-compose.yml`.
3. Run the compose command:
   ```bash
   docker-compose up --build
   ```
4. Once built and online, seed the Docker PostgreSQL database:
   ```bash
   docker-compose exec backend python seed.py
   ```

---

## 3. Production Environment Configurations

You can create a `.env` file in the `backend/` directory to configure custom parameters.

| Key | Description | Default Value |
|---|---|---|
| `DATABASE_URL` | SQLAlchemy Connection String | `sqlite:///./zest.db` (Fallback) |
| `SECRET_KEY` | JWT Signing Cryptographic Key | `supersecretkey...` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Token validity time in minutes | `10080` (7 days) |
| `ALGORITHM` | Encryption algorithm | `HS256` |
