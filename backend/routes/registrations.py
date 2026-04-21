from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas
from ..database import get_db

router = APIRouter()

@router.get("/", response_model=List[schemas.RegistrationResponse])
def get_registrations(db: Session = Depends(get_db)):
    regs = db.query(models.Registration).all()
    results = []
    for r in regs:
        user = db.query(models.User).filter(models.User.id == r.user_id).first()
        event = db.query(models.Event).filter(models.Event.id == r.event_id).first()
        results.append({
            "id": r.id,
            "user_id": r.user_id,
            "event_id": r.event_id,
            "status": r.status,
            "created_at": r.created_at,
            "user_name": user.name if user else "Unknown",
            "user_email": user.email if user else "Unknown",
            "event_name": event.name if event else "Unknown"
        })
    return results

@router.post("/", response_model=schemas.RegistrationResponse)
def create_registration(reg: schemas.RegistrationCreate, db: Session = Depends(get_db)):
    # Check if already registered
    user_id = 2 # Mocked student ID
    existing = db.query(models.Registration).filter(
        models.Registration.user_id == user_id,
        models.Registration.event_id == reg.event_id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Already registered for this event")
        
    new_reg = models.Registration(
        user_id=user_id,
        event_id=reg.event_id,
        status="pending"
    )
    db.add(new_reg)
    db.commit()
    db.refresh(new_reg)
    
    # Reload with details
    user = db.query(models.User).filter(models.User.id == new_reg.user_id).first()
    event = db.query(models.Event).filter(models.Event.id == new_reg.event_id).first()
    
    return {
        **new_reg.__dict__,
        "user_name": user.name,
        "user_email": user.email,
        "event_name": event.name
    }

@router.patch("/{id}")
def update_status(id: int, request: schemas.RegistrationUpdate, db: Session = Depends(get_db)):
    reg = db.query(models.Registration).filter(models.Registration.id == id).first()
    if not reg:
        raise HTTPException(status_code=404, detail="Registration not found")
    reg.status = request.status
    db.commit()
    return {"message": f"Status updated to {request.status}"}
