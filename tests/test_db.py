from datetime import datetime, UTC
from uuid import UUID

import pytest

from doctec.models import (
    EmbeddedFile,
    FileMetadata,
)
from doctec.tasks.types import TaskStatus
from doctec.repos.detection_repo import DetectionRepo


@pytest.fixture
def repo():
    return DetectionRepo()


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
    res = repo.init_job(cfg)
    assert res.job.cfg == cfg
    assert res.job.status == TaskStatus.PENDING


def test_fetch_all_runs(repo):
    runs = repo.fetch_jobs()
    assert isinstance(runs, list)


def test_fetch_one_run_by_id(repo, cfg):
    res = repo.init_job(cfg)
    run = repo.fetch_one_job_by_uuid(res.job.uuid)
    assert run.uuid == res.job.uuid


def test_fetch_one_result_by_run_id(repo, cfg):
    res = repo.init_job(cfg)
    result = repo.fetch_detected_files_by_job_uuid(res.job.uuid)
    assert result.job.uuid == res.job.uuid


def test_is_run_cancelled(repo, cfg):
    res = repo.init_job(cfg)
    assert not repo.is_job_cancelled(res.job.uuid)
    repo.update_job(res.job.uuid, status=TaskStatus.CANCELLED)
    assert repo.is_job_cancelled(res.job.uuid)


def test_update_run(repo, cfg):
    res = repo.init_job(cfg)
    repo.update_job(res.job.uuid, status=TaskStatus.COMPLETED)
    updated_run = repo.fetch_one_job_by_uuid(res.job.uuid)
    assert updated_run.status == TaskStatus.COMPLETED


def test_fetch_or_create_file_data(repo, resources):
    filepath = resources / "dummy-file"
    data, _ = repo.fetch_or_create_file_data(filepath)
    assert data.md5 is not None


def test_create_file_metadata(repo, resources):
    filepath = resources / "dummy-file"
    metadata = repo.create_file_metadata(filepath, creator="test", modifier="test")
    assert metadata.path == filepath


def test_create_embedded_file(repo, cfg, resources):
    res = repo.init_job(cfg)
    data, _ = repo.fetch_or_create_file_data(resources / "dummy-file")
    metadata = FileMetadata.create(
        path=resources / "dummy-file",
        data=data,
        created=datetime.now(UTC),
        modified=datetime.now(UTC),
        creator="test",
        modifier="test",
    )
    embedded_file = repo.store_detected_file(res, metadata)
    assert embedded_file.result == res


def test_add_detected_file(repo, cfg, resources):
    res = repo.init_job(cfg)
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
