import os
import shutil

import fire


def ts2js(path: str):
    for root, dirs, files in os.walk(path):
        for file in files:
            if file.endswith(".ts"):
                shutil.move(
                    os.path.join(root, file),
                    os.path.join(root, file[:-3] + ".js"),
                )


if __name__ == "__main__":
    fire.Fire(ts2js)
