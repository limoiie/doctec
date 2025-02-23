from doctec.schemas import (
    MaliciousDocDetectionTaskResData,
    MaliciousDocDetectionTaskCfgData,
)
from doctec.tasks.detector import Detector
from doctec.tasks.detectors.maldocument.detect import check_file
from doctec.tasks.detection import DetectionTaskType


class MaliciousDocDetector(Detector, task_type=DetectionTaskType.MALICIOUS_DOC):
    def __init__(self, config: MaliciousDocDetectionTaskCfgData):
        assert isinstance(config, MaliciousDocDetectionTaskCfgData)
        super().__init__(config)

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
