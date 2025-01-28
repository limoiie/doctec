import React from "react";
import type { EmbeddedFileData } from "@/types/EmbeddedFileData.schema.d";
import { splitPathName } from "@/utils";
import { DataTable } from "@/components/data-table";
import { columnsOfEmbDetectFile } from "@/components/columns-of-emb-detect-file";
import { EmbDetectFile } from "@/data/schema";

/**
 * Sort by parent path
 */
const sortByParentPath = (a: EmbDetectFile, b: EmbDetectFile) => {
  const aParent = a.parent.split("/")[0];
  const bParent = b.parent.split("/")[0];
  if (aParent === bParent) {
    return a.parent.localeCompare(b.parent);
  }
  return aParent.localeCompare(bParent);
};

export function EmbeddedFileList({ files }: { files: EmbeddedFileData[] }) {
  const id2File = new Map(files.map((file) => [file.id, file]));
  const allKinds = new Set(files.map((e) => e.metadata.data.kind));
  const allCreators = new Set(files.map((e) => e.metadata.creator));
  const allModifiers = new Set(files.map((e) => e.metadata.modifier));

  const dataSource: EmbDetectFile[] = files.map((e: EmbeddedFileData) => {
    const { name } = splitPathName(e.metadata.path);
    if (!name) {
      throw new Error("Invalid filename");
    }

    const parent_name =
      e.parentId != e.id && id2File.has(e.parentId!)
        ? splitPathName(id2File.get(e.parentId!)!.metadata.path)["name"]
        : "";
    const parent = parent_name ? `${parent_name}/${name}` : name;
    return {
      id: e.id,
      filepath: e.metadata.path,
      parent: parent,
      size: e.metadata.data.size,
      md5: e.metadata.data.md5,
      kind: e.metadata.data.kind,
      created: e.metadata.created,
      modified: e.metadata.modified,
      creator: e.metadata.creator,
      modifier: e.metadata.modifier,
    };
  });

  const sortedData = dataSource.sort(sortByParentPath);

  return (
    <>
      <DataTable
        data={sortedData}
        columns={columnsOfEmbDetectFile}
        facedFilters={[
          {
            columnKey: "kind",
            title: "Kind",
            options: [...allKinds].map((kind) => ({
              label: kind,
              value: kind,
            })),
          },
          {
            columnKey: "creator",
            title: "Creator",
            options: [...allCreators].map((creator) => ({
              label: creator,
              value: creator,
            })),
          },
          {
            columnKey: "modifier",
            title: "Modifier",
            options: [...allModifiers].map((modifier) => ({
              label: modifier,
              value: modifier,
            })),
          },
        ]}
        searchColumnKey="filepath"
      />
    </>
  );
}
