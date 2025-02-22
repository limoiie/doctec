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
        self.config = config

    def before(self):
        pass

    def after(self):
        pass

    def detect(self, doc) -> MaliciousDocDetectionTaskResData:
        """Detect malicious documents and return analysis results.
        
        Args:
            doc: Document to analyze
            
        Returns:
            MaliciousDocDetectionTaskResData: Structured detection results
        """
        # Constants for maintainability
        MALICIOUS_LABEL = "恶意的"
        BENIGN_LABEL = "良性的"
        SEVERITY_THRESHOLDS = [
            (0.8, "high"),
            (0.3, "medium"),
            (0.0, "low")
        ]
        ROUNDING_PRECISION = 2
        
        results = check_file(doc)
        if results["probability"]=='-':
            return MaliciousDocDetectionTaskResData(
            severity='-',
            category='-',
            description=results["reasons"],
            confidence='-',
            remediation="-",
        )
        confidence = round(results["probability"], ROUNDING_PRECISION)
        
        # Determine document category
        threshold = self.config.severityThreshold
        category = MALICIOUS_LABEL if confidence > threshold else BENIGN_LABEL
        
        # Determine severity level using threshold ranges
        severity_level = next(
            level for threshold, level in SEVERITY_THRESHOLDS 
            if confidence > threshold
        )
        
        # Build description based on detection results
        def build_description() -> str:
            if category == BENIGN_LABEL:
                return "无"
                
            return ';'.join(reason for reason in results["reasons"]) or "综合分析为恶意"  # Handle empty string case

        return MaliciousDocDetectionTaskResData(
            severity=severity_level,
            category=category,
            description=build_description(),
            confidence=confidence,
            remediation="-",
        )
