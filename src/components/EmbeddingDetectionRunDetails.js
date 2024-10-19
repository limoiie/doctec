import {Breadcrumb, Skeleton} from "antd";
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

  useEffect(() => loadData(), []);

  return (
      <div>
        <h2>Embedding Detection Run#{runUuid}</h2>
        {
            loading &&
            <Skeleton active/>
        }

        <p> {JSON.stringify(run)} </p>
        <p> {JSON.stringify(result)} </p>
        {
            loading && !error && run &&
            <div>
              <Breadcrumb items={[
                {'title': <a href="/public">Home</a>},
                {'title': runUuid}]
              }/>
              <p>Embedding Detection Run Id: {run.uuid}</p>
              <p>Status: {run.status}</p>
              <p>Progress: {run.nProcessed}/{run.nTotal}</p>
              <p>Launched: {run.launchedDate}</p>
              <p>Configuration: {JSON.stringify(run.cfg)}</p>
              <p>Finished: {run.finishedDate}</p>
              <p>Error: {run.error}</p>
              {
                  result &&
                  <div>
                    <p>Embedded Files:</p>
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