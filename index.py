# coding: utf-8
import eel
import json
import sys


# FIXME: this is dummy data, remove it when the database is ready
data = [
    {
        "id": "1001",
        "targetDirs": ["/home/user1/docs"],
        "date": "2023-10-12T17:30:19Z",
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
        "detectedFiles": [],
    },
]


@eel.expose
def fetchEmbeddingDetectionResults(page_no: int = 0, page_filesize: int = -1):
    # TODO: load from database
    return data


@eel.expose
def fetchEmbeddingDetectionResultById(result_id: str):
    # TODO: load from database
    for item in data:
        if item["id"] == result_id:
            return item
    return None


@eel.expose
def detectEmbeddedFiles(targetDir: list[str]):
    # TODO: launch the detection in parallel, and return the result id
    return None


if __name__ == "__main__":
    eel._start_args["mode"] = "edge"
    if sys.argv[1] == "--develop":
        eel.init("client")
        eel.start({"port": 3000}, host="localhost", port=8888)
    else:
        eel.init("build")
        eel.start("index.html")
