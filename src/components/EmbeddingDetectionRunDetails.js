import {Breadcrumb, Descriptions, Skeleton} from "antd";
import {useEffect, useState} from "react";

import {eel} from "../eel.js";
import {LoadStatus} from "../types";
import {EmbeddedFileTree} from "./EmbeddedFileTree";
import type {
  EmbDetectionResultDataWithoutRun
} from "../types/EmbDetectionResultDataWithoutRun.schema.d";
import type {EmbDetectionRunData} from "../types/EmbDetectionRunData.schema.d";

export function EmbeddingDetectionRunDetails({runUuid}: { runUuid: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [status: LoadStatus, setStatus] = useState({state: 'loading'});
  const [run: EmbDetectionRunData, setRun] = useState(null);
  const [result: EmbDetectionResultDataWithoutRun, setResult] = useState(null);
  const [items, setItems] = useState(null);

  function loadData() {
    setLoading(true);
    setError(null);

    // noinspection JSUnresolvedReference
    eel.fetchEmbeddingDetectionRunByUuid(runUuid)(
        function (run) {
          setLoading(false);
          setStatus({state: 'loaded'});
          setRun(run);
        },
        function (error) {
          setLoading(false);
          setError(error);
        }
    );

    // noinspection JSUnresolvedReference
    eel.fetchEmbeddingDetectionResultByRunUuid(runUuid)(
        function (result) {
          setLoading(false);
          setResult(result);
        },
        function (error) {
          setLoading(false);
          setError(error);
        }
    );
  }

  useEffect(() => loadData(), [runUuid]);
  useEffect(() => {
    if (run) {
      setItems([
        {
          key: 'uuid',
          label: 'UUID',
          children: run.uuid,
        },
        {
          key: 'status',
          label: 'Status',
          children: run.status,
        },
        {
          key: 'progress',
          label: 'Progress',
          children: run.nProcessed / run.nTotal,
        },
        {
          key: 'launched',
          label: 'Launched Date',
          children: run.launchedDate,
        },
        {
          key: 'finished',
          label: 'Finished Date',
          children: run.finishedDate,
        },
        {
          key: 'error',
          label: 'Error Logs',
          children: run.error
        }
      ]
    );
    }
  }, [run])

  return (
      <div className="ml-4 mr-4 p-4 flex flex-col gap-4 h-full overflow-scroll bg-white">
        <h1 className="text-2xl">Embedding Detection Run#{runUuid}</h1>
        {
            loading &&
            <Skeleton active/>
        }

        {
            !loading && !error && run &&
            <div>
              <div>
                <p>Configuration: {JSON.stringify(run.cfg)}</p>
              </div>
              <div>
                <h className="text-xl">
                  Detection Run Info
                </h>
              {
                items &&
                <Descriptions layout="vertical" bordered items={items} />
              }
              </div>
              {
                  result &&
                  <div>
                    <EmbeddedFileTree files={result.detectedFiles}/>
                  </div>
              }
            </div>
        }

        {
            error &&
            <span>Failed to load data, <a className="text-blue-600"
                                          onClick={loadData}>try again</a>?</span>
        }
      </div>
  )
}