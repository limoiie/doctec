import {Table, Tooltip} from "antd";

import type {EmbeddingDetectionResult} from "../types";

const columns = [
  {
    'title': 'RunId',
    'dataIndex': 'id',
    'key': 'id',
    render: (value) => (
        <Tooltip title="Details">
          <a href={"/result/" + value}>{value}</a>
        </Tooltip>
    )
  },
  {
    'title': 'TargetDirs',
    'dataIndex': 'targetDirs',
    'key': 'targetDirs',
  },
  {
    'title': 'Date',
    'dataIndex': 'date',
    'key': 'date',
  },
  {
    'title': '# of DetectedFiles',
    'dataIndex': 'nDetectedFiles',
    'key': 'nDetectedFiles',
  }
]

export function EmbeddingDetectionResultList({results}: {
  results: EmbeddingDetectionResult[]
}) {
  const dataSource = results.map((e: EmbeddingDetectionResult) => {
    return {
      'id': e.id,
      'targetDirs': e.targetDirs,
      'date': e.date.toISOString(),
      'nDetectedFiles': e.detectedFiles.length,
      'data': e,
    }
  })
  return (
      <Table columns={columns} dataSource={dataSource} pagination={false}/>
  )
}