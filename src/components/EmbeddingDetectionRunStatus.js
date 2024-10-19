import type {EmbDetectionRunData} from "../types/EmbDetectionRunData.schema.d";
import {
  CheckCircleFilled,
  CloseCircleFilled,
  FieldTimeOutlined,
  QuestionCircleFilled,
  StopFilled
} from "@ant-design/icons";
import {Descriptions} from "antd";

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
            run.status === 'pending' &&
            <div className="flex flex-row gap-1">
              <QuestionCircleFilled className="text-yellow-500"/>
              Pending
            </div>
        }
        {
            run.status === 'in-progress' &&
            <div className="flex flex-row gap-1">
              <FieldTimeOutlined className="text-blue-500"/>
              Running
            </div>
        }
        {
            run.status === 'completed' &&
            <div className="flex flex-row gap-1">
              <CheckCircleFilled className="text-green-500"/>
              Completed
            </div>
        }
        {
            run.status === 'failed' &&
            <div className="flex flex-row gap-1">
              <CloseCircleFilled className="text-red-500"/>
              Failed
            </div>
        }
        {
            run.status === 'cancelled' &&
            <div className="flex flex-row gap-1">
              <StopFilled className="text-purple-500"/>
              Cancelled
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