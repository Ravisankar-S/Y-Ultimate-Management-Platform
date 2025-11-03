from app.db.session import SessionLocal
from app.models import user, participant
from app.models.user import User, RoleEnum
from app.core.security import hash_password

def seed_admin():
    db = SessionLocal()

    existing_admin = db.query(User).filter(User.username == "admin").first()
    if existing_admin:
        print("⚠️ Admin user already exists. Skipping creation.")
        db.close()
        return

    admin_user = User(
        username="admin",
        hashed_password=hash_password("admin"),
        role=RoleEnum.admin,
        is_active=True
    )

    db.add(admin_user)
    db.commit()
    db.refresh(admin_user)
    db.close()
    print(f"✅ Admin user created successfully! Username: admin | Password: admin")

if __name__ == "__main__":
    seed_admin()
