from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    email = Column(String, unique=True, index=True)
    password = Column(String)
    department = Column(String)
    year = Column(String)
    role = Column(String) # admin, student, teacher
    created_at = Column(DateTime, default=datetime.utcnow)

    registrations = relationship("Registration", back_populates="user")

class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    description = Column(String)
    venue = Column(String)
    date = Column(String)
    created_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)

    registrations = relationship("Registration", back_populates="event")

class Registration(Base):
    __tablename__ = "registrations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    event_id = Column(Integer, ForeignKey("events.id"))
    status = Column(String, default="pending") # pending, accepted, rejected
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="registrations")
    event = relationship("Event", back_populates="registrations")
