from typing import List
from peewee import *
from db_model import (
    Task,
    TaskFileMapping,
    FileMetadata,
    ParentChildRelationship
)
from emb_detection_types import (
    EmbeddedFile,
    EmbeddingDetectionStatus,
    EmbeddingDetectionProgress,
    EmbDetectionResult,
    EmbDetectionConfig,
)
data = EmbDetectionResult(
    id="1003",
    cfg=EmbDetectionConfig(
        uuid='1003uuid',
        targetDirs=['/user/tyl/test3'],
        maxDepth=5
    ),
    date='2024-10-12T17:30:19Z',
    progress=EmbeddingDetectionProgress(
        status='in-progress',
        error='None',
        totalFiles=3,
        processedFiles=3
    ),
    detectedFiles=[
        EmbeddedFile(
            filepath='E',
            md5='e',
            filesize=600,
            embeddedFiles=[
                EmbeddedFile(
                    filepath='F',
                    md5='f',
                    filesize=300,
                    embeddedFiles=[]
                ),
                EmbeddedFile(
                    filepath='G',
                    md5='g',
                    filesize=200,
                    embeddedFiles=[
                        EmbeddedFile(
                            filepath='H',
                            md5='h',
                            filesize=400,
                            embeddedFiles=[]
                        )
                    ]
                )
            ]
        )
    ]
)

db = SqliteDatabase('FileIntegrityDB.db')
db.connect()
task = Task.create(
    id=data.id,
    uuid=data.cfg.uuid,
    targetDirs=data.cfg.targetDirs[0],  # 假设 targetDirs 是字符串而不是列表
    date=data.date,
    status=data.progress.status,
    error=data.progress.error,
    totalFiles=data.progress.totalFiles,
    processedFiles=data.progress.processedFiles
)


def insert_file_metadata(file, parent_id=None):
    # 插入文件元数据
    file_metadata = FileMetadata.create(
        filepath=file.filepath,
        md5=file.md5,
        filesize=file.filesize
    )

    # 如果有父文件，则插入 ParentChildRelationship
    if parent_id is not None:
        ParentChildRelationship.create(
            parent_file_id=parent_id,
            child_file_id=file_metadata.id
        )

    # 递归插入嵌套的子文件
    for embedded_file in file.embeddedFiles:
        '''
        [
            EmbeddedFile(filepath='F', md5='f', filesize=300, embeddedFiles=[]), 
            EmbeddedFile(filepath='G', md5='g', filesize=200, 
                embeddedFiles=[
                    EmbeddedFile(filepath='H', md5='h', filesize=400, embeddedFiles=[])
                ]
            )
        ]
        '''
        insert_file_metadata(embedded_file, parent_id=file_metadata.id)

    return file_metadata


# 遍历 detectedFiles，并插入到 FileMetadata 表和 ParentChildRelationship 表
for embedded_file in data.detectedFiles:
    '''
    EmbeddedFile(filepath='E', md5='e', filesize=600, embeddedFiles=[]
    '''
    file_metadata = insert_file_metadata(embedded_file)

    # 插入 TaskFileMapping 表
    TaskFileMapping.create(
        task_id=task.id,
        file_md5=file_metadata.md5
    )

print("数据已成功插入数据库！")
