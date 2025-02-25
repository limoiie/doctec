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
        print("doc:",doc)
        """Detect malicious documents and return analysis results.
        
        Args:
            doc: Document to analyze
            
        Returns:
            MaliciousDocDetectionTaskResData: Structured detection results
        """
        # Constants for maintainability
        MALICIOUS_LABEL = "恶意的"
        BENIGN_LABEL = "良性的"
        ROUNDING_PRECISION = 2
        
        results = check_file(doc)
        if results["probability"]=='-':
            return MaliciousDocDetectionTaskResData(
            severity='-',
            category='-',
            description='-',
            confidence='-',
            remediation="-",
        )
        confidence = round(float(results["probability"]), ROUNDING_PRECISION)
        
        # Determine document category
        threshold = self.cfg.severityThreshold
        print("threshold:",threshold)
        category = MALICIOUS_LABEL if confidence > threshold else BENIGN_LABEL
        
        # Build description based on detection results
        def build_description() -> str:
            if category == BENIGN_LABEL:
                return "无"
                
            return ';'.join(reason for reason in results["reasons"]) or "综合分析为恶意"  # Handle empty string case

        return MaliciousDocDetectionTaskResData(
            severity=(
                "high"
                if confidence > 0.8
                else ("medium" if confidence > 0.3 else "low")
            ),
            category=category,
            description=build_description(),
            confidence=str(confidence),
            remediation="-",
        )
