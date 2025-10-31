import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    PROJECT_NAME = "y-Ultimate Management Platform"
    DATABASE_URL= os.getenv("DATABASE_URL")
    JWT_SECRET = os.getenv("JWT_SECRET", "your-default-secret")
    JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES = 60*24

settings = Settings()