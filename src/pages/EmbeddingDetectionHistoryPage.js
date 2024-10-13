import {Spin} from "antd";
import {useState} from "react";

import {eel} from "../eel.js";
import {EmbeddingDetectionResult} from "../types";
import {EmbeddingDetectionResultList} from "../components/EmbeddingDetectionResultList";

export function EmbeddingDetectionHistoryPage({pageNo = 0, pageSize = 0}: {
  pageNo?: number,
  pageSize?: number
}) {
  const [state, setState] = useState({state: 'loading'});
  const [results, setResults] = useState(null);

  function loadData() {
    // noinspection JSUnresolvedReference
    eel.fetchEmbeddingDetectionResults(pageNo, pageSize)(
        function (results) {
          setState({state: 'loaded'});
          setResults(EmbeddingDetectionResult.fromObjects(results));
        },
        function (error) {
          setState({state: 'error', error: error});
        }
    );
  }

  if (state.state !== 'loaded') {
    loadData();
  }

  return (
      <div>
        <p>Embedding Detection History</p>
        <div className="History">
          {
              state.state === 'loaded' &&
              results &&
              <EmbeddingDetectionResultList results={results}/>
          }

          {
              state.state === 'error' &&
              <p>Failed to load data, <button onClick={loadData}>try again</button>?</p>
          }

          {
              state.state === 'loading' &&
              <Spin/>
          }
        </div>
      </div>
  )
}