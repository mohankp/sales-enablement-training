import os
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    APP_NAME: str = "Sales Training Simulator"
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    DATABASE_URL: str = "sqlite:///./sales_training.db"
    CHROMA_DB_DIR: str = "./chroma_db"

    class Config:
        env_file = ".env"

settings = Settings()
