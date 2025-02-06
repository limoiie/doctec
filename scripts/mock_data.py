import random

from doctec.models import *
from doctec.tasks.types import DetectionTaskType, TaskStatus

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


def create_detected_files_for_job(
    job: DetectionTaskJob, metadata_entries: List[FileMetadata]
):
    """Create multiple detected files for a job with proper tree structure."""

    def create_file_tree(
        parent_id: Optional[int], depth: int = 0, max_depth: int = 3
    ) -> List[DetectedFile]:
        """Create a tree of detected files and return their IDs."""
        if depth >= max_depth or random.random() < 0.3:  # 30% chance to stop branching
            return []

        num_children = random.randint(1, 5)
        children = []

        for _ in range(num_children):
            # Create child file detection with proper parentId
            child = DetectedFile.create(
                job=job,
                metadata=random.choice(metadata_entries),
                results=[
                    {
                        "type": DetectionTaskType.EMBEDDED_FILE.name,
                        "parentId": parent_id,  # Set parent ID during creation
                        "childIds": [],  # Will be updated after creating children
                        "depth": depth,
                    },
                    {
                        "type": DetectionTaskType.MALICIOUS_DOC.name,
                        "severity": random.choice(["high", "medium", "low"]),
                        "category": random.choice(
                            [
                                "shellcode",
                                "malform",
                                "upload",
                                "macro",
                                "exploit",
                                "obfuscation",
                            ]
                        ),
                        "description": random.choice(
                            [
                                "Suspicious macro detected",
                                "Potential shellcode found",
                                "Obfuscated content detected",
                                "Suspicious embedded objects",
                                "Malformed document structure",
                            ]
                        ),
                        "confidence": round(random.uniform(0.5, 1.0), 2),
                        "remediation": random.choice(
                            [
                                "Review and disable macros",
                                "Scan with updated antivirus",
                                "Check embedded content",
                                "Verify document source",
                                "Remove suspicious elements",
                            ]
                        ),
                    },
                ],
            )

            # Recursively create children for this node
            grandchildren = create_file_tree(child.id, depth + 1, max_depth)

            # Update the child's childIds
            if grandchildren:
                child.results[0]["childIds"] = [
                    grandchild.id for grandchild in grandchildren
                ]
                child.save()  # Save the updated results

                # Update all grandchildren to ensure their parentId is set correctly
                for grandchild in grandchildren:
                    grandchild.results[0]["parentId"] = child.id
                    grandchild.save()

            children.append(child)

        return children

    # Generate 5-15 root level files per job
    num_root_files = random.randint(5, 15)

    for _ in range(num_root_files):
        # Create root level detection
        root = DetectedFile.create(
            job=job,
            metadata=random.choice(metadata_entries),
            results=[
                {
                    "type": DetectionTaskType.EMBEDDED_FILE.name,
                    "parentId": None,  # Root has no parent
                    "childIds": [],  # Will be updated after creating children
                    "depth": 0,
                },
                {
                    "type": DetectionTaskType.MALICIOUS_DOC.name,
                    "severity": random.choice(["high", "medium", "low"]),
                    "category": random.choice(
                        [
                            "shellcode",
                            "malform",
                            "upload",
                            "macro",
                            "exploit",
                            "obfuscation",
                        ]
                    ),
                    "description": random.choice(
                        [
                            "Suspicious macro detected",
                            "Potential shellcode found",
                            "Obfuscated content detected",
                            "Suspicious embedded objects",
                            "Malformed document structure",
                        ]
                    ),
                    "confidence": round(random.uniform(0.5, 1.0), 2),
                    "remediation": random.choice(
                        [
                            "Review and disable macros",
                            "Scan with updated antivirus",
                            "Check embedded content",
                            "Verify document source",
                            "Remove suspicious elements",
                        ]
                    ),
                },
            ],
        )

        # Create child files and get their IDs
        root_children = create_file_tree(root.id)

        # Update root's childIds if it has children
        if root_children:
            root.results[0]["childIds"] = [child.id for child in root_children]
            root.save()  # Save the updated results

            # Update all children to ensure their parentId is set correctly
            for child in root_children:
                child.results[0]["parentId"] = root.id
                child.save()


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

    # Generate DetectedFile with valid tree structure
    for job in task_jobs:
        create_detected_files_for_job(job, file_metadata_entries)


if __name__ == "__main__":
    generate_fake_data()
    print("Fake data generation completed!")
