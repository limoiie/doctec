"""
This module defines the database models for the Doctec application.

The models are supposed to be used between the backend service and the database.
"""

import datetime
import secrets
from pathlib import Path
from typing import List, Optional
from uuid import UUID, uuid4

import bcrypt
from peewee import *

from doctec.tasks.types import TaskStatus
from doctec.utils.peewees import EnumField, JSONField

DB_PROXY = DatabaseProxy()


def init_db(db_path: str):
    db = SqliteDatabase(db_path)
    DB_PROXY.initialize(db)

    db.create_tables(
        [
            User,
            UserSession,
            FileData,
            FileMetadata,
            DetectionTaskCfg,
            DetectionTaskJob,
            DetectedFile,
        ],
        safe=True,
    )


class BaseModel(Model):
    class Meta:
        database = DB_PROXY


class User(BaseModel):
    uuid: UUID = UUIDField(primary_key=True, unique=True, default=uuid4)
    username: str = CharField(unique=True)
    password_hash: str = CharField()
    avatar: str = CharField(null=True)
    is_admin: bool = BooleanField(default=False)
    created_at = DateTimeField(default=datetime.datetime.now)
    updated_at = DateTimeField(default=datetime.datetime.now)

    @classmethod
    def create_user(cls, username: str, password: str, is_admin: bool = False) -> "User":
        """Create a new user with hashed password."""
        password_hash = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt())
        return cls.create(
            username=username,
            password_hash=password_hash.decode("utf-8"),
            avatar="/avatars/shadcn.jpg",
            is_admin=is_admin
        )

    def verify_password(self, password: str) -> bool:
        """Verify the provided password against the stored hash."""
        return bcrypt.checkpw(
            password.encode("utf-8"), self.password_hash.encode("utf-8")
        )
    
    def update_password(self, password: str):
        """Update user password with new hash and update timestamp"""
        self.password_hash = bcrypt.hashpw(
            password.encode("utf-8"), bcrypt.gensalt()
        ).decode("utf-8")
        self.updated_at = datetime.datetime.now()
        self.save()

    def create_session(self, expires_in_days: int = 1) -> "UserSession":
        """Create a new session for the user."""
        return UserSession.create_session(self, expires_in_days)


class UserSession(BaseModel):
    token = CharField(primary_key=True)
    user = ForeignKeyField(model=User, backref="sessions", on_delete="CASCADE")
    created_at = DateTimeField(default=datetime.datetime.now)
    expires_at = DateTimeField()

    @classmethod
    def create_session(cls, user: "User", expires_in_days: int = 1) -> "UserSession":
        """Create a new session for the user."""
        token = secrets.token_urlsafe(32)
        expires_at = datetime.datetime.now() + datetime.timedelta(days=expires_in_days)
        return cls.create(token=token, user=user, expires_at=expires_at)

    @classmethod
    def get_valid_session(cls, token: str) -> Optional["UserSession"]:
        """Get a valid session by token."""
        # noinspection PyUnresolvedReferences
        try:
            # noinspection PyTypeChecker
            session = cls.get(
                (cls.token == token) & (cls.expires_at > datetime.datetime.now())
            )
            return session
        except cls.DoesNotExist:
            return None


class FileData(BaseModel):
    md5: str = CharField(primary_key=True, max_length=32)
    size: int = IntegerField(constraints=[Check("size >= 0")])
    mime: str = CharField(max_length=50, null=False)
    kind: str = CharField(max_length=50, null=False)
    body: bytes = BlobField(null=False)

    class Meta:
        database = DB_PROXY
        indexes = ((("md5", "kind"), True),)


class FileMetadata(BaseModel):
    id: int = AutoField(primary_key=True)
    path: str = CharField(index=True, max_length=1024)
    data: FileData = ForeignKeyField(FileData, backref="metadata", on_delete="CASCADE")
    created: datetime.datetime = DateTimeField(index=True)
    modified: datetime.datetime = DateTimeField(index=True)
    creator: str = CharField(max_length=50)
    modifier: str = CharField(max_length=50)

    @property
    def size(self) -> int:
        return self.data.size

    @property
    def kind(self) -> str:
        return self.data.kind

    def get_parent_path(self) -> str:
        return str(Path(self.path).parent)


class DetectionTaskCfg(BaseModel):
    uuid: UUID = UUIDField(primary_key=True, unique=True, default=uuid4)
    targetDirs: List[str] = JSONField(null=False)
    saveDir: str = TextField(null=False)
    configs: List[dict] = JSONField(null=False)

    class Meta:
        database = DB_PROXY
        indexes = ((("uuid",), True),)


class DetectionTaskJob(BaseModel):
    uuid: UUID = UUIDField(primary_key=True, unique=True, default=uuid4)
    cfg: DetectionTaskCfg = ForeignKeyField(
        DetectionTaskCfg, backref="jobs", null=False
    )
    launchedDate = DateTimeField(default=datetime.datetime.now, index=True, null=False)
    finishedDate = DateTimeField(default=None, null=True, index=True)
    status: TaskStatus = EnumField(choices=TaskStatus, null=False, index=True)
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
        """Return the duration of the task execution."""
        assert isinstance(self.launchedDate, datetime.datetime)
        if self.finishedDate:
            return self.finishedDate - self.launchedDate
        return datetime.datetime.now() - self.launchedDate

    def mark_completed(self):
        """Mark the task as completed."""
        self.status = TaskStatus.COMPLETED
        self.finishedDate = datetime.datetime.now()
        self.save()

    def mark_failed(self, error: str):
        """Mark the task as failed with an error message."""
        self.status = TaskStatus.FAILED
        self.error = error
        self.finishedDate = datetime.datetime.now()
        self.save()


class DetectedFile(BaseModel):
    id: int = AutoField(primary_key=True)
    job: DetectionTaskJob = ForeignKeyField(
        DetectionTaskJob, backref="results", on_delete="CASCADE"
    )
    metadata: FileMetadata = ForeignKeyField(FileMetadata, on_delete="CASCADE")
    results: List[dict] = JSONField(null=False, default=[])
