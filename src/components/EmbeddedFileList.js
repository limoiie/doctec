import React from "react";
import type {TableColumnsType} from 'antd';
import {Table, Tooltip} from "antd";
import type {EmbeddedFileData} from "../types/EmbeddedFileData.schema.d";
import {bytesToSize, splitPathName} from "../utils";

interface DataType {
  key: React.Key;
  name: string;
  parent: string;
  size: string;
  md5: string;
  kind: string;
  creator: string;
  modifier: string;
}

const columns: TableColumnsType<DataType> = (allKinds, allCreators, allModifiers) => [
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
    sorter: (a, b) => a.name.localeCompare(b.name),
  },
  {
    title: 'Parent',
    dataIndex: 'parent',
    key: 'parent',
    sorter: (a, b) => a.parent.localeCompare(b.parent),
    render: (value) => <Tooltip title={value}>
      <div className="min-w-32 max-w-64 overflow-hidden whitespace-nowrap truncate">
        {value}
      </div>
    </Tooltip>
  },
  {
    title: 'Size',
    dataIndex: 'size',
    key: 'size',
    sorter: (a, b) => a.size - b.size,
    render: (value) => <div className="text-nowrap text-right">
      <span className="inline-block">{bytesToSize(value)}</span>
    </div>
  },
  {
    title: 'MD5',
    dataIndex: 'md5',
    key: 'md5',
    render: (value: string) => <Tooltip className="font-mono" title={value}>
      <span className="inline-block">{value.substring(0, 8)}</span>
    </Tooltip>
  },
  {
    title: 'Kind',
    dataIndex: 'kind',
    key: 'kind',
    sorter: (a, b) => a.kind.localeCompare(b.kind),
    filters: [...allKinds].map(kind => ({text: kind, value: kind})),
    onFilter: (value, record) => record.kind === value,
  },
  {
    title: 'Creator',
    dataIndex: 'creator',
    key: 'creator',
    sorter: (a, b) => a.creator.localeCompare(b.creator),
    filters: [...allCreators].map(creator => ({text: creator, value: creator})),
    onFilter: (value, record) => record.creator === value,
  },
  {
    title: 'Modifier',
    dataIndex: 'modifier',
    key: 'modifier',
    sorter: (a, b) => a.modifier.localeCompare(b.modifier),
    filters: [...allModifiers].map(modifier => ({text: modifier, value: modifier})),
    onFilter: (value, record) => record.creator === value,
  },
]

export function EmbeddedFileList({files}: { files: EmbeddedFileData[] }) {
  const id2File = new Map(
      files.map(file => [file.id, file])
  );
  const allKinds = new Set(files.map(e => e.metadata.data.kind));
  const allCreators = new Set(files.map(e => e.metadata.creator));
  const allModifiers = new Set(files.map(e => e.metadata.modifier));

  const dataSource = files.map((e: EmbeddedFileData, i) => {
    const {dir, name} = splitPathName(e.metadata.path);
    return {
      key: i,
      name: name,
      parent: id2File.has(e.parentId) ? id2File.get(e.parentId).metadata.path : dir,
      size: e.metadata.data.size,
      md5: e.metadata.data.md5,
      kind: e.metadata.data.kind,
      creator: e.metadata.creator,
      modifier: e.metadata.modifier,
      data: e,
    }
  })
  return (
      <Table className="w-full" columns={columns(allKinds, allCreators, allModifiers)}
             dataSource={dataSource} pagination={false}
             showSorterTooltip={{target: 'sorter-icon'}}/>
  )
}