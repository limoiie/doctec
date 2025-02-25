import os
import shutil
import tempfile
import uuid
from typing import override

import clr

from doctec.models import DetectionTaskCfg
from doctec.schemas import (
    EmbeddedFileDetectionTaskCfgData,
    EmbeddedFileDetectionTaskResData,
)
from doctec.tasks.detector import Detector
from doctec.tasks.types import DetectionTaskType

# noinspection PyUnresolvedReferences
clr.AddReference(os.path.abspath("./public/pkgs/OfficeExtractor/OfficeExtractor.dll"))


class EmbeddedFileDetector(Detector, task_type=DetectionTaskType.EMBEDDED_FILE):
    def __init__(
        self, cfg: EmbeddedFileDetectionTaskCfgData, common_cfg: DetectionTaskCfg
    ):
        assert isinstance(cfg, EmbeddedFileDetectionTaskCfgData)
        super().__init__(cfg, common_cfg)
        self._workspace = None

    def before(self):
        self._workspace = (
            tempfile.mkdtemp()
            if not self.common_cfg.saveDir
            else self.common_cfg.saveDir
        )
        if not os.path.exists(self._workspace):
            os.makedirs(self._workspace)

    def after(self):
        if self._workspace and not self.common_cfg.saveDir:
            shutil.rmtree(self._workspace)

    @override
    def detect(self, doc: str) -> EmbeddedFileDetectionTaskResData:
        # noinspection PyUnresolvedReferences,PyPackageRequirements
        from OfficeExtractor import Extractor  # type: ignore

        out = os.path.join(self._workspace, uuid.uuid4().hex)
        os.makedirs(out, exist_ok=True)

        extractor = Extractor()
        extractor.SaveToFolder(doc, out)

        return EmbeddedFileDetectionTaskResData(
            parentId=None,
            childIds=[],
            children=[os.path.join(out, file) for file in os.listdir(out)],
        )
