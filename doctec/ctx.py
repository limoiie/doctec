from concurrent.futures.thread import ThreadPoolExecutor
from contextlib import AbstractContextManager

from doctec.repos.emb_detection_repo import EmbDetectionRepo


class AppContext(AbstractContextManager):
    executor: ThreadPoolExecutor
    emb_det_repo: EmbDetectionRepo

    def __init__(self):
        self.emb_det_repo = EmbDetectionRepo()

    def __enter__(self) -> "AppContext":
        self.executor = ThreadPoolExecutor()
        self.executor.__enter__()
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        return self.executor.__exit__(exc_type, exc_val, exc_tb)
