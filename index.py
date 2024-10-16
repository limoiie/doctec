import sys
import uuid

import eel

from doctec.ctx import AppContext
from doctec.tasks.emb_detection_types import EmbDetectionConfig
from doctec.utils.loggings import init_logging
from doctec.utils.utils import as_jsonlike_dict


# noinspection PyPep8Naming
@eel.expose
def fetchEmbeddingDetectionResults(page_no: int = 0, page_size: int = -1):
    """
    Fetch the embedding detection results by page.

    :param page_no:
    :param page_size:
    :return: a list of embedding detection results in JSON format
    """
    results = APP.emb_det_repo.fetch_all_results(page_no, page_size)
    return as_jsonlike_dict(results)


# noinspection PyPep8Naming
@eel.expose
def fetchEmbeddingDetectionResultById(result_id: str):
    """
    Fetch the embedding detection result by id.

    :param result_id:
    :return: the embedding detection result in JSON format
    """
    result = APP.emb_det_repo.fetch_one_result_by_id(result_id)
    return as_jsonlike_dict(result)


# noinspection PyPep8Naming
@eel.expose
def detectEmbeddedFiles(targetDirs: list[str]):
    """
    Launch the embedding detection task.

    :param targetDirs:
    :return: id of the detection run
    """
    from doctec.tasks.emb_detection import EmbDetectionJob

    cfg = EmbDetectionConfig(
        uuid=uuid.uuid4().hex,
        targetDirs=targetDirs,
        maxDepth=5,
    )
    job = EmbDetectionJob(cfg=cfg, res=APP.emb_det_repo.init_run(cfg))
    APP.executor.submit(job.do, app=APP)
    return job.res.id


if __name__ == "__main__":
    init_logging(level='INFO')

    with AppContext() as APP:
        # NOTE: uncomment the following line if you have only Microsoft Edge installed
        getattr(eel, "_start_args")["mode"] = "edge"

        if sys.argv[1] == "--develop":
            eel.init("client")
            # noinspection PyTypeChecker
            eel.start({"port": 3000}, host="localhost", port=8888)
        else:
            eel.init("build")
            eel.start("index.html")
