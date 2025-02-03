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

    @classmethod
    def of(cls, name: str):
        if name == DetectionTaskType.EMBEDDED_FILE.name:
            return DetectionTaskType.EMBEDDED_FILE
        if name == DetectionTaskType.MALICIOUS_DOC.name:
            return DetectionTaskType.MALICIOUS_DOC
        raise ValueError("No such enum name:", name)
