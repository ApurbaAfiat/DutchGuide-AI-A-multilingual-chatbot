"""
Application Settings
====================
Centralised configuration using Pydantic BaseSettings.
Values are loaded from environment variables / .env file.
"""

from pydantic_settings import BaseSettings
from pydantic import Field
from typing import List
from functools import lru_cache


class Settings(BaseSettings):
    # OpenAI
    openai_api_key: str = Field(..., env="OPENAI_API_KEY")
    openai_model: str = Field("gpt-4.1", env="OPENAI_MODEL")
    openai_max_tokens: int = Field(1500, env="OPENAI_MAX_TOKENS")
    openai_temperature: float = Field(0.3, env="OPENAI_TEMPERATURE")

    # Embeddings
    embedding_model: str = Field("intfloat/multilingual-e5-large", env="EMBEDDING_MODEL")

    # ChromaDB
    chroma_persist_dir: str = Field("./vectorstore", env="CHROMA_PERSIST_DIR")
    chroma_collection_name: str = Field("dutchguide_knowledge", env="CHROMA_COLLECTION_NAME")

    # RAG
    rag_chunk_size: int = Field(1000, env="RAG_CHUNK_SIZE")
    rag_chunk_overlap: int = Field(200, env="RAG_CHUNK_OVERLAP")
    rag_top_k: int = Field(5, env="RAG_TOP_K")

    # Data
    data_dir: str = Field("./data", env="DATA_DIR")

    # API
    api_host: str = Field("0.0.0.0", env="API_HOST")
    api_port: int = Field(8000, env="API_PORT")
    debug: bool = Field(False, env="DEBUG")

    # CORS
    allowed_origins: str = Field(
        "http://localhost:3000", env="ALLOWED_ORIGINS"
    )

    # Rate limiting
    rate_limit_per_minute: int = Field(20, env="RATE_LIMIT_PER_MINUTE")

    # Session
    max_conversation_history: int = Field(10, env="MAX_CONVERSATION_HISTORY")

    @property
    def allowed_origins_list(self) -> List[str]:
        return [o.strip() for o in self.allowed_origins.split(",")]

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
