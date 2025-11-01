import pkgutil
import importlib
import app.models
from app.db.session import engine, Base
from sqlalchemy.exc import SQLAlchemyError

print("🔧 Scanning models and creating database tables...")

for module_info in pkgutil.iter_modules(app.models.__path__):
    importlib.import_module(f"app.models.{module_info.name}")

try:
    Base.metadata.create_all(bind=engine)
    print("✅ All tables created successfully!")
except SQLAlchemyError as e:
    print("❌ Error creating tables:")
    print(e)
