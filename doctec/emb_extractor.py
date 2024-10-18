import os
from abc import abstractmethod
from typing import Iterable

import clr

# noinspection PyUnresolvedReferences
clr.AddReference(os.path.abspath("./public/pkgs/OfficeExtractor/OfficeExtractor.dll"))


class EmbExtractor:
    def extract(self, path: str, out: str) -> Iterable[str]:
        pass

    @staticmethod
    def build() -> "EmbExtractor":
        return _EmbExtractorWrapper()


class _EmbExtractorWrapper(EmbExtractor):
    @abstractmethod
    def extract(self, path: str, out: str) -> Iterable[str]:
        # noinspection PyUnresolvedReferences,PyPackageRequirements
        from OfficeExtractor import Extractor  # type: ignore

        extractor = Extractor()
        extractor.SaveToFolder(path, out)

        for file in os.listdir(out):
            yield os.path.join(out, file)
