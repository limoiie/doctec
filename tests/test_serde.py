import pytest

# noinspection PyUnresolvedReferences
from playhouse.shortcuts import model_to_dict

from doctec.repos.emb_detection_repo import EmbDetectionRepo


@pytest.fixture
def repo():
    return EmbDetectionRepo()


def test_serialize_runs(repo: EmbDetectionRepo):
    # prepare several runs into db
    cfg_data = {"targetDirs": ["/test/dir"], "maxDepth": 5}
    cfg, _ = repo.fetch_or_create_config(**cfg_data)
    res = repo.init_run(cfg)

    dic = model_to_dict(res, recurse=True)
    print(dic)
