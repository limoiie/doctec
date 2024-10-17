import json
import os.path
import shutil

import fire

from doctec.schemas import generate_jsonschema


def gene_jsonschema(out: str, clean: bool = True):
    """
    Generate JSON schema for all schema models.

    For each separated model, a jsonschema file will be generated.
    For a list of commonly-used jsonschema, they will be defined in one common.schema.json.

    :param clean: Clean the output directory before generating the schema
    :param out: Output directory
    :return:
    """
    if clean and os.path.exists(out):
        # remove all files and folders under dir
        shutil.rmtree(out)

    jsonschema_mapping = {"common": {"$defs": {}}}

    # Generate all jsonschema and extract common jsonschema
    os.makedirs(out, exist_ok=True)
    for jsonschema in generate_jsonschema():
        # Extract common jsonschema
        for sub_name, sub_jsonschema in jsonschema.pop("$defs", {}).items():
            jsonschema_mapping["common"]["$defs"][sub_name] = sub_jsonschema
        jsonschema_mapping[jsonschema["title"]] = jsonschema

    # Any common jsonschema appearing in root should not be common anymore
    uncommon_names = []
    for name in set(jsonschema_mapping["common"]["$defs"]) & set(jsonschema_mapping):
        jsonschema_mapping["common"]["$defs"].pop(name)
        uncommon_names.append(name)

    for name, jsonschema in jsonschema_mapping.items():
        ser_jsonschema = json.dumps(jsonschema, indent=2)
        for separated_name in uncommon_names:
            ser_jsonschema = ser_jsonschema.replace(
                f'"#/$defs/{separated_name}"',
                f'"{separated_name}.schema.json#"',
            )

        if name == "common":
            if not jsonschema_mapping["common"]["$defs"]:
                continue
        else:
            for common_name in jsonschema_mapping["common"]["$defs"]:
                ser_jsonschema = ser_jsonschema.replace(
                    f'"#/$defs/{common_name}"',
                    f'"common.schema.json#/$defs/{common_name}"',
                )

        with open(os.path.join(out, f"{name}.schema.json"), "w+") as fp:
            fp.write(ser_jsonschema)


if __name__ == "__main__":
    fire.Fire(gene_jsonschema)
