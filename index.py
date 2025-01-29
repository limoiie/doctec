import sys
from functools import wraps
from typing import Dict, List

import eel

from doctec import schemas
from doctec.ctx import AppContext
from doctec.models import init_db
from doctec.utils.loggings import get_logger, init_logging


def log_on_calling(fn):
    @wraps(fn)
    def wrap(*args, **kwargs):
        s_args = ", ".join(f"{v}" for v in args)
        s_kwargs = ", ".join(f"{k}={v}" for k, v in kwargs.items())
        _LOGGER.info(f"Api {fn.__name__} called with {s_args}, {s_kwargs}")
        ret = fn(*args, **kwargs)
        _LOGGER.info(f"Api {fn.__name__} returned {ret}")
        return ret

    return wrap


# noinspection PyPep8Naming
@eel.expose
@log_on_calling
def fetchEmbeddingDetectionRuns(
    page_no: int = 0, page_size: int = -1
) -> List[schemas.EmbDetectionRunData]:
    """
    Fetch the embedding detection runs.

    :param page_no:
    :param page_size:
    :return: a list of embedding detection results in JSON format
    """
    runs = APP.emb_det_repo.fetch_runs(page_no, page_size)
    return [schemas.EmbDetectionRunData.from_pw_model(run).model_dump() for run in runs]


# noinspection PyPep8Naming
@eel.expose
@log_on_calling
def fetchEmbeddingDetectionRunByUuid(run_uuid: str) -> schemas.EmbDetectionRunData:
    """
    Fetch the embedding detection run by id.

    :param run_uuid:
    :return: the embedding detection run in JSON format
    """
    run = APP.emb_det_repo.fetch_one_run_by_id(run_uuid)
    return schemas.EmbDetectionRunData.from_pw_model(run).model_dump()


# noinspection PyPep8Naming
@eel.expose
@log_on_calling
def fetchEmbeddingDetectionConfigs(
    page_no: int = 0, page_size: int = -1
) -> List[schemas.EmbDetectionConfigData]:
    """
    Fetch the embedding detection configs.

    :param page_no:
    :param page_size:
    :return: a list of embedding detection configs in JSON format
    """
    configs = APP.emb_det_repo.fetch_configs(page_no, page_size)
    return [
        schemas.EmbDetectionConfigData.from_pw_model(cfg).model_dump()
        for cfg in configs
    ]


# noinspection PyPep8Naming
@eel.expose
@log_on_calling
def fetchEmbeddingDetectionConfigByUuid(config_uuid: str) -> dict:
    """
    Fetch an embedding detection configuration by its UUID.

    Args:
        config_uuid (str): The UUID of the configuration to fetch.

    Returns:
        dict: The configuration data formatted as JSON.
    """
    _LOGGER.info(f"Debug (py): Fetching config with UUID {config_uuid}")
    cfg = APP.emb_det_repo.fetch_one_config_by_id(config_uuid)
    return schemas.EmbDetectionConfigData.from_pw_model(cfg).model_dump()


# noinspection PyPep8Naming
@eel.expose
@log_on_calling
def fetchEmbeddingDetectionResultByRunUuid(
    run_id: str,
) -> schemas.EmbDetectionResultDataWithoutRun:
    """
    Fetch the embedding detection result by run id.

    :param run_id:
    :return: the embedding detection result in JSON format
    """
    result = APP.emb_det_repo.fetch_one_result_by_run_id(run_id)
    return schemas.EmbDetectionResultDataWithoutRun.from_pw_model(result).model_dump()


# noinspection PyPep8Naming
@eel.expose
@log_on_calling
def detectEmbeddedFiles(cfg: Dict[str, object]) -> str:
    """
    Launch the embedding detection task.

    :return: uuid of the detection run
    """
    from doctec.tasks.emb_detection import EmbDetectionJob

    cfg, _ = APP.emb_det_repo.fetch_or_create_config(**cfg)
    res = APP.emb_det_repo.init_run(cfg)
    job = EmbDetectionJob(cfg=cfg, res=res)
    APP.executor.submit(job.do, app=APP)
    return res.run.uuid.hex


# noinspection PyPep8Naming
@eel.expose
@log_on_calling
def deleteRun(run_uuid: str) -> bool:
    """
    Delete the embedding detection run by id.

    :param run_uuid:
    :return: delete status:True/false
    """
    result = APP.emb_det_repo.delete_run_result_by_run_id(run_uuid)
    print("11111111111111111111\n")
    print(result)

    return result


@eel.expose
@log_on_calling
def debug(msg: str):
    """
    Print the debug message.

    :param msg:
    """
    _LOGGER.info(f"Debug (py): {msg}")


if __name__ == "__main__":
    init_logging(level="INFO")
    init_db(db_path="app.db")

    _LOGGER = get_logger(__name__)

    with AppContext() as APP:
        # NOTE: uncomment the following line if you have only Microsoft Edge installed
        getattr(eel, "_start_args")["mode"] = "edge"

        if len(sys.argv) > 1 and sys.argv[1] == "--develop":
            eel.init("client")
            # noinspection PyTypeChecker
            eel.start({"port": 3000}, host="localhost", port=8888)
        else:
            eel.init("build")
            eel.start("index.html")
