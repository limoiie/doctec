from abc import abstractmethod
from typing import Iterable


class EmbExtractor:
    def extract(self, path: str, out: str) -> Iterable[str]:
        pass

    @staticmethod
    def build() -> "EmbExtractor":
        return _EmbExtractorWrapper()


class _EmbExtractorWrapper(EmbExtractor):
    @abstractmethod
    def extract(self, path: str, out: str) -> Iterable[str]:
        pass
