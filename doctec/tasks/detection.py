import os
from concurrent.futures import Future
from dataclasses import dataclass
from typing import List, Callable, Tuple

from future.backports.datetime import datetime

from doctec.ctx import AppContext
from doctec.models import (
    DetectionTaskCfg,
    DetectionTaskJob,
    DetectedFile,
)
from doctec.repos.detection_repo import DetectionRepo
from doctec.schemas import DetectionTaskCfgData, detection_task_cfg_of_dict
from doctec.tasks.base import BaseTask
from doctec.tasks.detector import Detector
from doctec.tasks.types import TaskStatus, DetectionTaskType
from doctec.utils.loggings import get_logger

_LOGGER = get_logger(__name__)


@dataclass
class DetectionTask(BaseTask[DetectionTaskCfg, DetectionTaskJob]):
    _repo: DetectionRepo = None
    _detectors: dict[DetectionTaskType, Detector] = None
    _detector_cfgs: dict[DetectionTaskType, DetectionTaskCfgData] = None

    def __post_init__(self):
        for parameters in self.cfg.parameters:
            cfg = detection_task_cfg_of_dict(parameters)
            self._detectors[cfg.type] = Detector.of(cfg)

    def do(self, app: AppContext, *args, **kwargs):
        """Detect embedded files in parallel."""
        self._repo = app.det_repo
        collected = self._collect_files()

        _LOGGER.info(f"TaskJob#{self.job.uuid} collected: {collected}")

        for detector in self._detectors.values():
            detector.before()

        # submit tasks
        futures: List[Tuple[str, Future]] = []
        for filepath in collected:
            futures.append(
                (
                    filepath,
                    app.executor.submit(
                        self._detect_iteratively,
                        parent=None,
                        depth=0,
                        filepath=filepath,
                        early_break=lambda: self._repo.is_job_cancelled(self.job.uuid),
                    ),
                )
            )

        self._wait_for_results(futures)

        for detector in self._detectors.values():
            detector.after()

        _LOGGER.info(f"DetectionTaskJob#{self.job.uuid} finished: {self.job}")

    def _collect_files(self):
        # collect files to process
        collected = []
        for target_dir in self.cfg.targetDirs:
            for root, dirs, files in os.walk(target_dir):
                for file in files:
                    collected.append(str(os.path.join(root, file)))

        self._repo.update_job(
            self.job.uuid,
            status=TaskStatus.IN_PROGRESS,
            n_total=len(collected),
        )
        return collected

    def _wait_for_results(self, futures: List[Tuple[str, Future]]):
        failed = []
        n_processed = 0

        for filepath, future in futures:
            try:
                future.result()

            except Exception as e:
                _LOGGER.error(
                    f"TaskJob#{self.job.uuid} failed while detecting {filepath}: {e}"
                )
                failed.append((filepath, repr(e)))

            n_processed += 1
            self._repo.update_job(self.job.uuid, n_processed=n_processed)

        if failed:
            _LOGGER.error(f"TaskJob#{self.job.uuid} failed:\n{failed}")
            self._repo.update_job(self.job.uuid, error=repr(failed))

        if not self._repo.is_job_cancelled(self.job.uuid):
            _LOGGER.info(f"TaskJob#{self.job.uuid} completed")
            self._repo.update_job(
                self.job.uuid,
                status=TaskStatus.COMPLETED,
                finished_date=datetime.now(),
            )
        else:
            _LOGGER.warning(f"TaskJob#{self.job.uuid} cancelled")

    def _detect_iteratively(
        self,
        filepath: str,
        early_break: Callable[[], bool],
        parent: DetectedFile = None,
        depth: int = 0,
    ) -> DetectedFile:
        """
        Detect files iteratively.

        :param parent:
        :param filepath: Path to the file to detect
        :param depth: Maximum depth to detect embedded files
        :param early_break: A function that returns True if the detection should be stopped early
        :return: The detected embedded file
        """
        _LOGGER.debug(f"Detecting at {filepath}")

        metadata = self._repo.create_file_metadata(filepath, creator="-", modifier="-")
        detected_file = self._repo.store_detected_file(
            self.job, metadata, results=[None] * len(self.cfg.parameters)
        )

        results = []
        for i, (task_type, detector) in enumerate(self._detectors.items()):
            try:
                result = detector.detect(filepath)

            except Exception as e:
                _LOGGER.error(f"Failed to detect {filepath}: {e}")
                result = None

            # handle embedded files specially
            if task_type == DetectionTaskType.EMBEDDED_FILE and result is not None:
                result.parentId = None if parent is None else parent.id

                if early_break() or depth >= self._detector_cfgs[task_type].maxDepth:
                    # ignore embedded files if the job is cancelled or the depth is reached
                    result.childIds = []
                    result.append(result)
                    break

                child_ids = []
                for emb_filepath in result.childIds:
                    # not stored yet, so it's a str
                    assert isinstance(emb_filepath, str)
                    child = self._detect_iteratively(
                        emb_filepath, early_break, detected_file, depth + 1
                    )
                    child_ids.append(child.id)
                result.childIds = child_ids

            results.append(result)

        detected_file.results = results
        detected_file.save()

        _LOGGER.debug(f"Detected {filepath}")
        return detected_file
