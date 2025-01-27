import { Button, Empty, List, message, Popconfirm, Spin, Splitter } from "antd";
import React, { useEffect, useState } from "react";

import "./EmbeddingDetectionHistoryPage.css";
import {eel} from "@/eel";
import type {EmbDetectionRunData} from "@/types/EmbDetectionRunData.schema.d";
import {DeleteFilled} from "@ant-design/icons";
import {EmbeddingDetectionRunDetails} from "@/cus-components/EmbeddingDetectionRunDetails";
import {StatusIcon} from "@/cus-components/StatusIcon";

export function EmbeddingDetectionHistoryPage({
  pageNo = 0,
  pageSize = 0,
}: {
  pageNo?: number;
  pageSize?: number;
}) {
  const [messageApi, contextHolder] = message.useMessage();
  const [loading, setLoading] = useState(false);

  const [activeRunUuid, setActiveRunUuid] = useState<string | null>(null);
  const [error, setError] = useState(null);
  const [runs, setRuns] = useState<EmbDetectionRunData[]>([]);
  const [data, setData] = useState<EmbDetectionRunData[]>([]);

  function loadHistory() {
    setLoading(true);
    // noinspection JSUnresolvedReference
    eel.fetchEmbeddingDetectionRuns(pageNo, pageSize)(
      function (runs: EmbDetectionRunData[]) {
        setLoading(false);
        setRuns(runs);
      },
      function (error: never) {
        setLoading(false);
        setError(error);
      },
    );
  }

  useEffect(() => loadHistory(), []);
  useEffect(() => {
    return setData(
      runs.map((run: EmbDetectionRunData) => {
        return {
          ...run,
          launchedDate: new Date(run.launchedDate).toLocaleString(),
        };
      }),
    );
  }, [runs]);

  function selectRun(
    event: React.MouseEvent<HTMLDivElement, MouseEvent>,
    runUuid: string,
  ) {
    event.stopPropagation();
    setActiveRunUuid(runUuid);
  }

  function deleteRun(runUuid: string) {
    console.log(runUuid);
    // noinspection JSUnresolvedReference,JSVoidFunctionReturnValueUsed
    eel.deleteRun(runUuid)(function (flag: boolean) {
      if (flag) {
        messageApi.success(`删除成功:${runUuid}`);
        loadHistory();
      } else {
        messageApi.error(`删除失败:${runUuid}`);
      }
    });
  }

  const cancel = (e: React.MouseEvent<HTMLElement> | undefined) => {
    console.log(e);
    messageApi.error("Click on No");
  };

  return (
    <>
      {contextHolder}
      <Splitter className="h-full">
        <Splitter.Panel defaultSize={360} min={240} collapsible>
          {loading && <Spin />}

          {!loading && runs && (
            <List
              className={"bg-white h-full text-left transition-colors"}
              loading={loading}
              itemLayout="horizontal"
              locale={{ emptyText: "Empty History" }}
              dataSource={data}
              renderItem={(item: EmbDetectionRunData) => (
                <List.Item
                  className={
                    "transition-all h-16 cursor-pointer " +
                    (item.uuid === activeRunUuid
                      ? "bg-blue-100"
                      : "hover:bg-blue-50")
                  }
                  onClick={(e) => {
                    selectRun(e, item.uuid);
                  }}
                >
                  <div className="p-4 pt-2 pb-1 gap-4 w-full flex flex-row justify-between items-center group">
                    <StatusIcon status={item.status} className="text-xl" />
                    <div className="grow flex flex-col">
                      {item.uuid}
                      <span className="text-gray-400">{item.launchedDate}</span>
                    </div>

                    <div className="absolute right-0 p-4">
                      <Popconfirm
                        title="Delete the task"
                        description="Are you sure to delete this task?"
                        onConfirm={(e) => {
                          e?.stopPropagation();
                          deleteRun(item.uuid);
                        }}
                        onCancel={cancel}
                        okText="Yes"
                        cancelText="No"
                      >
                        <Button
                          type="dashed"
                          shape="circle"
                          icon={<DeleteFilled />}
                        />
                      </Popconfirm>
                    </div>
                  </div>
                </List.Item>
              )}
            />
          )}

          {error && (
            <span>
              Failed to load data,
              <a
                className="text-blue-600"
                onClick={(e) => {
                  e.preventDefault(); // Prevent default anchor behavior
                  loadHistory();
                }}
              >
                try again
              </a>
              ?
            </span>
          )}
        </Splitter.Panel>

        <Splitter.Panel collapsible>
          {activeRunUuid ? (
            <EmbeddingDetectionRunDetails runUuid={activeRunUuid} />
          ) : (
            <Empty className="mt-16" description="No Detection Run Selected" />
          )}
        </Splitter.Panel>
      </Splitter>
    </>
  );
}
