from abc import abstractmethod
from typing import Optional, Unpack, Set, Type, Generator, Any, Dict, Union, Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict

from doctec.models import (
    DetectionTaskJob,
    FileMetadata,
    FileData,
    User,
    DetectionTaskCfg,
    DetectedFile,
)
from doctec.tasks.types import DetectionTaskType

__all__ = [
    "DetectedFileData",
    "DetectionTaskJobData",
    "DetectionTaskResData",
    "DetectionTaskCfgData",
    "DetectionTaskResDataType",
    "DetectionTaskCfgDataType",
    "EmbeddedFileDetectionTaskCfgData",
    "EmbeddedFileDetectionTaskResData",
    "FileDataData",
    "FileMetadataData",
    "MaliciousDocDetectionTaskCfgData",
    "MaliciousDocDetectionTaskResData",
    "UserData",
    "detection_task_cfg_of_dict",
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
        use_enum_values = True

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


class UserData(SchemaBaseModel):
    uuid: str
    username: str
    email: str
    avatar: Optional[str]
    sessionToken: str
    created: str
    updated: str

    @classmethod
    def from_pw_model(cls, m: User):
        return UserData(
            uuid=m.uuid.hex if isinstance(m.uuid, UUID) else m.uuid,
            username=m.username,
            email=m.email,
            avatar=m.avatar,
            sessionToken="",
            created=str(m.created_at),
            updated=str(m.updated_at),
        )

    def with_session_token(self, token: str) -> "UserData":
        self.sessionToken = token
        return self


class FileDataData(SchemaBaseModel):
    md5: str
    size: int
    kind: str
    mime: Optional[str] = None
    body: Optional[bytes] = None

    @classmethod
    def from_pw_model(cls, m: FileData):
        return FileDataData(
            md5=m.md5,
            size=m.size,
            kind=m.kind,
            mime=m.mime,
        )


class FileMetadataData(SchemaBaseModel):
    id: int
    path: str
    data: FileDataData
    created: str
    modified: str
    creator: str
    modifier: str

    @classmethod
    def from_pw_model(cls, m: FileMetadata):
        return FileMetadataData(
            id=m.id,
            path=m.path,
            data=FileDataData.from_pw_model(m.data),
            created=str(m.created),
            modified=str(m.modified),
            creator=m.creator,
            modifier=m.modifier,
        )


class DetectedFileData(SchemaBaseModel):
    id: int
    jobUuid: str
    metadata: FileMetadataData
    results: list["DetectionTaskResDataType"]

    @classmethod
    def from_pw_model(cls, m: DetectedFile):
        return DetectedFileData(
            id=m.id,
            jobUuid=m.job.uuid.hex if isinstance(m.job.uuid, UUID) else m.job.uuid,
            metadata=FileMetadataData.from_pw_model(m.metadata),
            results=[cls.parse_result(result) for result in m.results],
        )

    @classmethod
    def parse_result(cls, result: dict):
        result["type"] = DetectionTaskType.of(result["type"])
        match result["type"]:
            case DetectionTaskType.EMBEDDED_FILE:
                return EmbeddedFileDetectionTaskResData.model_validate(result)
            case DetectionTaskType.MALICIOUS_DOC:
                return MaliciousDocDetectionTaskResData.model_validate(result)
            case typ:
                raise ValueError(f"Unknown detection type: {typ}")


class DetectionTaskCfgData(SchemaBaseModel):
    uuid: str
    targetDirs: list[str]
    saveDir: str
    configs: list["DetectionTaskCfgDataType"]

    @classmethod
    def from_pw_model(cls, m: DetectionTaskCfg):
        return DetectionTaskCfgData(
            uuid=m.uuid.hex if isinstance(m.uuid, UUID) else m.uuid,
            targetDirs=m.targetDirs,
            saveDir=m.saveDir,
            configs=[cls.parse_config(config) for config in m.configs],
        )

    @classmethod
    def parse_config(cls, config: dict):
        config["type"] = DetectionTaskType.of(config["type"])
        match config["type"]:
            case DetectionTaskType.EMBEDDED_FILE:
                return EmbeddedFileDetectionTaskCfgData.model_validate(config)
            case DetectionTaskType.MALICIOUS_DOC:
                return MaliciousDocDetectionTaskCfgData.model_validate(config)
            case typ:
                raise ValueError(f"Unknown detection type: {typ}")


class DetectionTaskJobData(SchemaBaseModel):
    uuid: str
    cfg: DetectionTaskCfgData
    launchedDate: str
    finishedDate: Optional[str]
    status: str
    error: Optional[str]
    nTotal: int
    nProcessed: int

    @classmethod
    def from_pw_model(cls, m: DetectionTaskJob):
        return DetectionTaskJobData(
            uuid=m.uuid.hex if isinstance(m.uuid, UUID) else m.uuid,
            cfg=DetectionTaskCfgData.from_pw_model(m.cfg),
            launchedDate=str(m.launchedDate),
            finishedDate=str(m.finishedDate),
            status=m.status.value,
            error=m.error,
            nTotal=m.nTotal,
            nProcessed=m.nProcessed,
        )


class DetectionTaskResData(SchemaBaseModel):
    jobUuid: str
    detectedFiles: list[DetectedFileData]

    @classmethod
    def from_pw_model(cls, m):
        raise RuntimeError("Invalid operation")

    @classmethod
    def from_(cls, job_uuid: Union[str, UUID], detected_files: list[DetectedFile]):
        return DetectionTaskResData(
            jobUuid=job_uuid.hex if isinstance(job_uuid, UUID) else job_uuid,
            detectedFiles=[
                DetectedFileData.from_pw_model(file) for file in detected_files
            ],
        )


class EmbeddedFileDetectionTaskCfgData(SchemaBaseModel):
    maxDepth: int
    type: Literal[DetectionTaskType.EMBEDDED_FILE] = DetectionTaskType.EMBEDDED_FILE

    @classmethod
    def from_pw_model(cls, m):
        raise RuntimeError("Invalid operation")


class EmbeddedFileDetectionTaskResData(SchemaBaseModel):
    parentId: Optional[int]
    """
    The ID of the DetectedFile parent that contains this embedded file.
    """

    childIds: list[int]
    """
    The IDs of the DetectedFile children embedded in this file.
    """

    type: Literal[DetectionTaskType.EMBEDDED_FILE] = DetectionTaskType.EMBEDDED_FILE

    @classmethod
    def from_pw_model(cls, m):
        raise RuntimeError("Invalid operation")


class MaliciousDocDetectionTaskCfgData(SchemaBaseModel):
    severityThreshold: float
    type: Literal[DetectionTaskType.MALICIOUS_DOC] = DetectionTaskType.MALICIOUS_DOC

    @classmethod
    def from_pw_model(cls, m):
        raise RuntimeError("Invalid operation")


class MaliciousDocDetectionTaskResData(SchemaBaseModel):
    severity: str  # e.g., "high", "medium", "low"
    category: str  # e.g., "shellcode", "malform", "upload"
    description: str
    confidence: float
    remediation: str  # Suggested fix or mitigation
    type: Literal[DetectionTaskType.MALICIOUS_DOC] = DetectionTaskType.MALICIOUS_DOC

    @classmethod
    def from_pw_model(cls, m):
        raise RuntimeError("Invalid operation")


DetectionTaskResDataType = Union[
    MaliciousDocDetectionTaskResData,
    EmbeddedFileDetectionTaskResData,
]

DetectionTaskCfgDataType = Union[
    EmbeddedFileDetectionTaskCfgData,
    MaliciousDocDetectionTaskCfgData,
]


def detection_task_cfg_of_dict(config: dict):
    config["type"] = DetectionTaskType.of(config["type"])
    match config["type"]:
        case DetectionTaskType.EMBEDDED_FILE:
            return EmbeddedFileDetectionTaskCfgData.model_validate(config)
        case DetectionTaskType.MALICIOUS_DOC:
            return MaliciousDocDetectionTaskCfgData.model_validate(config)
        case typ:
            raise ValueError(f"Unsupported task type: {typ}")
