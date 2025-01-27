"""
This module defines the database models for the Doctec application.

The models are supposed to be used between the backend service and the database.
"""

import datetime
import enum
from pathlib import Path
from typing import List
from uuid import UUID, uuid4

from peewee import *

from doctec.utils.peewees import EnumField, JSONField

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
    size: int = IntegerField(constraints=[Check("size >= 0")])
    kind: str = TextField(null=False)
    data: bytes = BlobField(null=False)

    class Meta:
        database = DB_PROXY
        indexes = ((("md5", "kind"), True),)


class FileMetadata(BaseModel):
    id: int = AutoField(primary_key=True)
    path: str = TextField(index=True)
    data: FileBody = ForeignKeyField(FileBody, backref="metadata", on_delete="CASCADE")
    created: datetime.datetime = DateTimeField(index=True)
    modified: datetime.datetime = DateTimeField(index=True)
    creator: str = TextField()
    modifier: str = TextField()

    class Meta:
        indexes = ((("path", "created"), True),)

    @property
    def size(self) -> int:
        return self.data.size

    @property
    def kind(self) -> str:
        return self.data.kind

    def get_parent_path(self) -> str:
        return str(Path(self.path).parent)


class EmbDetectionConfig(BaseModel):
    uuid: UUID = UUIDField(primary_key=True, unique=True, default=uuid4)
    targetDirs: List[str] = JSONField(null=False)
    saveDirs: str = TextField(null=False)
    maxDepth: int = IntegerField(constraints=[Check("maxDepth >= 0")])

    class Meta:
        database = DB_PROXY
        indexes = ((("uuid",), True),)


class EmbDetectionRun(BaseModel):
    uuid: UUID = UUIDField(primary_key=True, unique=True, default=uuid4)
    cfg: EmbDetectionConfig = ForeignKeyField(
        EmbDetectionConfig, backref="runs", null=False
    )
    launchedDate = DateTimeField(default=datetime.datetime.now, index=True, null=False)
    finishedDate = DateTimeField(default=None, null=True, index=True)
    status: EmbDetectionStatus = EnumField(
        choices=EmbDetectionStatus, null=False, index=True
    )
    error: str = TextField(null=True)
    nTotal: int = IntegerField(default=0, constraints=[Check("nTotal >= 0")])
    nProcessed: int = IntegerField(
        default=0, constraints=[Check("nProcessed >= 0"), Check("nProcessed <= nTotal")]
    )

    @property
    def progress(self) -> float:
        """Return progress as a percentage."""
        return (self.nProcessed / self.nTotal * 100) if self.nTotal > 0 else 0

    @property
    def duration(self) -> datetime.timedelta:
        """Return the duration of the run."""
        assert isinstance(self.launchedDate, datetime.datetime)
        if self.finishedDate:
            return self.finishedDate - self.launchedDate
        return datetime.datetime.now() - self.launchedDate

    def mark_completed(self):
        """Mark the run as completed."""
        self.status = EmbDetectionStatus.COMPLETED
        self.finishedDate = datetime.datetime.now()
        self.save()

    def mark_failed(self, error: str):
        """Mark the run as failed with an error message."""
        self.status = EmbDetectionStatus.FAILED
        self.error = error
        self.finishedDate = datetime.datetime.now()
        self.save()


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

    @property
    def has_children(self) -> bool:
        """Check if the file has any embedded children."""
        # noinspection PyUnresolvedReferences
        return bool(self.children.count())

    def get_all_children(self) -> List["EmbeddedFile"]:
        """Get all children recursively."""
        result = []
        # noinspection PyUnresolvedReferences
        for child in self.children:
            result.append(child)
            result.extend(child.get_all_children())
        return result
