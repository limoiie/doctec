import {Skeleton} from "antd";
import {useEffect, useState} from "react";

import "./EmbeddingDetectionRunDetails.css"
import {eel} from "../eel.js";
import {EmbeddedFileTree} from "./EmbeddedFileTree";
import type {
  EmbDetectionResultDataWithoutRun
} from "../types/EmbDetectionResultDataWithoutRun.schema.d";
import type {EmbDetectionRunData} from "../types/EmbDetectionRunData.schema.d";
import {EmbeddingDetectionRunStatus} from "./EmbeddingDetectionRunStatus";
import {EmbeddingDetectionCfgDetails} from "./EmbeddingDetectionCfgDetails";

export function EmbeddingDetectionRunDetails({runUuid}: { runUuid: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [run: EmbDetectionRunData, setRun] = useState(null);
  const [result: EmbDetectionResultDataWithoutRun, setResult] = useState(null);

  function loadData() {
    setLoading(true);
    setError(null);

    // noinspection JSUnresolvedReference
    eel.fetchEmbeddingDetectionRunByUuid(runUuid)(
        function (run) {
          setLoading(false);
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

  return (
      <div className="ml-4 mr-4 p-4 flex flex-col gap-4 h-full overflow-scroll bg-white">
        <h1 className="page-title">Embedding Detection Run#{runUuid}</h1>
        {
            loading &&
            <Skeleton active/>
        }

        {
            !loading && !error && run &&
            <div className="flex flex-col gap-8">
              <div>
                <h2 className="section-title">Detection Run Status</h2>
                {
                    run &&
                    <EmbeddingDetectionRunStatus run={run}/>
                }
              </div>
              <div>
                <h2 className="section-title">Detection Configuration</h2>
                {
                    run && run.cfg &&
                    <EmbeddingDetectionCfgDetails cfg={run.cfg}/>
                }
              </div>
              <div>
                <h2 className="section-title">Detection Result</h2>
                {
                    result &&
                    <EmbeddedFileTree files={result.detectedFiles}/>
                }
              </div>
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