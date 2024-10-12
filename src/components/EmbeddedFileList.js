import {Table, Tooltip} from "antd";
import type {EmbeddedFile} from "../types";

const columns = [
  {
    'title': 'FileName',
    'dataIndex': 'filename',
    'key': 'filename',
    render: (filename, record) => {
      return (
          <Tooltip title="Details">
            <a href={"/result/" + record.nestedPath + "/" + filename}>{filename}</a>
          </Tooltip>
      )
    }
  },
  {
    'title': 'FileSize',
    'dataIndex': 'filesize',
    'key': 'filesize',
  },
  {
    'title': '# of EmbeddedFiles',
    'dataIndex': 'nEmbeddedFiles',
    'key': 'nEmbeddedFiles',
  }
]

export function EmbeddedFileList({files, nestedPath}: {
  files: EmbeddedFile[],
  nestedPath: string
}) {
  const dataSource = files.map((e: EmbeddedFile, i) => {
    return {
      'key': i,
      'filename': e.filename,
      'filesize': e.filesize,
      'nEmbeddedFiles': e.embeddedFiles.length,
      'data': e,
      'nestedPath': nestedPath,
    }
  })
  return (
      <Table columns={columns} dataSource={dataSource} pagination={false}/>
  )
}