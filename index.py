# coding: utf-8
import sys

import eel

# FIXME: this is dummy data, remove it when the database is ready
data = [
    {
        "id": "1001",
        "targetDirs": ["/home/user1/docs"],
        "date": "2023-10-12T17:30:19Z",
        "progress": {
            "status": "completed",  # or "in-progress" or "failed"
            "error": None,  # error message in string if status is "failed"
            "totalFiles": 3,  # total number of files to be processed
            "processedFiles": 3,  # number of files processed
        },
        "detectedFiles": [
            {
                "filepath": "/home/user1/docs/doc1.doc",
                "filesize": 1000,
                "embeddedFiles": [
                    {"filepath": "nested1-1.doc", "filesize": 100, "embeddedFiles": []},
                    {
                        "filepath": "nested1-2.doc",
                        "filesize": 100,
                        "embeddedFiles": [
                            {
                                "filepath": "nested2-1.doc",
                                "filesize": 100,
                                "embeddedFiles": [],
                            }
                        ],
                    },
                ],
            },
            {
                "filepath": "/home/user1/docs/doc2.doc",
                "filesize": 1000,
                "embeddedFiles": [{"filepath": "nested1-1.doc", "filesize": 100, "embeddedFiles": []}],
            },
        ],
    },
    {
        "id": "1002",
        "targetDirs": ["/home/user2/docs"],
        "date": "2023-10-12T17:30:19Z",
        "progress": {
            "status": "in-progress",
            "error": None,
            "totalFiles": 3,
            "processedFiles": 0,
        },
        "detectedFiles": [],
    },
]


# noinspection PyPep8Naming
@eel.expose
def fetchEmbeddingDetectionResults(page_no: int = 0, page_filesize: int = -1):
    # TODO: load from database
    return data


# noinspection PyPep8Naming
@eel.expose
def fetchEmbeddingDetectionResultById(result_id: str):
    # TODO: load from database
    for item in data:
        if item["id"] == result_id:
            return item
    return None


# noinspection PyPep8Naming
@eel.expose
def detectEmbeddedFiles(targetDir: list[str]):
    # TODO: launch the detection in parallel, and return the result id
    return None


if __name__ == "__main__":
    # NOTE: uncomment the following line if you have only Microsoft Edge installed
    getattr(eel, "_start_args")["mode"] = "edge"

    if sys.argv[1] == "--develop":
        eel.init("client")
        eel.start("http://localhost:3000", host="localhost", port=8888)
    else:
        eel.init("build")
        eel.start("index.html")
