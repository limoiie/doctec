import React, { useEffect } from "react";

import type { EmbeddedFileData } from "@/types/EmbeddedFileData.schema.d";
import { EmbDetectFileVO } from "@/data/schema";
import { buildEmbFileDataTree } from "@/cus-components/EmbeddedFileList";
import { treeColumnsOfEmbDetectFile } from "@/components/tree-columns-of-emb-detect-file";
import { TreeTable } from "@/components/tree-table";

export function EmbeddedFileTree({ files }: { files: EmbeddedFileData[] }) {
  const [kinds, setKinds] = React.useState<string[]>([]);
  const [creators, setCreators] = React.useState<string[]>([]);
  const [modifiers, setModifiers] = React.useState<string[]>([]);
  const [dataSource, setDataSource] = React.useState<EmbDetectFileVO[]>([]);
  const [dataSourceMap, setDataSourceMap] = React.useState<
    Map<number, EmbDetectFileVO>
  >(new Map());

  function getChildren(item: EmbDetectFileVO): EmbDetectFileVO[] | undefined {
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

    const dataSource = buildEmbFileDataTree(files);
    const sortedDataSource = dataSource
      .filter((item) => item.ancestors.length === 0)
      .sort((a: EmbDetectFileVO, b: EmbDetectFileVO) => {
        return a.embPath.localeCompare(b.embPath);
      });
    setDataSource(sortedDataSource);

    const dataSourceMap = dataSource.reduce((acc, item) => {
      return acc.set(item.id, item);
    }, new Map<number, EmbDetectFileVO>());
    setDataSourceMap(dataSourceMap);
  }, [files]);

  return (
    <TreeTable
      data={dataSource}
      getChildrenData={getChildren}
      columns={treeColumnsOfEmbDetectFile}
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
