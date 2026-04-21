from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime

class UserBase(BaseModel):
    name: str
    email: EmailStr
    department: str
    year: str
    role: str

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    created_at: datetime
    class Config:
        orm_mode = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: User

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class EventBase(BaseModel):
    name: str
    description: str
    venue: str
    date: str

class EventCreate(EventBase):
    pass

class Event(EventBase):
    id: int
    created_by: int
    created_at: datetime
    class Config:
        orm_mode = True

class RegistrationBase(BaseModel):
    event_id: int

class RegistrationCreate(RegistrationBase):
    pass

class RegistrationUpdate(BaseModel):
    status: str

class RegistrationResponse(BaseModel):
    id: int
    user_id: int
    event_id: int
    status: str
    created_at: datetime
    user_name: Optional[str]
    user_email: Optional[str]
    event_name: Optional[str]

    class Config:
        orm_mode = True
