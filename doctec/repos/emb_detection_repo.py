import hashlib
import os
from datetime import UTC, datetime
from typing import Dict, List, Tuple, Union
from uuid import UUID

from peewee import DoesNotExist

from doctec.models import (
    EmbDetectionConfig,
    EmbDetectionResult,
    EmbDetectionRun,
    EmbDetectionStatus,
    EmbeddedFile,
    FileBody,
    FileMetadata,
)


class EmbDetectionRepo:
    def __init__(self):
        pass

    @staticmethod
    def fetch_configs(
        page_no: int = 0, page_size: int = -1, order_by="uuid", desc=True
    ) -> List[EmbDetectionConfig]:
        query = EmbDetectionConfig.select()
        # Sorting the results by the specified field
        if order_by:
            query = query.order_by(
                getattr(EmbDetectionConfig, order_by).desc()
                if desc
                else getattr(EmbDetectionConfig, order_by).incr()
            )
        # Implementing pagination if page_size is specified
        if page_size and page_size > 0:
            query = query.paginate(page_no + 1, page_size)
        return list(query)

    @staticmethod
    def fetch_one_config_by_id(config_id: Union[str, UUID]) -> EmbDetectionConfig:
        return EmbDetectionConfig.get_by_id(config_id)

    @staticmethod
    def fetch_or_create_config(
        **cfg: Dict[str, object]
    ) -> Tuple[EmbDetectionConfig, bool]:
        return EmbDetectionConfig.get_or_create(**cfg)

    @staticmethod
    def init_run(cfg: EmbDetectionConfig) -> EmbDetectionResult:
        """
        Initialize a new embedding detection run.

        :param cfg: the configuration of the detection run
        :return: the initialized result object
        """
        run = EmbDetectionRun.create(
            cfg=cfg.uuid,
            launchedDate=datetime.now(UTC),
            status=EmbDetectionStatus.PENDING,
        )
        res = EmbDetectionResult.create(run=run)
        return res

    @staticmethod
    def fetch_runs(
        page_no: int = 0, page_size: int = -1, order_by="launchedDate", desc=True
    ) -> List[EmbDetectionRun]:
        query = EmbDetectionRun.select()
        # Sorting the results by the specified field
        if order_by:
            query = query.order_by(
                getattr(EmbDetectionRun, order_by).desc()
                if desc
                else getattr(EmbDetectionRun, order_by).incr()
            )
        # Implementing pagination if page_size is specified
        if page_size and page_size > 0:
            query = query.paginate(page_no + 1, page_size)
        return list(query)

    @staticmethod
    def fetch_one_run_by_id(run_id: Union[str, UUID]) -> EmbDetectionRun:
        return EmbDetectionRun.get_by_id(run_id)

    @staticmethod
    def fetch_one_result_by_run_id(run_id: Union[str, UUID]) -> EmbDetectionResult:
        return EmbDetectionResult.get(EmbDetectionResult.run == run_id)

    @staticmethod
    def delete_run_result_by_run_id(run_id: Union[str, UUID]) -> bool:
        result = False
        try:
            run_to_delete = EmbDetectionRun.get(EmbDetectionRun.uuid == run_id)

            run_to_delete.delete_instance(recursive=True)

            cfg_to_delete = EmbDetectionConfig.get(
                EmbDetectionConfig.uuid == run_to_delete.cfg
            )

            run_to_delete.delete_instance(recursive=True)
            cfg_to_delete.delete_instance()

            result = True
            return result

        except DoesNotExist:
            print("指定的记录不存在，无法删除。")
            result = False
            return result  # 删除失败
        except Exception as e:
            print(f"删除过程中发生错误: {e}")
            result = False
            return result  # 删除失败

    @staticmethod
    def is_run_cancelled(run_id: Union[str, UUID]) -> bool:
        return (
            EmbDetectionRun.select(EmbDetectionRun.status)
            .where(EmbDetectionRun.uuid == run_id)
            .scalar()
            == EmbDetectionStatus.CANCELLED
        )

    @staticmethod
    def update_run(
        run_id: Union[str, UUID],
        *,
        status: EmbDetectionStatus = None,
        error: str = None,
        n_total: int = None,
        n_processed: int = None,
        finished_date: datetime = None,
    ):
        EmbDetectionRun.update(
            dict(
                filter(
                    lambda x: x[1] is not None,
                    [
                        (EmbDetectionRun.status, status),
                        (EmbDetectionRun.error, error),
                        (EmbDetectionRun.nTotal, n_total),
                        (EmbDetectionRun.nProcessed, n_processed),
                        (EmbDetectionRun.finishedDate, finished_date),
                    ],
                )
            ),
        ).where(EmbDetectionRun.uuid == run_id).execute()

    @staticmethod
    def fetch_or_create_file_data(filepath) -> Tuple[FileBody, bool]:
        md5 = hashlib.md5()
        with open(filepath, "rb") as f:
            while chunk := f.read(4096):
                md5.update(chunk)

        # TODO: decide if we want to store the file body in the database
        return FileBody.get_or_create(
            md5=md5.hexdigest(),
            size=os.path.getsize(filepath),
            kind=os.path.splitext(filepath)[1],
            data=b"todo",
        )

    @staticmethod
    def create_file_metadata(filepath: str, *, creator, modifier) -> FileMetadata:
        data, _ = EmbDetectionRepo.fetch_or_create_file_data(filepath)
        metadata = FileMetadata.create(
            path=filepath,
            data=data,
            created=datetime.fromtimestamp(os.path.getctime(filepath)),
            modified=datetime.fromtimestamp(os.path.getmtime(filepath)),
            creator=creator,
            modifier=modifier,
        )
        return metadata

    @staticmethod
    def create_embedded_file(
        result: EmbDetectionResult,
        metadata: FileMetadata,
        parent: EmbeddedFile = None,
    ) -> EmbeddedFile:
        return EmbeddedFile.create(
            result=result,
            metadata=metadata,
            parent=parent,
        )

    @staticmethod
    def add_detected_file(result_id: int, detected_file: EmbeddedFile):
        detected_file.result_id = result_id
        detected_file.save()
