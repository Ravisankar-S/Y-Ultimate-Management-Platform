from pydantic import BaseModel

class UserBase(BaseModel):
    username: str
    
class UserCreate(UserBase):
    password: str

class UserLogin(UserBase):
    password: str

class UserOut(UserBase):
    id: int
    is_admin: bool

    class Config:
        orm_mode = True