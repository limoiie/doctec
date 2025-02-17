import React, { useEffect } from "react";

import type { DetectedFileData } from "@/types/DetectedFileData.schema";
import { DetectedFileVO } from "@/data/schema";
import { buildEmbFileDataTree } from "@/cus-components/EmbeddedFileList";
import { treeColumnsOfEmbDetectFile } from "@/components/tree-columns-of-emb-detect-file";
import { TreeTable } from "@/components/tree-table";
import { DetectionTaskJobData } from "@/types/DetectionTaskJobData.schema";

export function EmbeddedFileTree({
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
  const [dataSourceMap, setDataSourceMap] = React.useState<
    Map<number, DetectedFileVO>
  >(new Map());

  function getChildren(item: DetectedFileVO): DetectedFileVO[] | undefined {
    if (!item.children || item.children.length === 0) {
      return undefined;
    }
    return item.children.map((id) => dataSourceMap.get(id)!);
  }

  useEffect(() => {
    // noinspection DuplicatedCode
    setKinds([...new Set(files.map((e) => e.metadata.data.kind))]);
    setCreators([...new Set(files.map((e) => e.metadata.creator))]);
    setModifiers([...new Set(files.map((e) => e.metadata.modifier))]);

    const dataSource = buildEmbFileDataTree(job, files);
    const sortedDataSource = dataSource
      .filter((item) => item.ancestors.length === 0)
      .sort((a: DetectedFileVO, b: DetectedFileVO) => {
        return a.embPath.localeCompare(b.embPath);
      });
    setDataSource(sortedDataSource);

    const dataSourceMap = dataSource.reduce((acc, item) => {
      return acc.set(item.id, item);
    }, new Map<number, DetectedFileVO>());
    setDataSourceMap(dataSourceMap);
  }, [files]);

  return (
    <TreeTable
      data={dataSource}
      getChildrenData={getChildren}
      columns={treeColumnsOfEmbDetectFile(job.cfg)}
      initInvisibleColumns={["created", "modified"]}
      facedFilters={[
        {
          columnKey: "kind",
          title: "文件类型",
          options: [...kinds].map((kind) => ({
            label: kind,
            value: kind,
          })),
        },
        {
          columnKey: "creator",
          title: "创建者",
          options: [...creators].map((creator) => ({
            label: creator,
            value: creator,
          })),
        },
        {
          columnKey: "modifier",
          title: "编辑者",
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
