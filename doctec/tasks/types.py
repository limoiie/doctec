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
        for e in (
            DetectionTaskType.EMBEDDED_FILE, 
            DetectionTaskType.MALICIOUS_DOC,
        ):
            if name in (e.name, e.value):
                return e
        raise ValueError("No such enum name:", name)
