import dataclasses
import enum
from typing import List, Tuple, Any


def as_jsonlike_dict(obj):
    def dict_factory(kv_pairs: List[Tuple[str, Any]]):
        """
        Create a dictionary from a list of entries.

        If the value is an enum, extract the value.
        """
        return {k: v.value if isinstance(v, enum.Enum) else v for k, v in kv_pairs}

    if isinstance(obj, dict):
        return {k: as_jsonlike_dict(v) for k, v in obj.items()}
    if isinstance(obj, (list, set, tuple)):
        return [as_jsonlike_dict(e) for e in obj]
    assert dataclasses.is_dataclass(obj), f"Only support python builtin and dataclass."
    return dataclasses.asdict(obj, dict_factory=dict_factory)
