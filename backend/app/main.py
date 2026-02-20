from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.v1.api import router as api_router

from contextlib import asynccontextmanager
from app.db.session import engine
from app.db.redis import get_redis
from app.db.firebase import init_firebase
from app.core import logging  # Setup logging
from loguru import logger
from sqlalchemy import text

@asynccontextmanager
async def lifespan(app: FastAPI):
    import asyncio
    from app.tasks.scheduler import scheduler_loop
    
    # Startup: Connect to DBs
    try:
        # Check Postgres
        try:
            async with asyncio.timeout(30):  # 30s timeout
                async with engine.begin() as conn:
                    await conn.execute(text("SELECT 1"))
            logger.info("✅ Postgres connected (Async)")
        except Exception as e:
            logger.error(f"❌ Postgres connection failed: {e}")

        # Check Redis
        try:
            async with asyncio.timeout(30):  # 30s timeout
                r_gen = get_redis()
                r = await anext(r_gen)
                await r.ping()
            logger.info("✅ Redis connected (Async)")
        except Exception as e:
            logger.error(f"❌ Redis connection failed/timed out: {e}")
            logger.warning("⚠️ Running without Redis (Caching disabled)")

        # Init Firebase
        try:
            init_firebase()
            logger.info("✅ Firebase initialized (if credentials exist)")
        except Exception as e:
            logger.error(f"❌ Firebase init failed: {e}")
            
        # Startup ML Server (if not running)
        ml_server_process = None
        try:
            import subprocess
            from pathlib import Path
            import socket
            
            # Check if port 8001 is already in use
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            result = sock.connect_ex(('127.0.0.1', 8001))
            sock.close()
            
            if result != 0: # Port is closed (free)
                logger.info("🚀 Starting ML Model Server on port 8001...")
                # Correct path: backend/app/main.py -> backend/app -> backend -> Finpredict -> ml
                ml_root = Path(__file__).resolve().parent.parent.parent / "ml"
                ml_python = Path("/data/venvs/FinpredictML/bin/python")
                server_script = ml_root / "server.py"

                if not server_script.exists():
                     logger.error(f"❌ ML Server script not found at {server_script}")
                else:
                    ml_server_process = subprocess.Popen(
                        [str(ml_python), str(server_script)],
                        stdout=subprocess.DEVNULL, 
                        stderr=subprocess.DEVNULL,
                        cwd=str(ml_root),
                        start_new_session=True
                    )
                    logger.info(f"✅ ML Server triggered. PID: {ml_server_process.pid}")
            else:
                logger.info("ℹ️ ML Server already running on port 8001")
                
            # Start Background Scheduler
            asyncio.create_task(scheduler_loop())
            
        except Exception as e:
            logger.error(f"❌ Failed to start ML Server: {e}")
        
    except Exception as e:
        logger.error(f"❌ Startup error: {e}")
    
    yield
    
    # Shutdown: Clean resources
    await engine.dispose()
    logger.info("🛑 Database connections closed")

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan
)

@app.exception_handler(Exception)
async def debug_exception_handler(request: Request, exc: Exception):
    import traceback
    return JSONResponse(
        status_code=500,
        content={"detail": str(exc), "traceback": traceback.format_exc()},
    )

# Set all CORS enabled origins
if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
async def root():
    return {
        "message": "Welcome to FinPredict AI API",
        "docs": "/docs",
        "status": "operational"
    }
