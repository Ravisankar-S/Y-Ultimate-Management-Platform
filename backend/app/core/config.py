import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    PROJECT_NAME = "y-Ultimate Management Platform"
    DATABASE_URL= os.getenv("DATABASE_URL")
    JWT_SECRET = os.getenv("JWT_SECRET", "your-default-secret")
    JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))

settings = Settings()