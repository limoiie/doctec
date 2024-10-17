import os
import tempfile
from concurrent.futures import Future
from dataclasses import dataclass
from typing import List, Callable, Tuple

from doctec.ctx import AppContext
from doctec.emb_extractor import EmbExtractor
from doctec.models import (
    EmbDetectionConfig,
    EmbeddedFile,
    EmbDetectionStatus,
    EmbDetectionResult,
)
from doctec.repos.emb_detection_repo import EmbDetectionRepo
from doctec.tasks.base import BaseJob
from doctec.utils.loggings import get_logger

_LOGGER = get_logger(__name__)


@dataclass
class EmbDetectionJob(BaseJob[EmbDetectionConfig, EmbDetectionResult]):
    _repo: EmbDetectionRepo = None

    def do(self, app: AppContext, *args, **kwargs):
        """Detect embedded files in parallel."""
        self._repo = app.emb_det_repo
        collected = self._collect_files()

        _LOGGER.info(f"TaskRun#{self.res.run.uuid} collected: {collected}")

        # submit tasks
        futures: List[Tuple[str, Future]] = []
        for filepath in collected:
            futures.append(
                (
                    filepath,
                    app.executor.submit(
                        self._detect_embedding_iteratively,
                        parent=None,
                        filepath=filepath,
                        early_break=lambda: self._repo.is_run_cancelled(
                            self.res.run.uuid
                        ),
                        depth=self.cfg.maxDepth,
                    ),
                )
            )

        self._wait_for_results(futures)

        _LOGGER.info(f"TaskRun#{self.res.run.uuid} finished: {self.res}")

    def _collect_files(self):
        # collect files to process
        collected = []
        for target_dir in self.cfg.targetDirs:
            for root, dirs, files in os.walk(target_dir):
                for file in files:
                    collected.append(str(os.path.join(root, file)))

        self._repo.update_run(
            self.res.run.uuid,
            status=EmbDetectionStatus.IN_PROGRESS,
            n_total=len(collected),
        )
        return collected

    def _wait_for_results(self, futures: List[Tuple[str, Future]]):
        failed = []
        n_processed = 0

        for filepath, future in futures:
            try:
                detected_file: EmbeddedFile = future.result()
                self._repo.add_detected_file(self.res.id, detected_file)
            except Exception as e:
                _LOGGER.error(f"TaskRun#{self.res.run.uuid} failed while detecting {filepath}: {e}")
                failed.append((filepath, repr(e)))

            n_processed += 1
            self._repo.update_run(self.res.run.uuid, n_processed=n_processed)
        
        if failed:
            _LOGGER.error(f"TaskRun#{self.res.run.uuid} failed:\n{failed}")
            self._repo.update_run(self.res.run.uuid, error=repr(failed))

        if not self._repo.is_run_cancelled(self.res.run.uuid):
            _LOGGER.info(f"TaskRun#{self.res.run.uuid} completed")
            self._repo.update_run(
                self.res.run.uuid, status=EmbDetectionStatus.COMPLETED
            )
        else:
            _LOGGER.warnning(f"TaskRun#{self.res.run.uuid} cancelled")

    def _detect_embedding_iteratively(
        self,
        filepath: str,
        depth: int,
        early_break: Callable[[], bool],
        parent: EmbeddedFile = None,
    ) -> EmbeddedFile:
        """
        Detect embedded files iteratively.

        :param parent:
        :param filepath: Path to the file to detect
        :param depth: Maximum depth to detect embedded files
        :param early_break: A function that returns True if the detection should be stopped early
        :return: The detected embedded file
        """
        _LOGGER.debug(f"Detecting embedding at {filepath}")

        metadata = self._repo.create_file_metadata(filepath, creator="-", modifier="-")
        file = self._repo.create_embedded_file(self.res, metadata, parent=parent)
        if early_break() or depth <= 0:
            return file

        with tempfile.TemporaryDirectory() as out_dir:
            extractor = EmbExtractor.build()
            for extracted_filepath in extractor.extract(filepath, out_dir):
                self._detect_embedding_iteratively(
                    extracted_filepath, depth - 1, early_break, parent=file
                )

        _LOGGER.debug(f"Detected {filepath}")
        return file
