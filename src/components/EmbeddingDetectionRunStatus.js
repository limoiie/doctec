import type {EmbDetectionRunData} from "../types/EmbDetectionRunData.schema.d";
import {Descriptions} from "antd";
import {StatusIcon} from "./StatusIcon";

export function EmbeddingDetectionRunStatus({run}: { run: EmbDetectionRunData }) {
  const items = [
    {
      key: 'uuid',
      label: 'UUID',
      children: run.uuid,
      span: 2
    },
    {
      key: 'percent',
      label: 'Processed/Total',
      children: run.nProcessed + "/" + run.nTotal,
    },
    {
      key: 'status',
      label: 'Status',
      children: <>
        {
          <div className="flex flex-row gap-1">
            <StatusIcon status={run.status}/>
            <span>{run.status}</span>
          </div>
        }
      </>,
    },
    {
      key: 'launched',
      label: 'Launched Date',
      children: run.launchedDate,
      span: 2
    },
    {
      key: 'finished',
      label: 'Finished Date',
      children: run.finishedDate,
      span: 2
    },
    {
      key: 'error',
      label: 'Error Logs',
      children: run.error,
      span: 2
    }
  ]

  return (
      <Descriptions size="small" column={4} bordered items={items}/>
  )
}