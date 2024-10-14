import os
import tempfile
from concurrent.futures import Future
from dataclasses import dataclass
from typing import List, Callable, Tuple

from doctec.ctx import AppContext
from doctec.emb_extractor import EmbExtractor
from doctec.tasks.base import BaseJob
from doctec.tasks.emb_detection_types import (
    EmbDetectionConfig,
    EmbeddedFile,
    EmbeddingDetectionStatus,
    EmbDetectionResult,
)


@dataclass
class EmbDetectionJob(BaseJob[EmbDetectionConfig, EmbDetectionResult]):
    def do(self, app: AppContext, *args, **kwargs):
        """Detect embedded files in parallel."""
        repo = app.emb_det_repo

        # collect files to process
        collected = []
        for target_dir in self.cfg.targetDirs:
            for root, dirs, files in os.walk(target_dir):
                for file in files:
                    collected.append(str(os.path.join(root, file)))

        repo.update_result_progress(
            self.res.id,
            status=EmbeddingDetectionStatus.IN_PROGRESS,
            total_files=len(collected),
        )

        # submit tasks
        futures: List[Tuple[str, Future]] = []
        for filepath in collected:
            futures.append(
                (
                    filepath,
                    app.executor.submit(
                        detect_embedding_iteratively,
                        filepath=filepath,
                        early_break=lambda: repo.is_cancelled(self.res.id),
                        depth=self.cfg.maxDepth,
                    ),
                )
            )

        self._wait_for_results(futures, repo)

        repo.update_result_progress(
            self.res.id, status=EmbeddingDetectionStatus.COMPLETED
        )

    def _wait_for_results(self, futures: List[Tuple[str, Future]], repo):
        for filepath, future in futures:
            try:
                detected_file: EmbeddedFile = future.result()

                # update result
                self.res.detectedFiles.append(detected_file)
                repo.add_detected_file(self.res.id, detected_file)

            except Exception as e:
                self.res.progress.error += (
                    f"Error raised while processing {filepath}: {e}. "
                )

            # update result progress
            self.res.progress.processedFiles += 1
            repo.update_result_progress(
                self.res.id,
                processed_files=self.res.progress.processedFiles,
                error=self.res.progress.error,
            )


def detect_embedding_iteratively(
    filepath: str, depth: int, early_break: Callable[[], bool]
) -> EmbeddedFile:
    """
    Detect embedded files iteratively.

    :param filepath: Path to the file to detect
    :param depth: Maximum depth to detect embedded files
    :param early_break: A function that returns True if the detection should be stopped early
    :return: The detected embedded file
    """
    file = EmbeddedFile(
        filepath=filepath,
        filesize=os.path.getsize(filepath),
        embeddedFiles=[],
    )
    if early_break() or depth <= 0:
        return file

    with tempfile.TemporaryDirectory() as out_dir:
        extractor = EmbExtractor.build()
        for extracted_filepath in extractor.extract(filepath, out_dir):
            file.embeddedFiles.append(
                detect_embedding_iteratively(extracted_filepath, depth - 1, early_break)
            )
    return file
