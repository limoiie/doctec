"""
This module defines the database models for the Doctec application.

The models are supposed to be used between the backend service and the database.
"""

import datetime
import enum
from uuid import UUID, uuid4
from typing import List

from peewee import *

from doctec.utils.peewees import JSONField, EnumField

DB_PROXY = DatabaseProxy()


def init_db(db_path: str):
    db = SqliteDatabase(db_path)
    DB_PROXY.initialize(db)

    db.create_tables(
        [
            FileBody,
            FileMetadata,
            EmbeddedFile,
            EmbDetectionConfig,
            EmbDetectionRun,
            EmbDetectionResult,
        ],
        safe=True,
    )


class EmbDetectionStatus(enum.Enum):
    PENDING = "pending"
    IN_PROGRESS = "in-progress"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class BaseModel(Model):
    class Meta:
        database = DB_PROXY


class FileBody(BaseModel):
    md5: str = TextField(primary_key=True)
    size: int = IntegerField()
    kind: str = TextField()
    data: bytes = BlobField()


class FileMetadata(BaseModel):
    id: int = AutoField(primary_key=True)
    path: str = TextField()
    data: FileBody = ForeignKeyField(FileBody, backref="metadata", on_delete="CASCADE")
    created: datetime.datetime = DateTimeField()
    modified: datetime.datetime = DateTimeField()
    creator: str = TextField()
    modifier: str = TextField()


class EmbDetectionConfig(BaseModel):
    uuid: UUID = UUIDField(primary_key=True, unique=True, default=uuid4)
    targetDirs: List[str] = JSONField()
    maxDepth: int = IntegerField()


class EmbDetectionRun(BaseModel):
    uuid: UUID = UUIDField(primary_key=True, unique=True, default=uuid4)
    cfg: EmbDetectionConfig = ForeignKeyField(EmbDetectionConfig, backref="runs")
    launchedDate = DateTimeField(default=datetime.datetime.now)
    finishedDate = DateTimeField(default=None, null=True)
    status: EmbDetectionStatus = EnumField(choices=EmbDetectionStatus)
    error: str = TextField(null=True)
    nTotal: int = IntegerField(default=0)
    nProcessed: int = IntegerField(default=0)


class EmbDetectionResult(BaseModel):
    id: int = AutoField(primary_key=True)
    run: EmbDetectionRun = ForeignKeyField(
        EmbDetectionRun, backref="res", unique=True, on_delete="CASCADE"
    )


class EmbeddedFile(BaseModel):
    id: int = AutoField(primary_key=True)
    result: EmbDetectionResult = ForeignKeyField(
        EmbDetectionResult, backref="detectedFiles", on_delete="CASCADE"
    )
    metadata: FileMetadata = ForeignKeyField(FileMetadata, on_delete="CASCADE")
    parent: "EmbeddedFile" = ForeignKeyField(
        "self", null=True, backref="children", on_delete="CASCADE"
    )
