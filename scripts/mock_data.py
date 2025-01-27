"""Script to generate and insert mock data into the database."""

import hashlib
import os
import random
from pathlib import Path
from typing import List

from faker import Faker

from doctec.models import (
    EmbDetectionConfig,
    EmbDetectionResult,
    EmbDetectionRun,
    EmbDetectionStatus,
    EmbeddedFile,
    FileBody,
    FileMetadata,
    init_db,
)

fake = Faker()


def generate_mock_file_content() -> bytes:
    """Generate random file content."""
    return fake.text().encode("utf-8")


def create_mock_file_body(num_records: int = 15) -> List[FileBody]:
    """Create mock FileBody records."""
    records = []
    file_types = ["pdf", "doc", "docx", "txt", "jpg", "png"]

    for _ in range(num_records):
        data = generate_mock_file_content()
        md5 = hashlib.md5(data).hexdigest()
        record = FileBody.create(
            md5=md5, size=len(data), kind=random.choice(file_types), data=data
        )
        records.append(record)

    return records


def create_mock_file_metadata(
    file_bodies: List[FileBody], num_records: int = 15
) -> List[FileMetadata]:
    """Create mock FileMetadata records."""
    records = []

    for _ in range(num_records):
        created = fake.date_time_between(start_date="-1y", end_date="now")
        modified = fake.date_time_between(start_date=created, end_date="now")

        record = FileMetadata.create(
            path=str(Path(fake.file_path(depth=random.randint(2, 4)))),
            data=random.choice(file_bodies),
            created=created,
            modified=modified,
            creator=fake.user_name(),
            modifier=fake.user_name(),
        )
        records.append(record)

    return records


def create_mock_emb_detection_config(num_records: int = 15) -> List[EmbDetectionConfig]:
    """Create mock EmbDetectionConfig records."""
    records = []

    for _ in range(num_records):
        record = EmbDetectionConfig.create(
            targetDirs=[
                str(Path(fake.file_path(depth=1))) for _ in range(random.randint(1, 3))
            ],
            saveDirs=str(Path(fake.file_path(depth=1))),
            maxDepth=random.randint(1, 5),
        )
        records.append(record)

    return records


def create_mock_emb_detection_runs(
    configs: List[EmbDetectionConfig], num_records: int = 15
) -> List[EmbDetectionRun]:
    """Create mock EmbDetectionRun records."""
    records = []
    statuses = list(EmbDetectionStatus)

    for _ in range(num_records):
        launched_date = fake.date_time_between(start_date="-1y", end_date="now")
        status = random.choice(statuses)
        n_total = random.randint(10, 100)

        record = EmbDetectionRun.create(
            cfg=random.choice(configs),
            launchedDate=launched_date,
            finishedDate=(
                fake.date_time_between(start_date=launched_date, end_date="now")
                if status != EmbDetectionStatus.IN_PROGRESS
                else None
            ),
            status=status,
            error=fake.sentence() if status == EmbDetectionStatus.FAILED else None,
            nTotal=n_total,
            nProcessed=(
                random.randint(0, n_total)
                if status == EmbDetectionStatus.IN_PROGRESS
                else n_total
            ),
        )
        records.append(record)

    return records


def create_mock_emb_detection_results(
    runs: List[EmbDetectionRun], num_records: int = 15
) -> List[EmbDetectionResult]:
    """Create mock EmbDetectionResult records."""
    records = []

    for run in runs:
        if run.status == EmbDetectionStatus.COMPLETED:
            record = EmbDetectionResult.create(run=run)
            records.append(record)

    return records


def create_mock_embedded_files(
    results: List[EmbDetectionResult],
    file_metadata: List[FileMetadata],
    num_records: int = 15,
) -> List[EmbeddedFile]:
    """Create mock EmbeddedFile records with hierarchical structure."""
    records = []

    for result in results:
        # Create root level embedded files
        num_root_files = random.randint(3, 7)
        root_files = []

        for _ in range(num_root_files):
            root_file = EmbeddedFile.create(
                result=result, metadata=random.choice(file_metadata), parent=None
            )
            root_files.append(root_file)
            records.append(root_file)

        # Create child files (up to 2 levels deep)
        for root_file in root_files:
            num_children = random.randint(0, 3)
            for _ in range(num_children):
                child = EmbeddedFile.create(
                    result=result,
                    metadata=random.choice(file_metadata),
                    parent=root_file,
                )
                records.append(child)

                # Add grandchildren
                num_grandchildren = random.randint(0, 2)
                for _ in range(num_grandchildren):
                    grandchild = EmbeddedFile.create(
                        result=result,
                        metadata=random.choice(file_metadata),
                        parent=child,
                    )
                    records.append(grandchild)

    return records


def insert_mock_data():
    """Insert mock data into all tables."""
    # Initialize database
    db_path = "app.db"
    if os.path.exists(db_path):
        os.remove(db_path)

    init_db(db_path)

    # Create mock data
    print("Creating mock FileBody records...")
    file_bodies = create_mock_file_body()

    print("Creating mock FileMetadata records...")
    file_metadata = create_mock_file_metadata(file_bodies)

    print("Creating mock EmbDetectionConfig records...")
    configs = create_mock_emb_detection_config()

    print("Creating mock EmbDetectionRun records...")
    runs = create_mock_emb_detection_runs(configs)

    print("Creating mock EmbDetectionResult records...")
    results = create_mock_emb_detection_results(runs)

    print("Creating mock EmbeddedFile records...")
    embedded_files = create_mock_embedded_files(results, file_metadata)

    print(
        f"""
Mock data insertion complete:
- FileBody records: {len(file_bodies)}
- FileMetadata records: {len(file_metadata)}
- EmbDetectionConfig records: {len(configs)}
- EmbDetectionRun records: {len(runs)}
- EmbDetectionResult records: {len(results)}
- EmbeddedFile records: {len(embedded_files)}
"""
    )


if __name__ == "__main__":
    insert_mock_data()
