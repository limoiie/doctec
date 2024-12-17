from typing import Union
from uuid import UUID
from doctec.models import EmbDetectionConfig, EmbDetectionResult, EmbDetectionRun, EmbeddedFile, FileBody, FileMetadata, init_db
from peewee import DoesNotExist
import peewee


def delete_run_result_by_run_id(run_id: Union[str, UUID]) -> bool:
    try:
        run_to_delete = EmbDetectionRun.get(EmbDetectionRun.uuid == run_id)

        run_to_delete.delete_instance(recursive=True)

        cfg_to_delete = EmbDetectionConfig.get(
            EmbDetectionConfig.uuid == run_to_delete.cfg)

        run_to_delete.delete_instance(recursive=True)
        cfg_to_delete.delete_instance()

    except DoesNotExist:
        print("指定的记录不存在，无法删除。")
        return False  # 删除失败
    except Exception as e:
        print(f"删除过程中发生错误: {e}")
        return False  # 删除失败


init_db(db_path="app.db")
result = delete_run_result_by_run_id("5148ffa6c5314bcc88c01acb6dd92d98")
