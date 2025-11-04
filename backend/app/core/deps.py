from fastapi import Depends, HTTPException, status
from app.routers.auth import get_current_user

def require_roles(*allowed_roles):
    def wrapper(current_user = Depends(get_current_user)):
        if current_user.role not in allowed_roles:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=f"Role '{current_user.role}' not authorized")
        return current_user
    return wrapper
        