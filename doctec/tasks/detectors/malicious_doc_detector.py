from doctec.models import DetectionTaskCfg
from doctec.schemas import (
    MaliciousDocDetectionTaskResData,
    MaliciousDocDetectionTaskCfgData,
)
from doctec.tasks.detector import Detector
from doctec.tasks.detectors.maldocument.detect import check_file
from doctec.tasks.detection import DetectionTaskType


class MaliciousDocDetector(Detector, task_type=DetectionTaskType.MALICIOUS_DOC):
    def __init__(
        self, cfg: MaliciousDocDetectionTaskCfgData, common_cfg: DetectionTaskCfg
    ):
        assert isinstance(cfg, MaliciousDocDetectionTaskCfgData)
        super().__init__(cfg, common_cfg)

    def before(self):
        pass

    def after(self):
        pass

    def detect(self, doc) -> MaliciousDocDetectionTaskResData:
        filename, filetype, confidence, description = check_file(doc)
        confidence = float(confidence)
        return MaliciousDocDetectionTaskResData(
            severity=(
                "high"
                if confidence > 0.8
                else ("medium" if confidence > 0.3 else "low")
            ),
            category="unclassified",
            description=description,
            confidence=confidence,
            remediation="-",
        )
