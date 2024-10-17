from datetime import datetime, UTC
from uuid import UUID

import pytest

from doctec.models import (
    EmbeddedFile,
    FileMetadata,
    EmbDetectionStatus,
)
from doctec.repos.emb_detection_repo import EmbDetectionRepo


@pytest.fixture
def repo():
    return EmbDetectionRepo()


@pytest.fixture
def cfg(repo):
    cfg_data = {"targetDirs": ["/test/dir"], "maxDepth": 5}
    cfg, _ = repo.fetch_or_create_config(**cfg_data)
    return cfg


def test_fetch_or_create_config(repo):
    cfg_data = {"targetDirs": ["/test/dir"], "maxDepth": 5}
    cfg, created = repo.fetch_or_create_config(**cfg_data)
    assert isinstance(cfg.uuid, UUID)
    assert cfg.targetDirs == ["/test/dir"]
    assert cfg.maxDepth == 5


def test_init_run(repo, cfg):
    res = repo.init_run(cfg)
    assert res.run.cfg == cfg
    assert res.run.status == EmbDetectionStatus.PENDING


def test_fetch_all_runs(repo):
    runs = repo.fetch_runs()
    assert isinstance(runs, list)


def test_fetch_one_run_by_id(repo, cfg):
    res = repo.init_run(cfg)
    run = repo.fetch_one_run_by_id(res.run.uuid)
    assert run.uuid == res.run.uuid


def test_fetch_one_result_by_run_id(repo, cfg):
    res = repo.init_run(cfg)
    result = repo.fetch_one_result_by_run_id(res.run.uuid)
    assert result.run.uuid == res.run.uuid


def test_is_run_cancelled(repo, cfg):
    res = repo.init_run(cfg)
    assert not repo.is_run_cancelled(res.run.uuid)
    repo.update_run(res.run.uuid, status=EmbDetectionStatus.CANCELLED)
    assert repo.is_run_cancelled(res.run.uuid)


def test_update_run(repo, cfg):
    res = repo.init_run(cfg)
    repo.update_run(res.run.uuid, status=EmbDetectionStatus.COMPLETED)
    updated_run = repo.fetch_one_run_by_id(res.run.uuid)
    assert updated_run.status == EmbDetectionStatus.COMPLETED


def test_fetch_or_create_file_data(repo, resources):
    filepath = resources / "dummy-file"
    data, _ = repo.fetch_or_create_file_data(filepath)
    assert data.md5 is not None


def test_create_file_metadata(repo, resources):
    filepath = resources / "dummy-file"
    metadata = repo.create_file_metadata(filepath, creator="test", modifier="test")
    assert metadata.path == filepath


def test_create_embedded_file(repo, cfg, resources):
    res = repo.init_run(cfg)
    data, _ = repo.fetch_or_create_file_data(resources / "dummy-file")
    metadata = FileMetadata.create(
        path=resources / "dummy-file",
        data=data,
        created=datetime.now(UTC),
        modified=datetime.now(UTC),
        creator="test",
        modifier="test",
    )
    embedded_file = repo.create_embedded_file(res, metadata)
    assert embedded_file.result == res


def test_add_detected_file(repo, cfg, resources):
    res = repo.init_run(cfg)
    data, _ = repo.fetch_or_create_file_data(resources / "dummy-file")
    metadata = FileMetadata.create(
        path=resources / "dummy-file",
        data=data,
        created=datetime.now(UTC),
        modified=datetime.now(UTC),
        creator="test",
        modifier="test",
    )
    detected_file = EmbeddedFile.create(result=res, metadata=metadata)
    repo.add_detected_file(res.id, detected_file)
    assert detected_file.result_id == res.id
