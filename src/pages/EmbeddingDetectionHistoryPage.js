import {Spin} from "antd";
import {useState} from "react";

import {eel} from "../eel.js";
import {EmbeddingDetectionRunList} from "../components/EmbeddingDetectionRunList";
import {LoadStatus} from "../types";

export function EmbeddingDetectionHistoryPage({pageNo = 0, pageSize = 0}: {
  pageNo?: number,
  pageSize?: number
}) {
  const [status: LoadStatus, setStatus] = useState({state: 'loading'});
  const [runs, setRuns] = useState(null);

  function loadData() {
    // noinspection JSUnresolvedReference
    eel.fetchEmbeddingDetectionRuns(pageNo, pageSize)(
        function (runs) {
          setStatus({state: 'loaded'});
          setRuns(runs);
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
        <p>Embedding Detection History</p>
        <div className="History">
          {
              status.state === 'loaded' &&
              runs &&
              <EmbeddingDetectionRunList runs={runs}/>
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
      </div>
  )
}