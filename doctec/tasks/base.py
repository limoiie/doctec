from abc import abstractmethod
from dataclasses import dataclass
from typing import Generic, TypeVar

from doctec.ctx import AppContext

TCfg = TypeVar("TCfg")
TRes = TypeVar("TRes")


@dataclass
class BaseJob(Generic[TCfg, TRes]):
    cfg: TCfg
    res: TRes

    @abstractmethod
    def do(self, app: AppContext, *args, **kwargs):
        pass
