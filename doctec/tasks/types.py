import enum


class TaskStatus(enum.Enum):
    PENDING = "pending"
    IN_PROGRESS = "in-progress"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class DetectionTaskType(enum.Enum):
    EMBEDDED_FILE = "embedded-file"
    MALICIOUS_DOC = "malicious-doc"
