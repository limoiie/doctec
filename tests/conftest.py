import pathlib

import pytest

from doctec.models import init_db


@pytest.fixture(scope="session", autouse=True)
def init():
    """
    Initialize the runtime context for each test session.
    """
    init_db(":memory:")


@pytest.fixture
def resources():
    """
    Return the resources directory path.
    """
    return pathlib.Path(__file__).parent / "resources"
