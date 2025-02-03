import React, { useEffect } from "react";
import type { DetectedFileData } from "@/types/DetectedFileData.schema";
import { splitPathName } from "@/utils";
import { ListTable } from "@/components/list-table";
import { listColumnsOfEmbDetectFile } from "@/components/list-columns-of-emb-detect-file";
import { DetectedFileVO } from "@/data/schema";
import { DetectionTaskJobData } from "@/types/DetectionTaskJobData.schema";

/**
 * Check if the embedded file detect module is enabled
 *
 * @param job Check the job to see if the embedded file detect module is enabled
 * @returns The index of the embedded file detect module and whether it is enabled
 */
function isEmbeddedFileDetectModuleEnabled(job: DetectionTaskJobData) {
  let idxOfEmbeddedFileDetectModule = 0;
  let hasEmbeddedFileDetectModule = false;
  for (const config of job.cfg.configs) {
    switch (config.type) {
      case "embedded-file":
        hasEmbeddedFileDetectModule = true;
        break;
    }
    if (hasEmbeddedFileDetectModule) {
      break;
    }
    idxOfEmbeddedFileDetectModule++;
  }
  return { idxOfEmbeddedFileDetectModule, hasEmbeddedFileDetectModule };
}

/**
 * Build the embedded file data tree
 */
export function buildEmbFileDataTree(
  job: DetectionTaskJobData,
  files: DetectedFileData[],
): DetectedFileVO[] {
  const dataSource: DetectedFileVO[] = files.map((file) => ({
    id: file.id,
    embPath: file.metadata.path + "#" + file.id,
    ancestors: [],
    children: [],
    data: file,
  }));
  const id2EmbeddedFileMap = dataSource.reduce(
    (acc, cur) => acc.set(cur.id, cur),
    new Map<number, DetectedFileVO>(),
  );

  let { idxOfEmbeddedFileDetectModule, hasEmbeddedFileDetectModule } =
    isEmbeddedFileDetectModuleEnabled(job);

  const visited = new Set();

  function buildRelationship(file: DetectedFileVO): DetectedFileVO {
    if (visited.has(file.id)) {
      return file;
    }

    if (!hasEmbeddedFileDetectModule) {
      file.embPath = file.data.metadata.path + "#" + file.id;
      file.ancestors = [];
      visited.add(file.id);
      return file;
    }

    const parentId = Number(
      file.data.results[idxOfEmbeddedFileDetectModule].parentId,
    );
    if (
      parentId === null ||
      isNaN(parentId) ||
      parentId === file.id ||
      !id2EmbeddedFileMap.has(parentId)
    ) {
      file.embPath = file.data.metadata.path + "#" + file.id;
      file.data.results[idxOfEmbeddedFileDetectModule].parentId = file.id;
      file.ancestors = [];
      visited.add(file.id);
      return file;
    }

    const parent = buildRelationship(id2EmbeddedFileMap.get(parentId)!);
    file.embPath =
      parent.embPath +
      "/" +
      splitPathName(file.data.metadata.path)["name"] +
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

export function EmbeddedFileList({
  job,
  files,
}: {
  job: DetectionTaskJobData;
  files: DetectedFileData[];
}) {
  const [kinds, setKinds] = React.useState<string[]>([]);
  const [creators, setCreators] = React.useState<string[]>([]);
  const [modifiers, setModifiers] = React.useState<string[]>([]);
  const [dataSource, setDataSource] = React.useState<DetectedFileVO[]>([]);

  useEffect(() => {
    // noinspection DuplicatedCode
    setKinds([...new Set(files.map((e) => e.metadata.data.kind))]);
    setCreators([...new Set(files.map((e) => e.metadata.creator))]);
    setModifiers([...new Set(files.map((e) => e.metadata.modifier))]);

    const dataSource = buildEmbFileDataTree(job, files);
    const sortedData = dataSource.sort(
      (a: DetectedFileVO, b: DetectedFileVO) => {
        return a.embPath.localeCompare(b.embPath);
      },
    );
    setDataSource(sortedData);
  }, [files]);

  return (
    <ListTable
      data={dataSource}
      columns={listColumnsOfEmbDetectFile(job.cfg)}
      initInvisibleColumns={["created", "modified"]}
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
