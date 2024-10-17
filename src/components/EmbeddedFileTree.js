import {Table} from "antd";
import type {EmbeddedFileData} from "../types/EmbeddedFileData.schema";
import {splitFilePath} from "../utils";

const columns = [
  {
    'title': 'Name',
    'dataIndex': 'name',
    'key': 'name',
  },
  {
    'title': 'Parent Folder',
    'dataIndex': 'dir',
    'key': 'dir',
  },
  {
    'title': 'Size',
    'dataIndex': 'size',
    'key': 'size',
  },
  {
    'title': 'MD5',
    'dataIndex': 'md5',
    'key': 'md5',
  },
  {
    'title': 'Kind',
    'dataIndex': 'kind',
    'key': 'kind',
  },
  {
    'title': 'Creator',
    'dataIndex': 'creator',
    'key': 'creator',
  },
  {
    'title': 'Modifier',
    'dataIndex': 'modifier',
    'key': 'modifier',
  },
]

export function EmbeddedFileTree({files}: { files: EmbeddedFileData[] }) {
  const dataSource = files.map((e: EmbeddedFileData, i) => {
    const {dir, name} = splitFilePath(e.metadata.path);
    return {
      key: i,
      name: name,
      dir: dir,
      size: e.metadata.data.size,
      md5: e.metadata.data.md5,
      kind: e.metadata.data.kind,
      creator: e.metadata.creator,
      modifier: e.metadata.modifier,
      data: e,
      parent: e.parent,
    }
  })
  return (
      <Table columns={columns} dataSource={dataSource} pagination={false}/>
  )
}