import enum
from dataclasses import dataclass
from typing import List


@dataclass
class EmbDetectionConfig:
    uuid: str
    targetDirs: List[str]
    maxDepth: int = 5


class EmbeddingDetectionStatus(enum.Enum):
    PENDING = "pending"
    IN_PROGRESS = "in-progress"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


@dataclass
class EmbeddingDetectionProgress:
    status: EmbeddingDetectionStatus
    error: str
    totalFiles: int
    processedFiles: int


@dataclass
class EmbeddedFile:
    filepath: str
    md5:str
    filesize: int
    embeddedFiles: List["EmbeddedFile"]


@dataclass
class EmbDetectionResult:
    id: str
    cfg: EmbDetectionConfig
    date: str
    progress: EmbeddingDetectionProgress
    detectedFiles: List[EmbeddedFile]
