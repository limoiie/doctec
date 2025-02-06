from abc import abstractmethod

from doctec.schemas import DetectionTaskCfgDataType, DetectionTaskResDataType
from doctec.tasks.types import DetectionTaskType


class Detector:
    cfg: DetectionTaskCfgDataType
    __ALL_DETECTORS__ = {}

    def __init_subclass__(cls, *, task_type: DetectionTaskType = None, **kwargs):
        super().__init_subclass__(**kwargs)
        cls.__ALL_DETECTORS__[task_type] = cls

    def __init__(self, cfg: DetectionTaskCfgDataType):
        self.cfg = cfg

    @abstractmethod
    def before(self):
        pass

    @abstractmethod
    def after(self):
        pass

    def detect(self, filepath: str) -> DetectionTaskResDataType:
        pass

    @classmethod
    def of(cls, cfg: DetectionTaskCfgDataType):
        try:
            return cls.__ALL_DETECTORS__[cfg.type](cfg)

        except KeyError:
            raise ValueError(f"Unsupported task type: {cfg.type}")
