from abc import abstractmethod

from doctec.models import DetectionTaskCfg
from doctec.schemas import DetectionTaskCfgDataType, DetectionTaskResDataType
from doctec.tasks.types import DetectionTaskType


class Detector:
    cfg: DetectionTaskCfgDataType
    common_cfg: DetectionTaskCfg
    __ALL_DETECTORS__ = {}

    def __init_subclass__(cls, *, task_type: DetectionTaskType = None, **kwargs):
        super().__init_subclass__(**kwargs)
        cls.__ALL_DETECTORS__[task_type] = cls

    def __init__(self, cfg: DetectionTaskCfgDataType, common_cfg: DetectionTaskCfg):
        self.cfg = cfg
        self.common_cfg = common_cfg

    @abstractmethod
    def before(self):
        pass

    @abstractmethod
    def after(self):
        pass

    def detect(self, filepath: str) -> DetectionTaskResDataType:
        pass

    @classmethod
    def of(cls, cfg: DetectionTaskCfgDataType, common_cfg: DetectionTaskCfg):
        try:
            return cls.__ALL_DETECTORS__[cfg.type](cfg, common_cfg)

        except KeyError:
            raise ValueError(f"Unsupported task type: {cfg.type}")
