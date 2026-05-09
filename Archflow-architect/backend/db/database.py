from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import declarative_base
from utils.logger import get_logger

logger = get_logger(__name__)

Base = declarative_base()

# Lazy engine creation — avoids crash at import time if DATABASE_URL is invalid
_engine = None
_session_factory = None


def _get_engine():
    global _engine
    if _engine is None:
        from config import settings
        try:
            _engine = create_async_engine(settings.database_url, echo=False)
        except Exception as e:
            logger.error(f"Failed to create DB engine: {e}")
            return None
    return _engine


def _get_session_factory():
    global _session_factory
    if _session_factory is None:
        engine = _get_engine()
        if engine is None:
            return None
        _session_factory = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)
    return _session_factory


async def get_db():
    factory = _get_session_factory()
    if factory is None:
        logger.warning("DB session factory unavailable — skipping DB operation.")
        yield None
        return
    async with factory() as session:
        yield session


async def init_db():
    engine = _get_engine()
    if engine is None:
        logger.warning("DB engine unavailable — skipping init_db.")
        return
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
