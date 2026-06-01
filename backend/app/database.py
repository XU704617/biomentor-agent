from __future__ import annotations

from sqlalchemy import MetaData, create_engine, event, inspect, text
from sqlalchemy.orm import sessionmaker, declarative_base

from app.config import get_settings

settings = get_settings()

connect_args: dict = {}
if settings.DATABASE_URL.startswith("sqlite"):
    connect_args["check_same_thread"] = False
    connect_args["timeout"] = 30

engine = create_engine(
    settings.DATABASE_URL,
    echo=settings.DB_ECHO,
    connect_args=connect_args,
)


@event.listens_for(engine, "connect")
def _sqlite_pragma(dbapi_connection, _connection_record):
    if not settings.DATABASE_URL.startswith("sqlite"):
        return
    try:
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA journal_mode=WAL")
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()
    except Exception:
        pass


SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()
_schema_checked = False


def get_db():
    global _schema_checked
    if not _schema_checked:
        ensure_sqlite_schema_compatibility(Base.metadata)
        _schema_checked = True
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def ensure_sqlite_schema_compatibility(metadata: MetaData) -> None:
    """Best-effort SQLite column backfill for local/dev databases.

    The repo ships with long-lived SQLite files that may predate newer ORM
    columns. SQLite `create_all()` will not add missing columns, so critical
    query paths can fail at runtime after model evolution. This helper adds
    missing columns with permissive definitions to keep the local database
    compatible with the current metadata.
    """
    if not settings.DATABASE_URL.startswith("sqlite"):
        return

    inspector = inspect(engine)
    existing_tables = set(inspector.get_table_names())

    with engine.begin() as connection:
        for table in metadata.sorted_tables:
            if table.name not in existing_tables:
                continue

            existing_columns = {
                column["name"] for column in inspector.get_columns(table.name)
            }
            for column in table.columns:
                if column.name in existing_columns:
                    continue

                column_type = column.type.compile(dialect=engine.dialect)
                connection.execute(
                    text(
                        f'ALTER TABLE "{table.name}" ADD COLUMN "{column.name}" {column_type}'
                    )
                )
