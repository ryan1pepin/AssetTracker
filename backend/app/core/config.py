from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Hardware & Cluster Inventory Tracker"
    POSTGRES_URL: str = "postgresql+asyncpg://asset_user:asset_password@localhost:5432/asset_tracker"
    MONGO_URL: str = "mongodb://root:rootpassword@localhost:27017"
    
    class Config:
        env_file = ".env"

settings = Settings()
