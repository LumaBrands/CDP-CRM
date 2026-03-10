from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://crm_user:crm_password@localhost:5432/cdp_crm"
    # Railway provides DATABASE_URL with postgres:// scheme; SQLAlchemy needs postgresql://
    DATABASE_PRIVATE_URL: str = ""
    JWT_SECRET_KEY: str = "change-me-to-a-random-secret"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    CORS_ORIGINS: str = "http://localhost:3000"

    model_config = {"env_file": ".env"}

    @property
    def effective_database_url(self) -> str:
        """Use Railway's private URL if available, otherwise DATABASE_URL."""
        url = self.DATABASE_PRIVATE_URL or self.DATABASE_URL
        # Fix postgres:// -> postgresql:// for SQLAlchemy compatibility
        if url.startswith("postgres://"):
            url = url.replace("postgres://", "postgresql://", 1)
        return url


settings = Settings()
