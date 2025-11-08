from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from jose import JWTError, jwt
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from app.db.session import SessionLocal
from app.models.user import User, RoleEnum
from app.schemas.user import UserCreate, UserLogin, UserOut
from app.core.security import hash_password, verify_password, create_access_token
from app.core.config import settings
from app.core.rate_limits import auth_limiter
from loguru import logger

router = APIRouter(prefix="/auth", tags=["Auth"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


# ✅ DB Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ✅ Admin-only dependency (move this up)
def require_admin(current_user: User = Depends(lambda: get_current_user())):
    if current_user.role != UserRole.admin:  # type: ignore
        raise HTTPException(status_code=403, detail="Admins only")
    return current_user


# Register new user (admin-only)
@router.post("/register", response_model=UserOut, dependencies=[Depends(auth_limiter)])
def register(user: UserCreate, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    logger.info(f"Registration attempt for username: {user.username}")
    existing = db.query(User).filter(User.username == user.username).first()
    if existing:
        logger.warning(f"Registration failed - username exists: {user.username}")
        raise HTTPException(status_code=400, detail="Username already exists")
    hashed_pw = hash_password(user.password)
    new_user = User(username=user.username, hashed_password=hashed_pw, role=user.role)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    logger.success(f"User registered: {user.username}")
    return new_user


# Login
@router.post("/login", dependencies=[Depends(auth_limiter)])
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    logger.info(f"Login attempt for user: {form_data.username}")
    db_user = db.query(User).filter(User.username == form_data.username).first()
    if not db_user or not verify_password(form_data.password, db_user.hashed_password):  # type: ignore
        logger.warning(f"Login failed for user: {form_data.username}")
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_access_token({"sub": db_user.username})
    logger.success(f"Login successful for user: {form_data.username}")
    return {"access_token": token, "token_type": "bearer"}


# ✅ Fetch current user from JWT
def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        username: str = payload.get("sub")  # type: ignore
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

    user = db.query(User).filter(User.username == username).first()
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    return user


# ✅ Get current user profile
@router.get("/me", response_model=UserOut)
def read_current_user(current_user: User = Depends(get_current_user)):
    return current_user
