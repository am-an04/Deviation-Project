import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from app.config import settings

logger = logging.getLogger("qms.database")

Base = declarative_base()

def get_engine():
    db_url = settings.DATABASE_URL
    try:
        if db_url.startswith("postgresql"):
            # Test postgres connection with short connect_timeout
            engine = create_engine(
                db_url,
                pool_pre_ping=True,
                connect_args={"connect_timeout": 3}
            )
            # Try connecting
            with engine.connect() as conn:
                logger.info("Successfully connected to PostgreSQL database.")
            return engine
        else:
            return create_engine(db_url, connect_args={"check_same_thread": False})
    except Exception as e:
        logger.warning(
            f"Unable to connect to primary database ({db_url}): {e}. "
            "Falling back to local SQLite database (sqlite:///./deviations.db) for uninterrupted evaluation."
        )
        return create_engine("sqlite:///./deviations.db", connect_args={"check_same_thread": False})

engine = get_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    Base.metadata.create_all(bind=engine)
    try:
        from sqlalchemy import inspect, text
        inspector = inspect(engine)
        if "deviations" in inspector.get_table_names():
            cols = [c["name"] for c in inspector.get_columns("deviations")]
            with engine.connect() as conn:
                if "source_document_reference" not in cols:
                    conn.execute(text("ALTER TABLE deviations ADD COLUMN source_document_reference VARCHAR(150)"))
                if "detection_source" not in cols:
                    conn.execute(text("ALTER TABLE deviations ADD COLUMN detection_source VARCHAR(255)"))
                if "rule_candidate" not in cols:
                    conn.execute(text("ALTER TABLE deviations ADD COLUMN rule_candidate VARCHAR(50)"))
                if "assessment_status" not in cols:
                    conn.execute(text("ALTER TABLE deviations ADD COLUMN assessment_status VARCHAR(50)"))
                conn.commit()
    except Exception as e:
        logger.warning(f"Schema column check: {e}")
    logger.info("Database tables initialized successfully.")
