import logging
from os import environ
from typing import Union


def init_logging(*, level: Union[int, str, None]) -> None:
    """
    Initialize the logging system.

    :param level:
    :return:
    """
    if level is None:
        level = environ.get("LOG_LEVEL")
    if isinstance(level, str):
        level = level.upper()
    logging.basicConfig(level=level)


def get_logger(name: str) -> logging.Logger:
    """
    Get a logger with the given name.
    """
    return logging.getLogger(name)
