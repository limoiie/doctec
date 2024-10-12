import {Breadcrumb, Spin} from "antd";
import {useState} from "react";
import {useParams} from "react-router-dom";

import {eel} from "../eel.js";
import {EmbeddingDetectionResult, LoadState} from "../types";
import {EmbeddedFileList} from "../components/EmbeddedFileList";

export function EmbeddingDetectionResultPage() {
  const [state: LoadState, setState] = useState({state: 'loading'});
  const [result: EmbeddingDetectionResult, setResult] = useState(null);

  let {resultId} = useParams();

  function loadData() {
    // noinspection JSUnresolvedReference
    eel.fetchEmbeddingDetectionResultById(resultId)(
        function (result) {
          setState({state: 'loaded'});
          setResult(EmbeddingDetectionResult.fromObject(result));
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
        {
            state.state === 'loaded' &&
            result &&
            <div>
              <Breadcrumb items={[
                {'title': <a href="/">Home</a>},
                {'title': resultId}]
              }/>
              <p>Embedding Detection Result Id: {result.id}</p>
              <p>Target Directories: {result.targetDirs}</p>
              <p>Embedded Files:</p>
              <EmbeddedFileList files={result.detectedFiles} nestedPath={resultId}/>
            </div>
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
  )
}