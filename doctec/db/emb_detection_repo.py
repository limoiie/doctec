import uuid
from datetime import datetime, timezone
from typing import Dict, List
from peewee import *

from doctec.db.db_model import (
    db,
    Task,
    TaskFileMapping,
    FileMetadata,
    ParentChildRelationship
)
from doctec.tasks.emb_detection_types import (
    EmbeddedFile,
    EmbeddingDetectionStatus,
    EmbeddingDetectionProgress,
    EmbDetectionResult,
    EmbDetectionConfig,
)


class EmbDetectionRepo:
    def __init__(self):
        self.db = db
        self.db.connect()

    def init_run(self, cfg: EmbDetectionConfig) -> EmbDetectionResult:
        """
        Initialize a new embedding detection run.

        :param cfg: the configuration of the detection run
        :return: the initialized result object
        """
        res = EmbDetectionResult(
            id=uuid.uuid4().hex,
            cfg=cfg,
            date=datetime.now(timezone.utc).isoformat(),
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

    def fetch_all_results(
        self, page_no: int = 0, page_size: int = -1
    ) -> List[EmbDetectionResult]:
        results = {}

        # 第一步：在 Task 表中查找所有 id
        tasks = Task.select()
        for task in tasks:
            task_id = str(task.id)

            cfg = EmbDetectionConfig(
                uuid=task.uuid,
                targetDirs=[task.targetDirs]
            )
            progress = EmbeddingDetectionProgress(
                status=task.status,
                error=task.error,
                totalFiles=task.totalFiles,
                processedFiles=task.processedFiles
            )
            results[task_id] = EmbDetectionResult(
                id=task_id,
                cfg=cfg,
                date=task.date,
                progress=progress,
                detectedFiles=[]
            )

            # 第二步：根据 task_id 查找所有关联的 file_md5
            files_info = (FileMetadata
                          .select(FileMetadata)
                          .join(TaskFileMapping, on=(FileMetadata.md5 == TaskFileMapping.file_md5))
                          .join(Task, on=(TaskFileMapping.task_id == Task.id))
                          .where(Task.id == task_id))

            # 第三步：找到所有内嵌文件
            detected_files = []

            for file_info in files_info:
                detected_file = self.fetch_one_embedded_file(file_info.id)
                detected_files.append(detected_file)

            results[task_id].detectedFiles = detected_files

        print('Fetched:', results)
        return results

    def fetch_one_embedded_file(self, file_id) -> EmbeddedFile:
        # find the parent node :A
        parent_file = FileMetadata.get(FileMetadata.id == file_id)
        # {'id': 5, 'filepath': 'P', 'md5': 'p', 'filesize': 250, 'is_embedded': 0, 'embedded_description': None, 'is_nested': 0, 'nested_description': None}
        # find the children node: B, C
        child_relationships = ParentChildRelationship.select().where(
            ParentChildRelationship.parent_file_id == file_id)

        embedded_files = []

        # Traverse all children node
        for rel in child_relationships:
            child_file = FileMetadata.get(FileMetadata.id == rel.child_file_id)
            embedded_files.append(
                self.fetch_one_embedded_file(child_file.id))

        result = EmbeddedFile(
            filepath=parent_file.filepath,
            md5=parent_file.md5,
            filesize=parent_file.filesize,
            embeddedFiles=embedded_files
        )
        print("result:", result)
        return result

    def fetch_one_result_by_id(self, result_id: str) -> EmbDetectionResult:
        # FIXME

        return self.dummy_db.get(result_id)

    def is_cancelled(self, result_id: str) -> bool:
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
