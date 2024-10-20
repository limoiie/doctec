import {Splitter, Tree} from "antd";
import type {EmbeddedFileData} from "../types/EmbeddedFileData.schema.d";
import {FileOutlined, FolderOutlined} from "@ant-design/icons";
import {splitPathComponents, splitPathName} from "../utils";
import {useEffect, useState} from "react";

export function EmbeddedFileTree({files}: { files: EmbeddedFileData[] }) {
  const [roots, setRoots] = useState([]);
  const [selected, setSelected] = useState(null);
  useEffect(() => {
    const id2roots = new Map();
    const id2Node = new Map();
    for (const e: EmbeddedFileData of files) {
      let parentId = e.parentId;
      if (parentId === null) {
        const {components, subpaths} = splitPathComponents(e.metadata.path);
        for (let i = 0; i < components.length - 1; i++) {
          const [c, d] = [components[i], subpaths[i]];
          if (!id2Node.has(d)) {
            const node = {
              title: c,
              key: d,
              icon: <FolderOutlined/>,
              parentId: parentId,
              children: [],
              data: null,
            };
            id2Node.set(d, node);
          }
          parentId = d;
        }
        id2roots.set(subpaths[0], id2Node.get(subpaths[0]));
      }

      const node = {
        title: splitPathName(e.metadata.path).name,
        key: e.id,
        icon: <FileOutlined/>,
        parentId: parentId,
        children: [],
        data: e,
      };
      id2Node.set(e.id, node);
    }

    for (const node of id2Node.values()) {
      if (node.parentId !== null) {
        id2Node.get(node.parentId).children.push(node);
      }
    }

    setRoots([...id2roots.values()]);
  }, [files])

  return (
      <Splitter>
        <Splitter.Panel size={328}>
          <Tree showIcon={true} showLine={true} selectedKeys={selected} treeData={roots}/>
        </Splitter.Panel>
        <Splitter.Panel>
          {selected}
        </Splitter.Panel>
      </Splitter>
  )
}
