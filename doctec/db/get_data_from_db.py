from typing import List
from peewee import *
from doctec.db.db_model import (
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

db = SqliteDatabase('FileIntegrityDB.db')
db.connect()


def get_embedded_files_from_cloud(file_id) -> EmbeddedFile:
    pass


def get_embedded_files(file_id) -> EmbeddedFile:
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
            get_embedded_files(child_file.id))

    results = EmbeddedFile(
        filepath=parent_file.filepath,
        md5=parent_file.md5,
        filesize=parent_file.filesize,
        embeddedFiles=embedded_files
    )
    print("results:", results)
    return results


def get_embedded_detection_results():
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
            detected_file = get_embedded_files(file_info.id)
            detected_files.append(detected_file)

        results[task_id].detectedFiles = detected_files
    return results


result = get_embedded_detection_results()
