from pydantic_settings import BaseSettings
from functools import lru_cache
import os


class Settings(BaseSettings):
    model_config = {"env_file": ".env", "env_file_encoding": "utf-8", "extra": "ignore"}

    APP_NAME: str = "BioMentor Agent"
    APP_VERSION: str = "0.1.0"
    APP_DESCRIPTION: str = "智造学伴 - 面向生物制造课程的科研型自适应学习智能体平台"

    DATABASE_URL: str = "sqlite:///./biomentor.db"

    UPLOAD_DIR: str = "./uploads"

    LLM_PROVIDER: str = "openai"
    OPENAI_API_KEY: str = ""
    OPENAI_BASE_URL: str = "https://api.openai.com/v1"
    EMBEDDING_MODEL: str = "text-embedding-3-small"
    CHAT_MODEL: str = "gpt-4o"

    CHROMA_PERSIST_DIR: str = "./chroma_db"

    CORS_ORIGINS: list[str] = ["http://localhost:3000"]


@lru_cache()
def get_settings() -> Settings:
    return Settings()
