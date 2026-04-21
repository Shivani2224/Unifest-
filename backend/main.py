from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import uvicorn
import os

from . import models
from .database import engine
from .routes import auth, events, registrations

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="UNIFEST API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# routers FIRST
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(events.router, prefix="/api/events", tags=["Events"])
app.include_router(registrations.router, prefix="/api/registrations", tags=["Registrations"])

# STATIC LAST (IMPORTANT FIX)
if os.path.exists("frontend"):
    app.mount("/frontend", StaticFiles(directory="frontend", html=True), name="frontend")