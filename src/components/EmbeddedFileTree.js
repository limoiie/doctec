import React, {useEffect, useMemo, useState} from "react";
import {Input, Splitter, Tree} from "antd";

import type {EmbeddedFileData} from "../types/EmbeddedFileData.schema.d";
import {FileOutlined, FolderOutlined} from "@ant-design/icons";
import {splitPathComponents, splitPathName} from "../utils";

const {Search} = Input;

interface TreeDataNode {
  title: string;
  key: React.Key;
  icon: React.ReactNode;
  parentId: React.Key;
  children: TreeDataNode[];
  data?: EmbeddedFileData;
}

/** Get the parent key of a node with the specified key, iteratively. */
const getParentKey = (key: React.Key, nodes: TreeDataNode[]): React.Key => {
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    if (node.children) {
      if (node.children.some((item) => item.key === key)) {
        return node.key;
      } else {
        const parentKey = getParentKey(key, node.children);
        if (parentKey) {
          return parentKey
        }
      }
    }
  }
  return undefined
};

export function EmbeddedFileTree({files}: { files: EmbeddedFileData[] }) {
  const [roots: TreeDataNode[], setRoots] = useState([]);
  const [nodes: TreeDataNode[], setNodes] = useState([]);
  const [nodesMap: Map<React.Key, TreeDataNode>, setNodesMap] = useState(new Map());
  const [selected, setSelected] = useState([]);

  /** Build filesystem tree from the files. */
  function buildTreeFromFiles(files: EmbeddedFileData[]) {
    const nodesMap = new Map();

    /**
     * Since we only store files but no folders,
     * we need to construct nodes for each file's parent folders.
     */
    function constructNodesTillParent(path: string) {
      let parentId = null;
      const {components, subpaths} = splitPathComponents(path);
      for (let i = 0; i < components.length - 1; i++) {
        if (!nodesMap.has(subpaths[i])) {
          nodesMap.set(subpaths[i], {
            title: components[i],
            key: subpaths[i],
            icon: <FolderOutlined/>,
            parentId: parentId,
            children: [],
            data: null,
          });
        }
        parentId = subpaths[i];
      }
      return parentId;
    }

    // Construct nodes for each file
    for (const e: EmbeddedFileData of files) {
      let parentId = e.parentId;
      if (parentId === null) {
        parentId = constructNodesTillParent(e.metadata.path);
      }
      nodesMap.set(e.id, {
        title: splitPathName(e.metadata.path).name,
        key: e.id,
        icon: <FileOutlined/>,
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
        nodesMap.get(node.parentId).children.push(node);
      } else {
        roots.push(node);
      }
      nodes.push(node);
    }
    return {roots, nodes, nodesMap};
  }

  // Initialize the tree or Rebuild it when files change
  useEffect(() => {
    const {roots, nodes, nodesMap} = buildTreeFromFiles(files)
    setRoots(roots);
    setNodes(nodes);
    setNodesMap(nodesMap);
  }, [files])

  const [expandedKeys, setExpandedKeys] = useState([]);
  const [searchValue, setSearchValue] = useState('');
  const [autoExpandParent, setAutoExpandParent] = useState(true);

  // Whenever the expanding is triggered manually, disable the auto-expanding
  const onTreeNodeExpand = (newExpandedKeys: React.Key[]) => {
    setExpandedKeys(newExpandedKeys);
    setAutoExpandParent(false);
  };

  // Expand the tree nodes that match the search token and their parents
  const onSearchValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {value} = e.target;
    const newExpandedKeys = nodes
        .map((item) => {
          if (item.title.indexOf(value) > -1) {
            return getParentKey(item.key, roots);
          }
          return null;
        })
        .filter((item, i, self) => !!(item && self.indexOf(item) === i));
    setExpandedKeys(newExpandedKeys);
    setSearchValue(value);
    setAutoExpandParent(true);
  }

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
          if (item.children) {
            return {title, key: item.key, children: loop(item.children)};
          }
          return {title, key: item.key};
        });
    return loop(roots);
  }, [searchValue, roots]);

  return (
      <Splitter className="grow">
        <Splitter.Panel defaultSize={328}>
          <div className="h-full flex flex-col">
            <div className="w-64 mb-2">
              <Search placeholder="Search" onChange={onSearchValueChange}/>
            </div>
            <Tree showIcon={true}
                  showLine={true}
                  selectedKeys={selected}
                  onSelect={(selectedKeys) => setSelected(selectedKeys)}
                  onExpand={onTreeNodeExpand}
                  expandedKeys={expandedKeys}
                  autoExpandParent={autoExpandParent}
                  treeData={treeData}
            />
          </div>
        </Splitter.Panel>
        <Splitter.Panel>
          {selected.map(item => JSON.stringify(nodesMap.get(item).data || item))}
        </Splitter.Panel>
      </Splitter>
  )
}
