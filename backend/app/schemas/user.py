from pydantic import BaseModel
from app.models.user import RoleEnum

class UserBase(BaseModel):
    username: str
    role: RoleEnum = RoleEnum.coach
    
class UserCreate(UserBase):
    password: str

class UserLogin(UserBase):
    password: str

class UserOut(UserBase):
    id: int

    class Config:
        from_attributes = True