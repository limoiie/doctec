import os
import shutil
import tempfile
import uuid
from typing import override

import clr

from doctec.schemas import (
    EmbeddedFileDetectionTaskCfgData,
    EmbeddedFileDetectionTaskResData,
)
from doctec.tasks.detector import Detector
from doctec.tasks.types import DetectionTaskType

# noinspection PyUnresolvedReferences
clr.AddReference(os.path.abspath("./public/pkgs/OfficeExtractor/OfficeExtractor.dll"))


class EmbeddedFileDetector(Detector, task_type=DetectionTaskType.EMBEDDED_FILE):
    def __init__(self, config: EmbeddedFileDetectionTaskCfgData):
        assert isinstance(config, EmbeddedFileDetectionTaskCfgData)
        super().__init__(config)
        self._workspace = None

    def before(self):
        self._workspace = tempfile.mkdtemp()

    def after(self):
        if self._workspace:
            shutil.rmtree(self._workspace)

    @override
    def detect(self, doc: str) -> EmbeddedFileDetectionTaskResData:
        # noinspection PyUnresolvedReferences,PyPackageRequirements
        from OfficeExtractor import Extractor  # type: ignore

        out = os.path.join(self._workspace, uuid.uuid4().hex)
        os.makedirs(out, exist_ok=True)

        extractor = Extractor()
        extractor.SaveToFolder(doc, out)
        # noinspection PyTypeChecker
        #   as we are sure returning a list of files instead of id list
        return EmbeddedFileDetectionTaskResData(
            parentId=None,
            childIds=[os.path.join(out, file) for file in os.listdir(out)],
        )
