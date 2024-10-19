import {Button, Empty, List, message, Progress, Spin} from "antd";
import {useEffect, useState} from "react";

import {eel} from "../eel.js";
import type {EmbDetectionRunData} from "../types/EmbDetectionRunData.schema.d";
import {DeleteFilled, LoadingOutlined} from "@ant-design/icons";
import {EmbeddingDetectionRunDetails} from "../components/EmbeddingDetectionRunDetails";

export function EmbeddingDetectionHistoryPage({pageNo = 0, pageSize = 0}: {
  pageNo?: number,
  pageSize?: number
}) {
  const [messageApi, contextHolder] = message.useMessage();
  const [loading, setLoading] = useState(false);
  const [activeRunUuid, setActiveRunUuid] = useState(null);
  const [error, setError] = useState(null);
  const [runs, setRuns] = useState([]);
  const [data, setData] = useState([]);

  function loadHistory() {
    setLoading(true);
    // noinspection JSUnresolvedReference
    eel.fetchEmbeddingDetectionRuns(pageNo, pageSize)(
        function (runs) {
          setLoading(false);
          setRuns(runs);
        },
        function (error) {
          setLoading(false);
          setError(error);
        }
    );
  }

  useEffect(() => loadHistory(), [])
  useEffect(() => {
    setData(runs.map((run: EmbDetectionRunData, i) => {
      return {
        key: i,
        uuid: run.uuid,
        launchedDate: run.launchedDate,
        finishedDate: run.finishedDate,
        nTotal: run.nTotal,
        nProcessed: run.nProcessed,
        status: run.status,
        percent: 50 / 100 * 100,
      }
    }))
  }, [runs])

  function selectRun(runUuid: string) {
    setActiveRunUuid(runUuid);
  }

  function deleteRun(runUuid: string) {
    // redirect to results page
    messageApi.open({
          type: 'error',
          content: "Not implemented yet! You need to delete by UUID " + runUuid,
        }
    ).then();
  }

  return (
      <>
        {contextHolder}
          <div className="h-full flex flex-row">
            <div className="basis-64">
              {
                  loading &&
                  <Spin/>
              }

              {
                  !loading && runs &&
                  <List
                      className={"bg-white h-full text-left"}
                      loading={loading}
                      itemLayout="horizontal"
                      locale={{emptyText: 'Empty History'}}
                      dataSource={data}
                      renderItem={(item) => (
                          <List.Item
                              className={item.uuid === activeRunUuid ? "bg-blue-200" : ""}
                              onClick={() => selectRun(item.uuid)}>
                            <div className="p-4 pt-2 pb-1 gap-4 w-full flex flex-row">
                              {
                                item.percent === null ?
                                    <Spin indicator={<LoadingOutlined/>} size={20}/> :
                                    <Progress type="circle" percent={50} size={20}/>
                              }
                              <div className="grow flex flex-col">
                                {item.uuid}
                                <span className="text-gray-400">{item.launchedDate}</span>
                              </div>
                              <Button type="primary" shape="circle" icon={<DeleteFilled/>}
                                      onClick={() => deleteRun(item.uuid)}/>
                            </div>
                          </List.Item>
                      )}
                  />
              }

              {
                  error &&
                  <span>Failed to load data, <a className="text-blue-600"
                                                onClick={loadHistory}>try again</a>?</span>
              }
            </div>
            <div className="grow">
              {
                activeRunUuid ?
                    <EmbeddingDetectionRunDetails runUuid={activeRunUuid}/> :
                    <Empty className="mt-16" description="No Detection Run Selected"/>
              }
            </div>
          </div>
      </>
  )
}