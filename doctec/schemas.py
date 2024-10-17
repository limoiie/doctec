import datetime
from abc import abstractmethod
from typing import Optional, Unpack, Set, Type, Generator, Any, Dict
from uuid import UUID

from pydantic import BaseModel, ConfigDict

from doctec.models import (
    EmbDetectionConfig,
    EmbDetectionRun,
    EmbeddedFile,
    EmbDetectionResult,
)

__all__ = [
    "EmbDetectionConfigData",
    "EmbDetectionRunData",
    "EmbeddedFileData",
    "EmbDetectionResultDataWithoutRun",
    "generate_jsonschema",
]

__ALL_SCHEMA_MODELS__: Set[Type["SchemaBaseModel"]] = set()


def generate_jsonschema() -> Generator[dict, None, None]:
    """
    Generate JSON schema for all schema models.
    """
    for model in __ALL_SCHEMA_MODELS__:
        yield model.model_json_schema()


class SchemaBaseModel(BaseModel):
    def __init_subclass__(cls, **kwargs: Unpack[ConfigDict]):
        super().__init_subclass__(**kwargs)
        __ALL_SCHEMA_MODELS__.add(cls)

    class Config:
        @staticmethod
        def json_schema_extra(schema: Dict[str, Any], _model):
            """
            Remove title of fields from schema.

            There is no need to have a title for each field, as each field has a name.
            In addition, json-schema-to-typescript will create a type for any field with a title,
            even if this field is of primitive type like integer and string.
            """
            for field_name, field_props in schema.get("properties", {}).items():
                field_props.pop("title", None)  # remove title of fields

    @classmethod
    @abstractmethod
    def from_pw_model(cls, m):
        pass


class EmbDetectionConfigData(SchemaBaseModel):
    uuid: str
    targetDirs: list[str]
    maxDepth: int

    @classmethod
    def from_pw_model(cls, m: EmbDetectionConfig):
        return EmbDetectionConfigData(
            uuid=m.uuid.hex if isinstance(m.uuid, UUID) else m.uuid,
            targetDirs=m.targetDirs,
            maxDepth=m.maxDepth,
        )


class EmbDetectionRunData(SchemaBaseModel):
    uuid: str
    cfg: EmbDetectionConfigData
    launchedDate: datetime.datetime
    finishedDate: Optional[datetime.datetime]
    status: str
    error: str
    nTotal: int
    nProcessed: int

    @classmethod
    def from_pw_model(cls, m: EmbDetectionRun):
        return EmbDetectionRunData(
            uuid=m.uuid.hex if isinstance(m.uuid, UUID) else m.uuid,
            cfg=EmbDetectionConfigData.from_pw_model(m.cfg),
            launchedDate=m.launchedDate,
            finishedDate=m.finishedDate,
            status=m.status.value,
            error=m.error,
            nTotal=m.nTotal,
            nProcessed=m.nProcessed,
        )


class FileBodyData(SchemaBaseModel):
    md5: str
    size: int
    kind: str
    data: Optional[bytes] = None

    @classmethod
    def from_pw_model(cls, m):
        return FileBodyData(
            md5=m.md5,
            size=m.size,
            kind=m.kind,
        )


class FileMetadataData(SchemaBaseModel):
    id: int
    path: str
    data: FileBodyData
    created: datetime.datetime
    modified: datetime.datetime
    creator: str
    modifier: str

    @classmethod
    def from_pw_model(cls, m):
        return FileMetadataData(
            id=m.id,
            path=m.path,
            data=FileBodyData.from_pw_model(m.data),
            created=m.created,
            modified=m.modified,
            creator=m.creator,
            modifier=m.modifier,
        )


class EmbeddedFileData(SchemaBaseModel):
    id: int
    resultId: int
    metadata: FileMetadataData
    parentId: Optional[int]

    @classmethod
    def from_pw_model(cls, m: EmbeddedFile):
        return EmbeddedFileData(
            id=m.id,
            resultId=m.result.id,
            metadata=FileMetadataData.from_pw_model(m.metadata),
            parentId=m.parent.id if m.parent else None,
        )


class EmbDetectionResultDataWithoutRun(SchemaBaseModel):
    id: int
    runUuid: int
    detectedFiles: list[EmbeddedFileData]

    @classmethod
    def from_pw_model(cls, m: EmbDetectionResult):
        return EmbDetectionResultDataWithoutRun(
            id=m.id,
            runUuid=m.run.uuid.hex if isinstance(m.run.uuid, UUID) else m.run.uuid,
            detectedFiles=[
                EmbeddedFileData.from_pw_model(df) for df in getattr(m, "detectedFiles")
            ],
        )
