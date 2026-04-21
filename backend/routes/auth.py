from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from .. import models, schemas, database
from ..database import get_db

router = APIRouter()

@router.post("/register", response_model=schemas.User)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    new_user = models.User(
        name=user.name,
        email=user.email,
        password=user.password, # In production, use hashing like passlib
        department=user.department,
        year=user.year,
        role=user.role
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.post("/login")
def login(request: schemas.LoginRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == request.email).first()
    if not user or user.password != request.password:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    return {
        "token": f"fake-jwt-token-{user.id}", # Use JWT in production
        "user": user
    }
