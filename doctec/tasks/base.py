from abc import abstractmethod
from dataclasses import dataclass
from typing import Generic, TypeVar

from doctec.ctx import AppContext

TCfg = TypeVar("TCfg")
TJob = TypeVar("TJob")


@dataclass
class BaseTask(Generic[TCfg, TJob]):
    cfg: TCfg
    job: TJob

    @abstractmethod
    def do(self, app: AppContext, *args, **kwargs):
        pass
