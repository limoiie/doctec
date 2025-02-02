import random

from doctec.models import *
from doctec.tasks.types import TaskStatus, DetectionTaskType

# Initialize the database
db = SqliteDatabase("fake_database.db")
DB_PROXY.initialize(db)

# Create all tables
db.create_tables(
    [
        User,
        UserSession,
        FileData,
        FileMetadata,
        DetectionTaskCfg,
        DetectionTaskJob,
        DetectedFile,
    ]
)


def generate_fake_data():
    # Generate Users
    users = []
    for i in range(20):
        user = User.create(
            username=f"user{i}",
            email=f"user{i}@example.com",
            password_hash=bcrypt.hashpw(
                f"password{i}".encode("utf-8"), bcrypt.gensalt()
            ).decode("utf-8"),
            avatar=f"/avatars/shadcn.jpg",
            created_at=datetime.datetime.now(),
            updated_at=datetime.datetime.now(),
        )
        users.append(user)

    # Generate UserSessions
    for user in users:
        for _ in range(2):  # 2 sessions per user
            UserSession.create_session(user, expires_in_days=random.randint(1, 30))

    # Generate FileData
    file_data_entries = []
    for i in range(20):
        file_data = FileData.create(
            md5=f"md5hash{i}" * 2,  # 32 chars
            size=random.randint(1000, 1000000),
            mime=random.choice(["application/pdf", "application/msword", "text/plain"]),
            kind=random.choice(["document", "spreadsheet", "presentation"]),
            body=b"fake binary data",
        )
        file_data_entries.append(file_data)

    # Generate FileMetadata
    file_metadata_entries = []
    for i, file_data in enumerate(file_data_entries):
        metadata = FileMetadata.create(
            path=f"/documents/file{i}.doc",
            data=file_data,
            created=datetime.datetime.now(),
            modified=datetime.datetime.now(),
            creator=random.choice(users).username,
            modifier=random.choice(users).username,
        )
        file_metadata_entries.append(metadata)

    # Generate DetectionTaskCfg
    task_cfgs = []
    for i in range(20):
        cfg = DetectionTaskCfg.create(
            targetDirs=[f"/dir{j}" for j in range(random.randint(1, 3))],
            saveDir=f"/results/task{i}",
            parameters=[
                {
                    "type": DetectionTaskType.EMBEDDED_FILE.name,
                    "maxDepth": random.randint(1, 5),
                },
                {
                    "type": DetectionTaskType.MALICIOUS_DOC.name,
                    "severityThreshold": random.uniform(0.1, 0.9),
                },
            ],
        )
        task_cfgs.append(cfg)

    # Generate DetectionTaskJob
    task_jobs = []
    for cfg in task_cfgs:
        job = DetectionTaskJob.create(
            cfg=cfg,
            launchedDate=datetime.datetime.now(),
            finishedDate=datetime.datetime.now() if random.random() > 0.2 else None,
            status=random.choice(list(TaskStatus)),
            error="Some error occurred" if random.random() < 0.1 else None,
            nTotal=random.randint(10, 100),
            nProcessed=random.randint(0, 10),
        )
        task_jobs.append(job)

    # Generate DetectedFile
    for job in task_jobs:
        DetectedFile.create(
            job=job,
            metadata=random.choice(file_metadata_entries),
            results=[
                {
                    "type": DetectionTaskType.EMBEDDED_FILE.name,
                    "parentId": None,
                    "childIds": [
                        random.randint(1, 100) for _ in range(random.randint(0, 3))
                    ],
                },
                {
                    "type": DetectionTaskType.MALICIOUS_DOC.name,
                    "severity": random.choice(["high", "medium", "low"]),
                    "category": random.choice(["shellcode", "malform", "upload"]),
                    "description": "Suspicious content detected",
                    "confidence": random.uniform(0.1, 1.0),
                    "remediation": "Please review the file content",
                },
            ],
        )


if __name__ == "__main__":
    generate_fake_data()
    print("Fake data generation completed!")
