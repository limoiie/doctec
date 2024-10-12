import {Button, Input, Space, Spin} from "antd";
import {useState} from "react";

import {eel} from "../eel.js";
import {EmbeddingDetectionResult} from "../types";
import {EmbeddingDetectionResultList} from "../components/EmbeddingDetectionResultList";
import {useNavigate} from "react-router-dom";

export function EmbeddingDetectionPage() {
  const [state, setState] = useState({state: 'loading'});
  const [results, setResults] = useState(null);

  const [targetDirs, setTargetDirs] = useState(null);

  function loadData() {
    // noinspection JSUnresolvedReference
    eel.fetchEmbeddingDetectionResults()(
        function (results) {
          setState({state: 'loaded'});
          setResults(EmbeddingDetectionResult.fromObjects(results));
        },
        function (error) {
          setState({state: 'error', error: error});
        }
    );
  }

  let navigate = useNavigate();

  function detect() {
    // noinspection JSUnresolvedReference
    eel.detectEmbeddedFiles(targetDirs)(
        function (resultId) {
          // redirect to /result/<resultId>
          navigate('/results/' + resultId.toString());
        }
    )
  }

  if (state.state !== 'loaded') {
    loadData();
  }

  return (
      <div>
        <div>
          <p>Embedding Detection</p>
          <Space>
            <Input placeholder="directories or files" value={targetDirs}
                   onChange={(e) => setTargetDirs(e.target.value)}/>
            <Button type="primary" disabled={!targetDirs} onClick={detect}>Start</Button>
          </Space>
        </div>

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
      </div>
  )
}