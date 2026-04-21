from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas, database
from ..database import get_db

router = APIRouter()

@router.get("/", response_model=List[schemas.Event])
def get_events(db: Session = Depends(get_db)):
    return db.query(models.Event).all()

@router.post("/", response_model=schemas.Event)
def create_event(event: schemas.EventCreate, db: Session = Depends(get_db)):
    new_event = models.Event(
        name=event.name,
        description=event.description,
        venue=event.venue,
        date=event.date,
        created_by=1 # Mocked for now, should be from token
    )
    db.add(new_event)
    db.commit()
    db.refresh(new_event)
    return new_event

@router.delete("/{id}")
def delete_event(id: int, db: Session = Depends(get_db)):
    event = db.query(models.Event).filter(models.Event.id == id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    db.delete(event)
    db.commit()
    return {"message": "Event deleted"}
