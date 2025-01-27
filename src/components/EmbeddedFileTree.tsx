import React, { useEffect, useMemo, useState } from "react";
import { Descriptions, Input, Splitter, Tree } from "antd";

import type { EmbeddedFileData } from "@/types/EmbeddedFileData.schema.d";
import { FileOutlined, FolderOutlined } from "@ant-design/icons";
import { splitPathComponents, splitPathName } from "@/utils";

const { Search } = Input;

interface TreeDataNode {
  title: string;
  key: React.Key;
  icon: React.ReactNode;
  parentId: React.Key | null;
  children: TreeDataNode[];
  data?: EmbeddedFileData;
}

/** Get the parent key of a node with the specified key, iteratively. */
const getParentKey = (
  key: React.Key,
  nodes: TreeDataNode[],
): React.Key | undefined => {
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    if (node.children) {
      if (node.children.some((item) => item.key === key)) {
        return node.key;
      } else {
        const parentKey = getParentKey(key, node.children);
        if (parentKey) {
          return parentKey;
        }
      }
    }
  }
  return undefined;
};

export function EmbeddedFileTree({ files }: { files: EmbeddedFileData[] }) {
  const [roots, setRoots] = useState<TreeDataNode[]>([]);
  const [nodes, setNodes] = useState<TreeDataNode[]>([]);
  const [nodesMap, setNodesMap] = useState<
    Map<string | number | bigint, TreeDataNode>
  >(new Map());
  const [selected, setSelected] = useState<React.Key[]>([]);

  /** Build filesystem tree from the files. */
  function buildTreeFromFiles(files: EmbeddedFileData[]) {
    const nodesMap = new Map<string | number | bigint, TreeDataNode>();

    /**
     * Since we only store files but no folders,
     * we need to construct nodes for each file's parent folders.
     */
    function constructNodesTillParent(path: string) {
      let parentId = null;
      const { components, subpaths } = splitPathComponents(path);
      for (let i = 0; i < components.length - 1; i++) {
        if (!nodesMap.has(subpaths[i])) {
          nodesMap.set(subpaths[i], {
            title: components[i],
            key: subpaths[i],
            icon: <FolderOutlined />,
            parentId: parentId,
            children: [],
            data: undefined,
          });
        }
        parentId = subpaths[i];
      }
      return parentId;
    }

    // Construct nodes for each file
    for (const e of files) {
      let parentId: React.Key | null = e.parentId;
      if (parentId === null) {
        parentId = constructNodesTillParent(e.metadata.path);
      }
      nodesMap.set(e.id, {
        title: splitPathName(e.metadata.path).name || "Unknown",
        key: e.id,
        icon: <FileOutlined />,
        parentId: parentId,
        children: [],
        data: e,
      });
    }

    // Build the tree by linking nodes
    const roots = [];
    const nodes = [];
    for (const node of nodesMap.values()) {
      if (node.parentId !== null) {
        const parentNode = nodesMap.get(node.parentId);
        if (parentNode) {
          parentNode.children.push(node);
        }
      } else {
        roots.push(node);
      }
      nodes.push(node);
    }
    return { roots, nodes, nodesMap };
  }

  // Initialize the tree or Rebuild it when files change
  useEffect(() => {
    const { roots, nodes, nodesMap } = buildTreeFromFiles(files);
    setRoots(roots);
    setNodes(nodes);
    setNodesMap(nodesMap);
  }, [files]);

  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);
  const [searchValue, setSearchValue] = useState("");
  const [autoExpandParent, setAutoExpandParent] = useState(true);

  // Whenever the expanding is triggered manually, disable the auto-expanding
  const onTreeNodeExpand = (newExpandedKeys: React.Key[]) => {
    setExpandedKeys(newExpandedKeys);
    setAutoExpandParent(true);
  };

  // Expand the tree nodes that match the search token and their parents
  const onSearchValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    const newExpandedKeys: React.Key[] = [];
    for (const node of nodes) {
      if (node.title.indexOf(value) > -1) {
        const item = getParentKey(node.key, roots);
        if (item !== undefined) {
          newExpandedKeys.push();
        }
      }
    }
    setExpandedKeys(newExpandedKeys);
    setSearchValue(value);
    setAutoExpandParent(true);
  };

  // Highlight the search token in the tree nodes
  const treeData = useMemo(() => {
    const loop = (data: TreeDataNode[]): TreeDataNode[] =>
      data.map((item) => {
        const strTitle = item.title;
        const index = strTitle.indexOf(searchValue);
        const beforeStr = strTitle.substring(0, index);
        const afterStr = strTitle.slice(index + searchValue.length);
        // highlight the search token
        const title =
          index > -1 ? (
            <span key={item.key}>
              {beforeStr}
              <span className="text-blue-600">{searchValue}</span>
              {afterStr}
            </span>
          ) : (
            <span key={item.key}>{strTitle}</span>
          );
        return {
          title,
          key: item.key,
          children: loop(item.children || []),
          icon: item.icon,
          parentId: item.parentId,
        } as unknown as TreeDataNode;
      });
    return loop(roots);
  }, [searchValue, roots]);

  function DisplayFileInfo({
    data,
    nodesMap,
  }: {
    data: EmbeddedFileData | undefined;
    nodesMap: Map<string | number | bigint, TreeDataNode>;
  }) {
    if (!data) {
      return <div>Select a file to see its details.</div>;
    }

    const { id, resultId, metadata, parentId } = data;
    const parentNode = parentId ? nodesMap.get(parentId) : null;

    return (
      <Descriptions
        title={`File Info of #${metadata.data.md5 || "Unknown"}`}
        bordered
        column={1}
        size="small"
      >
        <Descriptions.Item label="ID">{id}</Descriptions.Item>
        <Descriptions.Item label="Result ID">{resultId}</Descriptions.Item>
        <Descriptions.Item label="File Path">{metadata.path}</Descriptions.Item>
        <Descriptions.Item label="MD5">{metadata.data.md5}</Descriptions.Item>
        <Descriptions.Item label="Size">
          {metadata.data.size} bytes
        </Descriptions.Item>
        <Descriptions.Item label="File Type">
          {metadata.data.kind}
        </Descriptions.Item>
        <Descriptions.Item label="Created">
          {metadata.created}
        </Descriptions.Item>
        <Descriptions.Item label="Modified">
          {metadata.modified}
        </Descriptions.Item>
        <Descriptions.Item label="Creator">
          {metadata.creator}
        </Descriptions.Item>
        <Descriptions.Item label="Modifier">
          {metadata.modifier}
        </Descriptions.Item>
        <Descriptions.Item label="parent">
          {parentNode ? parentNode.data?.metadata.path : "None"}
        </Descriptions.Item>
      </Descriptions>
    );
  }

  return (
    <Splitter className="grow">
      <Splitter.Panel defaultSize={328}>
        <div className="h-full flex flex-col">
          <div className="w-64 mb-2">
            <Search placeholder="Search" onChange={onSearchValueChange} />
          </div>
          <Tree
            showIcon={true}
            showLine={true}
            selectedKeys={selected}
            onSelect={(selectedKeys) => setSelected(selectedKeys)}
            defaultExpandAll={true}
            //
            onExpand={onTreeNodeExpand}
            expandedKeys={expandedKeys}
            autoExpandParent={autoExpandParent}
            //
            treeData={treeData}
          />
        </div>
      </Splitter.Panel>
      <Splitter.Panel>
        <div>
          {selected.map((item) => {
            const fileData = nodesMap.get(item as string)?.data;
            return (
              <DisplayFileInfo key={item} data={fileData} nodesMap={nodesMap} />
            );
          })}
        </div>
      </Splitter.Panel>
    </Splitter>
  );
}
