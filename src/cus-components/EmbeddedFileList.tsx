import React, { useEffect } from "react";
import type { EmbeddedFileData } from "@/types/EmbeddedFileData.schema.d";
import { splitPathName } from "@/utils";
import { ListTable } from "@/components/list-table";
import { listColumnsOfEmbDetectFile } from "@/components/list-columns-of-emb-detect-file";
import { EmbDetectFileVO } from "@/data/schema";

/**
 * Build the embedded file data tree
 */
export function buildEmbFileDataTree(
  files: EmbeddedFileData[],
): EmbDetectFileVO[] {
  const dataSource: EmbDetectFileVO[] = files.map((e: EmbeddedFileData) => {
    return {
      id: e.id,
      filepath: e.metadata.path,
      embPath: "",
      parentId: e.parentId,
      ancestors: [] as number[],
      children: [] as number[],
      size: e.metadata.data.size,
      md5: e.metadata.data.md5,
      kind: e.metadata.data.kind,
      created: e.metadata.created,
      modified: e.metadata.modified,
      creator: e.metadata.creator,
      modifier: e.metadata.modifier,
    };
  });

  const id2EmbeddedFileMap = dataSource.reduce(
    (acc, cur) => acc.set(cur.id, cur),
    new Map<number, EmbDetectFileVO>(),
  );
  const visited = new Set();

  function buildRelationship(file: EmbDetectFileVO): EmbDetectFileVO {
    if (visited.has(file.id)) {
      return file;
    }
    const parentId = file.parentId;
    if (parentId === null || parentId == file.id) {
      file.embPath = file.filepath + "#" + file.id;
      file.parentId = file.id;
      file.ancestors = [];
      visited.add(file.id);
      return file;
    }

    const parent = buildRelationship(id2EmbeddedFileMap.get(parentId)!);
    file.embPath =
      parent.embPath +
      "/" +
      splitPathName(file.filepath)["name"] +
      "#" +
      file.id;
    file.ancestors = [...parent.ancestors, parent.id];
    if (!parent.children.includes(file.id)) {
      parent.children.push(file.id);
    }
    visited.add(file.id);
    return file;
  }

  dataSource.forEach(buildRelationship);
  return dataSource;
}

export function EmbeddedFileList({ files }: { files: EmbeddedFileData[] }) {
  const [kinds, setKinds] = React.useState<string[]>([]);
  const [creators, setCreators] = React.useState<string[]>([]);
  const [modifiers, setModifiers] = React.useState<string[]>([]);
  const [dataSource, setDataSource] = React.useState<EmbDetectFileVO[]>([]);

  useEffect(() => {
    // noinspection DuplicatedCode
    setKinds([...new Set(files.map((e) => e.metadata.data.kind))]);
    setCreators([...new Set(files.map((e) => e.metadata.creator))]);
    setModifiers([...new Set(files.map((e) => e.metadata.modifier))]);

    const dataSource = buildEmbFileDataTree(files);
    const sortedData = dataSource.sort(
      (a: EmbDetectFileVO, b: EmbDetectFileVO) => {
        return a.embPath.localeCompare(b.embPath);
      },
    );
    setDataSource(sortedData);
  }, [files]);

  return (
    <ListTable
      data={dataSource}
      columns={listColumnsOfEmbDetectFile}
      facedFilters={[
        {
          columnKey: "kind",
          title: "Kind",
          options: [...kinds].map((kind) => ({
            label: kind,
            value: kind,
          })),
        },
        {
          columnKey: "creator",
          title: "Creator",
          options: [...creators].map((creator) => ({
            label: creator,
            value: creator,
          })),
        },
        {
          columnKey: "modifier",
          title: "Modifier",
          options: [...modifiers].map((modifier) => ({
            label: modifier,
            value: modifier,
          })),
        },
      ]}
      searchColumnKey="filepath"
    />
  );
}
