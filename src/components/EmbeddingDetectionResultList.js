import {Table, Tooltip} from "antd";

import type {EmbeddingDetectionResult} from "../types";
import {EmbeddingDetectionProgress} from "../types";

const columns = [
  {
    'title': 'ResultId',
    'dataIndex': 'resultId',
    'key': 'resultId',
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
  },
  {
    'title': 'Status',
    'dataIndex': 'progress',
    'key': 'progress',
    render: (value: EmbeddingDetectionProgress) => (
        <span>{value.status}</span>
    )
  }
]

export function EmbeddingDetectionResultList({results}: {
  results: EmbeddingDetectionResult[]
}) {
  const dataSource = results.map((e: EmbeddingDetectionResult, i) => {
    return {
      'key': i,
      'resultId': e.id,
      'targetDirs': e.targetDirs,
      'date': e.date.toISOString(),
      'nDetectedFiles': e.detectedFiles.length,
      'progress': e.progress
    }
  })
  return (
      <Table columns={columns} dataSource={dataSource} pagination={false}/>
  )
}