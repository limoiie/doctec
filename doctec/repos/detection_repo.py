import hashlib
import os
from datetime import UTC, datetime
from typing import List, Tuple, Union, Optional
from uuid import UUID
from doctec.tasks.islocallycreated import compare,get_metadata
import magic

from doctec.models import (
    DetectedFile,
    DetectionTaskJob,
    DetectionTaskCfg,
    FileData,
    FileMetadata,
)
from doctec.tasks.types import TaskStatus
from doctec.schemas import DetectionTaskResDataType, DetectionTaskCfgData


class DetectionRepo:
    def __init__(self):
        pass

    @staticmethod
    def fetch_configs(
        page_no: int = 0, page_size: int = -1, order_by="uuid", desc=True
    ) -> List[DetectionTaskCfg]:
        query = DetectionTaskCfg.select()
        # Sorting the results by the specified field
        if order_by:
            query = query.order_by(
                getattr(DetectionTaskCfg, order_by).desc()
                if desc
                else getattr(DetectionTaskCfg, order_by).incr()
            )
        # Implementing pagination if page_size is specified
        if page_size and page_size > 0:
            query = query.paginate(page_no + 1, page_size)
        return list(query)

    @staticmethod
    def fetch_one_config_by_id(config_id: Union[str, UUID]) -> DetectionTaskCfg:
        return DetectionTaskCfg.get_by_id(config_id)

    @staticmethod
    def create_one_config(
        cfg: DetectionTaskCfgData,
    ) -> Tuple[DetectionTaskCfg, bool]:
        return DetectionTaskCfg.create(**cfg.model_dump())

    @staticmethod
    def fetch_or_create_config(
        cfg: DetectionTaskCfgData,
    ) -> Tuple[DetectionTaskCfg, bool]:
        return DetectionTaskCfg.get_or_create(**cfg.model_dump())

    @staticmethod
    def init_job(cfg: DetectionTaskCfg) -> DetectionTaskJob:
        """
        Initialize a new detection job.

        :param cfg: the configuration of the detection job
        :return: the initialized job
        """
        job = DetectionTaskJob.create(
            cfg=cfg.uuid,
            launchedDate=datetime.now(UTC),
            status=TaskStatus.PENDING,
        )
        return job

    @staticmethod
    def fetch_jobs(
        page_no: int = 0, page_size: int = -1, order_by="launchedDate", desc=True
    ) -> List[DetectionTaskJob]:
        query = DetectionTaskJob.select()
        # Sorting the results by the specified field
        if order_by:
            query = query.order_by(
                getattr(DetectionTaskJob, order_by).desc()
                if desc
                else getattr(DetectionTaskJob, order_by).incr()
            )
        # Implementing pagination if page_size is specified
        if page_size and page_size > 0:
            query = query.paginate(page_no + 1, page_size)
        return list(query)

    @staticmethod
    def fetch_one_job_by_uuid(job_uuid: Union[str, UUID]) -> DetectionTaskJob:
        return DetectionTaskJob.get_by_id(job_uuid)

    @staticmethod
    def fetch_detected_files_by_job_uuid(
        job_uuid: Union[str, UUID]
    ) -> list[DetectedFile]:
        return list(DetectedFile.select().where(DetectedFile.job == job_uuid))
    
    @staticmethod
    def fetch_file_type_by_id(file_id):
        try:
            # 获取 DetectedFile 记录
            detected_file = DetectedFile.get_by_id(file_id)
            # 通过关联获取 FileData 的 kind
            return detected_file.metadata.data.kind
        except (DetectedFile.DoesNotExist, FileMetadata.DoesNotExist, FileData.DoesNotExist):
            return None

    @staticmethod
    def delete_detectedfile_by_uuid(job_uuid: Union[str, UUID]) -> bool:
        """
        Delete a detection job and its associated detected files by job UUID.
        
        Args:
            job_uuid: UUID of the job to delete
            
        Returns:
            bool: True if both job and files were deleted successfully
        """

                
        # Delete the job itself
        job_deleted = DetectionTaskJob.delete().where(
                    DetectionTaskJob.uuid == job_uuid
                ).execute()
        
                
        return True

    @staticmethod
    def is_job_cancelled(job_uuid: Union[str, UUID]) -> bool:
        return (
            DetectionTaskJob.select(DetectionTaskJob.status)
            .where(DetectionTaskJob.uuid == job_uuid)
            .scalar()
            == TaskStatus.CANCELLED
        )

    @staticmethod
    def update_job(
        job_uuid: Union[str, UUID],
        *,
        status: TaskStatus = None,
        error: str = None,
        n_total: int = None,
        n_processed: int = None,
        finished_date: datetime = None,
    ):
        DetectionTaskJob.update(
            dict(
                filter(
                    lambda x: x[1] is not None,
                    [
                        (DetectionTaskJob.status, status),
                        (DetectionTaskJob.error, error),
                        (DetectionTaskJob.nTotal, n_total),
                        (DetectionTaskJob.nProcessed, n_processed),
                        (DetectionTaskJob.finishedDate, finished_date),
                    ],
                )
            ),
        ).where(DetectionTaskJob.uuid == job_uuid).execute()
    

    @staticmethod
    def fetch_or_create_file_data(filepath: str) -> Tuple[FileData, bool]:
        md5 = hashlib.md5()
        
        local = compare(filepath)

        with open(filepath, "rb") as f:
            # 一次性读取初始字节用于magic检测
            initial_bytes = f.read(1024)
            
            # 重置文件指针到开头
            f.seek(0)
            
            # 计算完整MD5
            while chunk := f.read(4096):
                md5.update(chunk)

        return FileData.get_or_create(
            md5=md5.hexdigest(),
            size=os.path.getsize(filepath),
            mime=magic.from_buffer(initial_bytes, mime=True) or "application/octet-stream",
            kind=magic.from_buffer(initial_bytes, mime=False) or "unknown",
            isLocallyCreated=local["is_local"],
            description=local["message"],
            body=b"todo",
        )

    @staticmethod
    def create_file_metadata(
        filepath: str, *, creator: str, modifier: str
    ) -> FileMetadata:
        data, _ = DetectionRepo.fetch_or_create_file_data(filepath)
        try:
            mata = get_metadata(filepath)
            creator = mata.get('author')
            modifier = mata.get('last_saved_by')
            created_content = mata.get('created_time')
        except ValueError:
            creator = "-"
            modifier = "-"
            created_content = '-'
        metadata = FileMetadata.create(
            path=filepath,
            data=data,
            created_content = created_content,
            created=datetime.fromtimestamp(os.path.getctime(filepath)),
            modified=datetime.fromtimestamp(os.path.getmtime(filepath)),
            creator=creator,
            modifier=modifier,
        )
        return metadata

    @staticmethod
    def store_detected_file(
        job: DetectionTaskJob,
        metadata: FileMetadata,
        results: List[Optional[DetectionTaskResDataType]],
    ) -> DetectedFile:
        return DetectedFile.create(
            job=job,
            metadata=metadata,
            results=[result.model_dump() if result else None for result in results],
        )

    @staticmethod
    def add_detected_file(job_uuid: Union[str, UUID], detected_file: DetectedFile):
        detected_file.job_id = job_uuid
        detected_file.save()
    
    

    

