import asyncio
from db.database import engine, Base
import db.models # This ensures the models are imported

async def async_main():
    async with engine.begin() as conn:
        print("Dropping all tables...")
        await conn.run_sync(Base.metadata.drop_all)
        print("Tables dropped successfully.")

if __name__ == "__main__":
    asyncio.run(async_main())
