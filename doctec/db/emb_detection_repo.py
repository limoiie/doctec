import uuid
from datetime import datetime, UTC
from typing import Dict

from doctec.tasks.emb_detection_types import (
    EmbeddedFile,
    EmbeddingDetectionStatus,
    EmbeddingDetectionProgress,
    EmbDetectionResult,
    EmbDetectionConfig,
)


class EmbDetectionRepo:
    dummy_db: Dict[str, EmbDetectionResult]

    def __init__(self):
        # TODO: use the real database
        self.dummy_db = {
            "1001": EmbDetectionResult(
                id="1001",
                cfg=EmbDetectionConfig(
                    uuid="16001010101",
                    targetDirs=["/home/user1/docs"],
                ),
                date="2023-10-12T17:30:19Z",
                progress=EmbeddingDetectionProgress(
                    status=EmbeddingDetectionStatus.COMPLETED,
                    error="",
                    totalFiles=3,
                    processedFiles=3,
                ),
                detectedFiles=[
                    EmbeddedFile(
                        filepath="/home/user1/docs/doc1.doc",
                        filesize=1000,
                        embeddedFiles=[
                            EmbeddedFile(
                                filepath="nested1-1.doc",
                                filesize=100,
                                embeddedFiles=[],
                            ),
                            EmbeddedFile(
                                filepath="nested1-2.doc",
                                filesize=100,
                                embeddedFiles=[
                                    EmbeddedFile(
                                        filepath="nested2-1.doc",
                                        filesize=100,
                                        embeddedFiles=[],
                                    )
                                ],
                            ),
                        ],
                    ),
                    EmbeddedFile(
                        filepath="/home/user1/docs/doc2.doc",
                        filesize=1000,
                        embeddedFiles=[
                            EmbeddedFile(
                                filepath="nested1-1.doc",
                                filesize=100,
                                embeddedFiles=[],
                            )
                        ],
                    ),
                ],
            ),
            "1002": EmbDetectionResult(
                id="1002",
                cfg=EmbDetectionConfig(
                    uuid="16002121312",
                    targetDirs=["/home/user2/docs"],
                ),
                date="2023-10-12T17:30:19Z",
                progress=EmbeddingDetectionProgress(
                    status=EmbeddingDetectionStatus.IN_PROGRESS,
                    error="",
                    totalFiles=3,
                    processedFiles=0,
                ),
                detectedFiles=[],
            ),
        }

    def init_run(self, cfg: EmbDetectionConfig):
        res = EmbDetectionResult(
            id=uuid.uuid4().hex,
            cfg=cfg,
            date=datetime.now(UTC).isoformat(),
            progress=EmbeddingDetectionProgress(
                status=EmbeddingDetectionStatus.PENDING,
                error="",
                totalFiles=0,
                processedFiles=0,
            ),
            detectedFiles=[],
        )
        # FIXME
        self.dummy_db[res.id] = res
        return res

    def fetch_all_results(self, page_no: int = 0, page_size: int = -1):
        # FIXME
        return list(self.dummy_db.values())

    def fetch_one_result_by_id(self, result_id: str):
        # FIXME
        return self.dummy_db.get(result_id)

    def is_cancelled(self, result_id: str):
        # FIXME
        return (
            self.dummy_db[result_id].progress.status
            == EmbeddingDetectionStatus.CANCELLED
        )

    def update_result(self, result: EmbDetectionResult):
        # FIXME
        self.dummy_db[result.id] = result

    def update_result_progress(
        self,
        result_id: str,
        *,
        status: EmbeddingDetectionStatus = None,
        error: str = None,
        total_files: int = None,
        processed_files: int = None,
    ):
        # FIXME
        progress = self.dummy_db[result_id].progress
        progress.status = status or progress.status
        progress.error = error or progress.error
        progress.totalFiles = total_files or progress.totalFiles
        progress.processedFiles = processed_files or progress.processedFiles

    def add_detected_file(self, result_id: str, detected_file: EmbeddedFile):
        # FIXME
        self.dummy_db[result_id].detectedFiles.append(detected_file)
