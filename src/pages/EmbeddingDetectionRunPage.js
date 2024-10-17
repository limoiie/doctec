import {Breadcrumb, Spin} from "antd";
import {useState} from "react";
import {useParams} from "react-router-dom";

import {eel} from "../eel.js";
import {LoadStatus} from "../types";
import {EmbeddedFileTree} from "../components/EmbeddedFileTree";
import type {
  EmbDetectionResultDataWithoutRun
} from "../types/EmbDetectionResultDataWithoutRun.schema";
import type {EmbDetectionRunData} from "../types/EmbDetectionRunData.schema";

export function EmbeddingDetectionRunPage() {
  const [status: LoadStatus, setStatus] = useState({state: 'loading'});
  const [run: EmbDetectionRunData, setRun] = useState(null);
  const [result: EmbDetectionResultDataWithoutRun, setResult] = useState(null);

  let {runUuid} = useParams();

  function loadData() {
    // noinspection JSUnresolvedReference
    eel.fetchEmbeddingDetectionRunByUuid(runUuid)(
        function (run) {
          setStatus({state: 'loaded'});
          setRun(run);
        },
        function (error) {
          setStatus({state: 'error', error: error});
        }
    );

    // noinspection JSUnresolvedReference
    eel.fetchEmbeddingDetectionResultByRunUuid(runUuid)(
        function (result) {
          setStatus({state: 'loaded'});
          setResult(result);
        },
        function (error) {
          setStatus({state: 'error', error: error});
        }
    );
  }

  if (status.state !== 'loaded') {
    loadData();
  }

  return (
      <div>
        <h2>Embedding Detection Run#{runUuid}</h2>
        <p> {JSON.stringify(status)} </p>
        <p> {JSON.stringify(run)} </p>
        <p> {JSON.stringify(result)} </p>
        {
            status.state === 'loaded' &&
            run &&
            <div>
              <Breadcrumb items={[
                {'title': <a href="/">Home</a>},
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
            status.state === 'error' &&
            <p>Failed to load data, <button onClick={loadData}>try again</button>?</p>
        }

        {
            status.state === 'loading' &&
            <Spin/>
        }
      </div>
  )
}