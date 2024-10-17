import {Table, Tooltip} from "antd";

import type {EmbDetectionRunData} from "../types/EmbDetectionRunData.schema";

const columns = [
  {
    'title': 'UUID',
    'dataIndex': 'uuid',
    'key': 'uuid',
    render: (value) => (
        <Tooltip title="Details">
          <a href={"/run/" + value}>{value}</a>
        </Tooltip>
    )
  },
  {
    'title': 'LaunchDate',
    'dataIndex': 'launchedDate',
    'key': 'launchedDate',
  },
  {
    'title': 'FinishedDate',
    'dataIndex': 'finishedDate',
    'key': 'finishedDate',
  },
  {
    'title': 'Progress',
    'dataIndex': 'progress',
    'key': 'progress',
    render: (value, record) => (
        <span>{record.nProcessed}/{record.nTotal}</span>
    )
  },
  {
    'title': 'Status',
    'dataIndex': 'status',
    'key': 'status',
    render: (value) => (
        <span>{value}</span>
    )
  }
]

export function EmbeddingDetectionRunList({runs}: {
  runs: EmbDetectionRunData[]
}) {
  const dataSource = runs.map((run: EmbDetectionRunData, i) => {
    return {
      'key': i,
      'uuid': run.uuid,
      'launchedDate': run.launchedDate,
      'finishedDate': run.finishedDate,
      'nTotal': run.nTotal,
      'nProcessed': run.nProcessed,
      'status': run.status,
    }
  })
  return (
      <Table columns={columns} dataSource={dataSource} pagination={false}/>
  )
}