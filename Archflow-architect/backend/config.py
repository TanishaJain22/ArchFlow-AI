import os
from dotenv import load_dotenv
from pydantic_settings import BaseSettings, SettingsConfigDict

# Load explicitly here to ensure variables are available
env_path = os.path.join(os.path.dirname(__file__), ".env")
load_dotenv(dotenv_path=env_path)

GROQ_API_KEY = os.getenv("GROQ_API_KEY")

class Settings(BaseSettings):
    groq_api_key: str = GROQ_API_KEY or ""
    database_url: str = "postgresql+asyncpg://archflow_user:archflow_pass@localhost:5432/archflow_db"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

settings = Settings()
